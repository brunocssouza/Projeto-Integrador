import AuthLayout from "@/components/AuthLayout";

export default function AgendamentosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}
