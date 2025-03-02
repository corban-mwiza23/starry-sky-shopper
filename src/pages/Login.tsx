
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate("/");
      } else if (event === 'SIGNED_OUT') {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Create shooting stars for background
  const renderShootingStars = () => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      const randomDelay = Math.random() * 5;
      const randomDuration = 3 + Math.random() * 4;
      const randomTop = Math.random() * 100;
      const randomLeft = Math.random() * 100;
      
      stars.push(
        <div 
          key={i}
          className="shooting-star"
          style={{
            top: `${randomTop}%`,
            left: `${randomLeft}%`,
            animationDelay: `${randomDelay}s`,
            animationDuration: `${randomDuration}s`
          }}
        />
      );
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-[#1A1F2C] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black to-transparent opacity-50 z-0" />
        {renderShootingStars()}
      </div>
      
      {/* Purple gradient accent */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full filter blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/20 rounded-full filter blur-3xl" />
      
      <div className="w-full max-w-md bg-black/40 backdrop-blur-md p-8 rounded-lg shadow-xl border border-white/10 z-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">
            <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              Welcome Back
            </span>
          </h1>
          <p className="text-white/60 mt-2">Sign in to your account to continue</p>
        </div>
        
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'rgb(168, 85, 247)', // purple-500
                  brandAccent: 'rgb(192, 132, 252)', // purple-400
                  brandButtonText: 'white',
                  inputBackground: 'rgba(255, 255, 255, 0.05)',
                  inputText: 'white',
                  inputPlaceholder: 'rgba(255, 255, 255, 0.5)',
                  messageText: 'white',
                  messageTextDanger: 'rgb(244, 63, 94)', // rose-500
                  anchorTextColor: 'rgb(192, 132, 252)', // purple-400
                  dividerBackground: 'rgba(255, 255, 255, 0.1)',
                },
                borderWidths: {
                  buttonBorderWidth: '1px',
                  inputBorderWidth: '1px',
                },
                radii: {
                  borderRadiusButton: '0.5rem',
                  buttonBorderRadius: '0.5rem',
                  inputBorderRadius: '0.5rem',
                },
              },
            },
            style: {
              button: {
                border: '1px solid transparent',
                borderRadius: '8px',
                padding: '10px 15px',
                fontSize: '14px',
                fontWeight: '500',
                background: 'linear-gradient(to right, rgb(147, 51, 234), rgb(217, 70, 239))', // purple-600 to pink-500
                transition: 'all 0.2s ease',
              },
              input: {
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                padding: '10px 15px',
                fontSize: '14px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
              },
              anchor: {
                color: 'rgb(192, 132, 252)', // purple-400
                textDecoration: 'none',
                fontWeight: '500',
                ':hover': {
                  textDecoration: 'underline',
                },
              },
              message: {
                color: 'white',
                fontSize: '14px',
                margin: '10px 0',
              },
              label: {
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '14px',
                marginBottom: '6px',
              },
              container: {
                background: 'transparent',
              },
            },
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email address',
                password_label: 'Password',
                button_label: 'Sign in',
                loading_button_label: 'Signing in...',
                social_provider_text: 'Sign in with {{provider}}',
              },
              sign_up: {
                email_label: 'Email address',
                password_label: 'Create a password',
                button_label: 'Create account',
                loading_button_label: 'Creating account...',
                social_provider_text: 'Sign up with {{provider}}',
              },
              magic_link: {
                button_label: 'Send magic link',
                loading_button_label: 'Sending magic link...',
              },
            },
          }}
          providers={[]}
          theme="dark"
        />
      </div>
    </div>
  );
};

export default Login;
