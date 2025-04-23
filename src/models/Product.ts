export interface Product {
  id?: number;
  product_sku: string;
  product_name: string;
  category: string;
  isi_dus: number; // Number of pairs per box
  created_at?: string;
  updated_at?: string;
}

export const defaultProduct: Product = {
  product_sku: "",
  product_name: "",
  category: "",
  isi_dus: 0,
};
