export interface Size {
  id?: number;
  size_name: string;
  created_at?: string;
  updated_at?: string;
}

export const defaultSize: Size = {
  size_name: "",
};
