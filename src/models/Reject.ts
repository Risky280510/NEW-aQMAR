export interface Reject {
  id?: number;
  location_id: number;
  product_id: number;
  color_id: number;
  size_id: number;
  quantity: number;
  reject_date: string; // ISO string format
  reason: string;
  created_at?: string;
  updated_at?: string;
}

export interface RecordRejectInput {
  locationId: number; // Location where the reject was found/recorded
  productId: number;
  colorId: number;
  sizeId: number; // Rejects are usually per specific unit/pair
  quantity: number; // Number of rejected pairs
  rejectDate: Date; // Date of occurrence/recording
  reason: string; // Reason why the item is considered rejected
}

export interface RejectListItem {
  id: number; // Unique ID of the inventory_rijek record
  rejectDate: string | Date; // Recorded date
  locationName: string; // Name of the location of the incident
  productName: string;
  colorName: string;
  sizeName: string;
  quantity: number; // Number of rejected items
  reason: string; // Reason for rejection
  statusRijek: string; // Current status (eg: 'New', 'Destroyed', 'Repaired')
}
