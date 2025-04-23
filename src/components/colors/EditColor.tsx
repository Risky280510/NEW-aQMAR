import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { colorService } from "@/services/colorService";
import { Color } from "@/models/Color";

// Define the form schema with Zod
const formSchema = z.object({
  color_name: z.string().min(1, { message: "Color name is required." }),
});

type FormValues = z.infer<typeof formSchema>;

const EditColor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [color, setColor] = useState<Color | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the form with react-hook-form and zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      color_name: "",
    },
  });

  // Fetch color data when component mounts
  useEffect(() => {
    const fetchColor = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        const colorId = parseInt(id, 10);
        const fetchedColor = await colorService.getColorById(colorId);

        if (fetchedColor) {
          setColor(fetchedColor);
          // Reset form with fetched data
          form.reset({
            color_name: fetchedColor.color_name,
          });
        } else {
          setError("Color not found.");
        }
      } catch (err) {
        console.error("Error fetching color:", err);
        setError("Failed to load color data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchColor();
  }, [id, form]);

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    if (!id) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const colorId = parseInt(id, 10);
      const updatedColor = await colorService.updateColor(colorId, {
        color_name: data.color_name,
      });

      if (updatedColor) {
        toast({
          title: "Success",
          description: "Color updated successfully",
          variant: "default",
        });

        // Navigate back to the colors list
        navigate("/master/colors");
      } else {
        setError("Failed to update color. Color not found.");
        toast({
          title: "Error",
          description: "Failed to update color. Color not found.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error updating color:", err);
      setError("Failed to update color. Please try again.");
      toast({
        title: "Error",
        description: "Failed to update color. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Color</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
            <div className="flex justify-end gap-2 pt-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="color_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter color name"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/master/colors")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};

export default EditColor;
