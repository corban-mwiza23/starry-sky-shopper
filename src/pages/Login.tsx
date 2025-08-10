import { useEffect } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/account");
      }
    };
    checkUser();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <img 
            src="/lovable-uploads/millicado-spider-logo.png" 
            alt="Millicado Logo" 
            className="h-20 w-auto mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              style: {
                button: {
                  backgroundColor: '#000000',
                  color: 'white',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '10px 16px',
                },
                input: {
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  fontSize: '14px',
                  color: '#111827',
                },
                label: {
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '6px',
                },
                anchor: {
                  color: '#6b7280',
                  fontSize: '14px',
                },
                message: {
                  color: '#dc2626',
                  fontSize: '14px',
                },
                container: {
                  width: '100%',
                }
              },
              className: {
                button: "hover:bg-gray-800 transition-colors duration-200 w-full",
                input: "focus:border-gray-400 focus:ring-0 w-full",
              }
            }}
            providers={[]}
            redirectTo={`${window.location.origin}/account`}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;