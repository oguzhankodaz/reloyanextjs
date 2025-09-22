/** @format */

"use client";

import { createContext, useContext, useState, useEffect } from "react";

type User = {
  userId: string;
  email: string;
  name: string; // ✅ artık name de var
  surname?: string | null; // ✅ düzeltme
} | null;

const AuthContext = createContext<{ user: User; setUser: (u: User) => void }>({
  user: null,
  setUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);

  // İlk yüklemede API'den / cookie'den user bilgisini al
  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          const cleanUser = {
            userId: data.user.userId,
            email: data.user.email,
            name: data.user.name,
            surname: data.user.surname,
          };
          console.log("Clean user (setUser öncesi):", cleanUser);
          setUser(cleanUser);
        } else {
          console.log("API'den user gelmedi!");
          setUser(null);
        }
      })
      .catch((err) => console.error("Auth fetch error:", err));
  }, []);
  
  
  
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
