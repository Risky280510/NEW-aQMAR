export interface User {
  id: number | string;
  name: string;
  email: string;
  role: string; // Example: 'Admin', 'Warehouse Staff', 'Store Cashier'
  locationId?: number; // Location ID if the user is bound to a specific location
  locationName?: string; // Location Name (obtained from the join in the backend later)
  isActive: boolean; // Indicates the active or inactive status of the user
  createdAt?: string | Date; // Optional
}

/**
 * Input type for creating a new user
 */
export interface CreateUserInput {
  name: string;
  email: string;
  role: string; // 'Admin' | 'Warehouse Staff' | 'Store Cashier'
  locationId?: number | string; // Optional, depends on the role
  isActive: boolean;
  password: string;
  confirmPassword: string;
}

/**
 * Input type for updating an existing user
 * Similar to CreateUserInput but without password fields
 */
export type UpdateUserInput = Pick<
  User,
  "name" | "email" | "role" | "locationId" | "isActive"
>;

// Mock data for testing the display
const mockUsers: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Admin",
    isActive: true,
    createdAt: new Date(2023, 0, 15).toISOString(),
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "Warehouse Staff",
    locationId: 1,
    locationName: "Central Warehouse",
    isActive: true,
    createdAt: new Date(2023, 1, 20).toISOString(),
  },
  {
    id: 3,
    name: "Robert Johnson",
    email: "robert.johnson@example.com",
    role: "Store Cashier",
    locationId: 2,
    locationName: "Downtown Store",
    isActive: true,
    createdAt: new Date(2023, 2, 10).toISOString(),
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily.davis@example.com",
    role: "Store Cashier",
    locationId: 3,
    locationName: "Mall Branch",
    isActive: false,
    createdAt: new Date(2023, 3, 5).toISOString(),
  },
  {
    id: 5,
    name: "Michael Wilson",
    email: "michael.wilson@example.com",
    role: "Warehouse Staff",
    locationId: 1,
    locationName: "Central Warehouse",
    isActive: true,
    createdAt: new Date(2023, 4, 12).toISOString(),
  },
];

/**
 * Get all users
 * @returns Promise<User[]> Array of users
 */
export const getUsers = async (): Promise<User[]> => {
  // Simulate API call delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockUsers);
    }, 800);
  });
};

/**
 * Get a user by ID
 * @param id User ID
 * @returns Promise<User> User object or throws an error if not found
 */
export const getUserById = async (id: number | string): Promise<User> => {
  // Simulate API call delay
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(
        (user) => user.id.toString() === id.toString(),
      );
      if (user) {
        resolve(user);
      } else {
        reject(new Error(`User with ID ${id} not found`));
      }
    }, 500);
  });
};

/**
 * Create a new user
 * @param data User data without confirmPassword
 * @returns Promise<User> Newly created user
 */
export const createUser = async (
  data: Omit<CreateUserInput, "confirmPassword">,
): Promise<User> => {
  // Simulate API call delay and processing
  return new Promise((resolve) => {
    setTimeout(() => {
      // Create a new user with a unique ID
      const newUser: User = {
        ...data,
        id: Date.now(), // Use timestamp as a unique ID
        createdAt: new Date().toISOString(),
        // If locationId is provided, find the location name from the existing users
        // This is just for mock data - in a real app, this would come from the backend
        locationName: data.locationId
          ? mockUsers.find((u) => u.locationId === data.locationId)
              ?.locationName || "Unknown Location"
          : undefined,
      };

      // Add to mock users array
      mockUsers.push(newUser);

      // Return the new user
      resolve(newUser);
    }, 800);
  });
};

/**
 * Update an existing user
 * @param id User ID to update
 * @param data User data to update
 * @returns Promise<User> Updated user
 */
export const updateUser = async (
  id: number | string,
  data: UpdateUserInput,
): Promise<User> => {
  // Simulate API call delay and processing
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Find the user to update
      const userIndex = mockUsers.findIndex(
        (user) => user.id.toString() === id.toString(),
      );

      if (userIndex === -1) {
        reject(new Error(`User with ID ${id} not found`));
        return;
      }

      // Get the current user data
      const currentUser = mockUsers[userIndex];

      // Create updated user object
      const updatedUser: User = {
        ...currentUser,
        ...data,
        // Convert locationId to number if it's a string
        locationId: data.locationId
          ? typeof data.locationId === "string"
            ? parseInt(data.locationId, 10)
            : data.locationId
          : undefined,
        // Update locationName if locationId has changed
        locationName: data.locationId
          ? mockUsers.find((u) => u.locationId === data.locationId)
              ?.locationName || "Unknown Location"
          : undefined,
      };

      // Update the user in the mock array
      mockUsers[userIndex] = updatedUser;

      // Return the updated user
      resolve(updatedUser);
    }, 800);
  });
};

/**
 * Delete or deactivate a user
 * @param id User ID to delete/deactivate
 * @returns Promise<void>
 */
export const deleteUser = async (id: number | string): Promise<void> => {
  // Simulate API call delay and processing
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Find the user to delete
      const userIndex = mockUsers.findIndex(
        (user) => user.id.toString() === id.toString(),
      );

      if (userIndex === -1) {
        reject(new Error(`User with ID ${id} not found`));
        return;
      }

      // For this mock implementation, we'll perform a soft delete by setting isActive to false
      // In a real application, this could be a hard delete or a soft delete based on requirements
      mockUsers[userIndex] = {
        ...mockUsers[userIndex],
        isActive: false,
      };

      console.log(`User ${id} deactivated`);
      resolve();
    }, 800);
  });
};
