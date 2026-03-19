import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ThreeMail Bank",
  description:
    "Digitális banki alkalmazás regisztrációval, egyenleggel és virtuális kártyákkal",
  metadataBase: new URL("https://threemail.fun"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="hu"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-background text-foreground">
        <AppProviders>
          <div className="flex min-h-screen flex-col bg-background">
            {children}
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
