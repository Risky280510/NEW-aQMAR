import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  Package,
  Store,
  Truck,
  BarChart3,
  Settings,
  Users,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Building2,
  ShoppingCart,
  AlertTriangle,
  FileText,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import useAuthStore from "@/stores/authStore";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  isActive?: boolean;
  children?: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
}

const NavItem = ({
  icon,
  label,
  href,
  isActive,
  children,
  isOpen,
  onToggle,
}: NavItemProps) => {
  if (children) {
    return (
      <Collapsible open={isOpen} onOpenChange={onToggle} className="w-full">
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-accent group",
              isActive && "bg-accent",
            )}
          >
            <span className="flex items-center">
              {icon}
              <span className="ml-3">{label}</span>
            </span>
            <ChevronDown
              className={cn(
                "ml-auto h-4 w-4 transition-transform duration-200",
                isOpen ? "rotate-180" : "rotate-0",
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-9 pr-2 pt-1 pb-2">
          {children}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Link
      to={href || "#"}
      className={cn(
        "flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent group",
        isActive && "bg-accent",
      )}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </Link>
  );
};

interface SubNavItemProps {
  label: string;
  href: string;
  isActive?: boolean;
}

const SubNavItem = ({ label, href, isActive }: SubNavItemProps) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center py-1.5 px-3 text-sm rounded-md hover:bg-accent",
        isActive && "bg-accent/50",
      )}
    >
      {label}
    </Link>
  );
};

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const userRole = user?.role || "";

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    masterData: false,
    warehouseOps: false,
    distribution: false,
    storeOps: false,
    rejected: false,
    reports: false,
    conversion: false,
    stockReports: false,
    movementReports: false,
  });

  const toggleMenu = (menu: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar toggle */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="rounded-full"
        >
          {isSidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-border">
            <h1 className="text-xl font-bold">Inventory System</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {/* Dashboard: Always show if logged in */}
            {isAuthenticated && (
              <NavItem
                icon={<LayoutGrid className="h-5 w-5" />}
                label="Dashboard"
                href="/"
                isActive={isActive("/")}
              />
            )}

            {/* Master Data: Only show if userRole is 'Admin' */}
            {userRole === "Admin" && (
              <NavItem
                icon={<Package className="h-5 w-5" />}
                label="Master Data"
                isActive={location.pathname.startsWith("/master")}
                isOpen={openMenus.masterData}
                onToggle={() => toggleMenu("masterData")}
              >
                <SubNavItem
                  label="Products"
                  href="/master/products"
                  isActive={location.pathname.startsWith("/master/products")}
                />
                <SubNavItem
                  label="Locations"
                  href="/master/locations"
                  isActive={location.pathname.startsWith("/master/locations")}
                />
                <SubNavItem
                  label="Colors"
                  href="/master/colors"
                  isActive={location.pathname.startsWith("/master/colors")}
                />
                <SubNavItem
                  label="Sizes"
                  href="/master/sizes"
                  isActive={location.pathname.startsWith("/master/sizes")}
                />
                <SubNavItem
                  label="Users & Access Rights"
                  href="/master/users"
                  isActive={location.pathname.startsWith("/master/users")}
                />
              </NavItem>
            )}

            {/* Warehouse Operations: Displayed if userRole is 'Admin' OR 'Warehouse Staff' */}
            {(userRole === "Admin" || userRole === "Staff Gudang") && (
              <NavItem
                icon={<Building2 className="h-5 w-5" />}
                label="Warehouse Operations"
                isActive={location.pathname.startsWith("/warehouse")}
                isOpen={openMenus.warehouseOps}
                onToggle={() => toggleMenu("warehouseOps")}
              >
                <SubNavItem
                  label="Goods Receipt History"
                  href="/warehouse/receipts"
                  isActive={isActive("/warehouse/receipts")}
                />
                <SubNavItem
                  label="Add Goods Receipt"
                  href="/warehouse/receipts/add"
                  isActive={isActive("/warehouse/receipts/add")}
                />
                <SubNavItem
                  label="View Dus Stock"
                  href="/warehouse/stock/dus"
                  isActive={isActive("/warehouse/stock/dus")}
                />
                <SubNavItem
                  label="View Pasang Stock"
                  href="/warehouse/stock/pasang"
                  isActive={isActive("/warehouse/stock/pasang")}
                />
                <NavItem
                  icon={<Package className="h-5 w-5" />}
                  label="Conversion Process"
                  isActive={location.pathname.startsWith(
                    "/warehouse/conversion",
                  )}
                  isOpen={openMenus.conversion}
                  onToggle={() => toggleMenu("conversion")}
                >
                  <SubNavItem
                    label="Convert Boxes to Units"
                    href="/warehouse/conversion/add"
                    isActive={isActive("/warehouse/conversion/add")}
                  />
                  <SubNavItem
                    label="Boxes Ready to Calculate"
                    href="/warehouse/conversion/ready-to-calculate"
                    isActive={isActive(
                      "/warehouse/conversion/ready-to-calculate",
                    )}
                  />
                  <SubNavItem
                    label="Input Calculate Pairs"
                    href="/warehouse/conversion/input-pairs"
                    isActive={isActive("/warehouse/conversion/input-pairs")}
                  />
                </NavItem>
                <SubNavItem
                  label="Stock Opname Adjustment"
                  href="/warehouse/opname/adjust"
                  isActive={isActive("/warehouse/opname/adjust")}
                />
              </NavItem>
            )}

            {/* Distribution: Shown if userRole is 'Admin' OR 'Warehouse Staff' */}
            {(userRole === "Admin" || userRole === "Staff Gudang") && (
              <NavItem
                icon={<Truck className="h-5 w-5" />}
                label="Distribution"
                isActive={location.pathname.startsWith("/distribution")}
                isOpen={openMenus.distribution}
                onToggle={() => toggleMenu("distribution")}
              >
                <SubNavItem
                  label="Create New Shipment"
                  href="/distribution/transfers/add"
                  isActive={isActive("/distribution/transfers/add")}
                />
                <SubNavItem
                  label="Shipment History"
                  href="/distribution/transfers/history"
                  isActive={isActive("/distribution/transfers/history")}
                />
              </NavItem>
            )}

            {/* Store Operations: Shown if userRole is 'Admin' OR 'Store Cashier' */}
            {(userRole === "Admin" || userRole === "Kasir Toko") && (
              <NavItem
                icon={<Store className="h-5 w-5" />}
                label="Store Operations"
                isActive={location.pathname.startsWith("/store")}
                isOpen={openMenus.storeOps}
                onToggle={() => toggleMenu("storeOps")}
              >
                <SubNavItem
                  label="Store Stock"
                  href="/store/stock"
                  isActive={isActive("/store/stock")}
                />
                <SubNavItem
                  label="Point of Sale"
                  href="/store/pos"
                  isActive={isActive("/store/pos")}
                />
                <SubNavItem
                  label="Sales History"
                  href="/store/sales"
                  isActive={isActive("/store/sales")}
                />
                <SubNavItem
                  label="Store Stock Opname"
                  href="/store/opname"
                  isActive={isActive("/store/opname")}
                />
              </NavItem>
            )}

            {/* Rejected Goods: Shown if userRole is 'Admin' OR 'Warehouse Staff' */}
            {(userRole === "Admin" || userRole === "Staff Gudang") && (
              <NavItem
                icon={<AlertTriangle className="h-5 w-5" />}
                label="Rejected Goods"
                isActive={location.pathname.startsWith("/rejected")}
                isOpen={openMenus.rejected}
                onToggle={() => toggleMenu("rejected")}
              >
                <SubNavItem
                  label="View Rejected List"
                  href="/rejected"
                  isActive={
                    isActive("/rejected") || location.pathname === "/rejected"
                  }
                />
                <SubNavItem
                  label="Input Rejected Items"
                  href="/rejected/input"
                  isActive={isActive("/rejected/input")}
                />
                <SubNavItem
                  label="Update Status"
                  href="/rejected/update"
                  isActive={isActive("/rejected/update")}
                />
              </NavItem>
            )}

            {/* Reports: Shows if userRole is 'Admin' */}
            {userRole === "Admin" && (
              <NavItem
                icon={<FileText className="h-5 w-5" />}
                label="Reports"
                isActive={location.pathname.startsWith("/reports")}
                isOpen={openMenus.reports}
                onToggle={() => toggleMenu("reports")}
              >
                <NavItem
                  icon={<Package className="h-5 w-5" />}
                  label="Stock Reports"
                  isActive={location.pathname.startsWith("/reports/stock")}
                  isOpen={openMenus.stockReports}
                  onToggle={() => toggleMenu("stockReports")}
                >
                  <SubNavItem
                    label="Stock Overview"
                    href="/reports/stock"
                    isActive={isActive("/reports/stock")}
                  />
                  <SubNavItem
                    label="Stock Card"
                    href="/reports/stock/card"
                    isActive={isActive("/reports/stock/card")}
                  />
                </NavItem>
                <NavItem
                  icon={<Truck className="h-5 w-5" />}
                  label="Movement Reports"
                  isActive={location.pathname.startsWith("/reports/movement")}
                  isOpen={openMenus.movementReports}
                  onToggle={() => toggleMenu("movementReports")}
                >
                  <SubNavItem
                    label="Distribution Reports"
                    href="/reports/movement/distribution"
                    isActive={isActive("/reports/movement/distribution")}
                  />
                  <SubNavItem
                    label="Conversion Reports"
                    href="/reports/movement/konversi"
                    isActive={isActive("/reports/movement/konversi")}
                  />
                  <SubNavItem
                    label="Stock Opname Adjustments"
                    href="/reports/movement/opname"
                    isActive={isActive("/reports/movement/opname")}
                  />
                </NavItem>
                <SubNavItem
                  label="Sales Report"
                  href="/reports/sales"
                  isActive={isActive("/reports/sales")}
                />
                <SubNavItem
                  label="Rejected Goods Report"
                  href="/reports/rejected"
                  isActive={isActive("/reports/rejected")}
                />
              </NavItem>
            )}

            {/* Settings: Shows only if userRole is 'Admin' */}
            {userRole === "Admin" && (
              <NavItem
                icon={<Settings className="h-5 w-5" />}
                label="Settings"
                href="/settings"
                isActive={isActive("/settings")}
              />
            )}
          </nav>

          {/* Sidebar toggle button */}
          <div className="flex justify-center my-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="rounded-full"
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* User profile */}
          <div className="p-4 border-t border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center w-full px-2 py-2 text-sm rounded-md hover:bg-accent">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
                      alt="User"
                    />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{user?.name || "Admin User"}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email || "admin@example.com"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          isSidebarOpen
            ? isSidebarCollapsed
              ? "lg:ml-20"
              : "lg:ml-64"
            : "ml-0",
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-card border-b border-border flex items-center px-6">
          <div className="flex-1">
            <h2 className="text-xl font-semibold">Dashboard</h2>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <ShoppingCart className="h-4 w-4 mr-2" />
              POS
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 bg-background">{children || <Outlet />}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
