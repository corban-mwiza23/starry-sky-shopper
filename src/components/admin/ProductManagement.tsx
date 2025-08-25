import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Percent, Package, Upload, Link } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from "@/types/database";

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState<'hoodie' | 'tee' | 'jacket' | 'pant' | 'skate' | ''>("");
  const [imageMethod, setImageMethod] = useState<"url" | "upload">("url");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Helper function to determine if a product is new (created within last 7 days)
  const isNewProduct = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - created.getTime()) / (1000 * 3600 * 24));
    return daysDiff <= 7;
  };

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

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalImageUrl = image;
    
    // If using file upload method and a file is selected
    if (imageMethod === "upload" && imageFile) {
      handleImageUpload(imageFile);
      // Wait a moment for the file to be processed
      await new Promise(resolve => setTimeout(resolve, 100));
      finalImageUrl = image;
    }
    
    const newProduct: Omit<Product, 'id'> = {
      name,
      price: parseFloat(price),
      image: finalImageUrl,
      quantity: quantity ? parseInt(quantity) : 0,
      is_sold_out: false,
      category: category || null,
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
      setQuantity("");
      setCategory("");
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSoldOutToggle = async (id: number, is_sold_out: boolean) => {
    const { error } = await supabase
      .from('products')
      .update({ is_sold_out })
      .eq('id', id);

    if (error) {
      console.error('Error updating sold out status:', error);
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Product ${is_sold_out ? 'marked as sold out' : 'marked as available'}`,
      });
      
      // If marking as available, ensure quantity is at least 1
      if (!is_sold_out) {
        const { error: quantityError } = await supabase
          .from('products')
          .update({ quantity: 1 })
          .eq('id', id)
          .eq('quantity', 0); // Only update if quantity is currently 0
        
        if (quantityError) {
          console.error('Error updating quantity:', quantityError);
        }
      }
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


  const handleQuantityUpdate = async (id: number, quantity: number) => {
    const is_sold_out = quantity <= 0;

    const { error } = await supabase
      .from('products')
      .update({ quantity, is_sold_out })
      .eq('id', id);

    if (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Quantity updated successfully${is_sold_out ? ' (marked as sold out)' : ''}`,
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
              <label className="text-sm font-medium text-foreground block mb-2">Product Image</label>
              
              {/* Image Method Toggle */}
              <div className="flex gap-2 mb-3">
                <Button
                  type="button"
                  variant={imageMethod === "url" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setImageMethod("url")}
                  className="flex items-center gap-2"
                >
                  <Link className="w-4 h-4" />
                  URL
                </Button>
                <Button
                  type="button"
                  variant={imageMethod === "upload" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setImageMethod("upload")}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </Button>
              </div>

              {/* Image URL Input */}
              {imageMethod === "url" && (
                <Input
                  placeholder="Enter image URL"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="bg-background"
                  required
                />
              )}

              {/* File Upload Input */}
              {imageMethod === "upload" && (
                <div className="space-y-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        handleImageUpload(file);
                      }
                    }}
                    className="bg-background"
                    required
                  />
                  {imageFile && (
                    <p className="text-xs text-muted-foreground">
                      Selected: {imageFile.name}
                    </p>
                  )}
                </div>
              )}

              {/* Image Preview */}
              {image && (
                <div className="mt-2">
                  <img 
                    src={image} 
                    alt="Preview" 
                    className="w-20 h-20 object-cover rounded border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Category</label>
              <Select value={category} onValueChange={(value) => setCategory(value as 'hoodie' | 'tee' | 'jacket' | 'pant' | 'skate' | '')}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoodie">Hoodie</SelectItem>
                  <SelectItem value="tee">Tee</SelectItem>
                  <SelectItem value="jacket">Jacket</SelectItem>
                  <SelectItem value="pant">Pant</SelectItem>
                  <SelectItem value="skate">Skate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Quantity</label>
              <Input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-background"
                placeholder="0"
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
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{product.name}</h3>
                  {product.created_at && isNewProduct(product.created_at) && (
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 font-medium">
                      NEW
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">{product.price.toLocaleString()} RWF</p>
                  {product.category && (
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 capitalize">
                      {product.category}
                    </span>
                  )}
                </div>
                
                {/* Discount Management */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Discount:</span>
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
                    className="w-16 h-8 text-xs"
                  />
                  <Percent className="w-3 h-3 text-gray-500" />
                </div>

                {/* Quantity Management */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Quantity:</span>
                  <Input
                    type="number"
                    min="0"
                    value={product.quantity || 0}
                    onChange={(e) => handleQuantityUpdate(
                      product.id,
                      parseInt(e.target.value) || 0
                    )}
                    className="w-16 h-8 text-xs"
                  />
                  <Package className="w-3 h-3 text-gray-500" />
                </div>

                {/* Sold Out Status and Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      product.is_sold_out 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {product.is_sold_out ? 'Sold Out' : 'In Stock'}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSoldOutToggle(product.id, !product.is_sold_out)}
                      className={`h-6 text-xs px-2 ${
                        product.is_sold_out 
                          ? 'hover:bg-green-500/10 hover:text-green-600 hover:border-green-600' 
                          : 'hover:bg-red-500/10 hover:text-red-600 hover:border-red-600'
                      }`}
                    >
                      {product.is_sold_out ? 'Mark Available' : 'Mark Sold Out'}
                    </Button>
                  </div>
                  
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(product.id)}
                    className="h-8 w-8"
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
