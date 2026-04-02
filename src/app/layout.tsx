import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { NavigationProgressProvider } from "@/components/layout/NavigationProgress";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif", style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: "InfluenceIndia – India's Influencer Marketplace",
  description:
    "Connect with India's top verified Instagram influencers. Find the right creator for your brand campaign.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <NavigationProgressProvider>
          <SessionProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster position="top-right" richColors />
          </SessionProvider>
        </NavigationProgressProvider>
      </body>
    </html>
  );
}
