
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShippingAddress } from "@/types/database";

const checkoutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string()
    .min(1, "Phone number is required")
    .regex(/^[7][0-9]{8}$/, "Please enter a valid Rwandan phone number (e.g., 0781234567)"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  zipCode: z.string().min(1, "ZIP Code is required"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CartFormProps {
  onBack: () => void;
  onComplete: (customerName: string) => Promise<boolean>;
  totalAmount?: number;
}

export const CartForm = ({ onBack, onComplete, totalAmount = 0 }: CartFormProps) => {
  const { toast } = useToast();
  
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: "",
      email: "",
      address: "",
      city: "",
      zipCode: "",
    },
  });

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

    // Complete the order
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
      className: "bg-white text-black border border-gray-200",
    });
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Full Name</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-white/10 text-white border-white/20 placeholder:text-white/50" />
                </FormControl>
                <FormMessage className="text-red-400" />
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
                  <Input {...field} type="email" className="bg-white/10 text-white border-white/20 placeholder:text-white/50" />
                </FormControl>
                <FormMessage className="text-red-400" />
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
                      placeholder="781234567"
                      className="bg-white/10 text-white border-white/20 rounded-l-none focus:ring-0 focus:border-white/40 placeholder:text-white/50" 
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-400" />
                <p className="text-xs text-white/60 mt-1">
                  Enter your phone number without the country code (e.g., 781234567)
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
                  <Input {...field} className="bg-white/10 text-white border-white/20 placeholder:text-white/50" />
                </FormControl>
                <FormMessage className="text-red-400" />
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
                  <Input {...field} className="bg-white/10 text-white border-white/20 placeholder:text-white/50" />
                </FormControl>
                <FormMessage className="text-red-400" />
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
                  <Input {...field} className="bg-white/10 text-white border-white/20 placeholder:text-white/50" />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          
          <div className="pt-4">
            <p className="text-white/80 text-sm mb-4">
              Payment Method: <span className="font-semibold">Cash on Delivery</span>
            </p>
          </div>
          
          <div className="flex gap-4 pt-4">
            <Button 
              type="button"
              variant="ghost" 
              onClick={onBack}
              className="flex-1 text-white hover:bg-white/10 border border-white/20"
            >
              Back to Cart
            </Button>
            <Button 
              type="submit"
              className="flex-1 bg-white text-black hover:bg-gray-100 font-semibold"
            >
              Place Order
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
