'use client';

import { useState } from 'react';
import Tesseract from 'tesseract.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { Trash, Edit, Save, X } from "lucide-react";
import { addEarning, deleteEarning } from '@/lib/db/firebaseServices';
import { useAuth } from '@/components/USER/Auth/AuthContext';

interface Corrida {
  id?: string;
  valor: string;       // Valor principal (em string, ex: "22.16")
  taxaExtra?: string;  // Taxa extra (ex: "2.00")
  tempo: string;       // Tempo (ex: "32 min 57 seg")
  km: string;          // Quilometragem (ex: "21.06")
  date?: string;       // Data no formato "dd/mm/yyyy"
  hora?: string;       // Hora no formato "hh:mm"
  tipo?: string;       // Tipo da corrida (Entrega, Passageiro)
  platform?: string;   // Plataforma (Uber, 99, etc.)
}

interface CorridaCardProps {
  corrida: Corrida;
  index: number;
  onDelete: (index: number) => void;
  onSave: (index: number, updated: Corrida) => void;
}

function CorridaCard({ corrida, index, onDelete, onSave }: CorridaCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editCorrida, setEditCorrida] = useState<Corrida>(corrida);

  const handleFieldChange = (field: keyof Corrida, value: string) => {
    setEditCorrida({ ...editCorrida, [field]: value });
  };

  const handleSave = () => {
    onSave(index, editCorrida);
    setIsEditing(false);
  };

  return (
    <Card className="border transition-opacity duration-500">
      <CardHeader className="flex items-center justify-between pb-2">
        <CardTitle>Corrida #{index + 1}</CardTitle>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="ghost" size="icon" onClick={handleSave}>
                <Save className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => { setIsEditing(false); setEditCorrida(corrida); }}>
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="icon" onClick={() => onDelete(index)}>
                <Trash className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-2">
            <div>
              <label className="text-sm font-medium">Valor (R$): </label>
              <Input value={editCorrida.valor} onChange={(e) => handleFieldChange('valor', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Taxa Extra (R$): </label>
              <Input value={editCorrida.taxaExtra || ''} onChange={(e) => handleFieldChange('taxaExtra', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Tempo: </label>
              <Input value={editCorrida.tempo} onChange={(e) => handleFieldChange('tempo', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">KM: </label>
              <Input value={editCorrida.km} onChange={(e) => handleFieldChange('km', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Data: </label>
              <Input value={editCorrida.date || ''} onChange={(e) => handleFieldChange('date', e.target.value)} placeholder="dd/mm/aaaa" />
            </div>
            <div>
              <label className="text-sm font-medium">Hora: </label>
              <Input value={editCorrida.hora || ''} onChange={(e) => handleFieldChange('hora', e.target.value)} placeholder="hh:mm" />
            </div>
            <div>
              <label className="text-sm font-medium">Plataforma: </label>
              <Select value={editCorrida.platform || ''} onValueChange={(value) => handleFieldChange('platform', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a plataforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uber">Uber</SelectItem>
                  <SelectItem value="99">99</SelectItem>
                  <SelectItem value="ifood">iFood</SelectItem>
                  <SelectItem value="lalamove">Lalamove</SelectItem>
                  <SelectItem value="indrive">InDrive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Tipo da Corrida: </label>
              <Select value={editCorrida.tipo || ''} onValueChange={(value) => handleFieldChange('tipo', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrega">Entrega</SelectItem>
                  <SelectItem value="passageiro">Passageiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <p><strong>Valor:</strong> R$ {corrida.valor}</p>
            {corrida.taxaExtra && (
              <p>
                <strong>Taxa Extra:</strong>{' '}
                <span className="bg-secondary text-secondary-foreground text-xs font-medium rounded px-2 py-1">
                  R$ {corrida.taxaExtra}
                </span>
              </p>
            )}
            <p><strong>Tempo:</strong> {corrida.tempo}</p>
            <p><strong>KM:</strong> {corrida.km}</p>
            {corrida.date && <p><strong>Data:</strong> {corrida.date}</p>}
            {corrida.hora && <p><strong>Hora:</strong> {corrida.hora}</p>}
            {corrida.platform && <p><strong>Plataforma:</strong> {corrida.platform}</p>}
            {corrida.tipo && <p><strong>Tipo:</strong> {corrida.tipo}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Converte "dd/mm/yyyy" e "hh:mm" em objeto Date
function combineDateTime(dateStr: string, timeStr: string): Date {
  const [day, month, year] = dateStr.split('/').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

// Converte texto de tempo (ex: "32 min 57 seg") para duração em minutos (número decimal)
function parseDuration(tempo: string): number {
  const minMatch = tempo.match(/(\d+)\s*min/);
  const secMatch = tempo.match(/(\d+)\s*seg/);
  const minutes = minMatch ? parseInt(minMatch[1], 10) : 0;
  const seconds = secMatch ? parseInt(secMatch[1], 10) : 0;
  return minutes + seconds / 60;
}

// Converte data extraída (ex: "sáb., 22 de fev." ou similar) para "22/02/2025"
function parseData(dataStr: string): string {
  const meses: Record<string, string> = {
    jan: "01",
    fev: "02",
    mar: "03",
    abr: "04",
    mai: "05",
    jun: "06",
    jul: "07",
    ago: "08",
    set: "09",
    out: "10",
    nov: "11",
    dez: "12"
  };
  const regex = /(?:dom|seg|ter|qua|qui|sex|s[aá]b)[^0-9]*(\d{1,2}) de ([a-zçãé]+)(?: de (\d{4}))?/i;
  const match = dataStr.match(regex);
  if (match) {
    const day = match[1].padStart(2, '0');
    const monthAbbr = match[2].substring(0, 3).toLowerCase();
    const month = meses[monthAbbr] || "01";
    const year = match[3] ? match[3] : new Date().getFullYear().toString();
    return `${day}/${month}/${year}`;
  }
  return "";
}

export default function OcrEarningsPage() {
  const { currentUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ocrText, setOcrText] = useState('');
  const [corridas, setCorridas] = useState<Corrida[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number>(0);

  // Campos manuais globais (opcionais)
  const [date, setDate] = useState('');
  const [hora, setHora] = useState('');
  const [valor, setValor] = useState('');
  const [km, setKm] = useState('');
  const [platform, setPlatform] = useState('');
  const [tipo, setTipo] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setOcrText('');
      setCorridas([]);
      setProgress(0);
    }
  };

  const handleOcr = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setProgress(0);
    try {
      const { data: { text } } = await Tesseract.recognize(selectedFile, 'por', {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(m.progress);
          }
          console.log(m);
        },
        config: {
          tessedit_pageseg_mode: '6',
        },
      });
      setOcrText(text);
      const lista = parseCorridas(text);
      setCorridas(lista);
    } catch (error) {
      console.error('Erro no OCR:', error);
      setOcrText('Erro ao processar a imagem');
    } finally {
      setLoading(false);
    }
  };

  function parseCorridas(text: string): Corrida[] {
    const cleanedText = text.replace(/\s{2,}/g, ' ').trim();
    const blocks = cleanedText.split(/(?=R\$)/);
    const result: Corrida[] = [];
    let currentRace: Corrida | null = null;

    blocks.forEach((block) => {
      const b = block.trim();
      if (!b) return;

      const valorMatch = b.match(/R\$[\s]*([\d.,]+)/);
      const tempoMatch = b.match(/(\d+\s*(?:min(?:utos)?)\s*\d+\s*(?:seg(?:undos)?))/i);
      const kmMatch = b.match(/(\d+[.,]\d+)\s*km/i);
      const dateMatch = b.match(/(?:dom|seg|ter|qua|qui|sex|s[aá]b)[^0-9]*(\d{1,2}\/\d{1,2}\/\d{4})/);
      const horaMatch = b.match(/(\d{1,2}:\d{2})/);

      if (valorMatch) {
        let valorStr = valorMatch[1].trim();
        if (valorStr.includes(',') || valorStr.includes('.')) {
          if (valorStr.includes(',')) {
            valorStr = valorStr.replace(/\./g, '').replace(',', '.');
          }
        } else {
          if (valorStr.length === 4 || valorStr.length === 5) {
            valorStr = valorStr.slice(0, -2) + '.' + valorStr.slice(-2);
          }
        }

        if (currentRace) {
          const numericValor = parseFloat(valorStr);
          // Se não houver tempo nem km e o valor é pequeno (< 10), considere taxa extra
          if (!tempoMatch && !kmMatch && numericValor < 10) {
            currentRace.taxaExtra = valorStr;
            if (dateMatch) currentRace.date = parseData(dateMatch[0]);
            if (horaMatch) currentRace.hora = horaMatch[1];
            return;
          } else {
            // Se a corrida atual não tiver tempo e km, ignoramos (pois pode ser "dinheiro recebido")
            if (currentRace.tempo || currentRace.km) {
              result.push(currentRace);
            }
            currentRace = null;
          }
        }

        currentRace = {
          valor: valorStr,
          tempo: tempoMatch ? tempoMatch[1] : '',
          km: kmMatch ? kmMatch[1].replace(',', '.') : '',
          date: dateMatch ? parseData(dateMatch[0]) : '',
          hora: horaMatch ? horaMatch[1] : '',
          tipo: '',
          platform: ''
        };
      } else if (currentRace) {
        if (!currentRace.tempo && tempoMatch) {
          currentRace.tempo = tempoMatch[1];
        }
        if (!currentRace.km && kmMatch) {
          currentRace.km = kmMatch[1].replace(',', '.');
        }
        if (!currentRace.date && dateMatch) {
          currentRace.date = parseData(dateMatch[0]);
        }
        if (!currentRace.hora && horaMatch) {
          currentRace.hora = horaMatch[1];
        }
      }
    });
    if (currentRace) {
      // Só adiciona se a corrida tiver informações essenciais (tempo ou km)
      if (currentRace.tempo || currentRace.km) {
        result.push(currentRace);
      }
    }
    return result;
  }

  function combineDateTime(dateStr: string, timeStr: string): Date {
    const [day, month, year] = dateStr.split('/').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute);
  }

  function parseDuration(tempo: string): number {
    const minMatch = tempo.match(/(\d+)\s*min/);
    const secMatch = tempo.match(/(\d+)\s*seg/);
    const minutes = minMatch ? parseInt(minMatch[1], 10) : 0;
    const seconds = secMatch ? parseInt(secMatch[1], 10) : 0;
    return minutes + seconds / 60;
  }

  function parseData(dataStr: string): string {
    const meses: Record<string, string> = {
      jan: "01",
      fev: "02",
      mar: "03",
      abr: "04",
      mai: "05",
      jun: "06",
      jul: "07",
      ago: "08",
      set: "09",
      out: "10",
      nov: "11",
      dez: "12"
    };
    const regex = /(?:dom|seg|ter|qua|qui|sex|s[aá]b)[^0-9]*(\d{1,2}) de ([a-zçãé]+)(?: de (\d{4}))?/i;
    const match = dataStr.match(regex);
    if (match) {
      const day = match[1].padStart(2, '0');
      const monthAbbr = match[2].substring(0, 3).toLowerCase();
      const month = meses[monthAbbr] || "01";
      const year = match[3] ? match[3] : new Date().getFullYear().toString();
      return `${day}/${month}/${year}`;
    }
    return "";
  }

  const handleSaveRace = async (race: Corrida) => {
    if (!currentUser) return;
    try {
      // Se data e hora estiverem presentes, combine-as; senão, use a data atual
      const raceDate = (race.date && race.hora) ? combineDateTime(race.date, race.hora) : new Date();
      const payload = {
        amount: parseFloat(race.valor),
        date: raceDate, // Salvamos como objeto Date (o Firebase converte para Timestamp)
        description: "",
        duration: race.tempo ? parseDuration(race.tempo) : 0,
        mileage: race.km ? parseFloat(race.km) : 0,
        platform: race.platform || "",
        tip: race.taxaExtra ? parseFloat(race.taxaExtra) : 0,
      };
      await addEarning(currentUser.uid, payload);
      setCorridas(prev => prev.filter(r => r !== race));
      alert("Corrida salva com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar corrida:", error);
      alert("Erro ao salvar corrida.");
    }
  };

  const handleDelete = async (index: number) => {
    const race = corridas[index];
    if (!currentUser || !race.id) {
      setCorridas(prev => prev.filter((_, i) => i !== index));
      return;
    }
    try {
      await deleteEarning(currentUser.uid, race.id);
      setCorridas(prev => prev.filter((_, i) => i !== index));
      alert("Corrida deletada com sucesso!");
    } catch (error) {
      alert("Erro ao deletar corrida.");
    }
  };

  const handleUpdateRace = async (index: number, updatedRace: Corrida) => {
    await handleSaveRace(updatedRace);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Processar Print de Corridas (OCR em Português)</h1>
      <p className="text-muted-foreground">
        Faça upload do print do aplicativo para extrair automaticamente os dados das corridas.
      </p>

      <div className="space-y-4">
        <Input type="file" onChange={handleFileChange} />
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={handleOcr}
          disabled={!selectedFile || loading}
        >
          {loading ? `Processando... (${(progress * 100).toFixed(0)}%)` : "Processar Imagem"}
        </Button>
      </div>

      {ocrText && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Texto Reconhecido (Debug)</h2>
          <pre className="whitespace-pre-wrap bg-gray-800 p-4 rounded-md text-white">
            {ocrText}
          </pre>
        </div>
      )}

      {corridas.length > 0 && (
        <div className="mt-4 space-y-4">
          <h2 className="text-lg font-semibold">Corridas Extraídas</h2>
          {corridas.map((c, index) => (
            <div key={index} className="space-y-2">
              <CorridaCard
                corrida={c}
                index={index}
                onDelete={handleDelete}
                onSave={handleUpdateRace}
              />
              <Button onClick={() => handleSaveRace(c)} className="bg-green-600 hover:bg-green-700">
                Salvar Corrida #{index + 1}
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Link href="/earnings" className="text-primary underline">
          Voltar para Ganhos
        </Link>
      </div>
    </div>
  );
}
