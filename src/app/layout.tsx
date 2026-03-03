import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/site-footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Veyra",
  description: "Premium game discovery and ratings platform",
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Veyra",
    description: "Premium game discovery and ratings platform",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Veyra",
    description: "Premium game discovery and ratings platform",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.className} premium-shell flex min-h-screen flex-col bg-bg text-text`}>
        <Providers>
          <SiteHeader />
          <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
