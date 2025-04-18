// components/GerenciadorCorridas.tsx
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Você precisará instalar esta dependência: npm install uuid @types/uuid
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Definição dos tipos
interface Corrida {
  id: string;
  cliente: string;
  endereco: string;
  valor: number;
  status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';
  distancia: number;
  dataCriacao: Date;
  dataConclusao?: Date;
}

export default function GerenciadorCorridas() {
  // Estados
  const [corridas, setCorridas] = useState<Corrida[]>([]);
  const [cliente, setCliente] = useState<string>('');
  const [endereco, setEndereco] = useState<string>('');
  const [valor, setValor] = useState<string>('');
  const [distancia, setDistancia] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todas');
  
  // Adicionar nova corrida
  const adicionarCorrida = (e: React.FormEvent) => {
    e.preventDefault();
    
    const novaCorrida: Corrida = {
      id: uuidv4(),
      cliente,
      endereco,
      valor: parseFloat(valor),
      status: 'pendente',
      distancia: parseFloat(distancia),
      dataCriacao: new Date()
    };
    
    setCorridas([...corridas, novaCorrida]);
    
    // Limpar o formulário
    setCliente('');
    setEndereco('');
    setValor('');
    setDistancia('');
  };
  
  // Alterar status da corrida
  const alterarStatus = (id: string, novoStatus: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada') => {
    setCorridas(corridas.map(corrida => {
      if (corrida.id === id) {
        const corridaAtualizada = { 
          ...corrida, 
          status: novoStatus 
        };
        
        // Se a corrida foi concluída, registra a data de conclusão
        if (novoStatus === 'concluida') {
          corridaAtualizada.dataConclusao = new Date();
        }
        
        return corridaAtualizada;
      }
      return corrida;
    }));
  };
  
  // Filtrar corridas por status
  const corridasFiltradas = filtroStatus === 'todas' 
    ? corridas 
    : corridas.filter(corrida => corrida.status === filtroStatus);
  
  // Estatísticas
  const totalCorridas = corridas.length;
  const corridasConcluidas = corridas.filter(c => c.status === 'concluida').length;
  const valorTotal = corridas
    .filter(c => c.status === 'concluida')
    .reduce((acc, curr) => acc + curr.valor, 0);
  const distanciaTotal = corridas
    .filter(c => c.status === 'concluida')
    .reduce((acc, curr) => acc + curr.distancia, 0);
  
  // Badges para os status
  const renderStatusBadge = (status: string) => {
    switch(status) {
      case 'pendente':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'em_andamento':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Em andamento</Badge>;
      case 'concluida':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Concluída</Badge>;
      case 'cancelada':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelada</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nova Corrida</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={adicionarCorrida} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente</Label>
                <Input
                  id="cliente"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$)</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="distancia">Distância (km)</Label>
                <Input
                  id="distancia"
                  type="number"
                  step="0.1"
                  value={distancia}
                  onChange={(e) => setDistancia(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full">
              Adicionar Corrida
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Corridas</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="lista" className="w-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="lista">Lista de Corridas</TabsTrigger>
              <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="lista" className="space-y-4">
              <div className="flex justify-end">
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="em_andamento">Em andamento</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {corridasFiltradas.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Endereço</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Dist.</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {corridasFiltradas.map((corrida) => (
                        <TableRow key={corrida.id}>
                          <TableCell>{corrida.cliente}</TableCell>
                          <TableCell>{corrida.endereco}</TableCell>
                          <TableCell>R$ {corrida.valor.toFixed(2)}</TableCell>
                          <TableCell>{corrida.distancia} km</TableCell>
                          <TableCell>{renderStatusBadge(corrida.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {corrida.status === 'pendente' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => alterarStatus(corrida.id, 'em_andamento')}
                                >
                                  Iniciar
                                </Button>
                              )}
                              
                              {corrida.status === 'em_andamento' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => alterarStatus(corrida.id, 'concluida')}
                                >
                                  Concluir
                                </Button>
                              )}
                              
                              {(corrida.status === 'pendente' || corrida.status === 'em_andamento') && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-red-600"
                                  onClick={() => alterarStatus(corrida.id, 'cancelada')}
                                >
                                  Cancelar
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center p-8 text-gray-500">
                  Nenhuma corrida encontrada para o filtro selecionado.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="estatisticas">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{totalCorridas}</div>
                    <p className="text-sm text-gray-500">Total de Corridas</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{corridasConcluidas}</div>
                    <p className="text-sm text-gray-500">Corridas Concluídas</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">R$ {valorTotal.toFixed(2)}</div>
                    <p className="text-sm text-gray-500">Valor Total</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{distanciaTotal.toFixed(1)} km</div>
                    <p className="text-sm text-gray-500">Distância Total</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}