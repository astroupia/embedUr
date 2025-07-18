import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ToastContainer } from "@/components/ui/toast";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/lib/toast-context";
import { AuthErrorBoundary } from "@/components/error-boundary/auth-error-boundary";
import { installGlobalFetchInterceptor } from "@/lib/utils/global-fetch-interceptor";
import "./globals.css";

// Install global fetch interceptor
if (typeof window !== 'undefined') {
  installGlobalFetchInterceptor();
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EmailAI - AI-Powered Email Marketing Platform",
  description: "Create and send high-converting email campaigns in minutes with AI. Smart email delivery system with advanced analytics and automation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            <AuthProvider>
              <AuthErrorBoundary>
                {children}
                <ToastContainer />
              </AuthErrorBoundary>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
