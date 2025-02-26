"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Stepper from "@/components/ui/stepper";
import { useAuth } from "@/components/USER/Auth/AuthContext";
import { addEarning } from "@/lib/db/firebaseServices";
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
import { NumericFormat } from "react-number-format";

// Arrays de opções
const platformOptions = ["Uber", "99", "Ifood", "Indrive", "Particular"];
const rideTypeOptions = ["Passageiro", "Entrega", "Compras", "Comida"];
const timeOptions = ["15", "30", "45", "60", "75", "90"];
const steps = [
  { number: 1, label: "Plataforma e Tipo", icon: "user" },
  { number: 2, label: "KM e Tempo", icon: "mappin" },
  { number: 3, label: "Valor", icon: "dollar" },
  { number: 4, label: "Extras", icon: "clipboard" },
];

// Classes de estilo
const fieldInputClasses =
  "py-5 px-6 text-[1.2rem] h-[3rem] border border-gray-300 focus:border-blue-500 focus:outline-none";
const selectButtonClasses =
  "py-3 px-6 text-2xl h-[4rem] border border-gray-300 focus:border-blue-500";

// Tipagem
interface RegisterEarningsProps {
  onClose: () => void;
  onEarningAdded: () => void;
}

//
// COMPONENTES DOS STEPS – adicionamos onFocusCapture/onBlurCapture
//

interface StepProps {
  formValues: any;
  setFormValues: (v: any) => void;
  setInputFocused: (flag: boolean) => void;
}

const Step1: React.FC<StepProps> = ({ formValues, setFormValues, setInputFocused }) => (
  <div
    className="p-4 space-y-6"
    onFocusCapture={() => setInputFocused(true)}
    onBlurCapture={() => setInputFocused(false)}
  >
    <div className="grid grid-cols-2 gap-4">
      {platformOptions.map((option) => (
        <Button
          key={option}
          variant={formValues.platform === option ? "default" : "outline"}
          onClick={() => {
            setFormValues({ ...formValues, platform: option });
          }}
          className={`${selectButtonClasses} ${
            formValues.platform === option ? "bg-blue-600 text-white border-blue-600" : ""
          }`}
        >
          {option}
        </Button>
      ))}
    </div>
    <div className="grid grid-cols-2 gap-4">
      {rideTypeOptions.map((option) => (
        <Button
          key={option}
          variant={formValues.rideType === option ? "default" : "outline"}
          onClick={() => {
            setFormValues({ ...formValues, rideType: option });
          }}
          className={`${selectButtonClasses} ${
            formValues.rideType === option ? "bg-blue-600 text-white border-blue-600" : ""
          }`}
        >
          {option}
        </Button>
      ))}
    </div>
  </div>
);

const Step2: React.FC<StepProps> = ({ formValues, setFormValues, setInputFocused }) => (
  <div
    className="p-4 space-y-6"
    onFocusCapture={() => setInputFocused(true)}
    onBlurCapture={() => setInputFocused(false)}
  >
    <div>
      <NumericFormat
        thousandSeparator={true}
        suffix={" km"}
        customInput={Input}
        placeholder="Digite a quilometragem"
        value={formValues.mileage || ""}
        onValueChange={({ value }) => {
          setFormValues({ ...formValues, mileage: value });
        }}
        className={fieldInputClasses}
      />
    </div>
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
      <NumericFormat
        format="###"
        placeholder="Ou digite manualmente (máx 3 dígitos)"
        value={formValues.time || ""}
        onValueChange={({ value }) =>
          setFormValues({ ...formValues, time: value, timeOption: "" })
        }
        customInput={Input}
        className={fieldInputClasses}
      />
    </div>
  </div>
);

const Step3: React.FC<StepProps> = ({ formValues, setFormValues, setInputFocused }) => (
  <div
    className="p-4 space-y-6"
    onFocusCapture={() => setInputFocused(true)}
    onBlurCapture={() => setInputFocused(false)}
  >
    <NumericFormat
      thousandSeparator="."
      decimalSeparator=","
      prefix="R$ "
      fixedDecimalScale={true}
      decimalScale={2}
      customInput={Input}
      placeholder="Digite o valor"
      value={formValues.amount || ""}
      onValueChange={({ value }) => {
        setFormValues({ ...formValues, amount: value });
      }}
      className={fieldInputClasses}
    />
  </div>
);

const Step4: React.FC<StepProps> = ({ formValues, setFormValues, setInputFocused }) => (
  <div
    className="p-4 space-y-6"
    onFocusCapture={() => setInputFocused(true)}
    onBlurCapture={() => setInputFocused(false)}
  >
    <div className="flex items-center gap-4">
      <input
        type="checkbox"
        className="h-6 w-6"
        checked={formValues.useManualDate || false}
        onChange={(e) =>
          setFormValues({ ...formValues, useManualDate: e.target.checked })
        }
      />
      <Label className="text-2xl text-white">Usar data/hora personalizada?</Label>
    </div>
    {formValues.useManualDate && (
      <>
        <div>
          <Label className="mb-2 text-2xl text-white">Data</Label>
          <Input
            type="date"
            placeholder="Selecione a data"
            value={formValues.date || ""}
            onChange={(e) => setFormValues({ ...formValues, date: e.target.value })}
            className={fieldInputClasses}
          />
        </div>
        <div>
          <Label className="mb-2 text-2xl text-white">Hora</Label>
          <Input
            type="time"
            placeholder="Selecione a hora"
            value={formValues.time || ""}
            onChange={(e) => setFormValues({ ...formValues, time: e.target.value })}
            className={fieldInputClasses}
          />
        </div>
      </>
    )}
    <div className="flex items-center gap-4">
      <input
        type="checkbox"
        className="h-6 w-6"
        checked={formValues.showTip || false}
        onChange={(e) =>
          setFormValues({ ...formValues, showTip: e.target.checked })
        }
      />
      <Label className="text-2xl text-white">Recebeu gorjeta?</Label>
    </div>
    {formValues.showTip && (
      <div>
        <Label className="mb-2 text-2xl text-white">Gorjeta (R$)</Label>
        <NumericFormat
          thousandSeparator="."
          decimalSeparator=","
          prefix="R$ "
          fixedDecimalScale={true}
          decimalScale={2}
          customInput={Input}
          placeholder="Digite o valor da gorjeta"
          value={formValues.tip || ""}
          onValueChange={({ value }) =>
            setFormValues({ ...formValues, tip: value })
          }
          className={fieldInputClasses}
        />
      </div>
    )}
    <div className="flex items-center gap-4">
      <input
        type="checkbox"
        className="h-6 w-6"
        checked={formValues.showDescription || false}
        onChange={(e) =>
          setFormValues({ ...formValues, showDescription: e.target.checked })
        }
      />
      <Label className="text-2xl text-white">Adicionar anotações?</Label>
    </div>
    {formValues.showDescription && (
      <div>
        <Label className="mb-2 text-2xl text-white">Anotações</Label>
        <textarea
          rows={3}
          placeholder="Digite suas anotações"
          value={formValues.description || ""}
          onChange={(e) =>
            setFormValues({ ...formValues, description: e.target.value })
          }
          className="w-full p-6 text-[1.2rem] border-0 focus:ring-0"
        />
      </div>
    )}
  </div>
);

//
// COMPONENTE PRINCIPAL
//
interface Props {
  onClose: () => void;
  onEarningAdded: () => void;
}

export default function RegisterEarnings({ onClose, onEarningAdded }: Props) {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = steps.length;

  const [formValues, setFormValues] = useState<any>({
    platform: "",
    rideType: "",
    mileage: "",
    timeOption: "",
    time: "",
    amount: "",
    tip: "",
    description: "",
    date: "",
    useManualDate: false,
    showTip: false,
    showDescription: false,
  });

  // Estado para controle se algum input está focado
  const [isInputFocused, setInputFocused] = useState(false);
  // Guarda o timestamp da última alteração
  const [lastChange, setLastChange] = useState(Date.now());

  // Atualiza o lastChange em cada alteração
  function handleChange(newValues: any) {
    setFormValues({ ...formValues, ...newValues });
    setLastChange(Date.now());
  }

  // Auto-avança somente se o step estiver completo, nenhum input estiver focado e o usuário não estiver digitando (1s sem alteração)
  useEffect(() => {
    if (!isInputFocused && isStepComplete(currentStep) && currentStep < totalSteps) {
      const timer = setTimeout(() => {
        if (Date.now() - lastChange >= 1000) {
          setCurrentStep(currentStep + 1);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [formValues, currentStep, isInputFocused, lastChange, totalSteps]);

  function isStepComplete(step: number): boolean {
    switch (step) {
      case 1:
        return !!(formValues.platform && formValues.rideType);
      case 2:
        return !!(formValues.mileage && (formValues.time || formValues.timeOption));
      case 3:
        return !!formValues.amount;
      case 4:
        return true;
      default:
        return false;
    }
  }

  function renderStep() {
    switch (currentStep) {
      case 1:
        return <Step1 formValues={formValues} setFormValues={handleChange} setInputFocused={setInputFocused} />;
      case 2:
        return <Step2 formValues={formValues} setFormValues={handleChange} setInputFocused={setInputFocused} />;
      case 3:
        return <Step3 formValues={formValues} setFormValues={handleChange} setInputFocused={setInputFocused} />;
      case 4:
        return <Step4 formValues={formValues} setFormValues={handleChange} setInputFocused={setInputFocused} />;
      default:
        return null;
    }
  }

  async function handleSubmit() {
    if (!formValues.platform || !formValues.rideType || !formValues.mileage || !formValues.amount || (!formValues.timeOption && !formValues.time)) {
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
      date: customDateTime,
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
      // Reseta o formulário ao enviar
      setFormValues({
        platform: "",
        rideType: "",
        mileage: "",
        timeOption: "",
        time: "",
        amount: "",
        tip: "",
        description: "",
        date: "",
        useManualDate: false,
        showTip: false,
        showDescription: false,
      });
      setCurrentStep(1);
      onClose();
      onEarningAdded();
    } catch (error) {
      console.error("Erro ao adicionar ganho:", error);
      alert("Erro ao registrar ganho. Tente novamente.");
    }
  }

  // Animação de transição com Framer Motion
  const variants = {
    initial: { opacity: 0, x: 50 },
    enter: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.4 } },
  };

  return (
    <DialogContent className="sm:max-w-[600px] w-full p-6 bg-[#18192A] text-white">
      <DialogHeader className="mb-6 text-center">
        <DialogTitle className="text-2xl">Registrar Ganho</DialogTitle>
        <DialogDescription className="text-lg">Registre seus ganhos diários.</DialogDescription>
        <div className="flex justify-center">
        <Stepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={(stepNumber) => setCurrentStep(stepNumber)}
            className="my-custom-stepper-class" // se quiser classes extras
          />
        </div>
      </DialogHeader>

      {/* Conteúdo dos Steps com transição */}
      <div style={{ position: "relative", minHeight: "250px" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={variants}
            initial="initial"
            animate="enter"
            exit="exit"
            style={{ position: "relative", width: "100%" }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Rodapé fixo de navegação */}
      <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-600">
        <Button onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))} disabled={currentStep === 1}>
          Voltar
        </Button>
        <div className="text-sm">Passo {currentStep} de {totalSteps}</div>
        {currentStep < totalSteps ? (
          <Button onClick={() => setCurrentStep((prev) => Math.min(totalSteps, prev + 1))}>
            Próximo
          </Button>
        ) : (
          <Button onClick={handleSubmit} className="bg-green-600 text-white">
            Enviar
          </Button>
        )}
      </div>
    </DialogContent>
  );
}
