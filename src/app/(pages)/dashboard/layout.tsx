import Link from "next/link";

// Este layout se aplicará APENAS às rotas dentro da pasta (dashboard)
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* ================= SIDEBAR GLOBAL ================= */}
      <aside className="w-[280px] bg-surface-container-lowest border-r border-outline-variant flex flex-col justify-between fixed h-screen z-50">
        <div>
          {/* Logo */}
          <div className="p-xl pb-lg">
            <h1 className="font-headline-md font-bold text-primary text-[24px]">
              Mock Mentor
            </h1>
            <p className="text-label-sm text-on-surface-variant font-normal tracking-wide">
              Preparação Técnica
            </p>
          </div>

          {/* Nav Links */}
          <nav className="px-md space-y-2 mt-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-md px-md py-3 rounded-xl bg-secondary-fixed text-on-secondary-fixed font-bold transition-colors hover:opacity-90"
            >
              <span className="material-symbols-outlined text-[22px]">
                dashboard
              </span>
              Dashboard
            </Link>
            <Link
              href="/explore"
              className="flex items-center gap-md px-md py-3 rounded-xl text-on-surface-variant font-medium hover:bg-surface-variant/50 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">
                search
              </span>
              Explorar Mentores
            </Link>
            <Link
              href="/agendamentos"
              className="flex items-center gap-md px-md py-3 rounded-xl text-on-surface-variant font-medium hover:bg-surface-variant/50 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">
                calendar_month
              </span>
              Meus Agendamentos
            </Link>
            <Link
              href="/relatorios"
              className="flex items-center gap-md px-md py-3 rounded-xl text-on-surface-variant font-medium hover:bg-surface-variant/50 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">
                bar_chart
              </span>
              Meus Relatórios
            </Link>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-md space-y-2 mb-md">
          <button className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-sm mb-4 group">
            <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform">
              add
            </span>
            Nova Entrevista
          </button>

          <button className="w-full flex items-center gap-md px-md py-3 rounded-xl text-on-surface-variant font-medium hover:bg-surface-variant/50 transition-colors">
            <span className="material-symbols-outlined text-[22px]">
              settings
            </span>
            Configurações
          </button>
          <button className="w-full flex items-center gap-md px-md py-3 rounded-xl text-on-surface-variant font-medium hover:bg-surface-variant/50 transition-colors">
            <span className="material-symbols-outlined text-[22px]">
              logout
            </span>
            Sair
          </button>
        </div>
      </aside>

      {/* ================= ÁREA DE CONTEÚDO ================= */}
      {/* A margem esquerda de 280px empurra o conteúdo para não ficar debaixo da Sidebar */}
      <main className="flex-1 ml-[280px]">{children}</main>
    </div>
  );
}
