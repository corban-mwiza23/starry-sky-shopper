import { Button } from "@/components/ui/button";
import { CartItem } from "./Cart";

interface CartItemListProps {
  items: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
}

export const CartItemList = ({ items, onUpdateQuantity, onRemoveItem }: CartItemListProps) => {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-4 py-4 border-b border-white/10">
          <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
          <div className="flex-1">
            <p className="text-white">{item.name}</p>
            <p className="text-sm text-cosmic-light">{item.price.toLocaleString()} RWF</p>
            <div className="flex items-center gap-2 mt-2">
              <Button 
                variant="outline" 
                size="icon"
                className="h-6 w-6"
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              >
                -
              </Button>
              <span className="text-white">{item.quantity}</span>
              <Button 
                variant="outline" 
                size="icon"
                className="h-6 w-6"
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              >
                +
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-red-400 hover:text-red-300 ml-2"
                onClick={() => onRemoveItem(item.id)}
              >
                Remove
              </Button>
            </div>
          </div>
          <p className="text-white">{(item.price * item.quantity).toLocaleString()} RWF</p>
        </div>
      ))}
    </div>
  );
};