"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Stepper from "@/components/ui/stepper";
import { useAuth } from "@/components/USER/Auth/AuthContext";
import { addEarning, getUserProfile } from "@/lib/db/firebaseServices";
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
import { User, MapPin, DollarSign, ClipboardList } from "lucide-react";

// Ride type agora será filtrado dinamicamente a partir da plataforma selecionada.
// timeOptions e steps permanecem fixos.
const timeOptions = ["15", "30", "45", "60", "75", "90"];
const steps = [
  { number: 1, label: "Plataforma e Tipo", icon: User },
  { number: 2, label: "KM e Tempo", icon: MapPin },
  { number: 3, label: "Valor", icon: DollarSign },
  { number: 4, label: "Extras", icon: ClipboardList },
];

const fieldInputClasses =
  "py-5 px-6 text-[1.2rem] h-[3rem] border border-gray-300 focus:border-blue-500 focus:outline-none";
const selectButtonClasses =
  "py-3 px-6 text-2xl h-[4rem] border border-gray-300 focus:border-blue-500";

// STEP 1 – Atualizado para separar Plataforma e Tipo de Corrida
// Recebe:
//   - formValues, setFormValues, setInputFocused (controle do formulário)
//   - platformOptions: array de { id, name, associatedRaceTypes }
//   - allRideTypes: array de { id, type }
const Step1 = ({
  formValues,
  setFormValues,
  setInputFocused,
  platformOptions,
  allRideTypes,
}) => {
  const selectedPlatformObj = platformOptions.find(
    (p) => p.name === formValues.platform
  );
  const filteredRideTypes =
    selectedPlatformObj && selectedPlatformObj.associatedRaceTypes
      ? allRideTypes.filter((rt) =>
          selectedPlatformObj.associatedRaceTypes.includes(rt.id)
        )
      : [];

  let instructionText = "";
  if (!formValues.platform) {
    instructionText = "Selecione a plataforma da corrida";
  } else if (!formValues.rideType) {
    instructionText = "Selecione o tipo de corrida";
  } else {
    instructionText = "Pronto!";
  }

  return (
    <div
      className="p-4 space-y-6"
      onFocusCapture={() => setInputFocused(true)}
      onBlurCapture={() => setInputFocused(false)}
    >
      {/* Campo de instrução com fade */}
      <div className="p-2 rounded-md bg-yellow-100 text-yellow-900 text-center text-sm font-medium transition-opacity duration-300">
        {instructionText}
      </div>

      {/* Seção: Plataforma */}
      <div>
        <Label className="mb-2 text-base font-semibold">Plataforma</Label>
        {platformOptions && platformOptions.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {platformOptions.map((option) => (
              <Button
                key={option.id}
                variant={formValues.platform === option.name ? "default" : "outline"}
                onClick={() =>
                  setFormValues({ ...formValues, platform: option.name, rideType: "" })
                }
                className={`py-2 px-3 text-sm h-[3rem] border ${
                  formValues.platform === option.name
                    ? "bg-blue-600 text-white border-blue-600"
                    : ""
                }`}
              >
                {option.name}
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Nenhuma plataforma configurada. Atualize seu perfil.
          </p>
        )}
      </div>

      {/* Seção: Tipo de Corrida */}
      <div>
        {selectedPlatformObj && filteredRideTypes.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {filteredRideTypes.map((option) => (
              <Button
                key={option.id}
                variant={formValues.rideType === option.type ? "default" : "outline"}
                onClick={() =>
                  setFormValues({ ...formValues, rideType: option.type })
                }
                className={`py-2 px-3 text-sm h-[3rem] border ${
                  formValues.rideType === option.type
                    ? "bg-blue-600 text-white border-blue-600"
                    : ""
                }`}
              >
                {option.type}
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            {selectedPlatformObj
              ? "Nenhum tipo de corrida associado à plataforma selecionada."
              : "Selecione uma plataforma para ver os tipos de corrida."}
          </p>
        )}
      </div>
    </div>
  );
};

const Step2 = ({ formValues, setFormValues, setInputFocused }) => (
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
        onValueChange={({ value }) => setFormValues({ ...formValues, mileage: value })}
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
      <Input
        type="time"
        placeholder="Ou digite manualmente"
        value={formValues.time || ""}
        onChange={(e) =>
          setFormValues({ ...formValues, time: e.target.value, timeOption: "" })
        }
        className={fieldInputClasses}
      />
    </div>
  </div>
);

const Step3 = ({ formValues, setFormValues, setInputFocused }) => (
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
      onValueChange={({ value }) => setFormValues({ ...formValues, amount: value })}
      className={fieldInputClasses}
    />
  </div>
);

const Step4 = ({ formValues, setFormValues, setInputFocused }) => (
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
          onValueChange={({ value }) => setFormValues({ ...formValues, tip: value })}
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
          onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
          className="w-full p-6 text-[1.2rem] border-0 focus:ring-0"
        />
      </div>
    )}
  </div>
);

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

  // Estados para as plataformas do usuário e todos os ride types
  const [userPlatforms, setUserPlatforms] = useState<
    { id: string; name: string; associatedRaceTypes: string[] }[]
  >([]);
  const [allRideTypes, setAllRideTypes] = useState<{ id: string; type: string }[]>([]);

  const [isInputFocused, setInputFocused] = useState(false);
  const [lastChange, setLastChange] = useState(Date.now());

  function handleChange(newValues: any) {
    setFormValues({ ...formValues, ...newValues });
    setLastChange(Date.now());
  }

  useEffect(() => {
    if (isStepComplete(currentStep) && currentStep < totalSteps && !isInputFocused) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [formValues, currentStep, lastChange, totalSteps, isInputFocused]);

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

  // Busca as plataformas configuradas pelo usuário
  useEffect(() => {
    async function fetchUserPlatforms() {
      if (!currentUser) return;
      try {
        const profile = await getUserProfile(currentUser.uid);
        if (profile && profile.preferredPlatforms && profile.preferredPlatforms.length > 0) {
          const res = await fetch("/api/admin/platforms");
          const allPlatforms = await res.json();
          const filtered = allPlatforms.filter((p: any) =>
            profile.preferredPlatforms.includes(p.id)
          );
          setUserPlatforms(filtered);
          // Inicia sem seleção, deixando os campos vazios
          handleChange({ platform: "", rideType: "" });
        }
      } catch (error) {
        console.error("Erro ao buscar plataformas do usuário:", error);
      }
    }
    fetchUserPlatforms();
  }, [currentUser]);

  // Busca todos os ride types
  useEffect(() => {
    async function fetchRideTypes() {
      try {
        const res = await fetch("/api/admin/raceTypes");
        const data = await res.json();
        setAllRideTypes(data);
      } catch (error) {
        console.error("Erro ao buscar tipos de corrida:", error);
      }
    }
    fetchRideTypes();
  }, []);

  function renderStep() {
    switch (currentStep) {
      case 1:
        return (
          <Step1
            formValues={formValues}
            setFormValues={handleChange}
            setInputFocused={setInputFocused}
            platformOptions={userPlatforms}
            allRideTypes={allRideTypes}
          />
        );
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

  function convertTimeToMinutes(timeStr: string): number {
    if (timeStr.includes(":")) {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    }
    return parseInt(timeStr, 10);
  }

  async function handleSubmit() {
    if (!isStepComplete(1) || !isStepComplete(2) || !isStepComplete(3)) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const durationValue =
      formValues.timeOption !== ""
        ? parseInt(formValues.timeOption, 10)
        : formValues.time !== ""
        ? convertTimeToMinutes(formValues.time)
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

  const variants = {
    initial: { opacity: 0, x: 50 },
    enter: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.4 } },
  };

  return (
    <DialogContent className="sm:max-w-[600px] w-full p-6 bg-[#1C1B22] text-white">
      <DialogHeader className="mb-6 text-center">
        <DialogTitle className="text-2xl">Registrar Ganho</DialogTitle>
        <DialogDescription className="text-lg">
          Registre seus ganhos diários.
        </DialogDescription>
        <div className="flex justify-center">
          <Stepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={(stepNumber) => setCurrentStep(stepNumber)}
            className="flex justify-center"
          />
        </div>
      </DialogHeader>

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

      <div className="flex items-center justify-start mt-6 pt-6 border-t border-gray-600 gap-4">
        {currentStep > 1 && (
          <Button
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            className="border border-input bg-background shadow-sm text-white"
          >
            Voltar
          </Button>
        )}
        {currentStep < totalSteps ? (
          <Button
            onClick={() => setCurrentStep((prev) => Math.min(totalSteps, prev + 1))}
            className="border border-input bg-background shadow-sm text-white"
            disabled={!isStepComplete(currentStep)}
          >
            Próximo
          </Button>
        ) : (
          <Button onClick={handleSubmit} className="bg-green-600 text-white">
            Enviar
          </Button>
        )}
        <div className="text-sm text-end mr-auto">
          {currentStep} de {totalSteps} - {steps[currentStep - 1].label}
        </div>
      </div>
    </DialogContent>
  );
}
