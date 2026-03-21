import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Партнёрская программа от Центра Банкротства Юрист — cbucompany.ru",
  description: "Партнёрская программа от Центра Банкротства Юрист cbucompany.ru — приглашайте клиентов на банкротство и зарабатывайте",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${geistSans.variable} antialiased`} style={{ margin: 0, fontFamily: "var(--font-geist-sans), system-ui, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
