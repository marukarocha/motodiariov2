import { useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

type FormField = {
  id: string;
  label: string;
  type: string;
  step?: string;
  value: string;
  onChange: (value: string) => void;
}

const STATUS_BADGES = {
  pendente: <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendente</Badge>,
  em_andamento: <Badge variant="outline" className="bg-blue-100 text-blue-800">Em andamento</Badge>,
  concluida: <Badge variant="outline" className="bg-green-100 text-green-800">Concluída</Badge>,
  cancelada: <Badge variant="outline" className="bg-red-100 text-red-800">Cancelada</Badge>
};
    
export default function GerenciadorCorridas() {
  const [corridas, setCorridas] = useState<Corrida[]>([]);
  const [cliente, setCliente] = useState<string>('');
  const [endereco, setEndereco] = useState<string>('');
  const [valor, setValor] = useState<string>('');
  const [distancia, setDistancia] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todas');

  const adicionarCorrida = useCallback((e: React.FormEvent) => {
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
  
    setCorridas(prevCorridas => [...prevCorridas, novaCorrida]);

    setCliente('');
    setEndereco('');
    setValor('');
    setDistancia('');
  }, [cliente, endereco, valor, distancia]);
  const alterarStatus = useCallback((id: string, novoStatus: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada') => {
    setCorridas(prevCorridas => prevCorridas.map(corrida => {
      if (corrida.id === id) {
        const corridaAtualizada = { 
          ...corrida, 
          status: novoStatus 
        };
        
        if (novoStatus === 'concluida') {
          corridaAtualizada.dataConclusao = new Date();
        }
        
        return corridaAtualizada;
      }
      return corrida;
    }));
  }, []);

  const formFields: FormField[][] = useMemo(() => [
    [
      {
        id: "cliente",
        label: "Cliente",
        type: "text",
        value: cliente,
        onChange: setCliente
      },
      {
        id: "endereco",
        label: "Endereço",
        type: "text",
        value: endereco,
        onChange: setEndereco
      }
    ],
    [
      {
        id: "valor",
        label: "Valor (R$)",
        type: "number",
        step: "0.01",
        value: valor,
        onChange: setValor
      },
      {
        id: "distancia",
        label: "Distância (km)",
        type: "number",
        step: "0.1",
        value: distancia,
        onChange: setDistancia
      }
    ]
  ], [cliente, endereco, valor, distancia]);

  const corridasFiltradas = useMemo(() =>
    filtroStatus === 'todas'
    ? corridas 
      : corridas.filter(corrida => corrida.status === filtroStatus),
    [corridas, filtroStatus]
  );

  const estatisticas = useMemo(() => {
    const corridasConcluidas = corridas.filter(c => c.status === 'concluida');
    return {
      totalCorridas: corridas.length,
      corridasConcluidas: corridasConcluidas.length,
      valorTotal: corridasConcluidas.reduce((acc, curr) => acc + curr.valor, 0),
      distanciaTotal: corridasConcluidas.reduce((acc, curr) => acc + curr.distancia, 0)
    };
  }, [corridas]);

  const renderStatusBadge = (status: string) => {
    return STATUS_BADGES[status as keyof typeof STATUS_BADGES] || <Badge>{status}</Badge>;
  };

  const FormFields = ({ fields }: { fields: FormField[] }) => (
    <div className="grid grid-cols-2 gap-4">
      {fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <Label htmlFor={field.id}>{field.label}</Label>
          <Input
            id={field.id}
            type={field.type}
            step={field.step}
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            required
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nova Corrida</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={adicionarCorrida} className="space-y-4">
            {formFields.map((fieldGroup, index) => (
              <FormFields key={index} fields={fieldGroup} />
            ))}

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
                <StatisticCard label="Total de Corridas" value={estatisticas.totalCorridas.toString()} />
                <StatisticCard label="Corridas Concluídas" value={estatisticas.corridasConcluidas.toString()} />
                <StatisticCard label="Valor Total" value={`R$ ${estatisticas.valorTotal.toFixed(2)}`} />
                <StatisticCard label="Distância Total" value={`${estatisticas.distanciaTotal.toFixed(1)} km`} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function StatisticCard({ label, value }: { label: string, value: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-sm text-gray-500">{label}</p>
      </CardContent>
    </Card>
  );
}
