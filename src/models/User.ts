export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  locationId?: number;
  isActive: boolean;
}
