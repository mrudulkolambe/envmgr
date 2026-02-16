"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { AuthService } from "@/app/(auth)/service/auth";

interface User {
  id: string;
  email: string;
  name: string;
  username: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const authService = new AuthService();

  const fetchUser = async () => {
    setLoading(true);
    await authService.getCurrentUser({
      onLoading: (isLoading) => setLoading(isLoading),
      onSuccess: (data) => setUser(data),
      onError: () => setUser(null),
    });
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
