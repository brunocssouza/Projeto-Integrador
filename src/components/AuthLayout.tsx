import Sidebar from "@/components/Sidebar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[url('/bg.jpg')] bg-cover bg-center bg-fixed">
      <Sidebar />
      <main className="flex-1 ml-[260px] p-6">
        <div className="bg-background min-h-full rounded-2xl max-w-[1260px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
