import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const config: SmtpConfig = await req.json();
    
    const client = new SmtpClient();
    
    try {
      await client.connect({
        hostname: config.host,
        port: config.port,
        username: config.auth.user,
        password: config.auth.pass,
        tls: config.secure,
      });
      
      await client.close();
      
      return new Response(
        JSON.stringify({ success: true, message: "SMTP connection successful" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (error) {
      console.error("SMTP connection error:", error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Failed to connect to SMTP server",
          error: error.message 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
  } catch (error) {
    console.error("Request parsing error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "Invalid request",
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
};

serve(handler);