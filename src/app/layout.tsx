import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Партнёрская программа от Центра Банкротства Юрист — cbucompany.ru",
  description: "Партнёрская программа от Центра Банкротства Юрист cbucompany.ru — приглашайте клиентов на банкротство и зарабатывайте",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} antialiased`} style={{ margin: 0, fontFamily: "var(--font-inter), system-ui, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
