import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Algorithm Arena — Code. Compete. Optimize.",
  description:
    "The AI-powered algorithm execution and benchmarking platform for Africa's best developers. Solve real-world infrastructure problems, get instant Gemini-powered feedback, and prove your skills.",
  keywords: [
    "algorithm",
    "coding challenge",
    "AI feedback",
    "Africa",
    "developers",
    "benchmarking",
    "vehicle routing",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
