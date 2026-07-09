import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mock Mentor - Preparação Técnica",
  description: "Conecte-se com especialistas para acelerar sua carreira.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background font-body-md text-on-surface">
        {/* Aqui o Next.js vai injetar a Landing Page OU o Layout do Dashboard */}
        {children}
      </body>
    </html>
  );
}
