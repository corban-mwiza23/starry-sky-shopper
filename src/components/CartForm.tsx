import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";

interface CheckoutFormData {
  name: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
}

interface CartFormProps {
  onBack: () => void;
  onComplete: () => void;
}

export const CartForm = ({ onBack, onComplete }: CartFormProps) => {
  const { toast } = useToast();
  const form = useForm<CheckoutFormData>({
    defaultValues: {
      name: "",
      email: "",
      address: "",
      city: "",
      zipCode: "",
    },
  });

  const onSubmit = (data: CheckoutFormData) => {
    console.log("Checkout data:", data);
    toast({
      title: "Order placed successfully!",
      description: "Thank you for your purchase.",
    });
    onComplete();
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