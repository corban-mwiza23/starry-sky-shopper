import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  product_id: number;
  quantity: number;
  price: number;
}

interface ProcessOrderRequest {
  items: OrderItem[];
  customer_name: string;
  user_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing order request...");
    const requestBody = await req.json();
    console.log("Request body:", JSON.stringify(requestBody));
    
    const { items, customer_name, user_id }: ProcessOrderRequest = requestBody;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error("Invalid items:", items);
      return new Response(
        JSON.stringify({ error: "Items array is required and cannot be empty" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!customer_name || !user_id) {
      console.error("Missing required fields:", { customer_name, user_id });
      return new Response(
        JSON.stringify({ error: "Customer name and user ID are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Processing order for user ${user_id}, customer: ${customer_name}, items: ${items.length}`);

    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables:", { supabaseUrl: !!supabaseUrl, supabaseServiceKey: !!supabaseServiceKey });
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Start a transaction-like process
    // First, check inventory availability for all items
    const inventoryChecks = [];
    for (const item of items) {
      const { data: product, error } = await supabase
        .from('products')
        .select('id, quantity, is_sold_out, name')
        .eq('id', item.product_id)
        .single();

      if (error) {
        console.error(`Error fetching product ${item.product_id}:`, error);
        return new Response(
          JSON.stringify({ error: `Product ${item.product_id} not found` }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      if (product.is_sold_out) {
        return new Response(
          JSON.stringify({ error: `Product "${product.name}" is sold out` }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      if (product.quantity < item.quantity) {
        return new Response(
          JSON.stringify({ 
            error: `Insufficient stock for "${product.name}". Available: ${product.quantity}, Requested: ${item.quantity}` 
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      inventoryChecks.push({ product, requestedQuantity: item.quantity });
    }

    // All inventory checks passed, now process the order
    const createdOrders = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const { product, requestedQuantity } = inventoryChecks[i];

      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          product_id: item.product_id,
          quantity: item.quantity,
          total_price: item.price * item.quantity,
          customer_name: customer_name,
          user_id: user_id,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) {
        console.error(`Error creating order for product ${item.product_id}:`, orderError);
        return new Response(
          JSON.stringify({ error: `Failed to create order for product ${item.product_id}` }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Update product inventory
      const newQuantity = product.quantity - requestedQuantity;
      const shouldMarkSoldOut = newQuantity <= 0;

      const { error: inventoryError } = await supabase
        .from('products')
        .update({
          quantity: newQuantity,
          is_sold_out: shouldMarkSoldOut
        })
        .eq('id', item.product_id);

      if (inventoryError) {
        console.error(`Error updating inventory for product ${item.product_id}:`, inventoryError);
        // Consider rolling back the order creation here in a real-world scenario
        return new Response(
          JSON.stringify({ error: `Failed to update inventory for product ${item.product_id}` }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      createdOrders.push(order);
      console.log(`Successfully processed order for product ${product.name}: ${requestedQuantity} units. New stock: ${newQuantity}`);
    }

    console.log(`Order processing completed successfully for user ${user_id}. Created ${createdOrders.length} orders.`);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Order processed successfully",
      orders: createdOrders
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in process-order function:", error);
    console.error("Error stack:", error.stack);
    return new Response(
      JSON.stringify({ 
        error: error.message || "An unexpected error occurred",
        details: error.toString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);