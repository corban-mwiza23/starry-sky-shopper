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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, otp }: VerifyOTPRequest = await req.json();

    if (!email || !otp) {
      return new Response(
        JSON.stringify({ error: "Email and OTP are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Clean up expired OTPs first
    await supabase.rpc('cleanup_expired_user_otps');

    // Find valid OTP
    const { data: otpRecord, error: otpError } = await supabase
      .from('user_otps')
      .select('*')
      .eq('email', email)
      .eq('otp_code', otp)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError) {
      console.error("Error fetching OTP:", otpError);
      return new Response(
        JSON.stringify({ error: "Failed to verify OTP" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!otpRecord) {
      const { data: debugOtps } = await supabase
        .from('user_otps')
        .select('otp_code, expires_at, used')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(5);

      console.log("No valid OTP found for:", {
        email,
        otp: `${otp.substring(0, 2)}****`,
        searchTime: new Date().toISOString(),
        debugOtps
      });

      return new Response(
        JSON.stringify({ error: "Invalid or expired OTP" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Valid OTP found, marking as used");

    // Mark OTP as used
    const { error: updateError } = await supabase
      .from('user_otps')
      .update({ used: true })
      .eq('id', otpRecord.id);

    if (updateError) {
      console.error("Error marking OTP as used:", updateError);
    }

    // Check if user already exists
    let userId = null;
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(user => user.email === email);

    if (existingUser) {
      userId = existingUser.id;
      console.log("User already exists:", userId);
    } else {
      // Create new user
      console.log("Creating new user for:", email);
      const { data: newUserData, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        password: `temp-${Date.now()}` // Temporary password, user won't use it
      });

      if (createError) {
        console.error("Error creating user:", createError);
        return new Response(
          JSON.stringify({ error: "Failed to create user account" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      userId = newUserData.user.id;
      console.log("Created new user:", userId);
    }

    // Generate session tokens for the user
    let sessionData;
    if (existingUser) {
      // For existing users, generate a session using magiclink type
      const { data, error: sessionError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: email,
      });
      if (sessionError) {
        console.error("Error generating session for existing user:", sessionError);
        return new Response(
          JSON.stringify({ error: "Failed to create session" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      sessionData = data;
    } else {
      // For new users, generate a session using signup type  
      const { data, error: sessionError } = await supabase.auth.admin.generateLink({
        type: 'signup',
        email: email,
      });
      if (sessionError) {
        console.error("Error generating session for new user:", sessionError);
        return new Response(
          JSON.stringify({ error: "Failed to create session" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      sessionData = data;
    }

    console.log("OTP verified successfully for user:", email);

    return new Response(JSON.stringify({ 
      success: true,
      message: "OTP verified successfully",
      user: { id: userId, email },
      session: sessionData.properties
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in verify-user-otp function:", error);
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