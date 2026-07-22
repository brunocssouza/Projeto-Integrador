import AuthLayout from "@/components/AuthLayout";

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}
