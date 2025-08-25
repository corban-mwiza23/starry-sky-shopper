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
  is_sold_out?: boolean | null;
  quantity?: number | null;
  onAddToCart: (id: number, name: string, price: number, image: string) => void;
}

const ProductCard = ({ 
  id, 
  name, 
  price, 
  image, 
  discount_percentage = 0, 
  is_on_sale = false,
  is_sold_out = false,
  quantity = 0,
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
    if (is_sold_out || quantity === 0) return;
    
    onAddToCart(id, name, finalPrice, image);
    toast({
      title: "Added to cart",
      description: `${name} has been added to your cart.`,
    });
  };

  return (
    <div
      className={`group relative flex flex-col items-center transition-opacity duration-300 ${
        is_sold_out ? 'opacity-60' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full aspect-square mb-4">
        <div className="absolute inset-0 rounded-lg bg-white/5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {is_on_sale && discount_percentage && !is_sold_out && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            -{discount_percentage}%
          </div>
        )}
        {is_sold_out && (
          <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
            Sold Out
          </div>
        )}
        <img
          src={image}
          alt={name}
          className={`w-full h-full object-contain filter transition-all duration-300 ${
            is_sold_out 
              ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] grayscale' 
              : 'drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]'
          }`}
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
        disabled={is_sold_out || quantity === 0}
        className={`transition-all duration-300 border border-white/20 ${
          is_sold_out || quantity === 0
            ? 'opacity-50 cursor-not-allowed bg-gray-600/50 text-gray-400'
            : 'opacity-0 group-hover:opacity-100 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm'
        }`}
      >
        {is_sold_out || quantity === 0 ? 'Sold Out' : 'Add to Cart'}
      </Button>
    </div>
  );
};

export default ProductCard;