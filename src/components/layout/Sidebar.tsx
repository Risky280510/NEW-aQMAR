import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  Package2,
  Users,
  Settings,
  BarChart3,
} from "lucide-react";

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const SidebarLink = ({ to, icon, label }: SidebarLinkProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

export function Sidebar() {
  return (
    <div className="w-64 bg-card border-r border-border h-screen p-4 flex flex-col">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold">Inventory System</h1>
      </div>

      <nav className="space-y-1 flex-1">
        <SidebarLink
          to="/"
          icon={<LayoutDashboard className="h-5 w-5" />}
          label="Dashboard"
        />

        <div className="pt-4 pb-2">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Master Data
          </p>
        </div>

        <SidebarLink
          to="/master/locations"
          icon={<MapPin className="h-5 w-5" />}
          label="Locations"
        />

        <SidebarLink
          to="/master/products"
          icon={<Package2 className="h-5 w-5" />}
          label="Products"
        />

        <SidebarLink
          to="/master/users"
          icon={<Users className="h-5 w-5" />}
          label="Users"
        />

        <div className="pt-4 pb-2">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Operations
          </p>
        </div>

        <SidebarLink
          to="/operations/warehouse"
          icon={<Package2 className="h-5 w-5" />}
          label="Warehouse"
        />

        <SidebarLink
          to="/operations/store"
          icon={<Package2 className="h-5 w-5" />}
          label="Store"
        />

        <div className="pt-4 pb-2">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Reports
          </p>
        </div>

        <SidebarLink
          to="/reports/inventory"
          icon={<BarChart3 className="h-5 w-5" />}
          label="Inventory Reports"
        />

        <SidebarLink
          to="/reports/sales"
          icon={<BarChart3 className="h-5 w-5" />}
          label="Sales Reports"
        />

        <div className="pt-4 pb-2">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            System
          </p>
        </div>

        <SidebarLink
          to="/settings"
          icon={<Settings className="h-5 w-5" />}
          label="Settings"
        />
      </nav>

      <div className="border-t border-border pt-4 mt-4">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-muted-foreground">admin@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
