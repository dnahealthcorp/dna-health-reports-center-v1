
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    });

    // Parse request body
    const { name, email, role, invitedById } = await req.json();
    
    // Validate inputs
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["nurse", "doctor", "admin"].includes(role)) {
      return new Response(
        JSON.stringify({ error: "Invalid role. Role must be 'nurse', 'doctor', or 'admin'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create invitation record
    console.log("Creating invitation record...");
    const { data: inviteData, error: inviteError } = await supabaseAdmin
      .from('user_invitations')
      .insert({
        email,
        role,
        invited_by: invitedById || null
      })
      .select();

    if (inviteError) {
      console.error("Error creating invitation record:", inviteError);
      if (inviteError.message.includes('duplicate key')) {
        return new Response(
          JSON.stringify({ error: "A user with this email has already been invited" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw inviteError;
    }

    console.log("Invitation record created:", inviteData);
    console.log("Sending invitation email...");

    // Send invitation email through Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          name,
          role
        },
        redirectTo: new URL(req.url).origin + "/set-password"
      }
    );

    if (authError) {
      console.error("Auth error details:", authError);
      
      try {
        // Clean up the invitation record if email sending fails
        if (inviteData && inviteData[0]) {
          await supabaseAdmin
            .from('user_invitations')
            .delete()
            .eq('id', inviteData[0].id);
        }
      } catch (cleanupError) {
        console.error("Failed to clean up invitation record:", cleanupError);
      }
      
      throw authError;
    }

    console.log("Invitation sent successfully:", authData);

    return new Response(
      JSON.stringify({ success: true, message: "User invitation sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in invite-user function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
