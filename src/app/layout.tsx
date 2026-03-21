import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Color_Emoji } from "next/font/google";
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

const notoEmoji = Noto_Color_Emoji({
  weight: "400",
  subsets: ["emoji"],
  variable: "--font-emoji",
});

export const metadata: Metadata = {
  title: "Threemail",
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
      className={`${geistSans.variable} ${geistMono.variable} ${notoEmoji.variable} h-full antialiased`}
      suppressHydrationWarning
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
