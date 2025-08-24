
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MTNMoMoPayment } from "@/components/MTNMoMoPayment";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShippingAddress } from "@/types/database";
import { useState } from "react";

const checkoutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string()
    .min(1, "Phone number is required")
    .regex(/^[7][0-9]{8}$/, "Please enter a valid Rwandan phone number (e.g., 0781234567)"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  zipCode: z.string().min(1, "ZIP Code is required"),
  paymentMethod: z.enum(["cash", "mtn_momo"], {
    required_error: "Please select a payment method",
  }),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CartFormProps {
  onBack: () => void;
  onComplete: (customerName: string) => Promise<boolean>;
  totalAmount?: number;
}

export const CartForm = ({ onBack, onComplete, totalAmount = 0 }: CartFormProps) => {
  const { toast } = useToast();
  const [showMTNPayment, setShowMTNPayment] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: "",
      email: "",
      address: "",
      city: "",
      zipCode: "",
      paymentMethod: "cash",
    },
  });

  const watchPaymentMethod = form.watch("paymentMethod");

  const onSubmit = async (data: CheckoutFormData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to place an order",
        variant: "destructive",
      });
      return;
    }

    // If MTN MoMo is selected, show the payment component instead of completing order
    if (data.paymentMethod === "mtn_momo") {
      // First complete the order to get order ID
      const success = await onComplete(data.name);
      if (!success) return;

      // Get the latest order for this user
      const { data: latestOrder, error: orderError } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (orderError || !latestOrder) {
        console.error("Could not find the created order:", orderError);
        return;
      }

      setOrderId(latestOrder.id);
      setShowMTNPayment(true);
      return;
    }

    // For cash payments, complete the order immediately
    const success = await onComplete(data.name);
    if (!success) return;

    // Get the latest order for this user to link it to the shipping address
    const { data: latestOrder, error: orderError } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (orderError || !latestOrder) {
      console.error("Could not find the created order:", orderError);
      return;
    }

    // Save shipping address
    const shippingData: Omit<ShippingAddress, 'id' | 'created_at'> = {
      user_id: user.id,
      order_id: latestOrder.id,
      name: data.name,
      email: data.email,
      phone_number: data.phoneNumber,
      address: data.address,
      city: data.city,
      zip_code: data.zipCode,
    };

    const { error: addressError } = await supabase
      .from('shipping_addresses')
      .insert(shippingData);

    if (addressError) {
      console.error("Error saving shipping address:", addressError);
      toast({
        title: "Error",
        description: "Failed to save shipping address",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Order placed successfully",
    });
  };

  const handleMTNPaymentSuccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !orderId) return;

    const formData = form.getValues();
    
    // Save shipping address after successful payment
    const shippingData: Omit<ShippingAddress, 'id' | 'created_at'> = {
      user_id: user.id,
      order_id: orderId,
      name: formData.name,
      email: formData.email,
      phone_number: formData.phoneNumber,
      address: formData.address,
      city: formData.city,
      zip_code: formData.zipCode,
    };

    const { error: addressError } = await supabase
      .from('shipping_addresses')
      .insert(shippingData);

    if (addressError) {
      console.error("Error saving shipping address:", addressError);
    }

    toast({
      title: "Payment Successful",
      description: "Your order has been paid and will be processed soon",
    });
    
    setShowMTNPayment(false);
  };

  if (showMTNPayment) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Complete Payment</h3>
          <p className="text-white/80">Use MTN Mobile Money to pay for your order</p>
        </div>
        <MTNMoMoPayment
          amount={totalAmount}
          orderId={orderId || undefined}
          onSuccess={handleMTNPaymentSuccess}
          onError={(error) => {
            toast({
              title: "Payment Failed",
              description: error,
              variant: "destructive",
            });
          }}
        />
        <Button 
          variant="ghost" 
          onClick={() => setShowMTNPayment(false)}
          className="w-full text-white hover:text-cosmic-dark"
        >
          Back to Order Form
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Full Name</FormLabel>
              <FormControl>
                <Input {...field} className="bg-white/10 text-white border-white/20" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" className="bg-white/10 text-white border-white/20" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Phone Number</FormLabel>
              <FormControl>
                <div className="flex">
                  <div className="flex items-center justify-center px-3 bg-white/20 text-white border border-white/20 border-r-0 rounded-l-md">
                    <span className="text-sm font-medium">+250</span>
                  </div>
                  <Input 
                    {...field} 
                    type="tel" 
                    placeholder="0781234567"
                    className="bg-white/10 text-white border-white/20 rounded-l-none focus:ring-0 focus:border-white/40" 
                  />
                </div>
              </FormControl>
              <FormMessage />
              <p className="text-xs text-white/60 mt-1">
                Enter your phone number without the country code (e.g., 0781234567)
              </p>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Shipping Address</FormLabel>
              <FormControl>
                <Input {...field} className="bg-white/10 text-white border-white/20" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">City</FormLabel>
              <FormControl>
                <Input {...field} className="bg-white/10 text-white border-white/20" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="zipCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">ZIP Code</FormLabel>
              <FormControl>
                <Input {...field} className="bg-white/10 text-white border-white/20" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-white">Payment Method</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2 p-3 rounded-lg bg-white/5 border border-white/10">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="text-white cursor-pointer flex-1">
                      Cash on Delivery
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg bg-white/5 border border-white/10">
                    <RadioGroupItem value="mtn_momo" id="mtn_momo" />
                    <Label htmlFor="mtn_momo" className="text-white cursor-pointer flex-1 flex items-center gap-2">
                      <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-black font-bold text-xs">M</span>
                      </div>
                      MTN Mobile Money
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex gap-4">
          <Button 
            type="button"
            variant="ghost" 
            onClick={onBack}
            className="flex-1 text-white hover:text-cosmic-dark"
          >
            Back
          </Button>
          <Button 
            type="submit"
            className="flex-1 bg-white text-cosmic-dark hover:bg-cosmic-light"
          >
            {watchPaymentMethod === "mtn_momo" ? "Continue to Payment" : "Place Order"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
