import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);

const Admin = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          name,
          price: parseFloat(price),
          image,
        },
      ]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add product",
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

  return (
    <div className="min-h-screen bg-cosmic-dark p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>
        
        <div className="bg-cosmic-dark/50 backdrop-blur-sm p-6 rounded-lg border border-white/20">
          <h2 className="text-xl text-white mb-4">Add New Product</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-white block mb-2">Product Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/10 text-white border-white/20"
                required
              />
            </div>
            <div>
              <label className="text-white block mb-2">Price</label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-white/10 text-white border-white/20"
                required
              />
            </div>
            <div>
              <label className="text-white block mb-2">Image URL</label>
              <Input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="bg-white/10 text-white border-white/20"
                required
              />
            </div>
            <Button 
              type="submit"
              className="w-full bg-white text-cosmic-dark hover:bg-cosmic-light"
            >
              Add Product
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Admin;