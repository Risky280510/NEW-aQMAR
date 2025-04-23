export interface Color {
  id?: number;
  color_name: string;
  created_at?: string;
  updated_at?: string;
}

export const defaultColor: Color = {
  color_name: "",
};
