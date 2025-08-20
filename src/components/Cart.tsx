
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart } from "lucide-react";
import { CartForm } from "./CartForm";
import { CartItemList } from "./CartItemList";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartProps {
  items: CartItem[];
  setItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  onOrderSubmit: (customerName: string) => Promise<boolean>;
}

const Cart = ({ items, setItems, onOrderSubmit }: CartProps) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const navigate = useNavigate();

  // Calculate total
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleUpdateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setItems(items.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleRemoveItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleProceedToCheckout = () => {
    // If there's only one item in the cart, redirect to the external checkout
    if (items.length === 1) {
      setIsSheetOpen(false);
      navigate(`/checkout?productId=${items[0].id}`);
    } else {
      // For multiple items, show the inline checkout form
      setIsCheckingOut(true);
    }
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="relative bg-cosmic-dark/50 backdrop-blur-sm border-white/20 hover:bg-cosmic-dark/70 shadow-lg h-10 w-10 transition-all duration-300"
        >
          <ShoppingCart className="h-4 w-4 text-white" />
          {items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {items.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent 
        className="bg-cosmic-dark/95 backdrop-blur-sm border-white/20 overflow-y-auto w-full sm:max-w-md md:max-w-lg"
        side="right"
      >
        <SheetHeader>
          <SheetTitle className="text-white text-lg sm:text-xl md:text-2xl">Your Cart</SheetTitle>
        </SheetHeader>
        <div className="mt-8">
          {items.length === 0 ? (
            <p className="text-cosmic-light text-base sm:text-lg">Your cart is empty</p>
          ) : (
            <>
              <CartItemList 
                items={items}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
              />
              <div className="mt-6 sticky bottom-0 bg-cosmic-dark/95 backdrop-blur-sm p-4 border-t border-white/10">
                <p className="text-white text-lg sm:text-xl font-semibold">
                  Total: ${total.toFixed(2)}
                </p>
                {!isCheckingOut ? (
                  <Button 
                    onClick={handleProceedToCheckout}
                    className="w-full mt-4 bg-white text-cosmic-dark hover:bg-cosmic-light sm:py-6 text-base sm:text-lg"
                  >
                    Proceed to Checkout
                  </Button>
                ) : (
                  <CartForm 
                    onBack={() => setIsCheckingOut(false)}
                    totalAmount={total}
                    onComplete={async (customerName) => {
                      const { data: { user } } = await supabase.auth.getUser();
                      if (!user) return false;

                      const success = await onOrderSubmit(customerName);
                      if (success) {
                        setItems([]);
                        setIsCheckingOut(false);
                        setIsSheetOpen(false);
                      }
                      return success;
                    }}
                  />
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
