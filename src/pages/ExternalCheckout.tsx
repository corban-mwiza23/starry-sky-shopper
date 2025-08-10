import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CartForm } from "@/components/CartForm";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ExternalCheckout = () => {
  const [searchParams] = useSearchParams();
  const productIdParam = searchParams.get("productId");
  const { toast } = useToast();
  const navigate = useNavigate();
  const [productDetails, setProductDetails] = useState<{
    id: number;
    name: string;
    price: number;
    image: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productIdParam) {
        toast({
          title: "Error",
          description: "No product ID specified",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      try {
        const productId = parseInt(productIdParam, 10);
        
        if (isNaN(productId)) {
          throw new Error("Invalid product ID format");
        }

        const { data, error } = await supabase
          .from("products")
          .select("id, name, price, image")
          .eq("id", productId)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Product not found");

        setProductDetails(data);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast({
          title: "Error",
          description: "Failed to load product details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [productIdParam, toast]);

  const handleOrderSubmit = async (customerName: string) => {
    if (!productDetails) return false;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to place an order",
          variant: "destructive",
        });
        return false;
      }

      const orderData = {
        product_id: productDetails.id,
        quantity: 1,
        total_price: productDetails.price,
        customer_name: customerName,
        user_id: user.id,
        status: 'pending'
      };

      const { error } = await supabase
        .from('orders')
        .insert(orderData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order placed successfully",
      });

      setTimeout(() => navigate("/"), 2000);
      return true;
    } catch (error) {
      console.error('Error saving order:', error);
      toast({
        title: "Error",
        description: "There was a problem saving your order",
        variant: "destructive",
      });
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center py-12 px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-fuchsia-900/20 z-0"></div>
      <div className="relative w-full max-w-md z-10">
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/761c3dec-7031-4392-b6d8-70525efd46e2.png" 
            alt="Millicado Logo" 
            className="h-16 w-auto mx-auto mb-2"
          />
          <h1 className="text-2xl font-bold font-revans text-white/90 mb-1">MILLICADO</h1>
          <p className="text-white/60 font-miralone">Complete your purchase</p>
        </div>

        {isLoading ? (
          <Card className="border border-white/10 backdrop-blur-sm bg-cosmic-dark/80">
            <CardContent className="pt-6">
              <div className="h-20 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
              </div>
            </CardContent>
          </Card>
        ) : !productDetails ? (
          <Card className="border border-white/10 backdrop-blur-sm bg-cosmic-dark/80">
            <CardContent className="pt-6">
              <div className="text-center text-white">
                <p>Product not found</p>
                <Button 
                  onClick={() => navigate("/")}
                  className="mt-4 bg-white text-cosmic-dark hover:bg-cosmic-light"
                >
                  Return to Shop
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="overflow-hidden border border-white/10 backdrop-blur-sm bg-cosmic-dark/80 mb-6">
              <CardHeader className="pb-0">
                <CardTitle className="text-xl text-center text-white">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 py-4">
                  <div className="h-16 w-16 rounded-md overflow-hidden">
                    <img 
                      src={productDetails.image} 
                      alt={productDetails.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">{productDetails.name}</p>
                    <p className="text-white/70">Quantity: 1</p>
                  </div>
                  <div className="text-white font-semibold">
                    ${productDetails.price.toFixed(2)}
                  </div>
                </div>
                <div className="border-t border-white/10 mt-2 pt-4">
                  <div className="flex justify-between">
                    <span className="text-white font-semibold">Total:</span>
                    <span className="text-white font-semibold">${productDetails.price.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-white/10 backdrop-blur-sm bg-cosmic-dark/80">
              <CardHeader className="pb-0">
                <CardTitle className="text-xl text-center text-white">Shipping Information</CardTitle>
              </CardHeader>
              <CardContent>
                <CartForm
                  onBack={() => navigate("/")}
                  onComplete={handleOrderSubmit}
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default ExternalCheckout;
