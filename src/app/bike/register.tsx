'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormField,
  FormControl,
  FormLabel,
  FormMessage,
  FormItem,
  FormDescription,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/components/USER/Auth/AuthContext';
import { registerBike, getBikeData } from '@/lib/db/firebaseServices';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { faCarSide, faWrench, faGasPump, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BikeCard } from '@/app/bike/components/BikeCard';
import brandsData from '@/data/brands.json';

interface BikeData {
  make: string;
  model: string;
  year: number;
  plate: string;
  color: string;
  initialMileage: number;
  oilChangeInterval: number;
  relationChangeKm: number;
  oilChangeKm: number;
  lubricationKm: number;
  lastMaintenance: string;
  tankVolume: number;
  averageConsumption: number | null;
}

const defaultValues: BikeData = {
  make: '',
  model: '',
  year: new Date().getFullYear(),
  plate: '',
  color: '',
  initialMileage: 0,
  oilChangeInterval: 0,
  relationChangeKm: 0,
  oilChangeKm: 0,
  lubricationKm: 0,
  lastMaintenance: '',
  tankVolume: 0,
  averageConsumption: null,
};

const years = Array.from({ length: new Date().getFullYear() - 2015 + 1 }, (_, i) => 2015 + i);

function toNumber(val: unknown) {
  if (typeof val === 'string') {
    const numeric = val.replace(/[^\d]/g, '');
    return numeric ? Number(numeric) : 0;
  }
  return val;
}

const bikeSchema = z.object({
  make: z.string().min(1, { message: 'A marca é obrigatória' }),
  model: z.string().min(1, { message: 'O modelo é obrigatório' }),
  year: z.preprocess(
    toNumber,
    z.number()
      .min(2015, { message: 'Selecione um ano entre 2015 e o atual' })
      .max(new Date().getFullYear(), { message: 'Ano inválido' })
  ),
  plate: z.string().regex(/^\d{4}-\d{3}$/, { message: 'Placa inválida. Formato esperado: 1234-567' }),
  color: z.string().min(1, { message: 'A cor é obrigatória' }),
  initialMileage: z.preprocess(toNumber, z.number().min(0, { message: 'Quilometragem inválida' })),
  oilChangeInterval: z.preprocess(toNumber, z.number().min(0, { message: 'Intervalo inválido' })),
  relationChangeKm: z.preprocess(toNumber, z.number().min(0, { message: 'Quilometragem inválida' })),
  oilChangeKm: z.preprocess(toNumber, z.number().min(0, { message: 'Quilometragem inválida' })),
  lubricationKm: z.preprocess(toNumber, z.number().min(0, { message: 'Quilometragem inválida' })),
  lastMaintenance: z.string().optional(),
  tankVolume: z.preprocess(toNumber, z.number().min(0, { message: 'Volume inválido' })),
  averageConsumption: z.preprocess(toNumber, z.number().min(0).nullable().optional()),
});

function formatMileage(value: number): string {
  if (value < 1000) {
    const padded = String(value).padStart(3, '0');
    return `0.${padded} km`;
  } else {
    return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value) + ' km';
  }
}

export default function RegisterBikePage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [bikeData, setBikeData] = useState<BikeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "maintenance" | "fuel">('info');

  // Estado para a marca selecionada e lista de modelos
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [availableModels, setAvailableModels] = useState<{ model: string; cc: number }[]>([]);

  // Inicializa o formulário com RHF
  const formMethods = useForm<BikeData>({
    resolver: zodResolver(bikeSchema),
    defaultValues: defaultValues,
    mode: 'onSubmit',
  });
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = formMethods;

  const mileageValue = watch('initialMileage');

  // Carrega os dados do DB e normaliza os valores
  useEffect(() => {
    async function fetchData() {
      if (!currentUser) return;
      setIsLoading(true);
      try {
        const data = await getBikeData(currentUser.uid);
        console.log('DB data =>', data);
        if (data) {
          // Use trim para remover espaços extras
          const brandNormalized = (data.make || '').trim();
          const modelNormalized = (data.model || '').trim();
          const newData = { ...data, make: brandNormalized, model: modelNormalized };
          setBikeData(newData);
          reset(newData);
          // Defina a marca e os modelos com base no DB
          setSelectedBrand(brandNormalized);
          if (brandNormalized && brandsData[brandNormalized]) {
            setAvailableModels(brandsData[brandNormalized]);
          }
        } else {
          setBikeData(null);
          reset(defaultValues);
        }
      } catch (err) {
        console.error('Erro ao buscar dados da moto:', err);
        toast({
          title: 'Erro!',
          description: 'Erro ao buscar dados da moto.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
    if (currentUser) fetchData();
  }, [currentUser, reset, toast]);

  // Atualiza a lista de modelos quando a marca selecionada mudar
  useEffect(() => {
    if (selectedBrand && brandsData[selectedBrand]) {
      setAvailableModels(brandsData[selectedBrand]);
      // NÃO limpamos o modelo automaticamente; queremos manter o valor carregado
    }
  }, [selectedBrand]);

  // Lida com a placa (insere hífen automaticamente)
  function handlePlateChange(value: string) {
    let numeric = value.replace(/[^\d]/g, '');
    if (numeric.length > 4) {
      numeric = numeric.slice(0, 4) + '-' + numeric.slice(4, 7);
    }
    setValue('plate', numeric);
  }

  // Botões preset de quilometragem
  function setMileagePreset(mileage: number) {
    setValue('initialMileage', mileage);
  }

  async function onSubmit(data: BikeData) {
    setFormLoading(true);
    try {
      if (!currentUser) throw new Error('Usuário não autenticado');
      await registerBike(currentUser.uid, data);
      setBikeData(data);
      toast({
        title: 'Sucesso!',
        description: 'Dados da moto atualizados!',
        className: 'bg-green-500 text-white',
      });
    } catch (err: any) {
      console.error('Erro ao registrar moto:', err);
      toast({
        title: 'Erro!',
        description: 'Erro ao registrar moto. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Registrar Moto</h1>

      <BikeCard bikeData={bikeData} isLoading={isLoading} />

      <Card className="mb-4">
        <CardContent>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="justify-center">
              <TabsTrigger value="info">
                <FontAwesomeIcon icon={faCarSide} className="mr-2" />
                Informações da Moto
              </TabsTrigger>
              <TabsTrigger value="maintenance">
                <FontAwesomeIcon icon={faWrench} className="mr-2" />
                Manutenção
              </TabsTrigger>
              <TabsTrigger value="fuel">
                <FontAwesomeIcon icon={faGasPump} className="me-2" />
                Abastecimento
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <Form {...formMethods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Linha: Marca e Modelo */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Marca */}
                    <FormField
                      control={control}
                      name="make"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marca</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={(val) => {
                                const brandNormalized = val.trim();
                                field.onChange(brandNormalized);
                                setSelectedBrand(brandNormalized);
                              }}
                              value={field.value || ''}
                            >
                              <SelectTrigger className={`w-full bg-gray-800 ${errors.make ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder="Selecione a marca" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800">
                                {Object.keys(brandsData).map((brand) => (
                                  <SelectItem key={brand} value={brand}>
                                    {brand}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage>{errors.make?.message}</FormMessage>
                        </FormItem>
                      )}
                    />

                    {/* Modelo */}
                    <FormField
                      control={control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modelo</FormLabel>
                          <FormControl>
                            {/* A propriedade key força a remontagem quando a marca muda */}
                            <Select key={selectedBrand} onValueChange={field.onChange} value={field.value || ''}>
                              <SelectTrigger className={`w-full bg-gray-800 ${errors.model ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder="Selecione o modelo" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800">
                                {availableModels.map((m) => (
                                  <SelectItem key={m.model} value={m.model}>
                                    {m.model} ({m.cc} cc)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage>{errors.model?.message}</FormMessage>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Linha: Ano e Placa */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Ano */}
                    <FormField
                      control={control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ano</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={(val) => field.onChange(Number(val))}
                              value={field.value ? field.value.toString() : ''}
                            >
                              <SelectTrigger className={`w-full bg-gray-800 ${errors.year ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder="Selecione o ano" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800">
                                {years.map((yearOption) => (
                                  <SelectItem key={yearOption} value={yearOption.toString()}>
                                    {yearOption}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage>{errors.year?.message}</FormMessage>
                        </FormItem>
                      )}
                    />

                    {/* Placa */}
                    <FormField
                      control={control}
                      name="plate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Placa</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite a placa (ex.: 1234-567)"
                              value={field.value}
                              onChange={(e) => {
                                let numeric = e.target.value.replace(/[^\d]/g, '');
                                if (numeric.length > 4) {
                                  numeric = numeric.slice(0, 4) + '-' + numeric.slice(4, 7);
                                }
                                field.onChange(numeric);
                              }}
                              className={`${errors.plate ? 'border-red-500' : ''}`}
                            />
                          </FormControl>
                          <FormMessage>{errors.plate?.message}</FormMessage>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Linha: Cor e Quilometragem */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Cor */}
                    <FormField
                      control={control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cor</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                              <SelectTrigger className={`w-full bg-gray-800 ${errors.color ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder="Selecione a cor" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800">
                                {['Preto', 'Branco', 'Vermelho', 'Azul'].map((colorOption) => (
                                  <SelectItem key={colorOption} value={colorOption}>
                                    {colorOption}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage>{errors.color?.message}</FormMessage>
                        </FormItem>
                      )}
                    />

                    {/* Quilometragem */}
                    <FormField
                      control={control}
                      name="initialMileage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quilometragem Inicial (km)</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Digite a quilometragem"
                              {...field}
                              className={`${errors.initialMileage ? 'border-red-500' : ''}`}
                            />
                          </FormControl>
                          <div className="mt-2 flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => setMileagePreset(0)}>
                              0 km
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setMileagePreset(500)}>
                              500 km
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setMileagePreset(1000)}>
                              1.000 km
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setMileagePreset(10000)}>
                              10.000 km
                            </Button>
                          </div>
                          <FormMessage>{errors.initialMileage?.message}</FormMessage>
                          <FormDescription>
                            <FontAwesomeIcon icon={faInfoCircle} className="mr-1 inline-block h-3 w-3" />
                            Valor formatado: {formatMileage(mileageValue)}
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={formLoading}
                    className="w-full bg-green-500 hover:bg-green-600 text-white mt-4"
                  >
                    {bikeData ? 'Atualizar Informações' : 'Registrar Moto'}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="maintenance">
              <div>
                <p>Aqui você poderá definir intervalos de manutenção e trocas de peças.</p>
              </div>
            </TabsContent>

            <TabsContent value="fuel">
              <div>
                <p>Aqui você poderá cadastrar a capacidade do tanque e definir a média de consumo.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Button
        variant="secondary"
        onClick={() => router.push('/bike/view')}
        className="ml-2 w-full md:w-auto"
      >
        Visualizar Moto
      </Button>
    </div>
  );
}
