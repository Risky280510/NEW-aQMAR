import { useMemo } from "react";
import { Size } from "@/services/productService";

/**
 * Custom hook to get available sizes that haven't been selected yet
 * @param availableSizes All available sizes for the current product
 * @param selectedSizeIds Array of currently selected size IDs
 * @returns Array of sizes that haven't been selected yet
 */
export const useUnselectedSizes = (
  availableSizes: Size[],
  selectedSizeIds: string[],
): Size[] => {
  return useMemo(() => {
    return availableSizes.filter(
      (size) => !selectedSizeIds.includes(String(size.id)),
    );
  }, [availableSizes, selectedSizeIds]);
};
