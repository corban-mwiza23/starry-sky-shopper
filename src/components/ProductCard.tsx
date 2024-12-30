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
      className="relative group cursor-pointer h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-full overflow-hidden rounded-lg bg-cosmic-dark/30 backdrop-blur-xs transition-all duration-300 group-hover:bg-cosmic-dark/50 border border-white/10">
        <div className="aspect-square overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 border-2 border-white/20"
          />
        </div>
        <div className={`absolute inset-0 bg-gradient-to-t from-cosmic-dark/90 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute bottom-0 left-0 right-0 p-4 transform transition-transform duration-300">
            <h3 className="text-white font-semibold text-lg mb-2">{name}</h3>
            <p className="text-cosmic-light text-base mb-3">${price}</p>
            <Button 
              onClick={handleAddToCart}
              className="w-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all duration-300 border border-white/20"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;