import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BuildForJob - AI Resume & Portfolio Builder",
  description: "Create professional resumes, cover letters, and portfolios that win interviews. Powered by AI and ATS-friendly.",
};

import { ThemeProvider } from "@/components/theme-provider"
import { ReduxProvider } from "@/components/providers/redux-provider"
import { Toaster } from "sonner"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col font-sans`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
          <ReduxProvider>
            {children}
            <Toaster position="top-right" />
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
