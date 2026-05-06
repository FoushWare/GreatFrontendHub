import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { JotaiProvider } from "../../providers/JotaiProvider";
import { QueryProvider } from "../../providers/QueryProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";

import {
  UserTypeProvider,
  MobileMenuProvider,
  ThemeProvider,
  LanguageProvider,
  OnboardingProvider,
  AuthProvider,
  NotificationProvider,
} from "@elzatona/contexts";
import { ErrorBoundary } from "@elzatona/common-ui";
import { LearningTypeProvider } from "../context/LearningTypeContext";
import { NavigationProvider } from "../context/NavigationContext";
import { ConditionalNavbar } from "./components/ConditionalNavbar";

// Force dynamic rendering to prevent static generation issues with auth context
export const dynamic = "force-dynamic";
export const revalidate = 0;

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "arial"],
});

export const metadata: Metadata = {
  title: "Master Frontend Development Interviews",
  description:
    "Comprehensive platform for mastering frontend development interviews. Practice questions, learning paths, coding challenges, and real-time AI assistance.",
  keywords:
    "frontend development, interview preparation, React, JavaScript, CSS, HTML, coding challenges, learning paths",
  authors: [{ name: "Development Team", url: "https://elzatona.com" }],
  creator: "Development Team",
  publisher: "Development Team",
  robots: "index, follow",
  openGraph: {
    title: "Master Frontend Development Interviews",
    description:
      "Comprehensive platform for mastering frontend development interviews. Practice questions, learning paths, coding challenges, and real-time AI assistance.",
    type: "website",
    locale: "en_US",
    siteName: "Frontend Development Platform",
  },
  twitter: {
    card: "summary_large_image",
    title: "Master Frontend Development Interviews",
    description:
      "Comprehensive platform for mastering frontend development interviews. Practice questions, learning paths, coding challenges, and real-time AI assistance.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryProvider>
          <JotaiProvider>
            <AuthProvider>
              <UserTypeProvider>
                <MobileMenuProvider>
                  <ThemeProvider>
                    <LanguageProvider>
                      <OnboardingProvider>
                        <NotificationProvider>
                          <LearningTypeProvider>
                            <NavigationProvider>
                              <ErrorBoundary>
                                <ConditionalNavbar />
                                <main className="pt-20 min-h-screen">
                                  {children}
                                </main>
                                <SpeedInsights />
                              </ErrorBoundary>
                            </NavigationProvider>
                          </LearningTypeProvider>
                        </NotificationProvider>
                      </OnboardingProvider>
                    </LanguageProvider>
                  </ThemeProvider>
                </MobileMenuProvider>
              </UserTypeProvider>
            </AuthProvider>
          </JotaiProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
