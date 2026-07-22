import AuthLayout from "@/components/AuthLayout";

export default function RelatoriosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}
