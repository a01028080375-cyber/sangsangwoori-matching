import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "상상우리 — 시니어 일자리 매칭",
  description: "시니어와 일자리를 자동으로 연결하는 상상우리 매칭 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <Nav />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
          {children}
        </main>
        <footer className="border-t py-6 text-center text-lg text-gray-500">
          © 2025 상상우리. 시니어와 함께하는 일자리 매칭 서비스
        </footer>
      </body>
    </html>
  );
}
