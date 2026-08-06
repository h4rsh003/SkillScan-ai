import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SkillScan AI Interviewer",
  description: "AI powered mock interviews for software engineers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Navbar sabse upar */}
        <Navbar />

        {/* Baaki ka poora app */}
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  );
}