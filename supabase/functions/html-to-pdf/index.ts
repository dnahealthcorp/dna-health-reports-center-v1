
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the HTML content from the request body
    const { html, fileName = "document.pdf", css = "" } = await req.json();
    
    if (!html) {
      return new Response(
        JSON.stringify({ error: "HTML content is required" }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Launch a headless browser
    console.log("Launching browser...");
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    // Create a new page
    console.log("Creating page...");
    const page = await browser.newPage();
    
    // Set content with HTML and optional CSS
    console.log("Setting content...");
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.5;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            strong, b {
              font-weight: bold;
            }
            em, i {
              font-style: italic;
            }
            ul, ol {
              padding-left: 20px;
            }
            ${css}
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `);
    
    // Wait for any potential content to render (fonts, images, etc.)
    await page.waitForTimeout(500);
    
    // Generate PDF
    console.log("Generating PDF...");
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      }
    });
    
    // Close browser
    console.log("Closing browser...");
    await browser.close();
    
    // Return the PDF as a response
    console.log("Returning PDF...");
    return new Response(pdfBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      }
    });
    
  } catch (error) {
    console.error("Error generating PDF:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
