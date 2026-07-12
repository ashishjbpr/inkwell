import type { Metadata } from "next";
import { Lora, Inter } from "next/font/google";
import "./globals.css";

const lora = Lora({ 
  subsets: ["latin"],
  variable: "--font-lora"
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "Life Journal — Your Private Diary",
  description:
    "A warm, private space for your daily thoughts. Every word stays on your device.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${lora.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="h-full overflow-hidden font-sans antialiased">{children}</body>
    </html>
  );
}
