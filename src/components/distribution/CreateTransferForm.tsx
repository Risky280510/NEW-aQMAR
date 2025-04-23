import { useState, useEffect, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Plus, Trash2, FileUp } from "lucide-react";
import * as XLSX from "xlsx";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

import { Location } from "@/models/Location";
import { Product } from "@/models/Product";
import { Color } from "@/models/Color";
import { Size } from "@/services/productService";
import { CreateTransferInput } from "@/models/Transfer";

import { getLocations } from "@/services/locationService";
import { getProducts, getSizesForProduct } from "@/services/productService";
import { getColors } from "@/services/colorService";
import { createStockTransfer } from "@/services/distributionService";

// Define the item schema for each transfer item
const transferItemSchema = z.object({
  productId: z.number({
    required_error: "Please select a product",
  }),
  colorId: z.number({
    required_error: "Please select a color",
  }),
  sizeId: z.number().optional(),
  quantity: z
    .number({
      required_error: "Please enter a quantity",
    })
    .min(1, "Quantity must be greater than 0"),
});

// Define the form schema with zod
const formSchema = z
  .object({
    sourceLocationId: z.number({
      required_error: "Please select a source location",
    }),
    destinationLocationId: z.number({
      required_error: "Please select a destination location",
    }),
    transferType: z.enum(["dus", "pasang"], {
      required_error: "Please select a transfer type",
    }),
    transferDate: z.date({
      required_error: "Please select a transfer date",
    }),
    notes: z.string().optional(),
    items: z.array(transferItemSchema).min(1, {
      message: "There must be at least 1 item to transfer",
    }),
  })
  .refine((data) => data.sourceLocationId !== data.destinationLocationId, {
    message: "Source and destination locations must be different",
    path: ["destinationLocationId"],
  })
  .superRefine((data, ctx) => {
    // Check if size is provided for each item when transfer type is pasang
    if (data.transferType === "pasang") {
      data.items.forEach((item, index) => {
        if (!item.sizeId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Size is required for pasang transfers",
            path: [`items.${index}.sizeId`],
          });
        }
      });
    }
  });

// Define the component props
interface CreateTransferFormProps {
  onSuccess?: () => void;
}

const CreateTransferForm = ({ onSuccess }: CreateTransferFormProps) => {
  // State for loading data
  const [isLoading, setIsLoading] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[][]>([]);

  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast for notifications
  const { toast } = useToast();

  // Define the type for the form values
  type TransferFormValues = z.infer<typeof formSchema>;

  // Initialize the form
  const form = useForm<TransferFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sourceLocationId: 0,
      destinationLocationId: 0,
      transferType: "dus",
      transferDate: new Date(),
      notes: "",
      items: [{ productId: 0, colorId: 0, quantity: 1 }],
    },
  });

  // Initialize the field array for items
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Watch for changes to fields that affect other fields
  const transferType = form.watch("transferType");

  // Load locations, products, and colors on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [locationsData, productsData, colorsData] = await Promise.all([
          getLocations(),
          getProducts(),
          getColors(),
        ]);

        setLocations(locationsData);
        setProducts(productsData);
        setColors(colorsData);
      } catch (error) {
        console.error("Failed to load initial data:", error);
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [toast]);

  // Load sizes when product changes for a specific item
  const loadSizesForProduct = async (productId: number, index: number) => {
    if (!productId) return;

    try {
      const sizesData = await getSizesForProduct(productId);
      // Store sizes in a map where the key is the product ID
      setSizes((prevSizes) => {
        const newSizes = [...prevSizes];
        newSizes[index] = sizesData;
        return newSizes;
      });
    } catch (error) {
      console.error("Failed to load sizes:", error);
      toast({
        title: "Error",
        description: "Failed to load sizes for the selected product.",
        variant: "destructive",
      });
    }
  };

  // Watch for changes to product IDs in the items array
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name && name.startsWith("items.") && name.endsWith(".productId")) {
        const match = name.match(/items\.(\d+)\.productId/);
        if (match) {
          const index = parseInt(match[1]);
          const productId = value.items?.[index]?.productId;
          if (productId) {
            loadSizesForProduct(productId, index);
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form.watch, toast]);

  // Handle file selection
  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file change
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "array" });
          const wsname = workbook.SheetNames[0];
          const ws = workbook.Sheets[wsname];
          const jsonData = XLSX.utils.sheet_to_json(ws);

          // Process the imported data
          await processImportedData(jsonData);
        } catch (error) {
          console.error("Error parsing Excel file:", error);
          toast({
            title: "Error",
            description:
              "Failed to parse Excel file. Please check the file format.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
          // Reset the file input
          if (event.target) {
            event.target.value = "";
          }
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error reading file:", error);
      toast({
        title: "Error",
        description: "Failed to read the file. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // Process imported data
  const processImportedData = async (excelData: any[]) => {
    if (!excelData || excelData.length === 0) {
      toast({
        title: "Error",
        description: "No data found in the Excel file.",
        variant: "destructive",
      });
      return;
    }

    const transferType = form.watch("transferType");
    const newFormItems: any[] = [];
    const skippedItemsInfo: string[] = [];

    // Process each row in the Excel data
    for (const row of excelData) {
      // Extract values from the row (flexible header names)
      const productIdentifier =
        row.Product_SKU ||
        row.product_sku ||
        row.ProductSKU ||
        row.productSku ||
        row.SKU ||
        row.sku ||
        "";
      const colorIdentifier =
        row.Color_Name ||
        row.color_name ||
        row.ColorName ||
        row.colorName ||
        row.Color ||
        row.color ||
        "";
      const sizeIdentifier =
        row.Size_Name ||
        row.size_name ||
        row.SizeName ||
        row.sizeName ||
        row.Size ||
        row.size ||
        "";
      const quantity = Number(
        row.Quantity || row.quantity || row.QUANTITY || 0,
      );

      // Find matching product
      const product = products.find((p) => p.product_sku === productIdentifier);
      if (!product) {
        skippedItemsInfo.push(`Product not found: ${productIdentifier}`);
        continue;
      }

      // Find matching color
      const color = colors.find(
        (c) => c.color_name.toLowerCase() === colorIdentifier.toLowerCase(),
      );
      if (!color) {
        skippedItemsInfo.push(
          `Color not found: ${colorIdentifier} for product ${productIdentifier}`,
        );
        continue;
      }

      // Handle size based on transfer type
      let sizeId: number | undefined = undefined;
      if (transferType === "pasang") {
        // Load sizes for this product if not already loaded
        let productSizes = sizes[newFormItems.length];
        if (!productSizes) {
          try {
            productSizes = await getSizesForProduct(product.id!);
            // Update sizes state
            setSizes((prevSizes) => {
              const newSizes = [...prevSizes];
              newSizes[newFormItems.length] = productSizes;
              return newSizes;
            });
          } catch (error) {
            console.error(
              `Failed to load sizes for product ${product.id}:`,
              error,
            );
            skippedItemsInfo.push(
              `Failed to load sizes for product ${productIdentifier}`,
            );
            continue;
          }
        }

        // Find matching size
        const size = productSizes.find(
          (s) => s.size_name.toLowerCase() === sizeIdentifier.toLowerCase(),
        );
        if (!size) {
          skippedItemsInfo.push(
            `Size not found: ${sizeIdentifier} for product ${productIdentifier}`,
          );
          continue;
        }
        sizeId = size.id;
      }

      // Validate quantity
      if (!quantity || quantity <= 0) {
        skippedItemsInfo.push(
          `Invalid quantity: ${quantity} for product ${productIdentifier}`,
        );
        continue;
      }

      // Add valid item to the new form items
      newFormItems.push({
        productId: product.id,
        colorId: color.id,
        sizeId,
        quantity,
      });
    }

    // Update form state with the new items
    if (newFormItems.length > 0) {
      // Get current form values
      const currentValues = form.getValues();

      // Reset form with updated items
      form.reset({
        ...currentValues,
        items: newFormItems,
      });

      toast({
        title: "Import Successful",
        description: `Successfully imported ${newFormItems.length} items. ${skippedItemsInfo.length} items skipped.`,
      });

      // Log skipped items details
      if (skippedItemsInfo.length > 0) {
        console.log("Skipped items:", skippedItemsInfo);
        toast({
          title: "Some items were skipped",
          description: "Check the console for details on skipped items.",
          variant: "warning",
        });
      }
    } else {
      toast({
        title: "Import Failed",
        description: "No valid items found in the Excel file.",
        variant: "destructive",
      });
    }
  };

  // Handle form submission
  const onSubmit = async (values: TransferFormValues) => {
    setIsLoading(true);
    try {
      // Process items based on transfer type
      const processedItems = values.items.map((item) => {
        // If transfer type is dus, ensure sizeId is null
        if (values.transferType === "dus") {
          return { ...item, sizeId: undefined };
        }
        return item;
      });

      // Create the transfer input data
      const transferData = {
        sourceLocationId: values.sourceLocationId,
        destinationLocationId: values.destinationLocationId,
        transferType: values.transferType,
        transferDate: values.transferDate.toISOString(),
        notes: values.notes,
        items: processedItems,
      };

      // Call the service to create the transfer
      const result = await createStockTransfer(transferData);

      // Show success toast
      toast({
        title: "Transfer Created",
        description: `Transfer #${result.id} has been created successfully.`,
      });

      // Reset the form
      form.reset({
        transferType: "dus",
        transferDate: new Date(),
        items: [{ quantity: 1 }],
      });

      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to create transfer:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create transfer",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create Stock Transfer</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Source and Destination Locations */}
            <FormField
              control={form.control}
              name="sourceLocationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source Location</FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem
                          key={location.id}
                          value={location.id?.toString() || ""}
                        >
                          {location.location_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="destinationLocationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination Location</FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem
                          key={location.id}
                          value={location.id?.toString() || ""}
                        >
                          {location.location_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Transfer Type */}
            <FormField
              control={form.control}
              name="transferType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transfer Type</FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transfer type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="dus">Dus (Box)</SelectItem>
                      <SelectItem value="pasang">Pasang (Pair)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select whether you are transferring boxes or pairs
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Transfer Date */}
            <FormField
              control={form.control}
              name="transferDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Transfer Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={
                        field.value ? format(field.value, "yyyy-MM-dd") : ""
                      }
                      onChange={(e) => {
                        const date = e.target.value
                          ? new Date(e.target.value)
                          : new Date();
                        field.onChange(date);
                      }}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Transfer Items Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Transfer Items</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleFileSelect}
                disabled={isLoading}
              >
                <FileUp className="h-4 w-4 mr-1" />
                Import from Excel
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx, .xls"
                className="hidden"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="border rounded-md p-4 bg-muted/20"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Product */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.productId`}
                      render={({ field: productField }) => (
                        <FormItem>
                          <FormLabel>Product</FormLabel>
                          <Select
                            disabled={isLoading}
                            onValueChange={(value) => {
                              const numValue = parseInt(value);
                              productField.onChange(numValue);
                              loadSizesForProduct(numValue, index);
                            }}
                            value={productField.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem
                                  key={product.id}
                                  value={product.id?.toString() || ""}
                                >
                                  {product.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Color */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.colorId`}
                      render={({ field: colorField }) => (
                        <FormItem>
                          <FormLabel>Color</FormLabel>
                          <Select
                            disabled={isLoading}
                            onValueChange={(value) =>
                              colorField.onChange(parseInt(value))
                            }
                            value={colorField.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select color" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {colors.map((color) => (
                                <SelectItem
                                  key={color.id}
                                  value={color.id?.toString() || ""}
                                >
                                  {color.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Size (only for pasang transfers) */}
                    {transferType === "pasang" && (
                      <FormField
                        control={form.control}
                        name={`items.${index}.sizeId`}
                        render={({ field: sizeField }) => (
                          <FormItem>
                            <FormLabel>Size</FormLabel>
                            <Select
                              disabled={
                                isLoading ||
                                !form.watch(`items.${index}.productId`)
                              }
                              onValueChange={(value) =>
                                sizeField.onChange(parseInt(value))
                              }
                              value={sizeField.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select size" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {sizes[index]?.map((size) => (
                                  <SelectItem
                                    key={size.id}
                                    value={size.id?.toString() || ""}
                                  >
                                    {size.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* Quantity */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field: quantityField }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              {...quantityField}
                              onChange={(e) =>
                                quantityField.onChange(
                                  parseInt(e.target.value) || 1,
                                )
                              }
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Remove Item Button */}
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-destructive"
                      onClick={() => remove(index)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove Item
                    </Button>
                  )}
                </div>
              ))}

              {/* Add Item Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => append({ quantity: 1 })}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
          </div>

          {/* Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add any additional notes about this transfer"
                    className="resize-none"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Processing..." : "Create Transfer"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateTransferForm;
