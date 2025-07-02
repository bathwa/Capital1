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
    // Parse the webhook payload
    const payload = await req.json();
    console.log('Received webhook payload:', JSON.stringify(payload, null, 2));

    // Initialize Supabase client with service role key for elevated permissions
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle Auth webhook events (user.created, user.updated, etc.)
    if (payload.type === 'user.created' || payload.type === 'signup') {
      const user = payload.user || payload.record;
      
      if (!user || !user.id) {
        console.error('No user data in webhook payload');
        return new Response(
          JSON.stringify({ error: 'No user data provided' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Check if user profile already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (existingUser) {
        console.log('User profile already exists for:', user.id);
        return new Response(
          JSON.stringify({ success: true, message: 'User profile already exists' }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Extract user metadata
      const metadata = user.user_metadata || user.raw_user_meta_data || {};
      
      // Create user profile with proper validation
      const userData = {
        id: user.id,
        email: user.email,
        first_name: (metadata.first_name && metadata.first_name.trim() && metadata.first_name.trim().length >= 1 && metadata.first_name.trim().length <= 50) 
          ? metadata.first_name.trim() 
          : 'User',
        last_name: (metadata.last_name && metadata.last_name.trim() && metadata.last_name.trim().length >= 1 && metadata.last_name.trim().length <= 50) 
          ? metadata.last_name.trim() 
          : 'Name',
        phone_number: metadata.phone_number && metadata.phone_number.trim() !== '' ? metadata.phone_number.trim() : null,
        role: (metadata.role && ['ADMIN', 'ENTREPRENEUR', 'INVESTOR', 'SERVICE_PROVIDER', 'OBSERVER'].includes(metadata.role)) 
          ? metadata.role 
          : 'ENTREPRENEUR',
        status: user.email_confirmed_at ? 'ACTIVE' : 'PENDING_EMAIL_CONFIRMATION',
        organization_id: null,
        profile_completion_percentage: 30,
        reliability_score: 0
      };

      console.log('Creating user profile with data:', JSON.stringify(userData, null, 2));

      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select();

      if (error) {
        console.error('Error creating user profile:', error);
        console.error('User data that failed:', JSON.stringify(userData, null, 2));
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

    // Handle other Auth events if needed
    else if (payload.type === 'user.updated') {
      const user = payload.user || payload.record;
      
      if (user && user.id) {
        // Update user status if email was confirmed
        if (user.email_confirmed_at) {
          await supabase
            .from('users')
            .update({ 
              status: 'ACTIVE',
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
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