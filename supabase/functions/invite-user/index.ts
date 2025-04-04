
// Supabase Edge Function to securely invite a new user
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface RequestData {
  name: string;
  email: string;
  role: 'nurse' | 'doctor' | 'admin';
  invitedById?: string;
}

serve(async (req: Request) => {
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
    const { name, email, role, invitedById }: RequestData = await req.json();
    
    // Validate inputs
    if (!name || !email || !role) {
      return new Response(
        JSON.stringify({ error: "Name, email, and role are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!['nurse', 'doctor', 'admin'].includes(role)) {
      return new Response(
        JSON.stringify({ error: "Role must be one of: nurse, doctor, admin" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Creating invite for ${email} with role ${role}`);

    // 1. Invite the user through Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        data: { name, role },
        redirectTo: `${req.headers.get('origin')}/auth/callback`
      }
    );

    if (authError) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("User invited successfully");

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "User invited successfully",
        user: { email, role }
      }),
      { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (err) {
    console.error("Server error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
