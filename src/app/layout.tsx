import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fortune Intern Network — Bridging Dreams and Careers",
  description:
    "Single-purpose hiring and training platform: internships, traineeships, and career development.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0A1F44",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-100 min-h-screen text-slate-900 selection:bg-fin-gold selection:text-fin-navy">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
