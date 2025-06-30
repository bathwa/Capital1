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
      
      let organizationId = null;

      // If organization name is provided, try to find existing organization or create new one
      if (metadata.organization_name) {
        // First, try to find existing organization
        const { data: existingOrg, error: findError } = await supabase
          .from('organizations')
          .select('id')
          .eq('name', metadata.organization_name)
          .single();

        if (findError && findError.code !== 'PGRST116') { // PGRST116 is "not found" error
          console.error('Error finding organization:', findError);
        } else if (existingOrg) {
          organizationId = existingOrg.id;
        } else {
          // Create new organization if it doesn't exist
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .insert({
              name: metadata.organization_name,
              owner_id: record.id,
              status: 'PENDING'
            })
            .select('id')
            .single();

          if (orgError) {
            console.error('Error creating organization:', orgError);
            // Don't fail the entire request if organization creation fails
          } else {
            organizationId = orgData?.id;
          }
        }
      }

      // Create user profile when auth user is created
      // Ensure required fields meet database constraints
      const userData = {
        id: record.id,
        email: record.email,
        first_name: metadata.first_name || 'User',
        last_name: metadata.last_name || 'Name',
        role: metadata.role || 'ENTREPRENEUR',
        status: 'ACTIVE', // Set to ACTIVE instead of PENDING_EMAIL_CONFIRMATION
        profile_completion_percentage: 30,
        reliability_score: 0
      };

      // Only add organization_id if we have one
      if (organizationId) {
        userData.organization_id = organizationId;
      }

      // Only add phone_number if provided and not empty
      if (metadata.phone_number && metadata.phone_number.trim()) {
        userData.phone_number = metadata.phone_number;
      }

      const { data, error } = await supabase
        .from('users')
        .insert(userData);

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

      console.log('User profile created successfully:', data);
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
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});