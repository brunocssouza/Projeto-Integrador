import Sidebar from "@/components/Sidebar";

export default function MentorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 ml-[260px]">{children}</main>
    </div>
  );
}
