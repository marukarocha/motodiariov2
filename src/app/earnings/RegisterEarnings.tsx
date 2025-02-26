"use client";

import React, { useState, useRef } from "react";
import StepWizard, { ReactStepWizard } from "react-step-wizard";
import { useAuth } from "@/components/USER/Auth/AuthContext";
import { addEarning } from "@/lib/db/firebaseServices";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface RegisterEarningsProps {
  onClose: () => void;
  onEarningAdded: () => void;
}

const platformOptions = ["Uber", "99", "Ifood", "Indrive", "Particular"];
const rideTypeOptions = ["Passageiro", "Entrega", "Compras", "Comida"];
const timeOptions = ["15", "30", "45", "60", "75", "90"]; // tempo em minutos

// Classes para inputs grandes (KM, Valor, Data, Hora)
const fieldInputClasses =
  "py-5 px-6 text-[3rem] h-[5rem] border border-gray-300 focus:border-blue-500 focus:outline-none";
// Classes para os botões de seleção (tamanho moderado)
const selectButtonClasses =
  "py-3 px-6 text-2xl h-[4rem] border border-gray-300 focus:border-blue-500";
// Container para cada etapa com overflow
const stepContainerClasses = "overflow-auto max-h-[80vh] pb-8";

// Botões de navegação inferiores – aparecem somente na parte inferior
function StepNavigation({
  previousStep,
  nextStep,
  onSubmit,
}: {
  previousStep?: () => void;
  nextStep?: () => void;
  onSubmit?: () => void;
}) {
  return (
    <div className="flex justify-center items-center gap-6 mt-6">
      {previousStep && (
        <Button
          variant="ghost"
          onClick={previousStep}
          className="w-20 h-20 rounded-full border border-gray-300 flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
      )}
      {nextStep ? (
        <Button
          variant="ghost"
          onClick={nextStep}
          className="w-20 h-20 rounded-full border border-gray-300 flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      ) : onSubmit ? (
        <Button
          variant="ghost"
          onClick={onSubmit}
          className="w-20 h-20 rounded-full border border-gray-300 flex items-center justify-center bg-green-600 text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </Button>
      ) : null}
    </div>
  );
}

// Step 1: Plataforma e Tipo de Corrida
function Step1({
  nextStep,
  setFormValues,
  formValues,
}: {
  nextStep: () => void;
  setFormValues: (values: any) => void;
  formValues: any;
}) {
  return (
    <div className={`${stepContainerClasses} space-y-6`}>
      <div>
        <Label className="mb-2 text-2xl">Plataforma</Label>
        <div className="grid grid-cols-2 gap-4">
          {platformOptions.map((option) => (
            <Button
              key={option}
              variant={formValues.platform === option ? "default" : "outline"}
              onClick={() => setFormValues({ ...formValues, platform: option })}
              className={`${selectButtonClasses} ${
                formValues.platform === option ? "bg-blue-600 text-white border-blue-600" : ""
              }`}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
      <div>
        <Label className="mb-2 text-2xl">Tipo de Corrida</Label>
        <div className="grid grid-cols-2 gap-4">
          {rideTypeOptions.map((option) => (
            <Button
              key={option}
              variant={formValues.rideType === option ? "default" : "outline"}
              onClick={() => setFormValues({ ...formValues, rideType: option })}
              className={`${selectButtonClasses} ${
                formValues.rideType === option ? "bg-blue-600 text-white border-blue-600" : ""
              }`}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
      <StepNavigation nextStep={nextStep} />
    </div>
  );
}

// Step 2: Quilometragem e Tempo da Corrida
function Step2({
  nextStep,
  previousStep,
  setFormValues,
  formValues,
}: {
  nextStep: () => void;
  previousStep: () => void;
  setFormValues: (values: any) => void;
  formValues: any;
}) {
  return (
    <div className={`${stepContainerClasses} space-y-6`}>
      <StepNavigation previousStep={previousStep} nextStep={nextStep} />
      <div>
        <Label className="mb-2 text-2xl">KM Rodado</Label>
        <Input
          type="number"
          placeholder="Digite a quilometragem"
          value={formValues.mileage || ""}
          onChange={(e) => setFormValues({ ...formValues, mileage: e.target.value })}
          className={fieldInputClasses}
        />
      </div>
      <div>
        <Label className="mb-2 text-2xl">Tempo da Corrida (minutos)</Label>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {timeOptions.map((option) => (
              <Button
                key={option}
                variant={formValues.timeOption === option ? "default" : "outline"}
                onClick={() =>
                  setFormValues({ ...formValues, timeOption: option, time: "" })
                }
                className={`${selectButtonClasses} ${
                  formValues.timeOption === option ? "bg-blue-600 text-white border-blue-600" : ""
                }`}
              >
                {option} min
              </Button>
            ))}
          </div>
          <Input
            type="number"
            placeholder="Ou digite manualmente (máx 3 dígitos)"
            value={formValues.time || ""}
            onChange={(e) =>
              setFormValues({ ...formValues, time: e.target.value, timeOption: "" })
            }
            className={fieldInputClasses}
          />
        </div>
      </div>
      <StepNavigation previousStep={previousStep} nextStep={nextStep} />
    </div>
  );
}

// Step 3: Valor da Corrida
function Step3({
  nextStep,
  previousStep,
  setFormValues,
  formValues,
}: {
  nextStep: () => void;
  previousStep: () => void;
  setFormValues: (values: any) => void;
  formValues: any;
}) {
  return (
    <div className={`${stepContainerClasses} space-y-6`}>
      <StepNavigation previousStep={previousStep} nextStep={nextStep} />
      <div>
        <Label className="mb-2 text-2xl">Valor (R$)</Label>
        <Input
          type="number"
          placeholder="Digite o valor"
          value={formValues.amount || ""}
          onChange={(e) => setFormValues({ ...formValues, amount: e.target.value })}
          className={fieldInputClasses}
        />
      </div>
      <StepNavigation previousStep={previousStep} nextStep={nextStep} />
    </div>
  );
}

// Step 4: Informações Adicionais
function Step4({
  previousStep,
  setFormValues,
  formValues,
  onSubmit,
}: {
  previousStep: () => void;
  setFormValues: (values: any) => void;
  formValues: any;
  onSubmit: () => void;
}) {
  // Aqui, usamos a variável "useManualDate" do pai para definir se os campos de data/hora serão exibidos.
  // Vamos adicionar um checkbox que atualize essa variável via setFormValues.
  return (
    <div className={`${stepContainerClasses} space-y-6`}>
      <StepNavigation previousStep={previousStep} />
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            className="h-6 w-6"
            checked={formValues.useManualDate || false}
            onChange={(e) =>
              setFormValues({ ...formValues, useManualDate: e.target.checked })
            }
          />
          <Label className="text-2xl">Usar data/hora personalizada?</Label>
        </div>
        {formValues.useManualDate && (
          <>
            <div>
              <Label className="mb-2 text-2xl">Data</Label>
              <Input
                type="date"
                placeholder="Selecione a data"
                value={formValues.date || ""}
                onChange={(e) =>
                  setFormValues({ ...formValues, date: e.target.value })
                }
                className={fieldInputClasses}
              />
            </div>
            <div>
              <Label className="mb-2 text-2xl">Hora</Label>
              <Input
                type="time"
                placeholder="Selecione a hora"
                value={formValues.time || ""}
                onChange={(e) =>
                  setFormValues({ ...formValues, time: e.target.value })
                }
                className={fieldInputClasses}
              />
            </div>
          </>
        )}
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            className="h-6 w-6"
            onChange={(e) =>
              setFormValues({ ...formValues, showTip: e.target.checked })
            }
          />
          <Label className="text-2xl">Recebeu gorjeta?</Label>
        </div>
        {formValues.showTip && (
          <div>
            <Label className="mb-2 text-2xl">Gorjeta (R$)</Label>
            <Input
              type="number"
              placeholder="Digite o valor da gorjeta"
              value={formValues.tip || ""}
              onChange={(e) =>
                setFormValues({ ...formValues, tip: e.target.value })
              }
              className={fieldInputClasses}
            />
          </div>
        )}
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            className="h-6 w-6"
            onChange={(e) =>
              setFormValues({ ...formValues, showDescription: e.target.checked })
            }
          />
          <Label className="text-2xl">Adicionar anotações?</Label>
        </div>
        {formValues.showDescription && (
          <div>
            <Label className="mb-2 text-2xl">Anotações</Label>
            <textarea
              rows={3}
              placeholder="Digite suas anotações"
              value={formValues.description || ""}
              onChange={(e) =>
                setFormValues({ ...formValues, description: e.target.value })
              }
              className="w-full p-6 text-[3rem] border-0 focus:ring-0"
            />
          </div>
        )}
      </div>
      <StepNavigation previousStep={previousStep} onSubmit={onSubmit} />
    </div>
  );
}

export default function RegisterEarnings({ onClose, onEarningAdded }: RegisterEarningsProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const wizardRef = useRef<ReactStepWizard>(null);

  // Incluímos "useManualDate", "showTip" e "showDescription" no estado do formulário para gerenciar a exibição
  const [formValues, setFormValues] = useState({
    platform: "",
    rideType: "",
    mileage: "",
    timeOption: "",
    time: "",
    amount: "",
    tip: "",
    description: "",
    duration: "",
    date: "",
    useManualDate: false,
    showTip: false,
    showDescription: false,
  });

  const handleSubmit = async () => {
    if (
      !formValues.platform ||
      !formValues.rideType ||
      !formValues.mileage ||
      !formValues.amount ||
      (!formValues.timeOption && !formValues.time)
    ) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const durationValue =
      formValues.timeOption !== ""
        ? parseInt(formValues.timeOption, 10)
        : formValues.time !== ""
        ? parseInt(formValues.time, 10)
        : 0;

    const customDateTime =
      formValues.useManualDate && formValues.date && formValues.time
        ? new Date(`${formValues.date}T${formValues.time}:00`)
        : new Date();

    const earning = {
      date: customDateTime, // Timestamp completo
      amount: parseFloat(formValues.amount),
      mileage: parseFloat(formValues.mileage),
      platform: formValues.platform,
      rideType: formValues.rideType,
      duration: durationValue,
      tip: formValues.tip ? parseFloat(formValues.tip) : 0,
      description: formValues.description,
    };

    try {
      await addEarning(currentUser!.uid, earning);
      toast({
        title: "Ganho registrado com sucesso!",
        variant: "success",
        className: "bg-green-700 text-white",
      });
      onClose();
      onEarningAdded();
    } catch (error) {
      console.error("Erro ao adicionar ganho:", error);
      alert("Erro ao registrar ganho. Tente novamente.");
    }
  };

  return (
    <DialogContent className="sm:max-w-[600px] w-full p-6 bg-[#f8fafc] dark:bg-[#18192A]">
      <DialogHeader className="mb-6">
        <DialogTitle className="text-2xl">Registrar Ganho</DialogTitle>
        <DialogDescription className="text-lg">Registre seus ganhos diários.</DialogDescription>
      </DialogHeader>
      <StepWizard instance={(instance) => (wizardRef.current = instance)} transitions={false}>
        <Step1 setFormValues={setFormValues} formValues={formValues} nextStep={() => wizardRef.current?.nextStep()} />
        <Step2 setFormValues={setFormValues} formValues={formValues} previousStep={() => wizardRef.current?.previousStep()} nextStep={() => wizardRef.current?.nextStep()} />
        <Step3 setFormValues={setFormValues} formValues={formValues} previousStep={() => wizardRef.current?.previousStep()} nextStep={() => wizardRef.current?.nextStep()} />
        <Step4 setFormValues={setFormValues} formValues={formValues} previousStep={() => wizardRef.current?.previousStep()} onSubmit={handleSubmit} />
      </StepWizard>
    </DialogContent>
  );
}
