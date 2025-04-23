import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Location, defaultLocation } from "@/models/Location";
import { getLocationById, updateLocation } from "@/services/locationService";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";

const EditLocation: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const locationId = id ? parseInt(id) : 0;

  const [location, setLocation] = useState<Location>({ ...defaultLocation });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchLocation = async () => {
      if (!locationId) {
        setError("Invalid location ID");
        setLoading(false);
        return;
      }

      try {
        const data = await getLocationById(locationId);
        if (data) {
          setLocation(data);
        } else {
          setError("Location not found");
        }
      } catch (err) {
        setError("Failed to fetch location data");
        console.error("Error fetching location:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [locationId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setLocation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setLocation((prev) => ({
      ...prev,
      location_type: value as "Warehouse" | "Store",
    }));
  };

  const validateForm = (): boolean => {
    if (!location.location_name.trim()) {
      setError("Location name is required");
      return false;
    }
    if (!location.location_type) {
      setError("Location type is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm() || !locationId) {
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedLocation = await updateLocation(locationId, location);
      if (updatedLocation) {
        navigate("/master/locations");
      } else {
        setError("Failed to update location. Location not found.");
      }
    } catch (err) {
      setError("Failed to update location. Please try again.");
      console.error("Error updating location:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/master/locations")}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Edit Location</h1>
        </div>
        <div className="p-8 flex justify-center">
          <p>Loading location data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/master/locations")}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Edit Location</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Location Details</CardTitle>
          <CardDescription>
            Update the details for this inventory location.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="location_name">Location Name *</Label>
              <Input
                id="location_name"
                name="location_name"
                value={location.location_name}
                onChange={handleChange}
                placeholder="Enter location name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_type">Location Type *</Label>
              <Select
                value={location.location_type}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger id="location_type">
                  <SelectValue placeholder="Select location type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Warehouse">Warehouse</SelectItem>
                  <SelectItem value="Store">Store</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                value={location.address || ""}
                onChange={handleChange}
                placeholder="Enter address (optional)"
                rows={3}
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/master/locations")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                "Saving..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Update Location
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default EditLocation;
