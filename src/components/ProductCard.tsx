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
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden rounded-lg bg-cosmic-dark/30 backdrop-blur-xs transition-all duration-300 group-hover:bg-cosmic-dark/50">
        <img
          src={image}
          alt={name}
          className="w-full h-[200px] object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-cosmic-dark/80 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute bottom-0 left-0 right-0 p-3 transform transition-transform duration-300">
            <h3 className="text-white font-semibold text-base mb-1">{name}</h3>
            <p className="text-cosmic-light text-sm mb-2">${price}</p>
            <Button 
              onClick={handleAddToCart}
              className="w-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all duration-300"
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