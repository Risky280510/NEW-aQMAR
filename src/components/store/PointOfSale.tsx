import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSale, SalesOrderItemInput } from "@/services/salesService";
import { getVariantStockLevel } from "@/services/warehouseService";
import {
  getProducts,
  getSizesForProduct,
  Size,
} from "@/services/productService";
import { Product } from "@/models/Product";

// Mock color data (in a real app, this would come from colorService)
interface Color {
  id: number;
  color_name: string;
}

const mockColors: Color[] = [
  { id: 1, color_name: "Red" },
  { id: 2, color_name: "Blue" },
  { id: 3, color_name: "Green" },
  { id: 4, color_name: "Black" },
  { id: 5, color_name: "White" },
];

// Mock prices (in a real app, this would come from a pricing service)
const getProductPrice = (productId: number): number => {
  const prices: Record<number, number> = {
    1: 150000, // Running Shoes
    2: 25000, // Sports Socks
    3: 200000, // Training Shoes
  };
  return prices[productId] || 100000; // Default price
};

interface PointOfSaleProps {
  currentStoreLocationId: number;
}

const PointOfSale: React.FC<PointOfSaleProps> = ({
  currentStoreLocationId = 2,
}) => {
  const { toast } = useToast();

  // State for product selection
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [availableSizes, setAvailableSizes] = useState<Size[]>([]);
  const [stockLevel, setStockLevel] = useState<number | null>(null);

  // State for cart
  const [cartItems, setCartItems] = useState<SalesOrderItemInput[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const productsData = await getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);

  // Fetch sizes when product changes
  useEffect(() => {
    const fetchSizes = async () => {
      if (selectedProduct) {
        setIsLoading(true);
        try {
          const sizesData = await getSizesForProduct(selectedProduct);
          setAvailableSizes(sizesData);
          // Reset size selection when product changes
          setSelectedSize(null);
        } catch (error) {
          console.error("Failed to fetch sizes:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setAvailableSizes([]);
      }
    };

    fetchSizes();
  }, [selectedProduct]);

  // Check stock level when product, color, and size are selected
  useEffect(() => {
    const checkStockLevel = async () => {
      if (selectedProduct && selectedColor && selectedSize) {
        try {
          const stock = await getVariantStockLevel(
            currentStoreLocationId,
            selectedProduct,
            selectedColor,
            selectedSize,
          );
          setStockLevel(stock);
        } catch (error) {
          console.error("Failed to fetch stock level:", error);
          setStockLevel(null);
        }
      } else {
        setStockLevel(null);
      }
    };

    checkStockLevel();
  }, [selectedProduct, selectedColor, selectedSize, currentStoreLocationId]);

  // Calculate total amount when cart items change
  useEffect(() => {
    const newTotal = cartItems.reduce(
      (sum, item) => sum + item.quantity * item.pricePerItem,
      0,
    );
    setTotalAmount(newTotal);
  }, [cartItems]);

  // Add item to cart
  const handleAddToCart = () => {
    if (!selectedProduct || !selectedColor || !selectedSize) {
      toast({
        title: "Error",
        description: "Please select product, color, and size.",
        variant: "destructive",
      });
      return;
    }

    if (quantity <= 0) {
      toast({
        title: "Error",
        description: "Quantity must be greater than zero.",
        variant: "destructive",
      });
      return;
    }

    if (stockLevel !== null && quantity > stockLevel) {
      toast({
        title: "Error",
        description: `Insufficient stock. Only ${stockLevel} available.`,
        variant: "destructive",
      });
      return;
    }

    const product = products.find((p) => p.id === selectedProduct);
    const color = mockColors.find((c) => c.id === selectedColor);
    const size = availableSizes.find((s) => s.id === selectedSize);

    if (!product || !color || !size) {
      toast({
        title: "Error",
        description: "Invalid product, color, or size selection.",
        variant: "destructive",
      });
      return;
    }

    const pricePerItem = getProductPrice(selectedProduct);
    const variantSku = `${product.product_sku}-${color.color_name.substring(0, 3).toUpperCase()}-${size.size_name}`;

    // Check if item already exists in cart
    const existingItemIndex = cartItems.findIndex(
      (item) =>
        item.productId === selectedProduct &&
        item.colorId === selectedColor &&
        item.sizeId === selectedSize,
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedCartItems = [...cartItems];
      updatedCartItems[existingItemIndex].quantity += quantity;
      setCartItems(updatedCartItems);
    } else {
      // Add new item
      const newItem: SalesOrderItemInput = {
        productId: selectedProduct,
        colorId: selectedColor,
        sizeId: selectedSize,
        variantSku,
        quantity,
        pricePerItem,
      };
      setCartItems([...cartItems, newItem]);
    }

    // Reset selection
    setQuantity(1);
    toast({
      title: "Success",
      description: "Item added to cart.",
    });
  };

  // Remove item from cart
  const handleRemoveFromCart = (index: number) => {
    const updatedCartItems = [...cartItems];
    updatedCartItems.splice(index, 1);
    setCartItems(updatedCartItems);
  };

  // Update item quantity in cart
  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(index);
      return;
    }

    const updatedCartItems = [...cartItems];
    updatedCartItems[index].quantity = newQuantity;
    setCartItems(updatedCartItems);
  };

  // Complete sale
  const handleCompleteSale = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Error",
        description: "Cart is empty. Please add items to complete sale.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const saleData = {
        locationId: currentStoreLocationId,
        items: cartItems,
        totalAmount,
        saleDate: new Date(),
      };

      const result = await createSale(saleData);

      toast({
        title: "Sale Completed",
        description: `Sales order ${result.orderNumber} has been created successfully.`,
      });

      // Reset cart
      setCartItems([]);
      setTotalAmount(0);
    } catch (error) {
      console.error("Failed to complete sale:", error);
      toast({
        title: "Error",
        description: "Failed to process sale. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full bg-background p-4">
      {/* Left Section: Product Selection */}
      <Card className="w-full md:w-1/2">
        <CardHeader>
          <CardTitle>Add Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Product Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Product</label>
            <Select
              value={selectedProduct?.toString() || ""}
              onValueChange={(value) => setSelectedProduct(Number(value))}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem
                    key={product.id}
                    value={product.id?.toString() || ""}
                  >
                    {product.product_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Color</label>
            <Select
              value={selectedColor?.toString() || ""}
              onValueChange={(value) => setSelectedColor(Number(value))}
              disabled={!selectedProduct || isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a color" />
              </SelectTrigger>
              <SelectContent>
                {mockColors.map((color) => (
                  <SelectItem key={color.id} value={color.id.toString()}>
                    {color.color_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Size Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Size</label>
            <Select
              value={selectedSize?.toString() || ""}
              onValueChange={(value) => setSelectedSize(Number(value))}
              disabled={
                !selectedProduct || isLoading || availableSizes.length === 0
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a size" />
              </SelectTrigger>
              <SelectContent>
                {availableSizes.map((size) => (
                  <SelectItem key={size.id} value={size.id.toString()}>
                    {size.size_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stock Level Display */}
          {stockLevel !== null && (
            <div className="text-sm">
              Available Stock:{" "}
              <span
                className={
                  stockLevel > 0
                    ? "text-green-600 font-medium"
                    : "text-red-600 font-medium"
                }
              >
                {stockLevel}
              </span>
            </div>
          )}

          {/* Quantity Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quantity</label>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              disabled={
                !selectedProduct || !selectedColor || !selectedSize || isLoading
              }
            />
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={
              !selectedProduct ||
              !selectedColor ||
              !selectedSize ||
              isLoading ||
              (stockLevel !== null && stockLevel < quantity)
            }
            className="w-full"
          >
            Add to Cart
          </Button>
        </CardContent>
      </Card>

      {/* Right Section: Cart */}
      <Card className="w-full md:w-1/2">
        <CardHeader>
          <CardTitle>Shopping Cart</CardTitle>
        </CardHeader>
        <CardContent>
          {cartItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Cart is empty. Add items to proceed with sale.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Subtotal</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cartItems.map((item, index) => {
                  const product = products.find((p) => p.id === item.productId);
                  const color = mockColors.find((c) => c.id === item.colorId);
                  const size = availableSizes.find(
                    (s) => s.id === item.sizeId,
                  ) || { id: item.sizeId, size_name: "Unknown" };

                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="font-medium">
                          {product?.product_name || "Unknown Product"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {color?.color_name || "Unknown"} / {size.size_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateQuantity(
                              index,
                              parseInt(e.target.value) || 1,
                            )
                          }
                          className="w-16"
                        />
                      </TableCell>
                      <TableCell>
                        {item.pricePerItem.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {(item.quantity * item.pricePerItem).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFromCart(index)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-end space-y-4">
          <div className="text-xl font-bold">
            Total: Rp {totalAmount.toLocaleString()}
          </div>
          <Button
            onClick={handleCompleteSale}
            disabled={cartItems.length === 0 || isSubmitting}
            className="w-full md:w-auto"
          >
            {isSubmitting ? "Processing..." : "Complete Sale"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PointOfSale;
