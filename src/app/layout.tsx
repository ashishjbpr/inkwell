import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}
