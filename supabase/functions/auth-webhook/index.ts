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
      if (metadata.organization_name && metadata.organization_name.trim()) {
        // First, try to find existing organization
        const { data: existingOrg, error: findError } = await supabase
          .from('organizations')
          .select('id')
          .eq('name', metadata.organization_name.trim())
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
              name: metadata.organization_name.trim(),
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
        first_name: (metadata.first_name && metadata.first_name.trim() && metadata.first_name.trim().length >= 1 && metadata.first_name.trim().length <= 50) 
          ? metadata.first_name.trim() 
          : 'User',
        last_name: (metadata.last_name && metadata.last_name.trim() && metadata.last_name.trim().length >= 1 && metadata.last_name.trim().length <= 50) 
          ? metadata.last_name.trim() 
          : 'Name',
        role: (metadata.role && ['ADMIN', 'ENTREPRENEUR', 'INVESTOR', 'SERVICE_PROVIDER', 'OBSERVER'].includes(metadata.role)) 
          ? metadata.role 
          : 'ENTREPRENEUR',
        status: 'ACTIVE', // Set to ACTIVE instead of PENDING_EMAIL_CONFIRMATION
        profile_completion_percentage: 30,
        reliability_score: 0,
        preferences: {},
        metadata: {}
      };

      // Only add organization_id if we have a valid UUID
      if (organizationId && typeof organizationId === 'string') {
        userData.organization_id = organizationId;
      }

      // Only add phone_number if provided, not empty, and matches the expected format
      if (metadata.phone_number && 
          metadata.phone_number.trim() && 
          /^\+?[1-9]\d{1,14}$/.test(metadata.phone_number.trim())) {
        userData.phone_number = metadata.phone_number.trim();
      }

      console.log('Attempting to create user profile with data:', JSON.stringify(userData, null, 2));

      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select();

      if (error) {
        console.error('Error creating user profile:', error);
        console.error('User data that failed:', JSON.stringify(userData, null, 2));
        console.error('Full error details:', JSON.stringify(error, null, 2));
        return new Response(
          JSON.stringify({ 
            error: 'Failed to create user profile',
            details: error.message,
            code: error.code 
          }),
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
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});