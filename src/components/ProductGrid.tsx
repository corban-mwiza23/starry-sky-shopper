import ProductCard from "./ProductCard";

// Sample product data
const products = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  name: `Fashion Item ${i + 1}`,
  price: Math.floor(Math.random() * 200) + 50,
  image: `https://picsum.photos/300/400?random=${i}`,
}));

interface ProductGridProps {
  onAddToCart: (id: number, name: string, price: number, image: string) => void;
}

const ProductGrid = ({ onAddToCart }: ProductGridProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          {...product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
};

export default ProductGrid;