// Import createClient at the top level
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { type, table, record, old_record } = await req.json();

    // Initialize Supabase client with service role key for elevated permissions
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle auth events
    if (type === 'INSERT' && table === 'auth.users') {
      // Extract user metadata from the auth record
      const metadata = record.raw_user_meta_data || {};
      
      // Create user profile when auth user is created
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: record.id,
          email: record.email,
          first_name: metadata.first_name || '',
          last_name: metadata.last_name || '',
          phone_number: metadata.phone_number || '',
          role: metadata.role || 'ENTREPRENEUR',
          status: 'ACTIVE',
          profile_completion_percentage: 30,
          reliability_score: 0
          // Remove created_at and updated_at - they have default values and triggers
        });

      if (error) {
        console.error('Error creating user profile:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // If organization name is provided, create organization
      if (metadata.organization_name) {
        const { error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: metadata.organization_name,
            owner_id: record.id,
            status: 'PENDING'
          });

        if (orgError) {
          console.error('Error creating organization:', orgError);
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
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});