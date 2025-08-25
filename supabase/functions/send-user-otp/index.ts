import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendOTPRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: SendOTPRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry to 10 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Clean up any existing unused OTPs for this email
    await supabase
      .from('user_otps')
      .delete()
      .eq('email', email)
      .eq('used', false);

    // Store OTP in database
    const { error: insertError } = await supabase
      .from('user_otps')
      .insert({
        email,
        otp_code: otpCode,
        expires_at: expiresAt.toISOString(),
        used: false
      });

    if (insertError) {
      console.error("Error storing OTP:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to generate OTP" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send OTP via email using Resend
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    const emailResponse = await resend.emails.send({
      from: "PLUGG'IN <onboarding@resend.dev>",
      to: [email],
      subject: "Your PLUGG'IN Login Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; font-size: 24px; margin-bottom: 10px;">PLUGG'IN</h1>
            <p style="color: #666; font-size: 16px;">Your Login Verification Code</p>
          </div>
          
          <div style="background: #f8f9fa; border-radius: 10px; padding: 30px; text-align: center; margin-bottom: 30px;">
            <h2 style="color: #333; font-size: 32px; letter-spacing: 5px; margin: 0; font-family: monospace;">
              ${otpCode}
            </h2>
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <p style="color: #666; font-size: 16px; margin-bottom: 10px;">
              Enter this code to access your PLUGG'IN account
            </p>
            <p style="color: #999; font-size: 14px;">
              This code will expire in 10 minutes
            </p>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
            <p style="color: #999; font-size: 12px;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    console.log("OTP sent successfully:", {
      email,
      otpCode: `${otpCode.substring(0, 2)}****`,
      emailResponse: "Email sent"
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: "OTP sent successfully"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-user-otp function:", error);
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