"use client";

import React, { useEffect, useState } from "react";
import { User } from "lucide-react";

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  nickname?: string;
  useNickname?: boolean;
  bloodType?: string;
  emergencyPhone?: string;
}

export default function ListUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/users");
        if (!res.ok) {
          throw new Error("Erro ao buscar usuários");
        }
        const data = await res.json();
        setUsers(data.users);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Listagem de Usuários</h1>
      {loading && <p>Carregando...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="border p-2">ID</th>
              <th className="border p-2">Nome</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="text-gray-200">
                <td className="border p-2">{user.id}</td>
                <td className="border p-2">
                  {user.firstName} {user.lastName}
                </td>
                <td className="border p-2">{user.email}</td>
                <td className="border p-2">{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
