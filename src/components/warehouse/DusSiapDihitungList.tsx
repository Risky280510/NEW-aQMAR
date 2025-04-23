import { useState, useEffect } from "react";
import { KonversiDusItem, warehouseService } from "@/services/warehouseService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Main warehouse ID constant
const GUDANG_MAIN_ID = 1;

const DusSiapDihitungList = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<KonversiDusItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<Record<number, boolean>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<KonversiDusItem | null>(
    null,
  );

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await warehouseService.getDusSiapDihitung(GUDANG_MAIN_ID);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelesaiDus = async (item: KonversiDusItem) => {
    setIsProcessing((prev) => ({ ...prev, [item.id]: true }));
    try {
      await warehouseService.selesaikanProsesSatuDus(item.id);
      toast({
        title: "Success",
        description: `Successfully marked 1 box of ${item.namaProduct} ${item.namaWarna} as finished counting.`,
        variant: "default",
      });
      fetchData(); // Refresh the list
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to process box",
        variant: "destructive",
      });
    } finally {
      setIsProcessing((prev) => ({ ...prev, [item.id]: false }));
      setDialogOpen(false);
      setSelectedItem(null);
    }
  };

  const openConfirmDialog = (item: KonversiDusItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Dus Siap Dihitung - Gudang Utama</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            // Loading state
            <div className="space-y-2">
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            // Error state
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : items.length === 0 ? (
            // Empty state
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>No Data</AlertTitle>
              <AlertDescription>
                There are no boxes waiting to be counted at the moment.
              </AlertDescription>
            </Alert>
          ) : (
            // Data state
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product SKU</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Boxes Ready</TableHead>
                  <TableHead>Remaining Uncounted</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.skuProduct}</TableCell>
                    <TableCell>{item.namaProduct}</TableCell>
                    <TableCell>{item.namaWarna}</TableCell>
                    <TableCell>{item.stokDusSiapDiproses}</TableCell>
                    <TableCell>
                      {item.totalPsangDiharapkan - item.totalPsangTerinput}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={
                          isProcessing[item.id] || item.stokDusSiapDiproses <= 0
                        }
                        onClick={() => openConfirmDialog(item)}
                      >
                        {isProcessing[item.id] ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Finish 1 Box"
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedItem &&
                `Are you sure you want to mark 1 box for ${selectedItem.namaProduct} ${selectedItem.namaWarna} as finished counting?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedItem && handleSelesaiDus(selectedItem)}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DusSiapDihitungList;
