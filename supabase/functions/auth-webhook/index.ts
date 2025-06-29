import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

    // Handle auth events
    if (type === 'INSERT' && table === 'auth.users') {
      // Create user profile when auth user is created
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: record.id,
          email: record.email,
          email_verified: record.email_confirmed_at ? true : false,
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
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})