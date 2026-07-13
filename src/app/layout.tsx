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
  title: "Inkwell — Your Private Diary",
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var storedDark = localStorage.getItem("journal-dark-mode") === "true";
                var storedTheme = localStorage.getItem("journal-color-theme") || "theme-indigo";
                if (storedTheme && storedTheme !== "theme-indigo") {
                  document.documentElement.classList.add(storedTheme);
                }
                if (storedDark) {
                  document.documentElement.classList.add("dark");
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="h-full overflow-hidden font-sans antialiased">{children}</body>
    </html>
  );
}
