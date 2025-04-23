// Define the GoodsReceipt interface
export interface GoodsReceipt {
  id?: number;
  receipt_date: string;
  product_id: number;
  color_id: number;
  bun_count: number;
  supplier?: string;
  reference_number?: string;
  location_id: number; // Required field for warehouse location
  created_at?: string;
  updated_at?: string;
}

// Define the WarehouseDusStockItem interface
export interface WarehouseDusStockItem {
  productId: number;
  productSku: string;
  productName: string;
  colorId: number;
  colorName: string;
  stockDus: number; // Actual box stock from inventory_dus
  isiDus?: number; // Optional, from products table for info
  category?: string; // Optional, from products table for info
}

// Define the WarehousePasangStockItem interface
export interface WarehousePasangStockItem {
  productId: number;
  productSku: string;
  productName: string;
  colorId: number;
  colorName: string;
  sizeId: number;
  sizeName: string;
  stokPasang: number; // Actual stock pairs from inventory_pasang
  variantSku?: string; // Optional, unique SKU of the variant if any
  category?: string; // Optional, from products table for info
}

// Mock data for development
let goodsReceipts: GoodsReceipt[] = [];

// Mock data for warehouse dus stock
const mockWarehouseDusStock: WarehouseDusStockItem[] = [
  {
    productId: 1,
    productSku: "SKU001",
    productName: "Cotton Fabric",
    colorId: 1,
    colorName: "Red",
    stockDus: 25,
    isiDus: 50,
    category: "Fabrics",
  },
  {
    productId: 1,
    productSku: "SKU001",
    productName: "Cotton Fabric",
    colorId: 2,
    colorName: "Blue",
    stockDus: 18,
    isiDus: 50,
    category: "Fabrics",
  },
  {
    productId: 2,
    productSku: "SKU002",
    productName: "Polyester Blend",
    colorId: 1,
    colorName: "Red",
    stockDus: 12,
    isiDus: 100,
    category: "Fabrics",
  },
  {
    productId: 3,
    productSku: "SKU003",
    productName: "Silk Fabric",
    colorId: 3,
    colorName: "Green",
    stockDus: 8,
    isiDus: 25,
    category: "Premium Fabrics",
  },
  {
    productId: 4,
    productSku: "SKU004",
    productName: "Denim",
    colorId: 4,
    colorName: "Indigo",
    stockDus: 30,
    isiDus: 40,
    category: "Fabrics",
  },
];

// Mock data for warehouse pasang stock
const mockWarehousePasangStock: WarehousePasangStockItem[] = [
  {
    productId: 1,
    productSku: "FW001",
    productName: "Classic Sneakers",
    colorId: 1,
    colorName: "White",
    sizeId: 1,
    sizeName: "38",
    stokPasang: 25,
    variantSku: "FW001-WHT-38",
    category: "Footwear",
  },
  {
    productId: 1,
    productSku: "FW001",
    productName: "Classic Sneakers",
    colorId: 1,
    colorName: "White",
    sizeId: 2,
    sizeName: "39",
    stokPasang: 30,
    variantSku: "FW001-WHT-39",
    category: "Footwear",
  },
  {
    productId: 1,
    productSku: "FW001",
    productName: "Classic Sneakers",
    colorId: 2,
    colorName: "Black",
    sizeId: 1,
    sizeName: "38",
    stokPasang: 15,
    variantSku: "FW001-BLK-38",
    category: "Footwear",
  },
  {
    productId: 2,
    productSku: "FW002",
    productName: "Running Shoes",
    colorId: 3,
    colorName: "Blue",
    sizeId: 3,
    sizeName: "40",
    stokPasang: 12,
    variantSku: "FW002-BLU-40",
    category: "Footwear",
  },
  {
    productId: 3,
    productSku: "FW003",
    productName: "Casual Loafers",
    colorId: 4,
    colorName: "Brown",
    sizeId: 4,
    sizeName: "41",
    stokPasang: 8,
    variantSku: "FW003-BRN-41",
    category: "Footwear",
  },
];

import { supabase } from "../lib/supabaseClient";

// Create a new goods receipt
export const createGoodsReceipt = async (
  receipt: GoodsReceipt,
): Promise<GoodsReceipt> => {
  try {
    // Check if a box stock entry already exists for this location, product, and color combination
    const { data: existingStock, error: selectError } = await supabase
      .from("inventory_dus")
      .select("id, stok_dus")
      .eq("location_id", receipt.location_id)
      .eq("product_id", receipt.product_id)
      .eq("color_id", receipt.color_id)
      .maybeSingle(); // Returns data or null without error if not found

    if (selectError && selectError.code !== "PGRST116") {
      // Ignore 'row not found' error
      console.error("Error checking existing dus stock:", selectError);
      throw new Error(`Failed to check box stock: ${selectError.message}`);
    }

    // Update or insert box stock based on the results
    if (existingStock) {
      // If stock exists, update it
      const newStock = existingStock.stok_dus + receipt.bun_count;
      const { error: updateError } = await supabase
        .from("inventory_dus")
        .update({ stok_dus: newStock })
        .eq("id", existingStock.id); // Update based on the existing record ID

      if (updateError) {
        console.error("Error updating box stock:", updateError);
        throw new Error(`Failed to update box stock: ${updateError.message}`);
      }
    } else {
      // If no stock exists, insert a new record
      const { error: insertError } = await supabase
        .from("inventory_dus")
        .insert({
          location_id: receipt.location_id,
          product_id: receipt.product_id,
          color_id: receipt.color_id,
          stok_dus: receipt.bun_count,
        });

      if (insertError) {
        console.error("Error inserting box stock:", insertError);
        throw new Error(`Failed to add new stock box: ${insertError.message}`);
      }
    }

    // Record inventory transaction
    const { error: transactionError } = await supabase
      .from("inventory_transactions")
      .insert({
        type: "DUS_MASUK_UTAMA", // Define a clear transaction type
        destination_location_id: receipt.location_id, // The destination location is this warehouse
        product_id: receipt.product_id,
        color_id: receipt.color_id,
        // size_id: null, // Not relevant for box receipts
        jumlah_dus: receipt.bun_count, // Using the correct column name from the database
        // jumlah_pasang: null, // Not relevant for box receipts
        transaction_date: receipt.receipt_date,
        notes: `Receipt from ${receipt.supplier || "-"} (${receipt.reference_number || "-"})`, // Example notes
      });

    if (transactionError) {
      // TODO: Implement as backend transaction - ideally, if this fails, the previous stock update/insert should be rolled back
      console.error("Error logging inventory transaction:", transactionError);
      throw new Error(
        `Failed to log inventory transaction: ${transactionError.message}`,
      );
    }

    // Create the receipt record in the goods_receipts table
    const { data: newReceipt, error: receiptError } = await supabase
      .from("goods_receipts")
      .insert({
        receipt_date: receipt.receipt_date,
        product_id: receipt.product_id,
        color_id: receipt.color_id,
        bun_count: receipt.bun_count,
        supplier: receipt.supplier,
        reference_number: receipt.reference_number,
        location_id: receipt.location_id,
      })
      .select()
      .single();

    if (receiptError) {
      console.error("Error creating goods receipt:", receiptError);
      throw new Error(
        `Failed to create goods receipt: ${receiptError.message}`,
      );
    }

    return newReceipt;
  } catch (error) {
    console.error("Error in createGoodsReceipt:", error);
    throw error; // Re-throw to be handled by the UI component
  }
};

// Get goods receipts
export const getGoodsReceipts = async (): Promise<GoodsReceipt[]> => {
  try {
    const { data, error } = await supabase
      .from("goods_receipts")
      .select("*")
      .order("receipt_date", { ascending: false });

    if (error) {
      console.error("Error fetching goods receipts:", error);
      throw new Error(`Failed to fetch goods receipts: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error("Error in getGoodsReceipts:", error);
    // Fallback to mock data in case of error during development
    console.warn("Falling back to mock data due to error");
    return [...goodsReceipts];
  }
};

// Get a single goods receipt by ID
export const getGoodsReceiptById = async (
  id: number,
): Promise<GoodsReceipt | undefined> => {
  try {
    const { data, error } = await supabase
      .from("goods_receipts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching goods receipt:", error);
      throw new Error(`Failed to fetch goods receipt: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error in getGoodsReceiptById:", error);
    // Fallback to mock data in case of error during development
    console.warn("Falling back to mock data due to error");
    const receipt = goodsReceipts.find((r) => r.id === id);
    return receipt;
  }
};

// Get warehouse dus stock by location ID
export const getWarehouseDusStock = async (
  locationId: number,
): Promise<WarehouseDusStockItem[]> => {
  console.log(`Fetching dus stock for location ID: ${locationId}`);

  try {
    // Get inventory_dus records for the specified location
    const { data: stockData, error: stockError } = await supabase
      .from("inventory_dus")
      .select("id, stok_dus, product_id, color_id")
      .eq("location_id", locationId);

    if (stockError) {
      console.error("Error fetching dus stock:", stockError);
      throw new Error(`Failed to fetch dus stock: ${stockError.message}`);
    }

    if (!stockData || stockData.length === 0) {
      return [];
    }

    // Get all product IDs and color IDs from the inventory data
    const productIds = [...new Set(stockData.map((item) => item.product_id))];
    const colorIds = [...new Set(stockData.map((item) => item.color_id))];

    // Fetch products and colors data separately
    const [productsResponse, colorsResponse] = await Promise.all([
      supabase
        .from("products")
        .select("id, product_name, product_sku, isi_dus, category")
        .in("id", productIds),
      supabase.from("colors").select("id, color_name").in("id", colorIds),
    ]);

    if (productsResponse.error) {
      console.error("Error fetching products:", productsResponse.error);
      throw new Error(
        `Failed to fetch products: ${productsResponse.error.message}`,
      );
    }

    if (colorsResponse.error) {
      console.error("Error fetching colors:", colorsResponse.error);
      throw new Error(
        `Failed to fetch colors: ${colorsResponse.error.message}`,
      );
    }

    // Create lookup maps
    const productsMap = new Map(productsResponse.data.map((p) => [p.id, p]));
    const colorsMap = new Map(colorsResponse.data.map((c) => [c.id, c]));

    // Transform the data to WarehouseDusStockItem structure
    const formattedData: WarehouseDusStockItem[] = stockData.map((item) => {
      const product = productsMap.get(item.product_id);
      const color = colorsMap.get(item.color_id);

      return {
        productId: item.product_id,
        productSku: product?.product_sku || `SKU-${item.product_id}`,
        productName: product?.product_name || `Product ${item.product_id}`,
        colorId: item.color_id,
        colorName: color?.color_name || `Color ${item.color_id}`,
        stockDus: item.stok_dus,
        isiDus: product?.isi_dus,
        category: product?.category,
      };
    });

    // Return the actual data from the database
    return formattedData;
  } catch (error) {
    console.error("Error in getWarehouseDusStock:", error);
    // Fallback to mock data in case of error during development
    console.warn("Falling back to mock data due to error");
    return [...mockWarehouseDusStock];
  }
};

// Get warehouse pasang stock by location ID
export const getWarehousePasangStock = async (
  locationId: number,
): Promise<WarehousePasangStockItem[]> => {
  console.log(`Fetching pasang stock for location ID: ${locationId}`);

  try {
    // First, get the inventory_pasang records
    const { data: pasangData, error: pasangError } = await supabase
      .from("inventory_pasang")
      .select("id, stok_pasang, variant_sku, product_id, color_id, size_id")
      .eq("location_id", locationId)
      .gt("stok_pasang", 0); // Only fetch items that are in stock

    if (pasangError) {
      console.error("Error fetching pasang stock:", pasangError);
      throw new Error(`Failed to fetch pasang stock: ${pasangError.message}`);
    }

    if (!pasangData || pasangData.length === 0) {
      return [];
    }

    // Get all product IDs, color IDs, and size IDs from the inventory data
    const productIds = [...new Set(pasangData.map((item) => item.product_id))];
    const colorIds = [...new Set(pasangData.map((item) => item.color_id))];
    const sizeIds = [...new Set(pasangData.map((item) => item.size_id))];

    // Fetch products, colors, and sizes data separately
    const [productsResponse, colorsResponse, sizesResponse] = await Promise.all(
      [
        supabase
          .from("products")
          .select("id, product_name, product_sku, category")
          .in("id", productIds),
        supabase.from("colors").select("id, color_name").in("id", colorIds),
        supabase.from("sizes").select("id, size_name").in("id", sizeIds),
      ],
    );

    if (productsResponse.error) {
      console.error("Error fetching products:", productsResponse.error);
      throw new Error(
        `Failed to fetch products: ${productsResponse.error.message}`,
      );
    }

    if (colorsResponse.error) {
      console.error("Error fetching colors:", colorsResponse.error);
      throw new Error(
        `Failed to fetch colors: ${colorsResponse.error.message}`,
      );
    }

    if (sizesResponse.error) {
      console.error("Error fetching sizes:", sizesResponse.error);
      throw new Error(`Failed to fetch sizes: ${sizesResponse.error.message}`);
    }

    // Create lookup maps
    const productsMap = new Map(productsResponse.data.map((p) => [p.id, p]));
    const colorsMap = new Map(colorsResponse.data.map((c) => [c.id, c]));
    const sizesMap = new Map(sizesResponse.data.map((s) => [s.id, s]));

    // Transform the data to WarehousePasangStockItem structure
    const formattedData: WarehousePasangStockItem[] = pasangData.map((item) => {
      const product = productsMap.get(item.product_id);
      const color = colorsMap.get(item.color_id);
      const size = sizesMap.get(item.size_id);

      return {
        productId: item.product_id,
        productSku: product?.product_sku || `SKU-${item.product_id}`,
        productName: product?.product_name || `Product ${item.product_id}`,
        colorId: item.color_id,
        colorName: color?.color_name || `Color ${item.color_id}`,
        sizeId: item.size_id,
        sizeName: size?.size_name || `Size ${item.size_id}`,
        stokPasang: item.stok_pasang,
        variantSku: item.variant_sku,
        category: product?.category || "Unknown",
      };
    });

    // Return the actual data from the database
    return formattedData;
  } catch (error) {
    console.error("Error in getWarehousePasangStock:", error);
    throw error;
  }
};

// Define the ConvertBoxInput interface
export interface ConvertBoxInput {
  productId: number;
  colorId: number;
  numberBoxes: number;
}

// Define the KonversiDusItem interface
export interface KonversiDusItem {
  id: number;
  productId: number;
  skuProduct: string;
  namaProduct: string;
  colorId: number;
  namaWarna: string;
  stokDusSiapDiproses: number; // Remaining boxes waiting to be counted
  totalPsangDiharapkan: number; // Accumulated expected pairs from remaining boxes
  totalPsangTerinput: number; // Accumulated pairs that have been inputted from this conversion batch
  isiDus: number; // Standard box contents of this product (from products table)
}

// Convert boxes to units
export const convertBoxToUnit = async (
  data: ConvertBoxInput & { locationId: number },
): Promise<void> => {
  console.log(
    `Converting ${data.numberBoxes} boxes for product ID: ${data.productId}, color ID: ${data.colorId} at location ID: ${data.locationId}`,
  );

  try {
    // 1. Check if there's enough stock in inventory_dus
    const { data: stockData, error: stockError } = await supabase
      .from("inventory_dus")
      .select("id, stok_dus")
      .eq("location_id", data.locationId)
      .eq("product_id", data.productId)
      .eq("color_id", data.colorId)
      .single();

    if (stockError) {
      console.error("Error checking dus stock:", stockError);
      throw new Error(`Failed to check dus stock: ${stockError.message}`);
    }

    if (!stockData || stockData.stok_dus < data.numberBoxes) {
      throw new Error("Insufficient stock for conversion");
    }

    // Get product details to get isi_dus
    const { data: productData, error: productError } = await supabase
      .from("products")
      .select("isi_dus")
      .eq("id", data.productId)
      .single();

    if (productError) {
      console.error("Error fetching product details:", productError);
      throw new Error(
        `Failed to fetch product details: ${productError.message}`,
      );
    }

    const isiDus = productData.isi_dus;
    const expectedUnits = data.numberBoxes * isiDus;

    // 2. Decrease stock in inventory_dus
    const { error: updateError } = await supabase
      .from("inventory_dus")
      .update({ stok_dus: stockData.stok_dus - data.numberBoxes })
      .eq("id", stockData.id);

    if (updateError) {
      console.error("Error updating dus stock:", updateError);
      throw new Error(`Failed to update dus stock: ${updateError.message}`);
    }

    // 3. Check if there's an existing record in inventory_dus_konversi
    const { data: konversiData, error: konversiError } = await supabase
      .from("inventory_dus_konversi")
      .select(
        "id, stok_dus_siap_diproses, total_pasang_diharapkan, total_pasang_terinput",
      )
      .eq("location_id", data.locationId)
      .eq("product_id", data.productId)
      .eq("color_id", data.colorId)
      .maybeSingle();

    if (konversiError && konversiError.code !== "PGRST116") {
      console.error("Error checking konversi record:", konversiError);
      throw new Error(
        `Failed to check konversi record: ${konversiError.message}`,
      );
    }

    // 4. Update or insert inventory_dus_konversi
    if (konversiData) {
      // Update existing record
      const { error: updateKonversiError } = await supabase
        .from("inventory_dus_konversi")
        .update({
          stok_dus_siap_diproses:
            konversiData.stok_dus_siap_diproses + data.numberBoxes,
          total_pasang_diharapkan:
            konversiData.total_pasang_diharapkan + expectedUnits,
          updated_at: new Date().toISOString(),
        })
        .eq("id", konversiData.id);

      if (updateKonversiError) {
        console.error("Error updating konversi record:", updateKonversiError);
        throw new Error(
          `Failed to update konversi record: ${updateKonversiError.message}`,
        );
      }
    } else {
      // Insert new record
      const { error: insertKonversiError } = await supabase
        .from("inventory_dus_konversi")
        .insert({
          location_id: data.locationId,
          product_id: data.productId,
          color_id: data.colorId,
          stok_dus_siap_diproses: data.numberBoxes,
          total_pasang_diharapkan: expectedUnits,
          total_pasang_terinput: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertKonversiError) {
        console.error("Error inserting konversi record:", insertKonversiError);
        throw new Error(
          `Failed to insert konversi record: ${insertKonversiError.message}`,
        );
      }
    }

    // 5. Record the transaction
    const { error: transactionError } = await supabase
      .from("inventory_transactions")
      .insert({
        type: "KONVERSI_KELUAR_DUS",
        location_id: data.locationId,
        product_id: data.productId,
        color_id: data.colorId,
        jumlah_dus: data.numberBoxes,
        transaction_date: new Date().toISOString(),
        notes: `Converted ${data.numberBoxes} boxes for counting (${expectedUnits} expected pairs)`,
      });

    if (transactionError) {
      console.error("Error recording transaction:", transactionError);
      throw new Error(
        `Failed to record transaction: ${transactionError.message}`,
      );
    }

    // TODO: Implement as backend transaction (Supabase Function/RPC) for atomicity
    // All the above operations should be wrapped in a transaction to ensure atomicity
  } catch (error) {
    console.error("Error in convertBoxToUnit:", error);
    throw error;
  }
};

// Get boxes ready to be counted by location ID
export const getDusSiapDihitung = async (
  locationId: number,
): Promise<KonversiDusItem[]> => {
  console.log(
    `Fetching boxes ready to be counted for location ID: ${locationId}`,
  );

  try {
    // Query inventory_dus_konversi with joins to get product and color information
    const { data, error } = await supabase
      .from("inventory_dus_konversi")
      .select(
        `
        id,
        stok_dus_siap_diproses,
        total_pasang_diharapkan,
        total_pasang_terinput,
        product_id,
        color_id,
        products(id, product_name, product_sku, isi_dus, category),
        colors(id, color_name)
      `,
      )
      .eq("location_id", locationId)
      .gt("stok_dus_siap_diproses", 0);

    if (error) {
      console.error("Error fetching dus siap dihitung:", error);
      throw new Error(`Failed to fetch dus siap dihitung: ${error.message}`);
    }

    // Transform the data to match the KonversiDusItem interface
    const formattedData: KonversiDusItem[] = data.map((item: any) => ({
      id: item.id,
      productId: item.product_id,
      skuProduct: item.products?.product_sku || "",
      namaProduct: item.products?.product_name || "",
      colorId: item.color_id,
      namaWarna: item.colors?.color_name || "",
      stokDusSiapDiproses: item.stok_dus_siap_diproses,
      totalPsangDiharapkan: item.total_pasang_diharapkan,
      totalPsangTerinput: item.total_pasang_terinput,
      isiDus: item.products?.isi_dus || 0,
    }));

    return formattedData;
  } catch (error) {
    console.error("Error in getDusSiapDihitung:", error);
    throw error;
  }
};

// Mark one box as finished processing
export const selesaikanProsesSatuDus = async (
  konversiId: number,
): Promise<void> => {
  console.log(`Marking box with ID ${konversiId} as finished processing`);

  try {
    // 1. Get the konversi record and related product info to get isi_dus
    const { data: konversiData, error: konversiError } = await supabase
      .from("inventory_dus_konversi")
      .select(
        `
        id, 
        stok_dus_siap_diproses, 
        total_pasang_diharapkan, 
        total_pasang_terinput,
        product_id,
        color_id,
        location_id,
        products(isi_dus)
      `,
      )
      .eq("id", konversiId)
      .single();

    if (konversiError) {
      console.error("Error fetching konversi record:", konversiError);
      throw new Error(
        `Failed to fetch konversi record: ${konversiError.message}`,
      );
    }

    if (!konversiData) {
      throw new Error("Konversi record not found");
    }

    if (konversiData.stok_dus_siap_diproses <= 0) {
      throw new Error("No boxes left to process");
    }

    const isiDus = konversiData.products?.isi_dus || 0;

    // 2. Update the konversi record
    const { error: updateError } = await supabase
      .from("inventory_dus_konversi")
      .update({
        stok_dus_siap_diproses: konversiData.stok_dus_siap_diproses - 1,
        total_pasang_diharapkan: konversiData.total_pasang_diharapkan - isiDus,
        total_pasang_terinput: konversiData.total_pasang_terinput - isiDus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", konversiId);

    if (updateError) {
      console.error("Error updating konversi record:", updateError);
      throw new Error(
        `Failed to update konversi record: ${updateError.message}`,
      );
    }

    // 3. Record the transaction
    const { error: transactionError } = await supabase
      .from("inventory_transactions")
      .insert({
        type: "KONVERSI_SELESAI_DUS",
        location_id: konversiData.location_id,
        product_id: konversiData.product_id,
        color_id: konversiData.color_id,
        jumlah_dus: 1, // One box finished
        jumlah_pasang: isiDus, // Number of pairs in the box
        transaction_date: new Date().toISOString(),
        notes: `Finished processing 1 box (${isiDus} pairs)`,
      });

    if (transactionError) {
      console.error("Error recording transaction:", transactionError);
      throw new Error(
        `Failed to record transaction: ${transactionError.message}`,
      );
    }

    // TODO: Implement as backend transaction
    // All the above operations should be wrapped in a transaction to ensure atomicity
  } catch (error) {
    console.error("Error in selesaikanProsesSatuDus:", error);
    throw error;
  }
};

// Define the InputPasangFisikItem interface
export interface InputPasangFisikItem {
  sizeId: number;
  jumlahPasang: number;
}

// Define the InputPasangFisikData interface
export interface InputPasangFisikData {
  productId: number;
  colorId: number;
  tanggalInput: Date;
  items: InputPasangFisikItem[];
}

// Input physical count of pairs
export const inputHitungPasangFisik = async (
  data: InputPasangFisikData & { locationId: number },
): Promise<void> => {
  console.log(
    `Processing physical count for product ID: ${data.productId}, color ID: ${data.colorId} at location ID: ${data.locationId}`,
    data.items,
  );

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // In a real app, this would:
  // 1. Iterate over data.items
  // 2. Update/create inventory_pasang per item
  // 3. Update totalPasangTerinput in inventory_dus_konversi
  // 4. Record the transaction

  // Calculate total pairs for logging
  const totalPairs = data.items.reduce(
    (sum, item) => sum + item.jumlahPasang,
    0,
  );
  console.log(`Total pairs counted: ${totalPairs}`);

  // Simulate success
  return Promise.resolve();
};

// Define the StockAdjustmentData interface
export interface StockAdjustmentData {
  locationId: number;
  type: "dus" | "pasang";
  productId: number;
  colorId: number;
  sizeId?: number;
  physicalCount: number;
  systemCount: number;
  reason?: string;
}

// Get current dus stock for a specific item at a specific location
export const getCurrentDusStock = async (
  locationId: number,
  productId: number,
  colorId: number,
): Promise<number | null> => {
  console.log(
    `Fetching current dus stock for location ID: ${locationId}, product ID: ${productId}, color ID: ${colorId}`,
  );

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Find the stock item in the mock data
  const stockItem = mockWarehouseDusStock.find(
    (item) => item.productId === productId && item.colorId === colorId,
  );

  // Return the stock or null if not found
  return Promise.resolve(stockItem ? stockItem.stockDus : null);
};

// Get current pasang stock for a specific item at a specific location
export const getCurrentPasangStock = async (
  locationId: number,
  productId: number,
  colorId: number,
  sizeId: number,
): Promise<number | null> => {
  console.log(
    `Fetching current pasang stock for location ID: ${locationId}, product ID: ${productId}, color ID: ${colorId}, size ID: ${sizeId}`,
  );

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Find the stock item in the mock data
  const stockItem = mockWarehousePasangStock.find(
    (item) =>
      item.productId === productId &&
      item.colorId === colorId &&
      item.sizeId === sizeId,
  );

  // Return the stock or null if not found
  return Promise.resolve(stockItem ? stockItem.stokPasang : null);
};

// Adjust stock based on physical count
export const adjustStock = async (data: StockAdjustmentData): Promise<void> => {
  console.log("Adjusting stock with data:", data);

  // Calculate the difference between physical count and system count
  const difference = data.physicalCount - data.systemCount;
  console.log(`Stock adjustment difference: ${difference}`);

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // In a real app, this would update the inventory_dus or inventory_pasang table
  // and record the transaction in inventory_transactions
  if (data.type === "dus") {
    // Find the index of the item in the mock data
    const index = mockWarehouseDusStock.findIndex(
      (item) =>
        item.productId === data.productId && item.colorId === data.colorId,
    );

    // Update the mock data if the item exists
    if (index !== -1) {
      mockWarehouseDusStock[index].stockDus = data.physicalCount;
    }
  } else if (data.type === "pasang" && data.sizeId) {
    // Find the index of the item in the mock data
    const index = mockWarehousePasangStock.findIndex(
      (item) =>
        item.productId === data.productId &&
        item.colorId === data.colorId &&
        item.sizeId === data.sizeId,
    );

    // Update the mock data if the item exists
    if (index !== -1) {
      mockWarehousePasangStock[index].stokPasang = data.physicalCount;
    }
  }

  // Simulate success
  return Promise.resolve();
};

// Get variant stock level at a specific location
export const getVariantStockLevel = async (
  locationId: number,
  productId: number,
  colorId: number,
  sizeId: number,
): Promise<number> => {
  console.log(
    `Fetching variant stock level for location ID: ${locationId}, product ID: ${productId}, color ID: ${colorId}, size ID: ${sizeId}`,
  );

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Find the stock item in the mock data
  const stockItem = mockWarehousePasangStock.find(
    (item) =>
      item.productId === productId &&
      item.colorId === colorId &&
      item.sizeId === sizeId,
  );

  // Return the stock or a random number if not found
  if (stockItem) {
    return Promise.resolve(stockItem.stokPasang);
  } else {
    // For testing purposes, return a random stock between 0 and 20
    return Promise.resolve(Math.floor(Math.random() * 20));
  }
};

// Define the GoodsReceiptHistoryItem interface
export interface GoodsReceiptHistoryItem {
  id: number;
  receipt_date: string;
  reference_number?: string;
  supplier?: string;
  locationName?: string;
  productName?: string;
  colorName?: string;
  bun_count: number;
  status?: string;
  created_by?: string;
}

// Get goods receipt history with optional filters
export const getGoodsReceiptHistory = async (filters?: {
  dateRange?: [Date, Date];
  supplier?: string;
}): Promise<GoodsReceiptHistoryItem[]> => {
  console.log("Fetching goods receipt history with filters:", filters);

  try {
    // Query to get goods receipts with joined data
    let query = supabase
      .from("goods_receipts")
      .select(
        `
        id,
        receipt_date,
        reference_number,
        supplier,
        bun_count,
        products(product_name, product_sku),
        colors(color_name),
        locations(location_name)
      `,
      )
      .order("receipt_date", { ascending: false });

    // Apply filters if provided
    if (filters) {
      // Filter by date range if provided
      if (filters.dateRange && filters.dateRange.length === 2) {
        const [startDate, endDate] = filters.dateRange;
        query = query
          .gte("receipt_date", startDate.toISOString().split("T")[0])
          .lte("receipt_date", endDate.toISOString().split("T")[0]);
      }

      // Filter by supplier if provided
      if (filters.supplier) {
        query = query.ilike("supplier", `%${filters.supplier}%`);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching goods receipt history:", error);
      throw new Error(
        `Failed to fetch goods receipt history: ${error.message}`,
      );
    }

    // Transform the data to match the GoodsReceiptHistoryItem interface
    const formattedData: GoodsReceiptHistoryItem[] = data.map((item: any) => ({
      id: item.id,
      receipt_date: item.receipt_date,
      reference_number: item.reference_number,
      supplier: item.supplier,
      locationName: item.locations?.location_name || "Main Warehouse",
      productName: item.products?.product_name,
      colorName: item.colors?.color_name,
      bun_count: item.bun_count,
      status: "Completed", // Default status
      created_by: "System User", // Default user
    }));

    return formattedData;
  } catch (error) {
    console.error("Error in getGoodsReceiptHistory:", error);
    throw error;
  }
};

// Export as a named export for use in components
export const warehouseService = {
  createGoodsReceipt,
  getGoodsReceipts,
  getGoodsReceiptById,
  getWarehouseDusStock,
  getWarehousePasangStock,
  convertBoxToUnit,
  getDusSiapDihitung,
  selesaikanProsesSatuDus,
  inputHitungPasangFisik,
  getCurrentDusStock,
  getCurrentPasangStock,
  adjustStock,
  getVariantStockLevel,
  getGoodsReceiptHistory,
};
