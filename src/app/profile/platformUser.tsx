"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getUserProfile, updateUserProfile } from "@/lib/db/firebaseServices";
import { useAuth } from "@/components/USER/Auth/AuthContext";

export default function PlatformUser() {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [platforms, setPlatforms] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [loading, setLoading] = useState(false);

  // Busca as plataformas cadastradas (via API)
  const fetchPlatforms = async () => {
    try {
      const res = await fetch("/api/admin/platforms");
      const data = await res.json();
      setPlatforms(data);
    } catch (error) {
      console.error("Erro ao buscar plataformas", error);
    }
  };

  // Busca o perfil do usuário para preencher as plataformas já selecionadas
  const fetchUserProfile = async () => {
    if (!currentUser) return;
    try {
      const profile = await getUserProfile(currentUser.uid);
      if (profile && profile.preferredPlatforms) {
        setSelectedPlatforms(profile.preferredPlatforms);
      }
    } catch (error) {
      console.error("Erro ao buscar perfil", error);
    }
  };

  useEffect(() => {
    fetchPlatforms();
    if (currentUser) fetchUserProfile();
  }, [currentUser]);

  // Alterna a seleção de uma plataforma (selecionar/desselecionar)
  const handleTogglePlatform = (id) => {
    if (selectedPlatforms.includes(id)) {
      setSelectedPlatforms(selectedPlatforms.filter((pid) => pid !== id));
    } else {
      setSelectedPlatforms([...selectedPlatforms, id]);
    }
  };

  // Salva a seleção de plataformas no perfil do usuário
  const handleSavePlatforms = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      await updateUserProfile(currentUser.uid, { preferredPlatforms: selectedPlatforms });
      toast({
        title: "Plataformas atualizadas",
        description: "Suas plataformas preferidas foram atualizadas.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar suas plataformas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Plataformas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Exibição das plataformas selecionadas */}
        <div>
          <p className="mb-2 font-semibold">Você selecionou:</p>
          <div className="flex flex-wrap gap-2">
            {selectedPlatforms.length > 0 ? (
              selectedPlatforms.map((id) => {
                const platform = platforms.find((p) => p.id === id);
                return (
                  <Button
                    key={id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleTogglePlatform(id)}
                    className="capitalize "
                  >
                    {platform ? platform.name : id}
                  </Button>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma plataforma selecionada</p>
            )}
          </div>
        </div>

        {/* Listagem de todas as plataformas em três colunas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {platforms.map((platform) => {
            const isSelected = selectedPlatforms.includes(platform.id);
            return (
              <Button
                key={platform.id}
                variant="outline"
                onClick={() => handleTogglePlatform(platform.id)}
                className={`capitalize ${
                  isSelected
                    ? "bg-green-100 text-green-800"
                    : ""
                }`}
              >
                {platform.name}
              </Button>
            );
          })}
        </div>

        <Button onClick={handleSavePlatforms} disabled={loading} className="w-full p-2 bg-green-500">
          {loading ? "Salvando..." : "Salvar Plataformas"}
        </Button>
      </CardContent>
    </Card>
  );
}
