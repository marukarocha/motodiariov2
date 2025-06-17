"use client";

import { useAdmin } from "@/hooks/useAdmin";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import PainelAdmin from "./parts/PainelAdmin";

export default function AdminPage() {
  const { isAdmin, loading } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/Unauthorized/UnauthorizedPage");
    }
  }, [isAdmin, loading, router]);

  if (loading) {
    return <div className="p-10 text-white">Carregando...</div>;
  }

  if (!isAdmin) return null;

  return <PainelAdmin />;
}
