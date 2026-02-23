import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Math Worksheet Generator",
  description: "Generate and practice math worksheets for grades 1-8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
