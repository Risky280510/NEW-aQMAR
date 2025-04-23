import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  AppSettings,
  getAppSettings,
  updateAppSettings,
} from "@/services/settingsService";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

// Define the form schema with validation
const formSchema = z.object({
  appName: z.string().min(1, { message: "Application name is required" }),
  companyName: z.string().optional(),
  address: z.string().optional(),
  logoUrl: z
    .string()
    .url({ message: "Please enter a valid URL" })
    .optional()
    .or(z.literal("")),
  defaultCurrency: z.string().optional(),
  dateFormat: z.string().optional(),
});

const ApplicationSettingsForm = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      appName: "",
      companyName: "",
      address: "",
      logoUrl: "",
      defaultCurrency: "",
      dateFormat: "",
    },
  });

  // Load settings data on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const settings = await getAppSettings();
        // Make sure settings is a valid object before resetting the form
        if (
          settings &&
          typeof settings === "object" &&
          Object.keys(settings).length > 0
        ) {
          // Ensure all expected fields exist with fallbacks
          const validatedSettings = {
            appName: settings.appName || "",
            companyName: settings.companyName || "",
            address: settings.address || "",
            logoUrl: settings.logoUrl || "",
            defaultCurrency: settings.defaultCurrency || "",
            dateFormat: settings.dateFormat || "",
          };
          form.reset(validatedSettings);
        } else {
          console.error("Invalid settings data received:", settings);
          setError(new Error("Received invalid application settings data"));
          toast({
            variant: "destructive",
            title: "Error",
            description: "Received invalid application settings data.",
          });
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
        setError(
          error instanceof Error
            ? error
            : new Error("Failed to load application settings"),
        );
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load application settings.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []); // Empty dependency array for one-time load on mount

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSaving(true);
      setError(null);
      await updateAppSettings(data as AppSettings);
      toast({
        title: "Settings updated",
        description: "Your application settings have been saved successfully.",
      });
    } catch (error) {
      console.error("Failed to update settings:", error);
      setError(
        error instanceof Error
          ? error
          : new Error("Failed to update application settings"),
      );
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update application settings.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Error Loading Settings</CardTitle>
          <CardDescription>
            There was a problem loading the application settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">{error.message}</div>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Application Settings</CardTitle>
        <CardDescription>
          Configure general settings for your inventory management system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="appName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Inventory Management System"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This name will be displayed in the application header and
                    title.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Company Name" {...field} />
                  </FormControl>
                  <FormDescription>
                    The name of your organization.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your company address"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This address will be used on reports and documents.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/logo.png"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    URL to your company logo image.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="defaultCurrency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Currency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="IDR">
                          IDR - Indonesian Rupiah
                        </SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="SGD">
                          SGD - Singapore Dollar
                        </SelectItem>
                        <SelectItem value="MYR">
                          MYR - Malaysian Ringgit
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Currency used for financial calculations.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Format</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select date format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Format used for displaying dates throughout the
                      application.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <CardFooter className="px-0 pt-6">
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Settings
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ApplicationSettingsForm;
