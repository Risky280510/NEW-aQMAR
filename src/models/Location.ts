export interface Location {
  id?: number;
  location_name: string;
  location_type: "Warehouse" | "Store";
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export const defaultLocation: Location = {
  location_name: "",
  location_type: "Warehouse",
  address: "",
};
