"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, api } from "@/lib/api";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  guestLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem("satyalens_token");
    if (savedToken) {
      setToken(savedToken);
      api
        .getMe()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          localStorage.removeItem("satyalens_token");
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    localStorage.setItem("satyalens_token", res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    router.push("/");
  };

  const register = async (email: string, pass: string) => {
    const res = await api.register(email, pass);
    localStorage.setItem("satyalens_token", res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    router.push("/");
  };

  const guestLogin = async () => {
    // Quick demo login convenience
    const demoEmail = "demo@satyalens.in";
    const demoPass = "demo123456";
    try {
      await login(demoEmail, demoPass);
    } catch {
      // If not yet registered, register it
      await register(demoEmail, demoPass);
    }
  };

  const logout = () => {
    localStorage.removeItem("satyalens_token");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        guestLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
