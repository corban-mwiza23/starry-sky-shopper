import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendOTPRequest {
  email: string;
}

const ADMIN_EMAILS = ["corbanmwiza@gmail.com", "jeanlucniyonsaba46@gmail.com"];

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: SendOTPRequest = await req.json();

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

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Clean up old OTPs for this email
    await supabase
      .from('admin_otps')
      .delete()
      .eq('email', email);

    // Store OTP in database (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    
    const { error: dbError } = await supabase
      .from('admin_otps')
      .insert({
        email,
        otp_code: otpCode,
        expires_at: expiresAt,
        used: false
      });

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to store OTP");
    }

    // Send OTP via email
    const emailResponse = await resend.emails.send({
      from: "Admin Access <onboarding@resend.dev>",
      to: [email],
      subject: "Your Admin Access Code",
      html: `
        <h1>Admin Access Code</h1>
        <p>Your one-time password for admin access is:</p>
        <div style="
          font-family: monospace;
          font-size: 32px;
          font-weight: bold;
          color: #2563eb;
          background: #f1f5f9;
          padding: 20px;
          text-align: center;
          border-radius: 8px;
          margin: 20px 0;
          letter-spacing: 4px;
        ">
          ${otpCode}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p style="color: #64748b; font-size: 14px;">
          If you didn't request this code, please ignore this email.
        </p>
      `,
    });

    console.log("OTP sent successfully:", { 
      email, 
      otpCode, 
      emailResponse: emailResponse.data ? "Email sent" : emailResponse.error 
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
    console.error("Error in send-admin-otp function:", error);
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