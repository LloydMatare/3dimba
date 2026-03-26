import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";

// Import your existing CSS (renamed to globals.css in Next.js)
import "./globals.css";

// Configure fonts (Next.js handles font optimization differently)
// Using Space Grotesk and Fraunces as alternatives
const spaceGrotesk = Inter({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

// Note: Next.js doesn't have a direct equivalent to react-router's Links function
// We'll handle fonts and metadata differently

export const metadata: Metadata = {
  title: "ImbaAi", // Replace with your app name
  description: "Imba Ai 2D to 3D Floor Plans", // Replace with your description
  metadataBase: new URL("https://imbaai.vercel.app/"), // Replace with your domain
};

// Root layout component
export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en" className={spaceGrotesk.variable} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Google Fonts - Next.js recommends using next/font but we'll include these as fallback */}
        <link
            rel="preconnect"
            href="https://fonts.googleapis.com"
        />
        <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
        />
        <link
            href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,100..700&family=Space+Grotesk:wght@300..700&display=swap"
            rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <main className="min-h-screen w-full">{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
      </html>
  );
}

// Note: ErrorBoundary in Next.js is handled differently
// You would create a separate error.tsx file in your app directory
// for route-specific error boundaries, and a global-error.tsx for
// application-wide errors.
