// components/ConditionalLayout.tsx
"use client";

import { usePathname } from "next/navigation";
import { AuthGuard } from "@/components/USER/Auth/authGuard";
import { useEffect, useState } from "react";
import { Header } from "@/components/header";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (pathname) {
      setReady(true);
    }
  }, [pathname]);

  if (!ready) {
    // Enquanto o pathname não estiver disponível, renderiza null ou um componente de loading
    return null;
  }

  // Separa os segmentos da URL removendo entradas vazias
  const segments = pathname.split("/").filter(Boolean);

  // Condição para rota pública do perfil: URL com exatamente dois segmentos e o primeiro sendo "profile"
  const isPublicProfile = segments[0] === "profile" && segments.length === 2;

  // Se for a rota do perfil público, não renderiza o Header nem aplica o AuthGuard
  if (isPublicProfile) {
    return <>{children}</>;
  }

  // Para as demais páginas, renderiza o Header e envolve o conteúdo com AuthGuard
  return (
    <>
      <Header />
      <AuthGuard>{children}</AuthGuard>
    </>
  );
}
