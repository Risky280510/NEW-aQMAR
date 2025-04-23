import { Suspense, lazy } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";
import DashboardLayout from "./components/layout/DashboardLayout";
import ApplicationSettingsForm from "./components/settings/ApplicationSettingsForm";
import LoginSimulator from "./components/temp/LoginSimulator";
import LoginPage from "./components/auth/LoginPage";
import AccessDeniedPage from "./components/auth/AccessDeniedPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Import the ThemeProvider from shadcn
import { ThemeProvider } from "@/components/ui/theme-provider";

// Lazy load location components
const LocationList = lazy(() => import("./components/locations/LocationList"));
const AddLocation = lazy(() => import("./components/locations/AddLocation"));
const EditLocation = lazy(() => import("./components/locations/EditLocation"));

// Lazy load product components
const ProductList = lazy(() => import("./components/products/ProductList"));
const AddProduct = lazy(() => import("./components/products/AddProduct"));
const EditProduct = lazy(() => import("./components/products/EditProduct"));

// Lazy load color components
const ColorList = lazy(() => import("./components/colors/ColorList"));
const AddColor = lazy(() => import("./components/colors/AddColor"));
const EditColor = lazy(() => import("./components/colors/EditColor"));

// Lazy load size components
const SizeList = lazy(() => import("./components/sizes/SizeList"));
const AddSize = lazy(() => import("./components/sizes/AddSize"));
const EditSize = lazy(() => import("./components/sizes/EditSize"));

// Lazy load user components
const UserList = lazy(() => import("./components/users/UserList"));
const AddUserForm = lazy(() => import("./components/users/AddUserForm"));
const EditUserForm = lazy(() => import("./components/users/EditUserForm"));

// Lazy load warehouse components
const GoodsReceiptForm = lazy(
  () => import("./components/warehouse/GoodsReceiptForm"),
);
const GoodsReceiptHistoryList = lazy(
  () => import("./components/warehouse/GoodsReceiptHistoryList"),
);
const GoodsReceiptDetail = lazy(
  () => import("./components/warehouse/GoodsReceiptDetail"),
);
const WarehouseDusStockList = lazy(
  () => import("./components/warehouse/WarehouseDusStockList"),
);
const WarehousePasangStockList = lazy(
  () => import("./components/warehouse/WarehousePasangStockList"),
);
const StockOpnameAdjustment = lazy(
  () => import("./components/warehouse/StockOpnameAdjustment"),
);

// Lazy load reject components
const RecordRejectForm = lazy(
  () => import("./components/rejects/RecordRejectForm"),
);
const RejectList = lazy(() => import("./components/rejects/RejectList"));

// Lazy load report components
const StockPerLocationReport = lazy(
  () => import("./components/reports/StockPerLocationReport"),
);
const StockCardReport = lazy(
  () => import("./components/reports/StockCardReport"),
);
const SalesReport = lazy(() => import("./components/reports/SalesReport"));
const KonversiHistoryReport = lazy(
  () => import("./components/reports/KonversiHistoryReport"),
);
const StockOpnameReport = lazy(
  () => import("./components/reports/StockOpnameReport"),
);

// Reuse TransferHistoryList for reports
const DistributionReport = lazy(
  () => import("./components/distribution/TransferHistoryList"),
);

// Reuse RejectList for reports
const RejectReport = lazy(() => import("./components/rejects/RejectList"));

// Lazy load distribution components
const CreateTransferForm = lazy(
  () => import("./components/distribution/CreateTransferForm"),
);
const TransferHistoryList = lazy(
  () => import("./components/distribution/TransferHistoryList"),
);

// Lazy load store components
const PointOfSale = lazy(() => import("./components/store/PointOfSale"));
const StoreStockView = lazy(() => import("./components/store/StoreStockView"));
const SalesHistoryList = lazy(
  () => import("./components/store/SalesHistoryList"),
);

// Lazy load conversion workflow components
const KonversiDusForm = lazy(
  () => import("./components/warehouse/KonversiDusForm"),
);
const DusSiapDihitungList = lazy(
  () => import("./components/warehouse/DusSiapDihitungList"),
);
const InputHitungPasangForm = lazy(
  () => import("./components/warehouse/InputHitungPasangForm"),
);

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <Suspense fallback={<p>Loading...</p>}>
        {/* Login Simulator for testing - only in development */}
        {/* {import.meta.env.DEV && <LoginSimulator />} */}

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} />

          {/* Protected Routes with DashboardLayout */}
          <Route element={<DashboardLayout />}>
            {/* Dashboard Route - Admin, Warehouse Staff, Store Cashier */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["Admin", "Staff Gudang", "Kasir Toko"]}
                />
              }
            >
              <Route path="/" element={<Home />} />
            </Route>

            {/* Master Data Routes - Admin Only */}
            <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
              <Route path="/master">
                {/* Location Routes */}
                <Route path="locations" element={<LocationList />} />
                <Route path="locations/add" element={<AddLocation />} />
                <Route path="locations/edit/:id" element={<EditLocation />} />

                {/* Product Routes */}
                <Route path="products" element={<ProductList />} />
                <Route path="products/add" element={<AddProduct />} />
                <Route path="products/edit/:id" element={<EditProduct />} />

                {/* Color Routes */}
                <Route path="colors" element={<ColorList />} />
                <Route path="colors/add" element={<AddColor />} />
                <Route path="colors/edit/:id" element={<EditColor />} />

                {/* Size Routes */}
                <Route path="sizes" element={<SizeList />} />
                <Route path="sizes/add" element={<AddSize />} />
                <Route path="sizes/edit/:id" element={<EditSize />} />

                {/* User Routes */}
                <Route path="users" element={<UserList />} />
                <Route path="users/add" element={<AddUserForm />} />
                <Route path="users/edit/:id" element={<EditUserForm />} />
              </Route>

              {/* Settings Route - Admin Only */}
              <Route path="/settings" element={<ApplicationSettingsForm />} />
            </Route>

            {/* Warehouse Operations Routes - Admin and Warehouse Staff */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["Admin", "Staff Gudang"]} />
              }
            >
              <Route path="/warehouse">
                <Route path="receipts" element={<GoodsReceiptHistoryList />} />
                <Route path="receipts/add" element={<GoodsReceiptForm />} />
                <Route path="stock/dus" element={<WarehouseDusStockList />} />
                <Route
                  path="stock/pasang"
                  element={<WarehousePasangStockList />}
                />
                <Route
                  path="opname/adjust"
                  element={<StockOpnameAdjustment />}
                />
                <Route
                  path="opname/adjust/:locationId"
                  element={<StockOpnameAdjustment />}
                />

                {/* Conversion Workflow Routes */}
                <Route path="conversion/add" element={<KonversiDusForm />} />
                <Route
                  path="conversion/ready-to-calculate"
                  element={<DusSiapDihitungList />}
                />
                <Route
                  path="conversion/input-pairs"
                  element={<InputHitungPasangForm />}
                />
              </Route>
            </Route>

            {/* Distribution Routes - Admin and Warehouse Staff */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["Admin", "Staff Gudang"]} />
              }
            >
              <Route path="/distribution">
                <Route path="transfers/add" element={<CreateTransferForm />} />
                <Route
                  path="transfers/history"
                  element={<TransferHistoryList />}
                />
              </Route>
            </Route>

            {/* Store Operations Routes - Admin and Store Cashier */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["Admin", "Kasir Toko"]} />
              }
            >
              <Route path="/store">
                <Route path="pos" element={<PointOfSale />} />
                <Route path="stock" element={<StoreStockView />} />
                <Route path="sales" element={<SalesHistoryList />} />
                <Route path="opname" element={<StockOpnameAdjustment />} />
              </Route>
            </Route>

            {/* Rejected Goods Routes - Admin and Warehouse Staff */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["Admin", "Staff Gudang"]} />
              }
            >
              <Route path="/rejected">
                <Route index element={<RejectList />} />
                <Route path="input" element={<RecordRejectForm />} />
                <Route path="update" element={<RejectList />} />
              </Route>
            </Route>

            {/* Reports Routes - Admin Only */}
            <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
              <Route path="/reports">
                <Route path="stock" element={<StockPerLocationReport />} />
                <Route path="stock/card" element={<StockCardReport />} />
                <Route path="sales" element={<SalesReport />} />
                <Route
                  path="movement/distribution"
                  element={<DistributionReport />}
                />
                <Route
                  path="movement/konversi"
                  element={<KonversiHistoryReport />}
                />
                <Route path="movement/opname" element={<StockOpnameReport />} />
                <Route path="rejected" element={<RejectReport />} />
              </Route>
            </Route>
          </Route>

          {/* Add Tempo routes support */}
          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" />
          )}
        </Routes>

        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </Suspense>
    </ThemeProvider>
  );
}

export default App;
