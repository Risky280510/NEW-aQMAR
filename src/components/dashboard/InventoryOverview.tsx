import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowRight,
  Package,
  Store,
  History,
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  warehouseStock: number;
  storeStock: number;
  minStock: number;
  status: "normal" | "low" | "critical" | "overstock";
}

interface TransactionItem {
  id: string;
  date: string;
  type: "receipt" | "transfer" | "conversion" | "sale";
  product: string;
  quantity: number;
  from: string;
  to: string;
  status: "completed" | "pending" | "in-transit";
}

const InventoryOverview: React.FC = () => {
  const [activeTab, setActiveTab] = useState("warehouse");

  // Mock data for inventory items
  const inventoryItems: InventoryItem[] = [
    {
      id: "1",
      sku: "SH-001",
      name: "Running Shoes",
      category: "Footwear",
      warehouseStock: 120,
      storeStock: 45,
      minStock: 50,
      status: "normal",
    },
    {
      id: "2",
      sku: "SH-002",
      name: "Casual Sneakers",
      category: "Footwear",
      warehouseStock: 35,
      storeStock: 28,
      minStock: 40,
      status: "low",
    },
    {
      id: "3",
      sku: "AP-001",
      name: "Sports T-Shirt",
      category: "Apparel",
      warehouseStock: 10,
      storeStock: 15,
      minStock: 30,
      status: "critical",
    },
    {
      id: "4",
      sku: "AP-002",
      name: "Workout Shorts",
      category: "Apparel",
      warehouseStock: 200,
      storeStock: 75,
      minStock: 50,
      status: "overstock",
    },
    {
      id: "5",
      sku: "AC-001",
      name: "Sports Bag",
      category: "Accessories",
      warehouseStock: 45,
      storeStock: 20,
      minStock: 25,
      status: "normal",
    },
  ];

  // Mock data for recent transactions
  const recentTransactions: TransactionItem[] = [
    {
      id: "T1001",
      date: "2023-06-15",
      type: "receipt",
      product: "Running Shoes",
      quantity: 50,
      from: "Supplier A",
      to: "Main Warehouse",
      status: "completed",
    },
    {
      id: "T1002",
      date: "2023-06-14",
      type: "transfer",
      product: "Casual Sneakers",
      quantity: 20,
      from: "Main Warehouse",
      to: "Store A",
      status: "in-transit",
    },
    {
      id: "T1003",
      date: "2023-06-13",
      type: "conversion",
      product: "Sports T-Shirt",
      quantity: 5,
      from: "Box Stock",
      to: "Unit Stock",
      status: "completed",
    },
    {
      id: "T1004",
      date: "2023-06-12",
      type: "sale",
      product: "Workout Shorts",
      quantity: 3,
      from: "Store B",
      to: "Customer",
      status: "completed",
    },
    {
      id: "T1005",
      date: "2023-06-11",
      type: "receipt",
      product: "Sports Bag",
      quantity: 25,
      from: "Supplier B",
      to: "Main Warehouse",
      status: "pending",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "normal":
        return <Badge className="bg-green-500">Normal</Badge>;
      case "low":
        return <Badge className="bg-yellow-500">Low</Badge>;
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
      case "overstock":
        return <Badge className="bg-blue-500">Overstock</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "in-transit":
        return <Badge className="bg-blue-500">In Transit</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case "receipt":
        return <Badge className="bg-green-700">Receipt</Badge>;
      case "transfer":
        return <Badge className="bg-blue-700">Transfer</Badge>;
      case "conversion":
        return <Badge className="bg-purple-700">Conversion</Badge>;
      case "sale":
        return <Badge className="bg-orange-700">Sale</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  return (
    <Card className="w-full bg-white shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">Inventory Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="warehouse"
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger
                value="warehouse"
                className="flex items-center gap-2"
              >
                <Package size={16} />
                Warehouse Stock
              </TabsTrigger>
              <TabsTrigger value="store" className="flex items-center gap-2">
                <Store size={16} />
                Store Stock
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex items-center gap-2">
                <History size={16} />
                Recent Transactions
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-8 w-[200px] h-9"
                />
              </div>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter size={16} />
                Filter
              </Button>
            </div>
          </div>

          <TabsContent value="warehouse" className="mt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">SKU</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-1 cursor-pointer">
                      Stock Level
                      <ArrowUpDown size={14} />
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.sku}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-right">
                      {item.warehouseStock}
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Details <ArrowRight size={14} className="ml-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="store" className="mt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">SKU</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-1 cursor-pointer">
                      Store Stock
                      <ArrowUpDown size={14} />
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.sku}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-right">
                      {item.storeStock}
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Details <ArrowRight size={14} className="ml-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="recent" className="mt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {transaction.id}
                    </TableCell>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>
                      {getTransactionTypeBadge(transaction.type)}
                    </TableCell>
                    <TableCell>{transaction.product}</TableCell>
                    <TableCell className="text-right">
                      {transaction.quantity}
                    </TableCell>
                    <TableCell>{transaction.from}</TableCell>
                    <TableCell>{transaction.to}</TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Details <ArrowRight size={14} className="ml-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default InventoryOverview;
