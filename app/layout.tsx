import type { Metadata } from "next";
import "./globals.css";
import SiteFooter from "@/components/app/SiteFooter";

export const metadata: Metadata = {
  title: "ЛЕСik",
  description: "ЛЕСik — система маленьких шагов",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}<SiteFooter /></body>
    </html>
  );
}
