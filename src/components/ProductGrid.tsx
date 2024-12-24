import ProductCard from "./ProductCard";

// Sample product data
const products = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  name: `Fashion Item ${i + 1}`,
  price: Math.floor(Math.random() * 200) + 50,
  image: `https://picsum.photos/400/500?random=${i}`,
}));

interface ProductGridProps {
  onAddToCart: (id: number, name: string, price: number, image: string) => void;
}

const ProductGrid = ({ onAddToCart }: ProductGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
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