import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Simple Blog",
  description: "Nền tảng blog cá nhân",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <footer className="bg-white border-t border-gray-200 py-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Simple Blog. All rights reserved.
        </footer>
      </body>
    </html>
  );
}