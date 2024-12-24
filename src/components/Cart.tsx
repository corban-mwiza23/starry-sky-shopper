import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CheckoutFormData {
  name: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
}

const Cart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
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

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleUpdateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setItems(items.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleRemoveItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const onSubmit = (data: CheckoutFormData) => {
    console.log("Checkout data:", { items, ...data });
    toast({
      title: "Order placed successfully!",
      description: "Thank you for your purchase.",
    });
    setItems([]);
    setIsCheckingOut(false);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="fixed top-4 right-4 bg-cosmic-dark/50 backdrop-blur-sm border-white/20 hover:bg-cosmic-dark/70"
        >
          <ShoppingCart className="h-4 w-4 text-white" />
          {items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {items.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-cosmic-dark/95 backdrop-blur-sm border-white/20 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-white">Your Cart</SheetTitle>
        </SheetHeader>
        <div className="mt-8">
          {items.length === 0 ? (
            <p className="text-cosmic-light">Your cart is empty</p>
          ) : (
            <>
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-4 border-b border-white/10">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1">
                    <p className="text-white">{item.name}</p>
                    <p className="text-sm text-cosmic-light">${item.price}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <span className="text-white">{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-400 hover:text-red-300 ml-2"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                  <p className="text-white">${item.price * item.quantity}</p>
                </div>
              ))}
              <div className="mt-6">
                <p className="text-white text-lg font-semibold">Total: ${total.toFixed(2)}</p>
                {!isCheckingOut ? (
                  <Button 
                    onClick={() => setIsCheckingOut(true)}
                    className="w-full mt-4 bg-white text-cosmic-dark hover:bg-cosmic-light"
                  >
                    Proceed to Checkout
                  </Button>
                ) : (
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
                          onClick={() => setIsCheckingOut(false)}
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
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Cart;