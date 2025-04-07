
// Supabase Edge Function to securely invite a new user
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface RequestData {
  name: string;
  email: string;
  role: 'nurse' | 'doctor' | 'admin';
  password: string;
  invitedById?: string;
}

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  
  try {
    // Initialize Supabase admin client with the project URL and service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Parse request body
    let requestData: RequestData;
    try {
      requestData = await req.json();
    } catch (error) {
      console.error("Error parsing request JSON:", error);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders } }
      );
    }
    
    const { name, email, role, password, invitedById } = requestData;
    
    // Validate inputs
    if (!name || !email || !role || !password) {
      return new Response(
        JSON.stringify({ error: "Name, email, role, and password are required" }),
        { status: 400, headers: { ...corsHeaders } }
      );
    }

    if (!['nurse', 'doctor', 'admin'].includes(role)) {
      return new Response(
        JSON.stringify({ error: "Role must be one of: nurse, doctor, admin" }),
        { status: 400, headers: { ...corsHeaders } }
      );
    }

    console.log(`Creating user for ${email} with role ${role}`);

    // First check if the user already exists in auth
    const { data: existingUsers, error: lookupError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (lookupError) {
      console.error("Error checking for existing user:", lookupError);
      return new Response(
        JSON.stringify({ error: lookupError.message }),
        { status: 500, headers: { ...corsHeaders } }
      );
    }

    // If user already exists, return existing user info with a success message
    if (existingUsers) {
      console.log("User already exists, returning existing user data");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "User already exists",
          user: { id: existingUsers.id, email, role: existingUsers.role }
        }),
        { 
          status: 200,
          headers: { ...corsHeaders }
        }
      );
    }

    // Create the user through Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name
      }
    });

    if (authError) {
      // Handle duplicate email error specifically
      if (authError.message.includes("already been registered")) {
        // Try to fetch the existing user from the database
        const { data: existingUser } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (existingUser) {
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: "User already exists", 
              user: { id: existingUser.id, email, role: existingUser.role } 
            }),
            { status: 200, headers: { ...corsHeaders } }
          );
        }
      }

      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders } }
      );
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: "Failed to create user" }),
        { status: 500, headers: { ...corsHeaders } }
      );
    }

    console.log("User created successfully, now setting role in the users table");

    // Set user role in the users table
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .upsert([{
        id: authData.user.id,
        name: name,
        email: email,
        role: role
      }]);
    
    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: dbError.message }),
        { status: 500, headers: { ...corsHeaders } }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "User created successfully",
        user: { id: authData.user.id, email, role }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders }
      }
    );
  } catch (err) {
    console.error("Server error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: err.message }),
      { status: 500, headers: { ...corsHeaders } }
    );
  }
});
