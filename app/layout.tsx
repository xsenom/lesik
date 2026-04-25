import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  subsets: ["latin", "cyrillic"],
  weight: ["400"],
  display: "swap",
  variable: "--font-rubik",
});

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
    <html lang="ru" className={rubik.variable}>
      <body>{children}</body>
    </html>
  );
}
