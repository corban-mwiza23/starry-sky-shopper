import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Shield, Loader2 } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

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

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-user-otp', {
        body: { email }
      });

      if (error) {
        console.error('OTP send error:', error);
        toast({
          title: "Error",
          description: "Failed to send verification code. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Code Sent!",
        description: `We've sent a 6-digit code to ${email}`,
        className: "bg-white text-black border border-gray-200",
      });
      
      setStep("otp");
      setCountdown(60); // 1 minute countdown
    } catch (error: any) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-user-otp', {
        body: { email, otp }
      });

      if (error) {
        console.error('OTP verification error:', error);
        toast({
          title: "Invalid Code",
          description: "The code you entered is incorrect or expired. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.error) {
        toast({
          title: "Invalid Code",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      // Create a proper Supabase session using the session data
      if (data?.session?.access_token) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        });

        if (sessionError) {
          console.error('Session creation error:', sessionError);
          toast({
            title: "Login Error",
            description: "Failed to create session. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }

      toast({
        title: "Welcome!",
        description: "You've been successfully logged in.",
        className: "bg-white text-black border border-gray-200",
      });

      // Navigate to account page
      navigate("/account");
    } catch (error: any) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-user-otp', {
        body: { email }
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to resend code. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Code Resent!",
        description: "A new verification code has been sent to your email.",
        className: "bg-white text-black border border-gray-200",
      });
      
      setCountdown(60);
      setOtp(""); // Clear existing OTP input
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] via-[#0B1426] to-[#1A1F2C] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-fuchsia-900/20"></div>
      
      <div className="relative w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-white/60 hover:text-white hover:bg-white/10 absolute left-0"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Store
            </Button>
          </div>
          
          <img 
            src="/lovable-uploads/81b3af56-15f1-4535-8e61-b2a94a4afd4e.png" 
            alt="PLUGG'IN Logo" 
            className="h-16 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold font-revans text-white mb-1">PLUGG'IN</h1>
          <p className="text-white/60 font-miralone">
            {step === "email" ? "Sign in to your account" : "Enter verification code"}
          </p>
        </div>

        <Card className="border border-white/10 backdrop-blur-sm bg-cosmic-dark/80">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4">
              {step === "email" ? (
                <Mail className="h-6 w-6 text-white" />
              ) : (
                <Shield className="h-6 w-6 text-white" />
              )}
            </div>
            <CardTitle className="text-white text-xl">
              {step === "email" ? "Welcome Back" : "Check Your Email"}
            </CardTitle>
            {step === "otp" && (
              <p className="text-white/60 text-sm mt-2">
                We sent a 6-digit code to<br />
                <span className="font-semibold text-white">{email}</span>
              </p>
            )}
          </CardHeader>
          <CardContent>
            {step === "email" ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    placeholder="Enter your email address"
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full bg-white text-black hover:bg-gray-100 font-semibold py-6"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    "Send Verification Code"
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-white">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    required
                    disabled={isLoading}
                  />
                  <p className="text-white/60 text-xs text-center">
                    Enter the 6-digit code sent to your email
                  </p>
                </div>
                
                <Button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full bg-white text-black hover:bg-gray-100 font-semibold py-6"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Sign In"
                  )}
                </Button>
                
                <div className="flex flex-col items-center gap-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep("email")}
                    className="text-white/60 hover:text-white hover:bg-white/10"
                  >
                    Change Email Address
                  </Button>
                  
                  <div className="text-center">
                    {countdown > 0 ? (
                      <p className="text-white/60 text-sm">
                        Resend code in {countdown}s
                      </p>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleResendOTP}
                        disabled={isLoading}
                        className="text-white hover:text-white hover:bg-white/10 text-sm"
                      >
                        Didn't receive the code? Resend
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;