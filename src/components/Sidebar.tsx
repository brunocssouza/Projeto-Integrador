"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";

const NAV_ITEMS = {
  student: [
    { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
    { href: "/explore", icon: "explore", label: "Explorar Mentores" },
    { href: "/agendamentos", icon: "calendar_month", label: "Agendamentos" },
    { href: "/relatorios", icon: "monitoring", label: "Relatórios" },
    { href: "/configuracoes", icon: "settings", label: "Configurações" },
  ],
  mentor: [
    { href: "/mentor/alunos", icon: "groups", label: "Meus Alunos" },
    { href: "/mentor/disponibilidade", icon: "event_available", label: "Disponibilidade" },
    { href: "/mentor/agendamentos", icon: "calendar_month", label: "Agendamentos" },
    { href: "/mentor/avaliacoes", icon: "star", label: "Avaliações" },
    { href: "/mentor/configuracoes", icon: "settings", label: "Configurações" },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isMentorMode =
    (pathname.startsWith("/mentor/alunos") ||
      pathname.startsWith("/mentor/disponibilidade") ||
      pathname.startsWith("/mentor/agendamentos") ||
      pathname.startsWith("/mentor/avaliacoes") ||
      pathname.startsWith("/mentor/configuracoes")) &&
    pathname !== "/mentor/setup";
  const userIsTutor = user?.is_tutor ?? false;
  const perfilCompleto = user?.perfil_mentor_completo ?? false;

  const navItems = isMentorMode ? NAV_ITEMS.mentor : NAV_ITEMS.student;

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  return (
    <aside className="w-[260px] bg-white border-r border-outline-variant/30 flex flex-col fixed h-screen z-50">
      {/* Logo */}
      <div className="px-5 pt-7 pb-6">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[16px]">
              rocket_launch
            </span>
          </div>
          <span className="text-[15px] font-bold text-primary tracking-tight">
            Mock Mentor
          </span>
        </Link>
      </div>

      {/* Mode Toggle */}
      {userIsTutor && (
        <div className="px-4 mb-2">
          <div className="bg-surface-container-low rounded-xl p-1 flex">
            <Link
              href="/dashboard"
              className={`flex-1 py-2 text-[13px] font-medium rounded-lg transition-all text-center no-underline ${
                !isMentorMode
                  ? "bg-white text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Aluno
            </Link>
            <Link
              href={perfilCompleto ? "/mentor/alunos" : "/mentor/setup"}
              className={`flex-1 py-2 text-[13px] font-medium rounded-lg transition-all text-center no-underline ${
                isMentorMode
                  ? "bg-white text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Tutor
            </Link>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="px-3 flex-1 mt-4">
        <p className="text-[11px] font-semibold text-on-surface-variant/40 uppercase tracking-widest px-3 mb-2">
          {isMentorMode ? "Tutor" : "Menu"}
        </p>
        <div className="space-y-0.5">
          {navItems.map((item) => {
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
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-5 space-y-3">
        {!isMentorMode && (
          <Link
            href="/explore"
            className="flex items-center justify-center gap-2 bg-orange-500 text-white py-2.5 rounded-xl font-semibold text-[13px] hover:bg-orange-600 transition-colors no-underline"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nova Entrevista
          </Link>
        )}
        {isMentorMode && !perfilCompleto && (
          <Link
            href="/mentor/setup"
            className="flex items-center justify-center gap-2 bg-orange-500 text-white py-2.5 rounded-xl font-semibold text-[13px] hover:bg-orange-600 transition-colors no-underline"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Completar Perfil
          </Link>
        )}

        {/* User Profile */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[12px] font-bold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-primary truncate">
              {user?.name || "Usuário"}
            </p>
            <p className="text-[11px] text-on-surface-variant truncate">
              {user?.email || ""}
            </p>
          </div>
          <button
            onClick={logout}
            className="text-on-surface-variant/30 hover:text-red-500 transition-colors p-1"
            title="Sair"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
