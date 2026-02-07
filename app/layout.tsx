import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import CategoryNav from "./components/CategoryNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sachlich.News - Nachrichten ohne Drama",
  description: "Sachliche Nachrichten aus der Schweiz und der Welt. Ohne Sensationalismus, nur Fakten.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <Header />
        <CategoryNav />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
