// app/admin/parts/listUsers.tsx

"use client";

import React, { useEffect, useState } from "react";

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function ListUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data.users);
    setLoading(false);
  }

  async function updateRole(userId: string, newRole: string) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      fetchUsers();
    } else {
      alert("Erro ao atualizar role");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Listagem de Usuários</h1>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <table className="min-w-full border text-white">
          <thead>
            <tr className="bg-gray-800">
              <th className="border p-2">ID</th>
              <th className="border p-2">Nome</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Perfil</th>
              <th className="border p-2">Ação</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="bg-gray-900">
                <td className="border p-2">{user.id}</td>
                <td className="border p-2">{user.firstName} {user.lastName}</td>
                <td className="border p-2">{user.email}</td>
                <td className="border p-2 capitalize">{user.role}</td>
                <td className="border p-2">
                  <select
                    value={user.role}
                    onChange={(e) => updateRole(user.id, e.target.value)}
                    className="bg-gray-800 text-white p-1 rounded"
                  >
                    <option value="usuario">Usuário</option>
                    <option value="pago">Usuário Pago</option>
                    <option value="gerente">Gerente</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
