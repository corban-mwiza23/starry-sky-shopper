import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerifyOTPRequest {
  email: string;
  otp: string;
}

const ADMIN_EMAILS = ["corbanmwiza@gmail.com", "jeanlucniyonsaba46@gmail.com"];

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, otp }: VerifyOTPRequest = await req.json();

    // Validate admin email
    if (!ADMIN_EMAILS.includes(email)) {
      return new Response(
        JSON.stringify({ error: "Access denied. Not an authorized admin email." }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Find and verify OTP
    const { data: otpRecord, error: fetchError } = await supabase
      .from('admin_otps')
      .select('*')
      .eq('email', email)
      .eq('otp_code', otp)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (fetchError) {
      console.error("Database error during OTP lookup:", fetchError);
      return new Response(
        JSON.stringify({ error: "Database error occurred" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!otpRecord) {
      console.log("No valid OTP found for:", { 
        email, 
        otp: otp.substring(0, 2) + "****",
        searchTime: new Date().toISOString()
      });
      
      // Debug: Check what OTPs exist for this email
      const { data: debugOtps } = await supabase
        .from('admin_otps')
        .select('otp_code, expires_at, used, created_at')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(3);
      
      console.log("Recent OTPs for email:", { email, debugOtps });
      
      return new Response(
        JSON.stringify({ error: "Invalid or expired OTP code" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Valid OTP found, marking as used");

    // Mark OTP as used
    const { error: updateError } = await supabase
      .from('admin_otps')
      .update({ used: true })
      .eq('id', otpRecord.id);

    if (updateError) {
      console.error("Failed to mark OTP as used:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to process OTP" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Clean up expired OTPs
    await supabase.rpc('cleanup_expired_otps');

    console.log("OTP verified successfully for admin:", email);

    return new Response(JSON.stringify({ 
      success: true,
      message: "OTP verified successfully",
      email: email
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in verify-admin-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);