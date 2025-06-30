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
    const { type, table, record, old_record } = await req.json()

    // Initialize Supabase client with service role key for elevated permissions
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Handle auth events
    if (type === 'INSERT' && table === 'auth.users') {
      // Extract user metadata from the auth record
      const metadata = record.raw_user_meta_data || {}
      
      // Create user profile when auth user is created
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: record.id,
          email: record.email,
          first_name: metadata.first_name || '',
          last_name: metadata.last_name || '',
          phone_number: metadata.phone_number || null,
          role: metadata.role || 'ENTREPRENEUR',
          status: 'ACTIVE', // Changed from 'PENDING_EMAIL_CONFIRMATION' to 'ACTIVE'
          profile_completion_percentage: 30,
          reliability_score: 0,
          created_at: record.created_at,
          updated_at: record.updated_at
        })

      if (error) {
        console.error('Error creating user profile:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // If organization name is provided, create organization
      if (metadata.organization_name) {
        const { error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: metadata.organization_name,
            owner_id: record.id,
            status: 'PENDING'
          })

        if (orgError) {
          console.error('Error creating organization:', orgError)
          // Don't fail the entire request if organization creation fails
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})