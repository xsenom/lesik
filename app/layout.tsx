import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
