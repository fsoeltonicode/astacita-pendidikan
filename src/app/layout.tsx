import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Astacita Pendidikan | Depo Siaran Pers",
  description: "Platform portal publikasi Siaran Pers sekolah",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${oswald.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col font-sans text-slate-900 bg-slate-50">
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
