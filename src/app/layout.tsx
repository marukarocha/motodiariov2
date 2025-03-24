import "@/styles/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import type React from "react" // Added import for React

import { AuthProvider } from '@/components/USER/Auth/AuthContext';
import { AuthGuard } from '@/components/USER/Auth/authGuard';
import { Toaster } from "@/components/ui/toaster"
import { Header } from '@/components/header';



const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Moto Diário",
  description: "Aplicativo de gerenciamento e manutenção de motos",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="br" suppressHydrationWarning>
      <body className={inter.className}>
       <div className=""><Header /></div>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem >
          <AuthProvider>
            <AuthGuard>
                {children}
              <Toaster />
            </AuthGuard>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'