import { supabase } from "../lib/supabaseClient";

// Define the SalesOrderItemInput interface
export interface SalesOrderItemInput {
  productId: number;
  colorId: number;
  sizeId: number;
  variantSku?: string;
  quantity: number;
  pricePerItem: number;
}

// Define the CreateSalesOrderInput interface
export interface CreateSalesOrderInput {
  locationId: number;
  items: SalesOrderItemInput[];
  totalAmount: number;
  saleDate: Date;
  customerId?: number;
  paymentMethod?: string;
  customerName?: string;
}

// Define the SalesOrder interface
export interface SalesOrder {
  id: number | string;
  orderNumber: string;
  locationId: number;
  totalAmount: number;
  saleDate: string;
  customerId?: number;
  customerName?: string;
  paymentMethod?: string;
  createdAt: string;
  items?: SalesOrderItemInput[];
}

// Define the SalesHistoryItem interface
export interface SalesHistoryItem {
  id: number | string; // Unique ID of Sales Order
  orderNumber: string; // Sales order/receipt number
  saleDate: string | Date; // Transaction date
  itemCount?: number; // Number of unique items or total quantity in order
  totalAmount: number; // Total sales value
  customerName?: string; // Customer name (if noted)
  paymentMethod?: string; // Payment method used
  locationId: number; // Store location ID
}

// Create a new sales order
export const createSale = async (
  data: CreateSalesOrderInput,
): Promise<SalesOrder> => {
  try {
    // TODO: Implement as backend transaction (Supabase Function/RPC) for atomicity

    // Generate a unique order number
    const orderNumber = `SO-${Date.now()}`;

    // 1. Insert into sales_orders table
    const { data: salesOrder, error: salesOrderError } = await supabase
      .from("sales_orders")
      .insert({
        order_number: orderNumber,
        location_id: data.locationId,
        total_amount: data.totalAmount,
        sale_date: data.saleDate.toISOString(),
        customer_name: data.customerName || null,
        // customer_id: data.customerId || null, // Uncomment if customer_id column exists
        // payment_method: data.paymentMethod || null, // Uncomment if payment_method column exists
      })
      .select()
      .single();

    if (salesOrderError) {
      console.error("Error creating sales order:", salesOrderError);
      throw new Error(
        `Failed to create sales order: ${salesOrderError.message}`,
      );
    }

    // 2. Process each item: insert into sales_order_items and reduce inventory
    for (const item of data.items) {
      // Check inventory availability
      const { data: inventoryItem, error: inventoryError } = await supabase
        .from("inventory_pasang")
        .select("id, stok_pasang")
        .eq("location_id", data.locationId)
        .eq("product_id", item.productId)
        .eq("color_id", item.colorId)
        .eq("size_id", item.sizeId)
        .single();

      if (inventoryError) {
        console.error("Error checking inventory:", inventoryError);
        throw new Error(`Failed to check inventory: ${inventoryError.message}`);
      }

      if (!inventoryItem || inventoryItem.stok_pasang < item.quantity) {
        throw new Error(
          `Insufficient stock for product ID ${item.productId}, color ID ${item.colorId}, size ID ${item.sizeId}`,
        );
      }

      // Insert into sales_order_items
      const { error: itemError } = await supabase
        .from("sales_order_items")
        .insert({
          sales_order_id: salesOrder.id,
          product_id: item.productId,
          color_id: item.colorId,
          size_id: item.sizeId,
          quantity: item.quantity,
          price: item.pricePerItem,
          amount: item.quantity * item.pricePerItem,
        });

      if (itemError) {
        console.error("Error creating sales order item:", itemError);
        throw new Error(
          `Failed to create sales order item: ${itemError.message}`,
        );
      }

      // Reduce inventory
      const newStock = inventoryItem.stok_pasang - item.quantity;
      const { error: updateError } = await supabase
        .from("inventory_pasang")
        .update({ stok_pasang: newStock })
        .eq("id", inventoryItem.id);

      if (updateError) {
        console.error("Error updating inventory:", updateError);
        throw new Error(`Failed to update inventory: ${updateError.message}`);
      }

      // Record in inventory_transactions
      const { error: transactionError } = await supabase
        .from("inventory_transactions")
        .insert({
          type: "SALE",
          location_id: data.locationId,
          product_id: item.productId,
          color_id: item.colorId,
          size_id: item.sizeId,
          jumlah_pasang: item.quantity,
          transaction_date: data.saleDate.toISOString(),
          notes: `Sale: ${orderNumber}`,
          reference_id: salesOrder.id.toString(),
        });

      if (transactionError) {
        console.error("Error recording transaction:", transactionError);
        throw new Error(
          `Failed to record transaction: ${transactionError.message}`,
        );
      }
    }

    // Return the created sales order
    return {
      id: salesOrder.id,
      orderNumber: salesOrder.order_number,
      locationId: salesOrder.location_id,
      totalAmount: salesOrder.total_amount,
      saleDate: salesOrder.sale_date,
      customerName: salesOrder.customer_name,
      // customerId: salesOrder.customer_id, // Uncomment if customer_id column exists
      // paymentMethod: salesOrder.payment_method, // Uncomment if payment_method column exists
      createdAt: salesOrder.created_at,
      items: data.items,
    };
  } catch (error) {
    console.error("Error in createSale:", error);
    throw error;
  }
};

// Get all sales orders
export const getSalesOrders = async (): Promise<SalesOrder[]> => {
  try {
    const { data, error } = await supabase
      .from("sales_orders")
      .select("*")
      .order("sale_date", { ascending: false });

    if (error) {
      console.error("Error fetching sales orders:", error);
      throw new Error(`Failed to fetch sales orders: ${error.message}`);
    }

    return data.map((order) => ({
      id: order.id,
      orderNumber: order.order_number,
      locationId: order.location_id,
      totalAmount: order.total_amount,
      saleDate: order.sale_date,
      customerName: order.customer_name,
      // customerId: order.customer_id, // Uncomment if customer_id column exists
      // paymentMethod: order.payment_method, // Uncomment if payment_method column exists
      createdAt: order.created_at,
    }));
  } catch (error) {
    console.error("Error in getSalesOrders:", error);
    throw error;
  }
};

// Get a single sales order by ID
export const getSalesOrderById = async (
  id: number | string,
): Promise<SalesOrder | undefined> => {
  try {
    // Get the sales order
    const { data: order, error: orderError } = await supabase
      .from("sales_orders")
      .select("*")
      .eq("id", id)
      .single();

    if (orderError) {
      if (orderError.code === "PGRST116") {
        // No rows returned
        return undefined;
      }
      console.error("Error fetching sales order:", orderError);
      throw new Error(`Failed to fetch sales order: ${orderError.message}`);
    }

    // Get the sales order items
    const { data: items, error: itemsError } = await supabase
      .from("sales_order_items")
      .select("*")
      .eq("sales_order_id", id);

    if (itemsError) {
      console.error("Error fetching sales order items:", itemsError);
      throw new Error(
        `Failed to fetch sales order items: ${itemsError.message}`,
      );
    }

    // Map the items to the expected format
    const salesOrderItems: SalesOrderItemInput[] = items.map((item) => ({
      productId: item.product_id,
      colorId: item.color_id,
      sizeId: item.size_id,
      quantity: item.quantity,
      pricePerItem: item.price,
    }));

    // Return the sales order with items
    return {
      id: order.id,
      orderNumber: order.order_number,
      locationId: order.location_id,
      totalAmount: order.total_amount,
      saleDate: order.sale_date,
      customerName: order.customer_name,
      // customerId: order.customer_id, // Uncomment if customer_id column exists
      // paymentMethod: order.payment_method, // Uncomment if payment_method column exists
      createdAt: order.created_at,
      items: salesOrderItems,
    };
  } catch (error) {
    console.error("Error in getSalesOrderById:", error);
    throw error;
  }
};

// Get sales history for a specific location
export const getSalesHistory = async (
  locationId: number,
  filters?: { dateRange?: [Date, Date] },
): Promise<SalesHistoryItem[]> => {
  try {
    // Build the query
    let query = supabase
      .from("sales_orders")
      .select(
        `
        id,
        order_number,
        sale_date,
        total_amount,
        customer_name,
        location_id,
        sales_order_items(id)
      `,
      )
      .eq("location_id", locationId);

    // Apply date range filter if provided
    if (filters?.dateRange) {
      const [startDate, endDate] = filters.dateRange;
      query = query
        .gte("sale_date", startDate.toISOString())
        .lte("sale_date", endDate.toISOString());
    }

    // Order by most recent sale date
    query = query.order("sale_date", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching sales history:", error);
      throw new Error(`Failed to fetch sales history: ${error.message}`);
    }

    // Transform the data to match the SalesHistoryItem interface
    const salesHistory: SalesHistoryItem[] = data.map((order: any) => ({
      id: order.id,
      orderNumber: order.order_number,
      saleDate: order.sale_date,
      itemCount: order.sales_order_items ? order.sales_order_items.length : 0,
      totalAmount: order.total_amount,
      customerName: order.customer_name,
      // paymentMethod: order.payment_method, // Uncomment if payment_method column exists
      locationId: order.location_id,
    }));

    return salesHistory;
  } catch (error) {
    console.error("Error in getSalesHistory:", error);
    throw error;
  }
};

// Export as a named export for use in components
export const salesService = {
  createSale,
  getSalesOrders,
  getSalesOrderById,
  getSalesHistory,
};
