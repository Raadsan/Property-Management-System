import type { Metadata } from "next";
import { Montserrat, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AdminLayoutShell } from "@/components/admin-layout-shell";
import { AuthSessionSync } from "@/components/auth-session-sync";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Damal Platform: Somalia Real Estate | Buy, Sell & Rent Homes and Properties",
  description:
    "Damal Platform is Somalia's trusted digital property service for discovering, booking, buying, renting, and managing homes, apartments, hotels, and event venues. Verified listings, smart owner tools, and local expertise in one place.",
  keywords: [
    "Damal Platform",
    "Damal platform",
    "Somalia real estate",
    "rent property Somalia",
    "buy property Mogadishu",
    "property management Somalia",
    "hotels Somalia",
    "verified property listings",
  ],
  openGraph: {
    title: "Damal Platform: Somalia Real Estate | Buy, Sell & Rent Homes and Properties",
    description:
      "Discover, book, rent, and manage properties across Somalia with Damal Platform. Verified listings, smart owner dashboards, and trusted local expertise.",
    type: "website",
    locale: "en_US",
    siteName: "Damal Platform",
    images: [
      {
        url: "/logo-production.jpeg",
        width: 512,
        height: 512,
        alt: "Damal Platform logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Damal Platform: Somalia Real Estate | Buy, Sell & Rent Homes and Properties",
    description:
      "Somalia's trusted platform to discover, book, rent, and manage properties with verified listings and local expertise.",
    images: ["/logo-production.jpeg"],
  },
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${geistMono.variable} h-full antialiased font-sans`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <TooltipProvider>
            <AuthSessionSync />
            <AdminLayoutShell>{children}</AdminLayoutShell>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
