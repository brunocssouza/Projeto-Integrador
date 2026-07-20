import Link from "next/link";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* ================= SIDEBAR ================= */}
      <aside className="w-[260px] bg-white border-r border-outline-variant/40 flex flex-col justify-between fixed h-screen z-50">
        <div>
          {/* Logo */}
          <div className="px-8 pt-8 pb-10">
            <Link href="/" className="flex items-center gap-2.5 no-underline">
              <div className="w-7 h-7 border border-primary rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[13px]">
                  rocket_launch
                </span>
              </div>
              <span className="text-[16px] font-semibold text-primary">
                Mock Mentor
              </span>
            </Link>
          </div>

          {/* Nav Links */}
          <nav className="px-4 space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-on-surface-variant text-[14px] font-medium hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                dashboard
              </span>
              Dashboard
            </Link>
            <Link
              href="/explore"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-on-surface-variant text-[14px] font-medium hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                search
              </span>
              Explorar Mentores
            </Link>
            <Link
              href="/agendamentos"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-on-surface-variant text-[14px] font-medium hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                calendar_month
              </span>
              Meus Agendamentos
            </Link>
            <Link
              href="/relatorios"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-on-surface-variant text-[14px] font-medium hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                bar_chart
              </span>
              Meus Relatorios
            </Link>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="px-4 pb-8 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg font-semibold text-[14px] hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[18px]">
              add
            </span>
            Nova Entrevista
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-on-surface-variant text-[14px] font-medium hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-[20px]">
              settings
            </span>
            Configuracoes
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-on-surface-variant text-[14px] font-medium hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-[20px]">
              logout
            </span>
            Sair
          </button>
        </div>
      </aside>

      {/* ================= CONTENT ================= */}
      <main className="flex-1 ml-[260px]">{children}</main>
    </div>
  );
}
