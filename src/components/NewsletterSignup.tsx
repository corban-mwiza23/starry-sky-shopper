import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!consent) {
      toast({
        title: "Consent Required",
        description: "Please agree to receive updates before subscribing.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email }]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "You've been subscribed to our newsletter.",
      });
      setEmail("");
      setConsent(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-transparent border-white/20 text-white placeholder:text-white/50 font-mono"
        />
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-transparent border border-white hover:bg-white hover:text-black transition-colors font-mono"
        >
          Subscribe
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="consent" 
          checked={consent}
          onCheckedChange={(checked) => setConsent(checked as boolean)}
          className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black"
        />
        <Label 
          htmlFor="consent" 
          className="text-sm text-white/80 font-mono cursor-pointer"
        >
          I agree to receive updates and marketing emails
        </Label>
      </div>
    </form>
  );
};

export default NewsletterSignup;