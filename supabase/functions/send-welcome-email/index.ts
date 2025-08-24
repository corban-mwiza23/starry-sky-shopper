import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: WelcomeEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "PLUGG'IN <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to PLUGG'IN Newsletter! 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #121212; padding: 40px; border-radius: 10px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 28px; margin-bottom: 20px; font-weight: bold;">Welcome to PLUGG'IN!</h1>
            <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              Thank you for subscribing to our newsletter. You'll be the first to know about:
            </p>
            <ul style="color: #ffffff; font-size: 14px; text-align: left; margin: 0 auto; display: inline-block;">
              <li style="margin-bottom: 10px;">🆕 New product launches</li>
              <li style="margin-bottom: 10px;">💰 Exclusive discounts and sales</li>
              <li style="margin-bottom: 10px;">🎨 Limited edition collections</li>
              <li style="margin-bottom: 10px;">📰 Fashion trends and style tips</li>
            </ul>
            <div style="margin-top: 30px; padding: 20px; background-color: rgba(255, 255, 255, 0.1); border-radius: 5px;">
              <p style="color: #ffffff; font-size: 14px; margin: 0;">
                Stay tuned for exciting updates from the PLUGG'IN team!
              </p>
            </div>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #666;">
            <p style="font-size: 12px;">
              If you no longer wish to receive these emails, you can unsubscribe at any time.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
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