
import { useEffect } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

// Add custom styling to override Supabase Auth UI
const customStyles = {
  container: {
    maxWidth: "400px",
    margin: "0 auto",
    padding: "2rem",
    background: "rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(10px)",
    borderRadius: "0.5rem",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  button: {
    backgroundColor: "rgb(124, 58, 237)",
    color: "white",
    fontFamily: "monospace",
  },
  anchor: {
    color: "rgb(156, 163, 175)",
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "white",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  label: {
    color: "white",
    fontFamily: "monospace",
  },
  message: {
    color: "white",
    fontFamily: "monospace",
  },
};

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

    // Create star animation
    const createShootingStars = () => {
      const container = document.querySelector(".star-container");
      if (!container) return;

      for (let i = 0; i < 20; i++) {
        const star = document.createElement("div");
        star.className = "shooting-star";
        
        // Random position and delay
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 5}s`;
        
        container.appendChild(star);
      }
    };

    createShootingStars();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 bg-black text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-fuchsia-900/20 z-0"></div>
      <div className="star-container absolute inset-0 z-0"></div>
      
      <div className="relative z-10 px-4">
        <div className="text-center mb-6">
          <img 
            src="/lovable-uploads/761c3dec-7031-4392-b6d8-70525efd46e2.png" 
            alt="Millicado Logo" 
            className="h-28 w-auto mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold font-mono mb-2">COSMIC APPAREL</h1>
          <p className="text-gray-400 font-mono">Sign in to continue</p>
        </div>
        
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            style: customStyles,
            className: {
              button: "hover:bg-purple-400 transition-colors duration-200",
              input: "focus:border-purple-500",
            }
          }}
          providers={[]}
          redirectTo={`${window.location.origin}/account`}
        />
      </div>
    </div>
  );
};

export default Login;
