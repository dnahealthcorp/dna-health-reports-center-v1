
// Supabase Edge Function to securely update a user's password
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface RequestData {
  userId: string;
  password: string;
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
    
    const { userId, password } = requestData;
    
    // Validate inputs
    if (!userId || !password) {
      return new Response(
        JSON.stringify({ error: "User ID and password are required" }),
        { status: 400, headers: { ...corsHeaders } }
      );
    }

    console.log(`Updating password for user ${userId}`);

    // Update the user password
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: password }
    );

    if (error) {
      console.error("Error updating password:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders } }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Password updated successfully",
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
