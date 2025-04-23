import React from "react";
import useAuthStore from "../../stores/authStore";
import { User } from "../../models/User";
import { Button } from "@/components/ui/button";

// Mock user data for simulation
const mockAdmin: User = {
  id: 1,
  name: "Admin User",
  email: "admin@test.com",
  role: "Admin",
  isActive: true,
};
const mockGudang: User = {
  id: 2,
  name: "Staff Gudang",
  email: "gudang@test.com",
  role: "Staff Gudang",
  locationId: 1,
  isActive: true,
};
const mockKasir: User = {
  id: 3,
  name: "Kasir Toko A",
  email: "kasir@test.com",
  role: "Kasir Toko",
  locationId: 2,
  isActive: true,
};

const LoginSimulator: React.FC = () => {
  // Get state and actions from store
  const { user, login, logout } = useAuthStore();

  return (
    <div className="border border-dashed border-gray-400 p-4 m-4 bg-gray-100 rounded-md">
      <h4 className="text-lg font-medium mb-2">Login Simulator (Temporary)</h4>
      {user ? (
        <div>
          <p className="mb-2">
            Logged in as: <strong>{user.name}</strong> ({user.role})
            {user.locationId && <span> - Location ID: {user.locationId}</span>}
          </p>
          <Button onClick={logout} variant="destructive" size="sm">
            Logout
          </Button>
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => login(mockAdmin)} size="sm">
            Login as Admin
          </Button>
          <Button onClick={() => login(mockGudang)} size="sm">
            Login as Warehouse Staff
          </Button>
          <Button onClick={() => login(mockKasir)} size="sm">
            Login as Shop Cashier
          </Button>
        </div>
      )}
    </div>
  );
};

export default LoginSimulator;
