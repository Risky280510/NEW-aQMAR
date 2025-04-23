import React from "react";
import { Control, Controller, UseFormReturn } from "react-hook-form";
import {
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Size } from "@/services/productService";
import { useToast } from "@/components/ui/use-toast";

interface SizeQuantityInputProps {
  index: number;
  control: Control<any>;
  availableSizes: Size[];
  selectedSizeIds: string[];
  isSubmitting: boolean;
  onRemove: () => void;
}

const SizeQuantityInput: React.FC<SizeQuantityInputProps> = ({
  index,
  control,
  availableSizes,
  selectedSizeIds,
  isSubmitting,
  onRemove,
}) => {
  const { toast } = useToast();

  return (
    <div className="grid grid-cols-[1fr_1fr_auto] gap-4 items-end border p-3 rounded-md bg-white">
      <FormField
        control={control}
        name={`items.${index}.sizeId`}
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>Size</FormLabel>
            <Select
              disabled={isSubmitting}
              onValueChange={field.onChange}
              value={field.value || ""}
              defaultValue={field.value || ""}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a size" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {availableSizes
                  .filter(
                    (size) =>
                      String(size.id) === field.value ||
                      !selectedSizeIds
                        .filter((id, i) => i !== index)
                        .includes(String(size.id)),
                  )
                  .map((size) => (
                    <SelectItem key={size.id} value={String(size.id)}>
                      {size.size_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`items.${index}.jumlahPasang`}
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>Quantity</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                max="9999"
                placeholder="0"
                disabled={isSubmitting}
                {...field}
                onChange={(e) => {
                  const value = e.target.value === "" ? "0" : e.target.value;
                  const parsedValue = parseInt(value, 10);
                  // Ensure the value is within valid range
                  if (
                    !isNaN(parsedValue) &&
                    parsedValue >= 0 &&
                    parsedValue <= 9999
                  ) {
                    field.onChange(parsedValue);
                  } else if (isNaN(parsedValue)) {
                    field.onChange(0);
                  } else if (parsedValue > 9999) {
                    field.onChange(9999);
                    toast({
                      title: "Warning",
                      description: "Maximum quantity is 9999",
                      variant: "destructive",
                    });
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 self-end"
        onClick={onRemove}
        disabled={isSubmitting}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
};

export default SizeQuantityInput;
