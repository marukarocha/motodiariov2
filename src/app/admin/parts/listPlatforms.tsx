"use client";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function ListPlatforms() {
  const { toast } = useToast();
  const [platformName, setPlatformName] = useState("");
  const [platforms, setPlatforms] = useState([]);
  const [raceTypeName, setRaceTypeName] = useState("");
  const [raceTypes, setRaceTypes] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedRaceTypes, setSelectedRaceTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPlatforms();
    fetchRaceTypes();
  }, []);

  const fetchPlatforms = async () => {
    const res = await fetch("/api/admin/platforms");
    const data = await res.json();
    setPlatforms(data);
  };

  const fetchRaceTypes = async () => {
    const res = await fetch("/api/admin/raceTypes");
    const data = await res.json();
    setRaceTypes(data);
  };

  // Cadastro de Plataforma
  const handleCreatePlatform = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/platforms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: platformName }),
    });
    if (res.ok) {
      toast({
        title: "Plataforma criada",
        description: "Plataforma criada com sucesso!",
        variant: "success",
      });
      setPlatformName("");
      fetchPlatforms();
    } else {
      toast({
        title: "Erro",
        description: "Erro ao criar plataforma.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  // Cadastro de Tipo de Corrida
  const handleCreateRaceType = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/raceTypes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: raceTypeName }),
    });
    if (res.ok) {
      toast({
        title: "Tipo de corrida criado",
        description: "Tipo de corrida criado com sucesso!",
        variant: "success",
      });
      setRaceTypeName("");
      fetchRaceTypes();
    } else {
      toast({
        title: "Erro",
        description: "Erro ao criar tipo de corrida.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  // Exclusão de Plataforma
  const handleDeletePlatform = async (id) => {
    if (!confirm("Deseja realmente excluir esta plataforma?")) return;
    const res = await fetch(`/api/admin/platforms?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      toast({
        title: "Plataforma removida",
        description: "Plataforma removida com sucesso!",
        variant: "success",
      });
      fetchPlatforms();
    } else {
      toast({
        title: "Erro",
        description: "Erro ao remover plataforma.",
        variant: "destructive",
      });
    }
  };

  // Exclusão de Tipo de Corrida
  const handleDeleteRaceType = async (id) => {
    if (!confirm("Deseja realmente excluir este tipo de corrida?")) return;
    const res = await fetch(`/api/admin/raceTypes?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      toast({
        title: "Tipo de corrida removido",
        description: "Tipo de corrida removido com sucesso!",
        variant: "success",
      });
      fetchRaceTypes();
    } else {
      toast({
        title: "Erro",
        description: "Erro ao remover tipo de corrida.",
        variant: "destructive",
      });
    }
  };

  // Associação de Tipos à Plataforma Selecionada
  const handleAssociateRaceTypes = async () => {
    if (!selectedPlatform) return;
    const res = await fetch("/api/admin/platforms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedPlatform.id,
        associatedRaceTypes: selectedRaceTypes,
      }),
    });
    if (res.ok) {
      toast({
        title: "Associação atualizada",
        description: "Associação atualizada com sucesso!",
        variant: "success",
      });
      setSelectedPlatform(null);
      setSelectedRaceTypes([]);
      fetchPlatforms();
    } else {
      toast({
        title: "Erro",
        description: "Erro ao atualizar associação.",
        variant: "destructive",
      });
    }
  };

  // Remover associação: atualiza com array vazio
  const handleRemoveAssociation = async () => {
    if (!selectedPlatform) return;
    const res = await fetch("/api/admin/platforms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedPlatform.id,
        associatedRaceTypes: [],
      }),
    });
    if (res.ok) {
      toast({
        title: "Associação removida",
        description: "Todos os tipos foram desassociados.",
        variant: "success",
      });
      setSelectedPlatform(null);
      setSelectedRaceTypes([]);
      fetchPlatforms();
    } else {
      toast({
        title: "Erro",
        description: "Erro ao remover associação.",
        variant: "destructive",
      });
    }
  };

  // Função para obter os nomes dos tipos associados a partir dos IDs
  const getAssociatedRaceTypesNames = (associatedIds = []) => {
    const names = associatedIds
      .map((id) => raceTypes.find((r) => r.id === id)?.type)
      .filter(Boolean);
    return names.join(", ") || "Nenhum";
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-extrabold text-center mb-4">
        Configurações de Trips
      </h1>

      {/* Grid com duas colunas para cadastros e listagens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Coluna da Esquerda - Plataformas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Plataformas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Formulário de criação */}
            <form onSubmit={handleCreatePlatform} className="space-y-2">
              <Input
                placeholder="Nome da Plataforma"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                required
              />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Salvando..." : "Criar Plataforma"}
              </Button>
            </form>

            {/* Listagem simplificada */}
            <div className="space-y-2">
              {platforms.map((platform) => (
                <div
                  key={platform.id}
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <div>
                    <span className="font-semibold">{platform.name}</span>
                    <div className="text-xs text-muted-foreground">
                      Tipos: {getAssociatedRaceTypesNames(platform.associatedRaceTypes)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPlatform(platform)}
                    >
                      Associar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePlatform(platform.id)}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Coluna da Direita - Tipos de Corrida */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Tipos de Corrida</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Formulário de criação */}
            <form onSubmit={handleCreateRaceType} className="space-y-2">
              <Input
                placeholder="Nome do Tipo de Corrida"
                value={raceTypeName}
                onChange={(e) => setRaceTypeName(e.target.value)}
                required
              />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Salvando..." : "Criar Tipo de Corrida"}
              </Button>
            </form>

            {/* Listagem simplificada */}
            <div className="space-y-2">
              {raceTypes.map((race) => (
                <div
                  key={race.id}
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <span className="font-semibold">{race.type}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteRaceType(race.id)}
                  >
                    Excluir
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Área de Associação (exibida quando uma plataforma é selecionada) */}
      {selectedPlatform && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              Associar Tipos para: {selectedPlatform.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2">
              {raceTypes.map((race) => (
                <div key={race.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={race.id}
                    checked={selectedRaceTypes.includes(race.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRaceTypes([...selectedRaceTypes, race.id]);
                      } else {
                        setSelectedRaceTypes(selectedRaceTypes.filter((id) => id !== race.id));
                      }
                    }}
                    className="mr-2"
                  />
                  <label htmlFor={race.id} className="cursor-pointer">
                    {race.type}
                  </label>
                </div>
              ))}
            </div>
            <div className="flex space-x-4">
              <Button onClick={handleAssociateRaceTypes} className="flex-1">
                Salvar Associação
              </Button>
              <Button variant="destructive" onClick={handleRemoveAssociation} className="flex-1">
                Remover Associação
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedPlatform(null)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
