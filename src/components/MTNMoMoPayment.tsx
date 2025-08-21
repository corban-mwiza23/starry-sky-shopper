import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MTNMoMoPaymentProps {
  amount: number;
  orderId?: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const MTNMoMoPayment: React.FC<MTNMoMoPaymentProps> = ({
  amount,
  orderId,
  onSuccess,
  onError
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number format (Rwandan phone numbers)
    const phoneRegex = /^(\+250|250|0)?[7][0-9]{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Rwandan phone number (e.g., 0781234567)",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      console.log('Initiating MTN MoMo payment...');
      
      const { data, error } = await supabase.functions.invoke('mtn-momo-payment', {
        body: {
          phoneNumber: phoneNumber.startsWith('0') ? `+25${phoneNumber.substring(1)}` : phoneNumber,
          amount: Math.round(amount * 100), // Convert to cents/francs
          orderId
        }
      });

      if (error) {
        console.error('Payment error:', error);
        const errorMessage = error.message || 'Payment failed';
        toast({
          title: "Payment Failed",
          description: errorMessage,
          variant: "destructive",
        });
        onError?.(errorMessage);
        return;
      }

      console.log('Payment response:', data);

      if (data.success) {
        toast({
          title: "Payment Initiated",
          description: "Please check your phone for the payment prompt and complete the transaction",
        });
        
        // Poll for payment status
        setTimeout(() => {
          toast({
            title: "Payment Processing",
            description: "Your payment is being processed. You will be notified once completed.",
          });
          onSuccess?.();
        }, 3000);
      } else {
        const errorMessage = data.error || 'Payment failed';
        toast({
          title: "Payment Failed",
          description: errorMessage,
          variant: "destructive",
        });
        onError?.(errorMessage);
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = 'An unexpected error occurred';
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
            <span className="text-black font-bold text-sm">M</span>
          </div>
          MTN Mobile Money
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-sm font-medium text-yellow-800 mb-1">🚧 Under Development</p>
          <p className="text-xs text-yellow-700">
            MTN MoMo payments are currently being tested. Please use cash payment for now.
          </p>
        </div>
        
        <div className="space-y-2 opacity-50">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="0781234567"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={true}
          />
          <p className="text-sm text-muted-foreground">
            Enter your MTN Mobile Money number
          </p>
        </div>
        
        <div className="p-3 bg-muted rounded-lg opacity-50">
          <div className="flex justify-between items-center">
            <span className="font-medium">Amount to pay:</span>
            <span className="font-bold">{amount.toLocaleString()} RWF</span>
          </div>
        </div>

        <Button 
          onClick={handlePayment}
          disabled={true}
          className="w-full opacity-50"
        >
          Under Development - Use Cash Payment
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          This payment method is currently under development and testing.
        </p>
      </CardContent>
    </Card>
  );
};