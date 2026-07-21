import Sidebar from "@/components/Sidebar";

export default function ConfiguracoesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 min-h-screen overflow-y-auto">{children}</main>
    </div>
  );
}
