import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Percent } from "lucide-react";
import { Product } from "@/types/supabase";

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();

    // Set up real-time subscription
    const subscription = supabase
      .channel('products_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchProducts)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id');

    if (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } else {
      setProducts(data as Product[]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProduct: Omit<Product, 'id'> = {
      name,
      price: parseFloat(price),
      image,
    };

    const { data, error } = await supabase
      .from('products')
      .insert([newProduct]);

    if (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add product",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Product added successfully",
      });
      setName("");
      setPrice("");
      setImage("");
    }
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    }
  };

  const handleDiscountUpdate = async (id: number, discount: number, is_on_sale: boolean) => {
    const updateData = {
      discount_percentage: discount,
      is_on_sale: is_on_sale
    };

    const { error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating discount:', error);
      toast({
        title: "Error",
        description: "Failed to update discount",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Discount updated successfully",
      });
    }
  };

  return (
    <Card className="p-6 shadow-sm">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Product Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Price</label>
              <Input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-background"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Image URL</label>
              <Input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="bg-background"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Add Product
            </Button>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Manage Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4 space-y-3">
                <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded-lg" />
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-600">${product.price}</p>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={product.discount_percentage || 0}
                    onChange={(e) => handleDiscountUpdate(
                      product.id,
                      parseInt(e.target.value),
                      parseInt(e.target.value) > 0
                    )}
                    className="w-20"
                  />
                  <Percent className="w-4 h-4 text-gray-500" />
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(product.id)}
                    className="ml-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProductManagement;
