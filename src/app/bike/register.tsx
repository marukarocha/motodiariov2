'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormControl, FormLabel, FormMessage, FormItem, FormDescription } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/components/USER/Auth/AuthContext';
import { registerBike, getBikeData } from '@/lib/db/firebaseServices';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { faMotorcycle, faCarSide, faTachometerAlt, faCalendarAlt, faPalette, faPlus, faOilCan, faWrench, faGasPump, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BikeCard } from '@/app/bike/components/BikeCard';


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
  lubricationKm: string;
  lastMaintenance: string;
  tankVolume: number;
  averageConsumption: number | null;
}

const models = ['Modelo 1', 'Modelo 2', 'Modelo 3'];
const colors = ['Preto', 'Branco', 'Vermelho', 'Azul'];
const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

const bikeSchema = z.object({
  make: z.string().min(1, { message: 'A marca é obrigatória' }),
  model: z.string().min(1, { message: 'O modelo é obrigatório' }),
  year: z.number().min(1900, { message: 'Ano inválido' }).max(new Date().getFullYear(), { message: 'Ano inválido' }),
  plate: z.string().min(7, { message: 'Placa inválida' }),
  color: z.string().min(1, { message: 'A cor é obrigatória' }),
  initialMileage: z.number().min(0, { message: 'Quilometragem inválida' }),
  oilChangeInterval: z.number().min(0, { message: 'Intervalo inválido' }),
  relationChangeKm: z.number().min(0, { message: 'Quilometragem inválida' }),
  oilChangeKm: z.number().min(0, { message: 'Quilometragem inválida' }),
  lubricationKm: z.number().min(0, { message: 'Quilometragem inválida' }),
  lastMaintenance: z.string().optional(),
  tankVolume: z.number().min(0, { message: 'Volume inválido' }),
  averageConsumption: z.number().min(0).nullable().optional(),
});

export default function RegisterBikePage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [bikeData, setBikeData] = useState<BikeData | null>(null);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "maintenance" | "fuel">('info'); // Define activeTab type
  const form = useForm<BikeData>({
    resolver: zodResolver(bikeSchema),
    defaultValues: bikeData || {},
    mode: 'onSubmit',
  });
  const { control, handleSubmit, reset, setValue, formState: { errors }, } = form;
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    const fetchBikeData = async () => {
        try {
          const data = await getBikeData(currentUser?.uid || '');
          if (data) {
            setBikeData(data);
            reset(data);
          } else {
            setBikeData(null); // Explicitly set bikeData to null if no data is returned
          }
        } catch (error) {
          console.error('Erro ao buscar dados da moto:', error);
          toast({
            title: 'Erro!',
            description: 'Erro ao buscar dados da moto.',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      };
      if (currentUser) {
        setIsLoading(true);
        fetchBikeData();
      } else {
        setIsLoading(false); // If no currentUser, also set loading to false
      }
    }, [currentUser, toast, reset]);
  
    useEffect(() => {
      if (bikeData) {
        reset(bikeData);
      }
    }, [bikeData, reset]);


  

  const onSubmit = async (data: BikeData) => {
    setFormLoading(true);
    setFormError('');
    try {
      if (!currentUser) throw new Error('Usuario não autenticado');
      await registerBike(currentUser.uid, data);
      setBikeData(data);
      toast({ title: 'Sucesso!', description: 'Dados da moto atualizados!', className: 'bg-green-500 text-white' }); // Toast verde
    } catch (error: any) {
      setFormError(error.message);
      toast({
        title: 'Erro!',
        description: 'Erro ao registrar moto. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

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
              <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name="make"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marca</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite a marca" {...field} />
                          </FormControl>
                          <FormMessage>{errors.make?.message}</FormMessage>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modelo</FormLabel>
                          <FormControl>
                            <Select control={control} {...field}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione o modelo" />
                              </SelectTrigger>
                              <SelectContent>
                                {models.map((model) => (
                                  <SelectItem key={model} value={model}>
                                    {model}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                        control={control}
                        name="year"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ano</FormLabel>
                            <FormControl>
                              <Select control={control} {...field}>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Selecione o ano" />
                                </SelectTrigger>
                                <SelectContent>
                                  {years.map((yearOption) => (
                                    <SelectItem key={yearOption} value={yearOption}>
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
                    <FormField
                      control={control}
                      name="plate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Placa</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite a placa" {...field} />
                          </FormControl>
                          <FormMessage>{errors.plate?.message}</FormMessage>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cor</FormLabel>
                          <FormControl>
                            <Select control={control} {...field}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione a cor" />
                              </SelectTrigger>
                              <SelectContent>
                                {colors.map((colorOption) => (
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
                    <FormField
                      controlId="initialMileage"
                      name="initialMileage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quilometragem Inicial (km)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="KM Inicial" {...field} />
                          </FormControl>
                          <FormMessage>{errors.initialMileage?.message}</FormMessage>
                          <FormDescription>
                            <FontAwesomeIcon icon={faInfoCircle} className="mr-1 inline-block h-3 w-3" />
                            Informe a quilometragem atual da sua moto.
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="maintenance">
              <div>
                Conteúdo da aba Manutenção
              </div>
            </TabsContent>
            <TabsContent value="fuel">
              <div>
                Conteúdo da aba Abastecimento
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Button type="submit" onClick={handleSubmit(onSubmit)} disabled={formLoading} className="w-full">
        {bikeData ? 'Atualizar Informações' : 'Registrar Moto'}
      </Button>
      <Button variant="secondary" onClick={() => router.push('/bike/view')} className="ml-2 w-full md:w-auto">
        Visualizar Moto
      </Button>
    </div>
  );
}
