import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const checkoutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  zipCode: z.string().min(1, "ZIP Code is required"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CartFormProps {
  onBack: () => void;
  onComplete: (customerName: string) => Promise<boolean>;
}

export const CartForm = ({ onBack, onComplete }: CartFormProps) => {
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

    // First complete the order
    const success = await onComplete(data.name);
    if (!success) return;

    // Get the latest order for this user to link it to the shipping address
    const { data: latestOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!latestOrder) {
      console.error("Could not find the created order");
      return;
    }

    // Save shipping address
    const { error: addressError } = await supabase
      .from('shipping_addresses')
      .insert({
        user_id: user.id,
        order_id: latestOrder.id,
        name: data.name,
        email: data.email,
        address: data.address,
        city: data.city,
        zip_code: data.zipCode,
      });

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
            Place Order
          </Button>
        </div>
      </form>
    </Form>
  );
};