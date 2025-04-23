import React, { useState, useEffect, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
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
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { CalendarIcon, Download, Plus, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProducts } from "@/services/productService";
import { getColors } from "@/services/colorService";
import { getSizesForProduct, Size } from "@/services/productService";
import { inputHitungPasangFisik } from "@/services/warehouseService";
import { Product } from "@/models/Product";
import { Color } from "@/models/Color";
import SizeQuantityInput from "./SizeQuantityInput";
import { useUnselectedSizes } from "@/hooks/useUnselectedSizes";

// Main warehouse ID constant
const WAREHOUSE_MAIN_ID = 1;

// Define the form schema using zod
const formSchema = z.object({
  productId: z.string().min(1, { message: "Product is required" }),
  colorId: z.string().min(1, { message: "Color is required" }),
  tanggalInput: z.date({
    required_error: "Date is required",
  }),
  items: z
    .array(
      z.object({
        sizeId: z.string().min(1, { message: "Size is required" }),
        jumlahPasang: z
          .number()
          .int({ message: "Quantity must be a whole number" })
          .min(0, { message: "Number of pairs must be 0 or more" })
          .max(9999, { message: "Quantity cannot exceed 9999" }),
      }),
    )
    .min(1, { message: "At least one size must be added" })
    .refine(
      (items) => {
        const sizeIds = items.map((item) => item.sizeId);
        return new Set(sizeIds).size === sizeIds.length;
      },
      {
        message: "Each size can only be selected once",
        path: ["items"],
      },
    )
    .refine(
      (items) => {
        // Check if at least one item has a quantity greater than 0
        return items.some((item) => item.jumlahPasang > 0);
      },
      {
        message: "At least one size must have a quantity greater than 0",
        path: ["items"],
      },
    )
    .refine(
      (items) => {
        // Check that all items have a valid sizeId (not empty string)
        return items.every((item) => item.sizeId.trim() !== "");
      },
      {
        message: "All sizes must be selected",
        path: ["items"],
      },
    )
    .refine(
      (items) => {
        // Check that all items with quantity > 0 have a valid sizeId
        return items.every(
          (item) =>
            item.jumlahPasang === 0 ||
            (item.sizeId && item.sizeId.trim() !== ""),
        );
      },
      {
        message: "All items with quantity must have a size selected",
        path: ["items"],
      },
    ),
});

// Define the form values type
type FormValues = z.infer<typeof formSchema>;

const InputHitungPasangForm: React.FC = () => {
  // State for products, colors, and sizes
  const [products, setProducts] = useState<Product[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [availableSizes, setAvailableSizes] = useState<Size[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingColors, setIsLoadingColors] = useState(true);
  const [isLoadingSizes, setIsLoadingSizes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to handle downloading the Excel template
  const handleDownloadTemplate = () => {
    // Define the headers
    const headers = ["Ukuran", "Jumlah"];

    // Create worksheet data with just the headers
    const worksheetData = [headers];

    // Create a worksheet from the data
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

    // Trigger Excel file download
    XLSX.writeFile(workbook, "template_input_pasang.xlsx");
  };

  // Toast for notifications
  const { toast } = useToast();

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: "",
      colorId: "",
      tanggalInput: new Date(),
      items: [],
    },
  });

  // Setup field array for dynamic size inputs
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Fetch products and colors on component mount
  useEffect(() => {
    const fetchProducts = async () => {
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
        setIsLoadingProducts(false);
      }
    };

    const fetchColors = async () => {
      try {
        const colorsData = await getColors();
        setColors(colorsData);
      } catch (error) {
        console.error("Failed to fetch colors:", error);
        toast({
          title: "Error",
          description: "Failed to load colors. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingColors(false);
      }
    };

    fetchProducts();
    fetchColors();
  }, [toast]);

  // Fetch sizes when product changes
  useEffect(() => {
    const productId = form.watch("productId");

    if (!productId) {
      setAvailableSizes([]);
      form.setValue("items", []);
      return;
    }

    const fetchSizes = async () => {
      setIsLoadingSizes(true);
      try {
        const sizesData = await getSizesForProduct(Number(productId));
        setAvailableSizes(sizesData);
        form.setValue("items", []);
      } catch (error) {
        console.error("Failed to fetch sizes:", error);
        toast({
          title: "Error",
          description:
            "Failed to load sizes for this product. Please try again.",
          variant: "destructive",
        });
        setAvailableSizes([]);
        form.setValue("items", []);
      } finally {
        setIsLoadingSizes(false);
      }
    };

    fetchSizes();
  }, [form.watch("productId"), form, toast]);

  // Get selected size IDs from the form fields
  const selectedSizeIds = fields.map((field) => field.sizeId);

  // Use the custom hook to get unselected sizes
  const unselectedSizes = useUnselectedSizes(availableSizes, selectedSizeIds);

  // Add a new size input row
  const handleAddSize = () => {
    // Default to the first available unselected size if possible
    const defaultSizeId =
      unselectedSizes.length > 0 ? String(unselectedSizes[0].id) : "";
    append({ sizeId: defaultSizeId, jumlahPasang: 0 });
  };

  // Validate file before processing
  const validateFile = (
    file: File,
  ): { isValid: boolean; errorMessage?: string } => {
    // Check file extension
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (fileExtension !== "xlsx" && fileExtension !== "xls") {
      return {
        isValid: false,
        errorMessage: "Please upload an Excel file (.xlsx or .xls extension).",
      };
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return {
        isValid: false,
        errorMessage: "File size exceeds the maximum limit of 5MB.",
      };
    }

    return { isValid: true };
  };

  // Handle Excel file upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate the file
    const validation = validateFile(file);
    if (!validation.isValid) {
      toast({
        title: "Error",
        description: validation.errorMessage,
        variant: "destructive",
      });
      // Reset file input
      if (event.target) {
        event.target.value = "";
      }
      return;
    }

    setIsImporting(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error("Failed to read file.");

        // Read workbook from ArrayBuffer
        const workbook = XLSX.read(data, { type: "array" });

        // Get the first sheet name
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) throw new Error("Excel file has no sheets.");

        // Get the worksheet
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert sheet to array of objects
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Process the imported data
        processImportedData(jsonData);
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        toast({
          title: "Import Error",
          description:
            "Failed to process Excel file. Make sure the format is correct.",
          variant: "destructive",
        });
      } finally {
        // Reset file input
        if (event.target) {
          event.target.value = "";
        }
        setIsImporting(false);
      }
    };

    reader.onerror = () => {
      console.error("Error reading file");
      toast({
        title: "Import Error",
        description: "Cannot read file.",
        variant: "destructive",
      });
      if (event.target) event.target.value = "";
      setIsImporting(false);
    };

    reader.readAsArrayBuffer(file);
  };

  // Process imported CSV data
  const processImportedData = (csvData: any[]) => {
    if (!availableSizes.length) {
      toast({
        title: "Error",
        description: "No available sizes for the selected product.",
        variant: "destructive",
      });
      return;
    }

    if (csvData.length === 0) {
      toast({
        title: "Error",
        description:
          "The Excel file is empty. Please check the file and try again.",
        variant: "destructive",
      });
      return;
    }

    const newFormItems: { sizeId: string; jumlahPasang: number }[] = [];
    let successCount = 0;
    let skippedCount = 0;
    let invalidQuantityCount = 0;
    let missingSizeCount = 0;
    let duplicateSizeCount = 0;

    // Try to detect column names for size and quantity
    const firstRow = csvData[0] || {};
    const columns = Object.keys(firstRow);

    if (columns.length < 2) {
      toast({
        title: "Error",
        description:
          "The Excel file must contain at least two columns (size and quantity).",
        variant: "destructive",
      });
      return;
    }

    // Try to find size column (could be 'size', 'size_name', 'size_id', etc.)
    const sizeColumn =
      columns.find(
        (col) =>
          col.toLowerCase().includes("size") ||
          col.toLowerCase() === "ukuran" ||
          col.toLowerCase() === "size_name" ||
          col.toLowerCase() === "size_id",
      ) || columns[0]; // Default to first column if not found

    // Try to find quantity column (could be 'quantity', 'amount', 'pairs', etc.)
    const quantityColumn =
      columns.find(
        (col) =>
          col.toLowerCase().includes("quantity") ||
          col.toLowerCase().includes("amount") ||
          col.toLowerCase().includes("pairs") ||
          col.toLowerCase().includes("jumlah") ||
          col.toLowerCase() === "qty",
      ) || columns[1]; // Default to second column if not found

    // Log detected columns for debugging
    console.log(`Detected size column: ${sizeColumn}`);
    console.log(`Detected quantity column: ${quantityColumn}`);

    // Process each row
    csvData.forEach((row, index) => {
      const sizeValue = String(row[sizeColumn] || "").trim();
      const quantityValue = row[quantityColumn];

      // Skip empty rows
      if (Object.keys(row).length === 0 || (!sizeValue && !quantityValue)) {
        return;
      }

      if (!sizeValue) {
        missingSizeCount++;
        skippedCount++;
        return;
      }

      // Parse quantity to number
      let quantity: number;
      if (typeof quantityValue === "number") {
        quantity = quantityValue;
      } else if (typeof quantityValue === "string") {
        // Handle different number formats (e.g., "1,000" or "1.000" for 1000)
        const cleanedValue = quantityValue.trim().replace(/,/g, "");
        quantity = parseInt(cleanedValue, 10);
      } else {
        quantity = 0;
      }

      if (isNaN(quantity)) {
        console.warn(
          `Row ${index + 1}: Invalid quantity value: ${quantityValue}`,
        );
        invalidQuantityCount++;
        skippedCount++;
        return;
      }

      if (quantity < 0) {
        console.warn(`Row ${index + 1}: Negative quantity: ${quantity}`);
        invalidQuantityCount++;
        skippedCount++;
        return;
      }

      if (quantity > 9999) {
        console.warn(`Row ${index + 1}: Quantity too large: ${quantity}`);
        invalidQuantityCount++;
        skippedCount++;
        return;
      }

      // Try to match size by name or id
      let matchedSize = availableSizes.find(
        (size) =>
          String(size.size_name).toLowerCase() === sizeValue.toLowerCase() ||
          String(size.id) === sizeValue,
      );

      if (matchedSize) {
        // Check if this size is already in the newFormItems
        const isDuplicate = newFormItems.some(
          (item) => item.sizeId === String(matchedSize?.id),
        );

        if (!isDuplicate) {
          newFormItems.push({
            sizeId: String(matchedSize.id),
            jumlahPasang: quantity,
          });
          successCount++;
        } else {
          console.warn(`Row ${index + 1}: Duplicate size: ${sizeValue}`);
          duplicateSizeCount++;
          skippedCount++;
        }
      } else {
        console.warn(`Row ${index + 1}: Size not found: ${sizeValue}`);
        missingSizeCount++;
        skippedCount++;
      }
    });

    if (newFormItems.length > 0) {
      // Update form with imported data
      form.reset({
        ...form.getValues(),
        items: newFormItems,
      });

      let detailedMessage = `Imported ${successCount} size items. `;
      if (skippedCount > 0) {
        detailedMessage += `${skippedCount} items skipped: `;
        if (missingSizeCount > 0)
          detailedMessage += `${missingSizeCount} invalid sizes, `;
        if (invalidQuantityCount > 0)
          detailedMessage += `${invalidQuantityCount} invalid quantities, `;
        if (duplicateSizeCount > 0)
          detailedMessage += `${duplicateSizeCount} duplicate sizes, `;
        // Remove trailing comma and space
        detailedMessage = detailedMessage.replace(/, $/, "");
      }

      toast({
        title: "Success",
        description: detailedMessage,
      });
    } else {
      toast({
        title: "Warning",
        description:
          "No valid size data found in the Excel file. Please check the format and try again.",
        variant: "destructive",
      });
    }
  };

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    // Filter out items with 0 pairs
    const filteredItems = data.items.filter((item) => item.jumlahPasang > 0);

    // This validation is now handled by the Zod schema, but keeping as a double-check
    if (filteredItems.length === 0) {
      toast({
        title: "Warning",
        description:
          "Please enter at least one size with a quantity greater than 0.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await inputHitungPasangFisik({
        productId: Number(data.productId),
        colorId: Number(data.colorId),
        tanggalInput: data.tanggalInput,
        items: filteredItems.map((item) => ({
          sizeId: Number(item.sizeId),
          jumlahPasang: item.jumlahPasang,
        })),
        locationId: WAREHOUSE_MAIN_ID,
      });

      toast({
        title: "Success",
        description: "Physical count data has been saved successfully.",
      });

      // Reset the form
      form.reset({
        productId: "",
        colorId: "",
        tanggalInput: new Date(),
        items: [],
      });
      setAvailableSizes([]);
    } catch (error) {
      console.error("Saving physical count failed:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white">
      <CardHeader>
        <CardTitle>Input Physical Count</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="tanggalInput"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                          disabled={isSubmitting}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <Select
                    disabled={isLoadingProducts || isSubmitting}
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Reset color when product changes
                      form.setValue("colorId", "");
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={String(product.id)}>
                          {product.product_name} ({product.product_sku})
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
              name="colorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <Select
                    disabled={
                      isLoadingColors ||
                      isSubmitting ||
                      !form.watch("productId")
                    }
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a color" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {colors.map((color) => (
                        <SelectItem key={color.id} value={String(color.id)}>
                          {color.color_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isLoadingSizes && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  Loading sizes...
                </p>
              </div>
            )}

            {!isLoadingSizes && availableSizes.length > 0 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                  <h3 className="font-medium text-sm">
                    Add sizes and quantities:
                  </h3>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={
                          isSubmitting ||
                          isImporting ||
                          availableSizes.length === 0
                        }
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        {isImporting ? "Importing..." : "Import Excel"}
                      </Button>
                      {isImporting && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-md">
                          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleDownloadTemplate}
                      disabled={isSubmitting}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download Excel Template
                    </Button>
                    <input
                      type="file"
                      accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={
                        isSubmitting ||
                        isImporting ||
                        availableSizes.length === 0
                      }
                      onClick={(e) => {
                        // Reset the value when clicked to ensure onChange fires even if the same file is selected again
                        e.currentTarget.value = "";
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleAddSize}
                      disabled={isSubmitting || unselectedSizes.length === 0}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Size
                    </Button>
                  </div>
                </div>

                {fields.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      Click "Add Size" to start adding sizes and quantities.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <SizeQuantityInput
                        key={field.id}
                        index={index}
                        control={form.control}
                        availableSizes={availableSizes}
                        selectedSizeIds={selectedSizeIds}
                        isSubmitting={isSubmitting}
                        onRemove={() => remove(index)}
                      />
                    ))}
                  </div>
                )}
                <FormMessage>
                  {form.formState.errors.items?.message ||
                    form.formState.errors.items?.[0]?.sizeId?.message ||
                    form.formState.errors.items?.[0]?.jumlahPasang?.message}
                </FormMessage>
              </div>
            )}

            {!isLoadingSizes &&
              availableSizes.length === 0 &&
              form.watch("productId") && (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    No sizes available for this product.
                  </p>
                </div>
              )}

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setAvailableSizes([]);
                }}
                disabled={isSubmitting}
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  isLoadingProducts ||
                  isLoadingColors ||
                  isLoadingSizes ||
                  !form.watch("productId") ||
                  !form.watch("colorId") ||
                  availableSizes.length === 0 ||
                  fields.length === 0
                }
              >
                {isSubmitting ? "Saving..." : "Save Count"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default InputHitungPasangForm;
