import { useState, useEffect } from "react";
import { Size } from "../../models/Size";
import { getSizes, deleteSize } from "../../services/sizeService";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "../ui/use-toast";

export default function SizeList() {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadSizes();
  }, []);

  const loadSizes = async () => {
    try {
      setLoading(true);
      const data = await getSizes();
      setSizes(data);
    } catch (error) {
      console.error("Failed to load sizes:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load sizes. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleting(id);
      await deleteSize(id);
      setSizes(sizes.filter((size) => size.id !== id));
      toast({
        title: "Size deleted",
        description: "The size has been successfully deleted.",
      });
    } catch (error) {
      console.error("Failed to delete size:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete size. Please try again later.",
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/master/sizes/edit/${id}`);
  };

  const handleAdd = () => {
    navigate("/master/sizes/add");
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Size Management</CardTitle>
        <Button onClick={handleAdd} className="ml-auto">
          <Plus className="mr-2 h-4 w-4" /> Add Size
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Size Name</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sizes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No sizes found
                  </TableCell>
                </TableRow>
              ) : (
                sizes.map((size) => (
                  <TableRow key={size.id}>
                    <TableCell>{size.id}</TableCell>
                    <TableCell>{size.size_name}</TableCell>
                    <TableCell>
                      {size.created_at
                        ? new Date(size.created_at).toLocaleString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {size.updated_at
                        ? new Date(size.updated_at).toLocaleString()
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(size.id!)}
                        className="mr-2"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(size.id!)}
                        disabled={deleting === size.id}
                      >
                        {deleting === size.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-red-500" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
