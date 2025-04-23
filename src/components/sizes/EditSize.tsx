import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getSizeById, updateSize } from "../../services/sizeService";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { toast } from "../ui/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  size_name: z
    .string()
    .min(1, "Size name is required")
    .max(50, "Size name must be less than 50 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditSize() {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      size_name: "",
    },
  });

  useEffect(() => {
    const loadSize = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const size = await getSizeById(id);

        if (!size) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Size not found.",
          });
          navigate("/master/sizes");
          return;
        }

        form.reset({
          size_name: size.size_name,
        });
      } catch (error) {
        console.error("Failed to load size:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load size. Please try again later.",
        });
        navigate("/master/sizes");
      } finally {
        setIsLoading(false);
      }
    };

    loadSize();
  }, [id, form, navigate]);

  const onSubmit = async (data: FormValues) => {
    if (!id) return;

    try {
      setIsSubmitting(true);
      await updateSize(id, { size_name: data.size_name });
      toast({
        title: "Size updated",
        description: "The size has been successfully updated.",
      });
      navigate("/master/sizes");
    } catch (error) {
      console.error("Failed to update size:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update size. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white">
      <CardHeader>
        <CardTitle>Edit Size</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="size_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Size Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter size name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/master/sizes")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
