import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";

const ADMIN_EMAILS = ["corbanmwiza@gmail.com", "jeanlucniyonsaba46@gmail.com"];

const AdminAuth = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ADMIN_EMAILS.includes(email)) {
      toast({
        title: "Access Denied",
        description: "This admin panel is restricted to authorized users only.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-admin-otp', {
        body: { email }
      });

      if (error) throw error;

      setOtpSent(true);
      toast({
        title: "OTP Sent",
        description: "Check your email for the 6-digit verification code.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-admin-otp', {
        body: { email, otp }
      });

      if (error) throw error;

      // OTP verified successfully, now handle authentication properly
      console.log("OTP verified, creating admin user with proper auth");
      
      try {
        // Generate a secure random password
        const adminPassword = crypto.randomUUID();
        
        // Always try to create/update the admin user through our edge function
        const { data: sessionData, error: sessionError } = await supabase.functions.invoke('create-admin-session', {
          body: { email, adminPassword }
        });
        
        if (sessionError) {
          console.error("Session creation error:", sessionError);
          throw sessionError;
        }

        // Now try to sign in with the password we just set
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          password: adminPassword
        });

        if (signInError) {
          console.error("Sign in error:", signInError);
          throw signInError;
        }

        console.log("Authentication successful");
        toast({
          title: "Access Granted",
          description: "Welcome to the admin panel!",
        });
        navigate("/admin");
      } catch (authError: any) {
        console.error("Authentication error:", authError);
        toast({
          title: "Authentication Failed", 
          description: authError.message || "Failed to authenticate after OTP verification",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast({
        title: "Invalid OTP",
        description: error.message || "Invalid or expired OTP code",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Admin Access</h1>
          <p className="text-sm text-muted-foreground">
            Secure access to the administration panel
          </p>
        </div>

        {!otpSent ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">
                Verification Code
              </label>
              <Input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Check your email for the verification code
              </p>
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify & Access"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setOtpSent(false);
                setOtp("");
              }}
            >
              Back to Email
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};

export default AdminAuth;