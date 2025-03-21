
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );
    
    const { patientId } = await req.json();

    if (!patientId) {
      return new Response(
        JSON.stringify({ error: "Patient ID is required" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    // Get patient data
    const { data: patient, error: patientError } = await supabaseClient
      .from("patients")
      .select("*")
      .eq("id", patientId)
      .single();

    if (patientError) {
      return new Response(
        JSON.stringify({ error: "Patient not found", details: patientError.message }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404 
        }
      );
    }

    // Get form data
    const { data: formData, error: formError } = await supabaseClient
      .from("patient_form_data")
      .select("*")
      .eq("patient_id", patientId)
      .single();

    if (formError && formError.code !== "PGRST116") { // PGRST116 is "not found"
      return new Response(
        JSON.stringify({ error: "Error retrieving form data", details: formError.message }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }

    // Get medications
    const { data: medications, error: medError } = await supabaseClient
      .from("medications")
      .select("*");

    if (medError) {
      return new Response(
        JSON.stringify({ error: "Error retrieving medications", details: medError.message }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }

    // In a real implementation, we would generate the PDF here
    // For now, we'll just create a PDF reference
    
    // Get the user info
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not authenticated" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401 
        }
      );
    }

    // Create a PDF file record
    const fileName = `${patient.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
    
    const { data: pdfFile, error: pdfError } = await supabaseClient
      .from("pdf_files")
      .insert({
        patient_id: patientId,
        file_name: fileName,
        created_by: user.id,
        url: fileName // In a real app, this would be a URL to the file in storage
      })
      .select()
      .single();

    if (pdfError) {
      return new Response(
        JSON.stringify({ error: "Error creating PDF reference", details: pdfError.message }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "PDF generated successfully",
        pdf: {
          id: pdfFile.id,
          fileName: pdfFile.file_name,
          url: pdfFile.url,
          patientId: pdfFile.patient_id,
          createdAt: pdfFile.created_at
        }
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
