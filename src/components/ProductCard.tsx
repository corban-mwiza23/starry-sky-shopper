import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  image: string;
  onAddToCart: (id: number, name: string, price: number, image: string) => void;
}

const ProductCard = ({ id, name, price, image, onAddToCart }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();

  const handleAddToCart = () => {
    onAddToCart(id, name, price, image);
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
        <img
          src={image}
          alt={name}
          className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
        />
      </div>
      <h3 className="text-white font-mono uppercase text-sm tracking-wider text-center mb-2">{name}</h3>
      <p className="text-white/80 font-mono text-sm mb-2">£{price.toFixed(2)}</p>
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