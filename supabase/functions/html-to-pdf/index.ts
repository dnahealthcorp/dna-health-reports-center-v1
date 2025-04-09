
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
    
    // Create a full HTML document with proper doctype and charset
    console.log("Setting content...");
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${fileName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            strong, b {
              font-weight: bold !important;
            }
            em, i {
              font-style: italic !important;
            }
            ul, ol {
              padding-left: 20px !important;
              margin: 10px 0 !important;
            }
            li {
              margin: 5px 0 !important;
            }
            p {
              margin: 10px 0 !important;
              display: block !important;
            }
            h1, h2, h3, h4, h5, h6 {
              margin-top: 20px !important;
              margin-bottom: 10px !important;
              font-weight: bold !important;
              display: block !important;
            }
            h1 { font-size: 24px !important; }
            h2 { font-size: 20px !important; }
            h3 { font-size: 16px !important; }
            hr { 
              border: none !important;
              border-top: 1px solid #ddd !important;
              margin: 20px 0 !important;
            }
            table {
              width: 100% !important;
              border-collapse: collapse !important;
              margin: 15px 0 !important;
            }
            th, td {
              padding: 8px !important;
              border: 1px solid #ddd !important;
              text-align: left !important;
            }
            th {
              background-color: #99BC44 !important;
              color: white !important;
            }
            tr:nth-child(even) {
              background-color: #f5f5f5 !important;
            }
            /* Fix for paragraph tags */
            p:empty {
              display: block !important;
              min-height: 1em !important;
            }
            ${css}
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;
    
    // Use content with waitUntil for better rendering
    await page.setContent(fullHtml, { 
      waitUntil: 'networkidle0',
      timeout: 30000 // Extended timeout for complex content
    });
    
    // Add specific evaluations to ensure HTML tags are rendered properly
    await page.evaluate(() => {
      // Force browser to process all HTML elements
      document.body.innerHTML = document.body.innerHTML;
      
      // Fix common issues with paragraph rendering
      document.querySelectorAll('p').forEach(p => {
        if (p.innerHTML.trim() === '') {
          p.style.minHeight = '1em';
        }
      });
    });
    
    // Ensure all content is properly rendered with a generous waiting time
    console.log("Waiting for content to render...");
    await page.waitForTimeout(3000);
    
    // Generate PDF with improved settings for better quality
    console.log("Generating PDF...");
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
      displayHeaderFooter: false,
      preferCSSPageSize: true
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
