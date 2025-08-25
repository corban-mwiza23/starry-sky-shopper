
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
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
      // For multiple items, close cart and show checkout dialog
      setIsSheetOpen(false);
      setIsCheckoutDialogOpen(true);
    }
  };

  return (
    <>
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
                <div className="mt-6 p-4 bg-cosmic-dark/95 backdrop-blur-sm border-t border-white/10">
                  <p className="text-white text-lg sm:text-xl font-semibold mb-4">
                    Total: {total.toLocaleString()} RWF
                  </p>
                  <Button 
                    onClick={handleProceedToCheckout}
                    className="w-full bg-white text-cosmic-dark hover:bg-cosmic-light sm:py-6 text-base sm:text-lg font-semibold"
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutDialogOpen} onOpenChange={setIsCheckoutDialogOpen}>
        <DialogContent className="bg-cosmic-dark/95 backdrop-blur-sm border-white/20 text-white max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Complete Your Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center border-b border-white/10 pb-4">
              <p className="text-white text-lg font-semibold">
                Order Total: {total.toLocaleString()} RWF
              </p>
              <p className="text-white/60 text-sm">
                {items.length} item{items.length > 1 ? 's' : ''} in cart
              </p>
            </div>
            <CartForm 
              onBack={() => setIsCheckoutDialogOpen(false)}
              totalAmount={total}
              onComplete={async (customerName) => {
                let user;
                
                // Try to get existing user
                const { data: { user: currentUser } } = await supabase.auth.getUser();
                
                if (!currentUser) {
                  // Create anonymous user for guest checkout
                  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                    email: `guest-${Date.now()}@temp.com`,
                    password: `temp-${Date.now()}`,
                  });
                  
                  if (signUpError) {
                    console.error('Error creating anonymous user:', signUpError);
                    return false;
                  }
                  
                  user = signUpData.user;
                } else {
                  user = currentUser;
                }
                
                if (!user) return false;

                const success = await onOrderSubmit(customerName);
                // Always close the dialog and clear cart regardless of success/failure for better UX
                setItems([]);
                setIsCheckoutDialogOpen(false);
                return success;
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Cart;
