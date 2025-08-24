import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/database";

interface ProductGridProps {
  onAddToCart: (id: number, name: string, price: number, image: string) => void;
  selectedCategory?: string;
  searchQuery?: string;
}

const ProductGrid = ({ onAddToCart, selectedCategory, searchQuery }: ProductGridProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('id');
        
        if (error) {
          console.error('Error fetching products:', error);
          return;
        }

        setProducts(data as Product[] || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on category and search query
  const filteredProducts = products.filter((product) => {
    // Category filter
    if (selectedCategory === 'new') {
      // Show products created within last 7 days
      if (product.created_at) {
        const created = new Date(product.created_at);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - created.getTime()) / (1000 * 3600 * 24));
        if (daysDiff > 7) return false;
      }
    } else if (selectedCategory && product.category !== selectedCategory) {
      return false;
    }
    
    // Search filter
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[...Array(4)].map((_, index) => (
          <div 
            key={index}
            className="h-[300px] bg-white/5 animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  // Show message if no products match the filters
  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-white/60 text-lg mb-4">
          {searchQuery && selectedCategory 
            ? `No ${selectedCategory}s found matching "${searchQuery}"`
            : searchQuery 
            ? `No products found matching "${searchQuery}"`
            : selectedCategory 
            ? `No ${selectedCategory}s available`
            : 'No products available'
          }
        </div>
        <div className="text-white/40 text-sm">
          Try adjusting your search or category filters
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {filteredProducts.map((product) => (
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