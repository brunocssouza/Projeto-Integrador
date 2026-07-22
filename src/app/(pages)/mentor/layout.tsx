import AuthLayout from "@/components/AuthLayout";

export default function MentorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthLayout>{children}</AuthLayout>;
}
