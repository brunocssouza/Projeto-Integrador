"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

export interface User {
  id: number;
  email: string;
  cpf: string;
  name: string;
  phone: string;
  avatar_url?: string | null;
  languages: string[];
  is_aluno: boolean;
  is_tutor: boolean;
  perfil_mentor_completo: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = ["/", "/login", "/register"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) return data.error || "Erro ao fazer login";

    setUser(data.user);
    return null;
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    router.push("/login");
  }, [router]);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : prev));
  }, []);

  const isPublic = PUBLIC_ROUTES.includes(pathname);
  const isRoot = pathname === "/";

  useEffect(() => {
    if (isLoading) return;
    if (!user && !isPublic && !isRoot) {
      router.push("/login");
    }
  }, [user, isLoading, isPublic, isRoot, pathname, router]);

  useEffect(() => {
    if (isLoading) return;
    if (user && isPublic) {
      router.push("/dashboard");
    }
  }, [user, isLoading, isPublic, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-on-surface-variant text-[13px]">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user && !isPublic && !isRoot) {
    return null;
  }

  if (user && isPublic) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
