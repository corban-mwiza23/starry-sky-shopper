import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  image: string;
  discount_percentage?: number | null;
  is_on_sale?: boolean | null;
  onAddToCart: (id: number, name: string, price: number, image: string) => void;
}

const ProductCard = ({ 
  id, 
  name, 
  price, 
  image, 
  discount_percentage = 0, 
  is_on_sale = false, 
  onAddToCart 
}: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();

  const calculateDiscountedPrice = (originalPrice: number, discountPercentage: number) => {
    return originalPrice - (originalPrice * (discountPercentage / 100));
  };

  const finalPrice = is_on_sale && discount_percentage 
    ? calculateDiscountedPrice(price, discount_percentage)
    : price;

  const handleAddToCart = () => {
    onAddToCart(id, name, finalPrice, image);
    toast({
      title: "Added to cart",
      description: `${name} has been added to your cart.`,
    });
  };

  return (
    <div
      className="group relative flex flex-col items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full aspect-square mb-4">
        <div className="absolute inset-0 rounded-lg bg-white/5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {is_on_sale && discount_percentage && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            -{discount_percentage}%
          </div>
        )}
        <img
          src={image}
          alt={name}
          className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
        />
      </div>
      <h3 className="text-white font-mono uppercase text-sm tracking-wider text-center mb-2">{name}</h3>
      <div className="flex flex-col items-center gap-1 mb-2">
        {is_on_sale && discount_percentage ? (
          <>
            <p className="text-white/80 font-mono text-sm line-through">RWF{price.toFixed(2)}</p>
            <p className="text-red-500 font-mono text-lg font-bold">RWF{finalPrice.toFixed(2)}</p>
          </>
        ) : (
          <p className="text-white/80 font-mono text-sm">RWF{price.toFixed(2)}</p>
        )}
      </div>
      <Button
        onClick={handleAddToCart}
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/20"
      >
        Add to Cart
      </Button>
    </div>
  );
};

export default ProductCard;