import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

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
      } else if (event === 'USER_DELETED' || event === 'SIGNED_OUT') {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#1A1F2C] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-sm p-8 rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Welcome Back</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#1A1F2C',
                  brandAccent: '#2A2F3C',
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
              },
              input: {
                borderRadius: '8px',
                padding: '10px 15px',
                fontSize: '14px',
              },
              anchor: {
                color: '#fff',
                textDecoration: 'underline',
              },
              message: {
                color: '#fff',
              },
              label: {
                color: '#fff',
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
              },
              sign_up: {
                email_label: 'Email address',
                password_label: 'Create a password',
                button_label: 'Create account',
                loading_button_label: 'Creating account...',
              },
            },
          }}
          providers={[]}
          onError={(error) => {
            toast({
              title: "Authentication Error",
              description: error.message,
              variant: "destructive",
            });
          }}
        />
      </div>
    </div>
  );
};

export default Login;