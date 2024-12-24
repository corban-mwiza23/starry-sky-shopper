import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart } from "lucide-react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

const Cart = () => {
  const [items, setItems] = useState<CartItem[]>([]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    // Implement checkout logic here
    console.log("Proceeding to checkout with items:", items);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="fixed top-4 right-4 bg-cosmic-dark/50 backdrop-blur-sm border-white/20 hover:bg-cosmic-dark/70">
          <ShoppingCart className="h-4 w-4 text-white" />
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-cosmic-dark/95 backdrop-blur-sm border-white/20">
        <SheetHeader>
          <SheetTitle className="text-white">Your Cart</SheetTitle>
        </SheetHeader>
        <div className="mt-8">
          {items.length === 0 ? (
            <p className="text-cosmic-light">Your cart is empty</p>
          ) : (
            <>
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-4 border-b border-white/10">
                  <div>
                    <p className="text-white">{item.name}</p>
                    <p className="text-sm text-cosmic-light">Quantity: {item.quantity}</p>
                  </div>
                  <p className="text-white">${item.price * item.quantity}</p>
                </div>
              ))}
              <div className="mt-6">
                <p className="text-white text-lg font-semibold">Total: ${total}</p>
                <Button 
                  onClick={handleCheckout}
                  className="w-full mt-4 bg-white text-cosmic-dark hover:bg-cosmic-light"
                >
                  Checkout
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Cart;