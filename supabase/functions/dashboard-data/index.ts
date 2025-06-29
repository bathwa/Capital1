import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return new Response(
        JSON.stringify({ error: profileError.message }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    let dashboardData = {}

    // Generate role-specific dashboard data
    switch (userProfile.role) {
      case 'ADMIN':
        // Get admin dashboard data
        const [usersCount, opportunitiesCount, investmentsSum] = await Promise.all([
          supabaseClient.from('users').select('id', { count: 'exact' }),
          supabaseClient.from('opportunities').select('id', { count: 'exact' }).eq('status', 'PENDING_ADMIN_REVIEW'),
          supabaseClient.from('investments').select('invested_amount').eq('status', 'FUNDS_IN_ESCROW')
        ])

        dashboardData = {
          total_users: usersCount.count || 0,
          pending_approvals: opportunitiesCount.count || 0,
          total_active_investments: investmentsSum.data?.reduce((sum, inv) => sum + Number(inv.invested_amount), 0) || 0,
          platform_revenue: 0, // Calculate based on fees
        }
        break

      case 'ENTREPRENEUR':
        // Get entrepreneur dashboard data
        const [myOpportunities, myFunding, myMilestones] = await Promise.all([
          supabaseClient.from('opportunities').select('*').eq('entrepreneur_id', user.id),
          supabaseClient.from('investments').select('invested_amount').in('opportunity_id', 
            (await supabaseClient.from('opportunities').select('id').eq('entrepreneur_id', user.id)).data?.map(o => o.id) || []
          ),
          supabaseClient.from('milestones').select('*').eq('status', 'OVERDUE').in('opportunity_id',
            (await supabaseClient.from('opportunities').select('id').eq('entrepreneur_id', user.id)).data?.map(o => o.id) || []
          )
        ])

        dashboardData = {
          active_opportunities: myOpportunities.data?.filter(o => o.status === 'FUNDING_LIVE').length || 0,
          total_funded: myFunding.data?.reduce((sum, inv) => sum + Number(inv.invested_amount), 0) || 0,
          reliability_score: userProfile.reliability_score || 0,
          overdue_milestones: myMilestones.count || 0,
        }
        break

      case 'INVESTOR':
        // Get investor dashboard data
        const [myInvestments, myPools] = await Promise.all([
          supabaseClient.from('investments').select('*').eq('investor_id', user.id),
          supabaseClient.from('pool_members').select('*').eq('user_id', user.id).eq('active', true)
        ])

        const totalInvested = myInvestments.data?.reduce((sum, inv) => sum + Number(inv.invested_amount), 0) || 0
        
        dashboardData = {
          active_investments: myInvestments.data?.filter(i => i.status === 'FUNDS_IN_ESCROW').length || 0,
          total_invested: totalInvested,
          portfolio_roi: 0, // Calculate based on returns
          pool_memberships: myPools.data?.length || 0,
        }
        break

      case 'SERVICE_PROVIDER':
        // Get service provider dashboard data
        const [myRequests, myServices] = await Promise.all([
          supabaseClient.from('service_requests').select('*').eq('service_provider_id', user.id),
          supabaseClient.from('service_provider_profiles').select('*').eq('user_id', user.id).single()
        ])

        dashboardData = {
          active_requests: myRequests.data?.filter(r => r.status === 'IN_PROGRESS').length || 0,
          completed_services: myServices.data?.total_services_completed || 0,
          average_rating: myServices.data?.average_rating || 0,
          total_earnings: 0, // Calculate from completed services
        }
        break

      default:
        dashboardData = {}
    }

    return new Response(
      JSON.stringify({ success: true, data: dashboardData }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})