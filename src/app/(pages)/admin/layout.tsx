"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const NAV = [
  { href: "/admin", icon: "dashboard", label: "Visão Geral" },
  { href: "/admin/mentores", icon: "person_check", label: "Mentores" },
  { href: "/admin/usuarios", icon: "group", label: "Usuários" },
  { href: "/admin/sessoes", icon: "event", label: "Sessões" },
  { href: "/admin/pagamentos", icon: "payments", label: "Pagamentos" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !user.is_admin)) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || !user.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "A";

  return (
    <div className="flex min-h-screen bg-surface-container-lowest">
      <aside className="w-[260px] bg-white border-r border-outline-variant/30 flex flex-col fixed h-screen z-50">
        <div className="px-5 pt-7 pb-6">
          <Link href="/admin" className="flex items-center gap-2.5 no-underline">
            <span className="text-[15px] font-bold text-primary tracking-tight">Mock Mentor</span>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-orange-500 text-white px-1.5 py-0.5 rounded">
              Admin
            </span>
          </Link>
        </div>

        <nav className="px-3 flex-1 mt-2">
          <p className="text-[11px] font-semibold text-on-surface-variant/40 uppercase tracking-widest px-3 mb-2">
            Painel
          </p>
          <div className="space-y-0.5">
            {NAV.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all no-underline ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="px-3 pb-5">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[12px] font-bold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-primary truncate">{user.name}</p>
              <p className="text-[11px] text-on-surface-variant truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-[260px]">{children}</main>
    </div>
  );
}
