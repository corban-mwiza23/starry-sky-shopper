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
      .single();

    if (fetchError || !otpRecord) {
      console.log("OTP verification failed:", fetchError);
      return new Response(
        JSON.stringify({ error: "Invalid or expired OTP code" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Mark OTP as used
    const { error: updateError } = await supabase
      .from('admin_otps')
      .update({ used: true })
      .eq('id', otpRecord.id);

    if (updateError) {
      console.error("Failed to mark OTP as used:", updateError);
      throw new Error("Failed to process OTP");
    }

    // Sign in the user or create them if they don't exist
    let authUser;
    
    // Try to get existing user first
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(email);
    
    if (existingUser.user) {
      authUser = existingUser.user;
      
      // Update user password to ensure consistent access
      await supabase.auth.admin.updateUserById(existingUser.user.id, {
        password: email
      });
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: email, // Using email as password for admin accounts
        email_confirm: true
      });

      if (createError) {
        console.error("Failed to create admin user:", createError);
        throw new Error("Failed to authenticate admin user");
      }

      authUser = newUser.user;
    }

    // Ensure user has admin role
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', authUser.id)
      .eq('role', 'admin')
      .single();

    if (!existingRole) {
      await supabase
        .from('user_roles')
        .insert({
          user_id: authUser.id,
          role: 'admin'
        });
    }

    // Clean up expired OTPs
    await supabase.rpc('cleanup_expired_otps');

    console.log("OTP verified successfully for admin:", email);

    return new Response(JSON.stringify({ 
      success: true,
      message: "OTP verified successfully" 
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