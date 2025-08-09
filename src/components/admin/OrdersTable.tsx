
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Order } from "@/types/database";

interface ExtendedOrder extends Order {
  products: {
    name: string;
  };
}

const OrdersTable = () => {
  const [orders, setOrders] = useState<ExtendedOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();

    // Subscribe to orders changes
    const subscription = supabase
      .channel('orders_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // First fetch all orders
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

      if (orderError) throw orderError;
      if (!orderData) return;

      // Then fetch product names for each order
      const ordersWithProducts = await Promise.all(
        orderData.map(async (order) => {
          const { data: productData } = await supabase
            .from('products')
            .select('name')
            .eq('id', order.product_id)
            .single();

          return {
            ...order,
            products: { 
              name: productData?.name || 'Unknown Product' 
            }
          } as ExtendedOrder;
        })
      );

      setOrders(ordersWithProducts);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Order #${orderId} status changed to ${status}`,
      });

      // Refresh orders
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative overflow-x-auto">
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>{order.products.name}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>${order.total_price}</TableCell>
                   <TableCell>
                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                       order.status === 'completed' ? 'bg-green-100 text-green-800' :
                       order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                       'bg-red-100 text-red-800'
                     }`}>
                       {order.status || 'pending'}
                     </span>
                   </TableCell>
                  <TableCell>{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>
                     <Select
                       defaultValue={order.status || 'pending'}
                       onValueChange={(value) => updateOrderStatus(order.id, value)}
                     >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Change status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default OrdersTable;
