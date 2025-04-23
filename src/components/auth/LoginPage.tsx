import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import useAuthStore from "@/stores/authStore";
import { User } from "@/models/User";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [loginInProgress, setLoginInProgress] = useState(false);

  // Get the page user was trying to visit before being redirected to login
  const from = location.state?.from?.pathname || "/";

  // Check if user is already authenticated when component mounts
  useEffect(() => {
    checkAuth();

    // If already authenticated, redirect to the intended destination
    if (isAuthenticated && !isLoading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, checkAuth, navigate, from]);

  const handleLogin = (role: string) => {
    setLoginInProgress(true);

    // Create a mock user with the selected role
    const mockUser: User = {
      id: "1",
      name:
        role === "Admin"
          ? "Admin User"
          : role === "Staff Gudang"
            ? "Warehouse Staff"
            : "Store Cashier",
      email: role.toLowerCase().replace(" ", "-") + "@example.com",
      role: role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update auth store with the user
    login(mockUser);

    // Navigate to the page they were trying to access
    // The useEffect will handle the navigation once isAuthenticated is updated
    setLoginInProgress(false);
  };

  // If we're checking authentication or already authenticated, show loading
  if (isLoading || (isAuthenticated && !loginInProgress)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Select a role to login as for testing purposes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                disabled
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value="********" disabled />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            className="w-full"
            onClick={() => handleLogin("Admin")}
            disabled={loginInProgress}
          >
            {loginInProgress ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login as Admin"
            )}
          </Button>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => handleLogin("Staff Gudang")}
            disabled={loginInProgress}
          >
            {loginInProgress ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login as Warehouse Staff"
            )}
          </Button>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => handleLogin("Kasir Toko")}
            disabled={loginInProgress}
          >
            {loginInProgress ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login as Store Cashier"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
