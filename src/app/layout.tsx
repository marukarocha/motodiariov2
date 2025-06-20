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
