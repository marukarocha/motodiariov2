// components/users/UserRoleBadge.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/db/firebaseServices";
import { onAuthStateChanged } from "firebase/auth";

export default function UserRoleBadge() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const roleDocRef = doc(db, "users", user.uid);
          const roleSnap = await getDoc(roleDocRef);

          if (roleSnap.exists()) {
            const data = roleSnap.data();
            setRole(data.role || "user");
          } else {
            setRole("user");
          }
        } catch (error) {
          console.error("Erro ao buscar papel do usuário:", error);
          setRole("user");
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading || !role) return null;

  const roleLabelMap: Record<string, string> = {
    admin: "Administrador",
    user: "Usuário",
    manager: "Gerente",
    premium: "Usuário Premium",
  };

  const colorMap: Record<string, string> = {
    admin: "bg-blue-800",
    user: "bg-gray-700",
    manager: "bg-purple-700",
    premium: "bg-yellow-600",
  };

  const label = roleLabelMap[role] || role;
  const color = colorMap[role] || "bg-gray-600";

  const badge = (
    <span className={`${color} text-xs text-white rounded-full px-2 py-1`}>
      {label}
    </span>
  );

  if (role === "admin") {
    return (
      <Link href="/admin" title="Acessar painel de administração">
        {badge}
      </Link>
    );
  }

  return badge;
}
