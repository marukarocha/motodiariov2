// NÃO use "use client" aqui!
import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/USER/Auth/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import ConditionalLayout from "@/components/ConditionalLayout";
// import SwipeableLayout from "@/components/SwipeableLayout";
import GlobalPreloader from "@/components/Preloader";
import { BottomNav } from "@/components/home/BottomNav";
import Head from "next/head";



const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Moto Diário",
  description: "Aplicativo de gerenciamento e manutenção de motos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
     <html lang="br" suppressHydrationWarning>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="MotoDiário" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <ConditionalLayout>
                      <GlobalPreloader minTime={3000} />

              {/* <SwipeableLayout> */}
                {children}
                <Toaster />
              {/* </SwipeableLayout> */}
              <BottomNav />

            </ConditionalLayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
