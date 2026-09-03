import { useEffect, useState } from "react";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getCurrentUser() {
      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/me",
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = await response.json();

        setUser(data);
      } catch (error) {
        console.error("Error getting current user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    getCurrentUser();
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
  };
}