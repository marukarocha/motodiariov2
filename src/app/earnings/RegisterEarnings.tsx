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
import { NumericFormat } from "react-number-format";
import { useToast } from "@/hooks/use-toast";
import { User, MapPin, DollarSign, ClipboardList } from "lucide-react";

// Valores pré-definidos
const preDefinedMileage = [1, 5, 10, 20, 30];
// Removido: const preDefinedTimes = [15, 30, 45, 60, 75, 90];
const preDefinedHours = [0, 1, 2, 3, 4, 5];
const preDefinedMinutes = [0, 15, 30, 45];
const preDefinedAmounts = [5, 10, 20, 50];
const preDefinedCentavos = [0, 25, 50, 75, 99];

//
// COMPONENTES AUXILIARES
//

// Quilometragem – NumericFormat sem fundo; inputs maiores (w-48, text-4xl)
const MileageSelector = ({ value, onChange }) => {
  const increment = () => onChange(Number(value) + 1);
  const decrement = () =>
    onChange(Number(value) > 0 ? Number(value) - 1 : 0);
  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="flex items-center gap-4 w-full justify-center">
        <Button onClick={decrement} className="w-12 h-12 rounded-full bg-red-900 text-white opacity-70">
          –
        </Button>
        <NumericFormat
          value={value}
          onValueChange={({ floatValue }) => onChange(floatValue || 0)}
          thousandSeparator="."
          decimalSeparator=","
          decimalScale={1}
          fixedDecimalScale={true}
          suffix=" km"
          placeholder="Distância"
          customInput={Input}
          className="w-48 text-center text-2xl bg-transparent"
        />
        <Button onClick={increment} className="w-12 h-12 rounded-full bg-green-900 text-white opacity-70">
          +
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {preDefinedMileage.map((km) => (
          <Button
            key={km}
            variant={Number(value) === km ? "default" : "outline"}
            onClick={() => onChange(km)}
            className="py-1 px-2 text-sm h-8"
          >
            {km} km
          </Button>
        ))}
      </div>
    </div>
  );
};

// Tempo – inputs para Horas e Minutos com botões laterais; inputs maiores (w-48, text-4xl)
// Removi a fileira de presets para tempo total.
const TimeSelector = ({ hours, minutes, onChangeHours, onChangeMinutes }) => {
  const increment = (val, setter, max = Infinity) => setter(val < max ? val + 1 : val);
  const decrement = (val, setter) => setter(val > 0 ? val - 1 : 0);
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        <div className="flex flex-col items-center">
          <Label className="mb-1 text-sm font-semibold">Horas</Label>
          <div className="flex items-center gap-4 w-full justify-center">
            <Button onClick={() => decrement(hours, onChangeHours)} className="w-12 h-12 rounded-full bg-red-900 text-white opacity-70">
              –
            </Button>
            <Input
              type="number"
              value={hours}
              onChange={(e) => onChangeHours(parseInt(e.target.value) || 0)}
              className="w-48 text-center text-2xl bg-transparent"
              style={{ MozAppearance: "textfield" }}
            />
            <Button onClick={() => increment(hours, onChangeHours)} className="w-12 h-12 rounded-full bg-green-900 text-white opacity-70">
              +
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {preDefinedHours.map((hr) => (
              <Button
                key={hr}
                variant={hours === hr ? "default" : "outline"}
                onClick={() => onChangeHours(hr)}
                className="py-1 px-2 text-sm h-8"
              >
                {hr}h
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <Label className="mb-1 text-sm font-semibold">Minutos</Label>
          <div className="flex items-center gap-4 w-full justify-center">
            <Button onClick={() => decrement(minutes, onChangeMinutes)} className="w-12 h-12 rounded-full bg-red-900 text-white opacity-70">
              –
            </Button>
            <Input
              type="number"
              value={minutes}
              onChange={(e) => {
                let val = parseInt(e.target.value) || 0;
                if (val > 60) val = 60;
                onChangeMinutes(val);
              }}
              className="w-48 text-center text-2xl bg-transparent"
              style={{ MozAppearance: "textfield" }}
              max={60}
            />
            <Button onClick={() => increment(minutes, onChangeMinutes, 60)} className="w-12 h-12 rounded-full bg-green-900 text-white opacity-70">
              +
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {preDefinedMinutes.map((min) => (
              <Button
                key={min}
                variant={minutes === min ? "default" : "outline"}
                onClick={() => onChangeMinutes(min)}
                className="py-1 px-2 text-sm h-8"
              >
                {min}m
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Valor – NumericFormat para "R$ X,XX" com input maior (w-56, text-5xl)
const AmountSelector = ({ amount, onChange }) => {
  const formattedValue = Number(amount).toFixed(2);
  const handlePresetReais = (val) => {
    onChange(val);
  };
  const handlePresetCentavos = (val) => {
    const integerPart = Math.floor(Number(amount));
    onChange(integerPart + val / 100);
  };
  const increment = () => onChange(Number(amount) + 1);
  const decrement = () => onChange(Number(amount) > 0 ? Number(amount) - 1 : 0);
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex items-center gap-4">
        <Button onClick={decrement} className="w-12 h-12 rounded-full bg-red-900 text-white opacity-70">
          –
        </Button>
        <NumericFormat
          value={amount}
          onValueChange={({ floatValue }) => onChange(floatValue || 0)}
          thousandSeparator="."
          decimalSeparator=","
          decimalScale={2}
          fixedDecimalScale={true}
          prefix="R$ "
          placeholder="Valor"
          customInput={Input}
          className="w-full max-w-lg text-center text-2xl bg-transparent"
        />
        <Button onClick={increment} className="w-12 h-12 rounded-full bg-green-900 text-white opacity-70">
          +
        </Button>
      </div>
      <div className="flex flex-col items-center space-y-2">
        <div className="flex flex-wrap gap-2 justify-center">
          {preDefinedAmounts.map((amt) => (
            <Button
              key={amt}
              variant={Math.floor(Number(amount)) === amt ? "default" : "outline"}
              onClick={() => handlePresetReais(amt)}
              className="py-1 px-2 text-sm h-8"
            >
              R$ {amt}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {preDefinedCentavos.map((cent) => (
            <Button
              key={cent}
              variant={
                Math.round((Number(amount) - Math.floor(Number(amount))) * 100) === cent
                  ? "default"
                  : "outline"
              }
              onClick={() => handlePresetCentavos(cent)}
              className="py-1 px-2 text-sm h-8"
            >
              {cent}¢
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

//
// COMPONENTES DOS PASSOS
//

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

// STEP 1 – Plataforma e Tipo de Corrida
const Step1 = ({ formValues, setFormValues, setInputFocused, platformOptions, allRideTypes }) => {
  const selectedPlatformObj = platformOptions.find((p) => p.name === formValues.platform);
  const filteredRideTypes =
    selectedPlatformObj && selectedPlatformObj.associatedRaceTypes
      ? allRideTypes.filter((rt) => selectedPlatformObj.associatedRaceTypes.includes(rt.id))
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
      className="p-2 space-y-0"
      onFocusCapture={() => setInputFocused(true)}
      onBlurCapture={() => setInputFocused(false)}
    >
      <div className="p-2 rounded-md bg-yellow-100 text-yellow-900 text-center text-sm font-medium transition-opacity duration-300">
        {instructionText}
      </div>
      <div>
        <Label className="mb-2 text-base font-semibold">Plataforma</Label>
        {platformOptions && platformOptions.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {platformOptions.map((option) => (
              <Button
                key={option.id}
                variant={formValues.platform === option.name ? "default" : "outline"}
                onClick={() => setFormValues({ ...formValues, platform: option.name, rideType: "" })}
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
      <div>
        {selectedPlatformObj && filteredRideTypes.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {filteredRideTypes.map((option) => (
              <Button
                key={option.id}
                variant={formValues.rideType === option.type ? "default" : "outline"}
                onClick={() => setFormValues({ ...formValues, rideType: option.type })}
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

// STEP 2 – Quilometragem e Tempo
const Step2 = ({ formValues, setFormValues, setInputFocused }) => (
  <div
    className="p-4 space-y-6"
    onFocusCapture={() => setInputFocused(true)}
    onBlurCapture={() => setInputFocused(false)}
  >
    <div>
      <Label className="mb-2 text-base font-semibold">Quilometragem</Label>
      <MileageSelector
        value={formValues.mileage || 0}
        onChange={(value) => setFormValues({ ...formValues, mileage: value })}
      />
    </div>
    <div>
      <Label className="mb-2 text-base font-semibold">Tempo da Corrida</Label>
      <TimeSelector
        hours={formValues.hours || 0}
        minutes={formValues.minutes || 0}
        onChangeHours={(value) => setFormValues({ ...formValues, hours: value })}
        onChangeMinutes={(value) => setFormValues({ ...formValues, minutes: value })}
      />
    </div>
  </div>
);

// STEP 3 – Valor
const Step3 = ({ formValues, setFormValues, setInputFocused }) => (
  <div
    className="p-4 space-y-6 flex justify-center"
    onFocusCapture={() => setInputFocused(true)}
    onBlurCapture={() => setInputFocused(false)}
  >
    <AmountSelector
      amount={formValues.amount || 0}
      onChange={(value) => setFormValues({ ...formValues, amount: value })}
    />
  </div>
);

// STEP 4 – Extras
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
        onChange={(e) => setFormValues({ ...formValues, useManualDate: e.target.checked })}
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
            value={formValues.manualTime || ""}
            onChange={(e) => setFormValues({ ...formValues, manualTime: e.target.value })}
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
        onChange={(e) => setFormValues({ ...formValues, showTip: e.target.checked })}
      />
      <Label className="text-2xl text-white">Recebeu gorjeta?</Label>
    </div>
    {formValues.showTip && (
      <div>
        <Label className="mb-2 text-2xl text-white">Gorjeta (R$)</Label>
        <Input
          type="number"
          placeholder="Digite o valor da gorjeta"
          value={formValues.tip || ""}
          onChange={(e) => setFormValues({ ...formValues, tip: e.target.value })}
          className={fieldInputClasses}
        />
      </div>
    )}
    <div className="flex items-center gap-4">
      <input
        type="checkbox"
        className="h-6 w-6"
        checked={formValues.showDescription || false}
        onChange={(e) => setFormValues({ ...formValues, showDescription: e.target.checked })}
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
    mileage: 0,
    hours: 0,
    minutes: 0,
    amount: 0,
    tip: "",
    description: "",
    date: "",
    useManualDate: false,
    showTip: false,
    showDescription: false,
  });
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
        return formValues.mileage > 0 && (formValues.hours > 0 || formValues.minutes > 0);
      case 3:
        return formValues.amount > 0;
      case 4:
        return true;
      default:
        return false;
    }
  }
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
          handleChange({ platform: "", rideType: "" });
        }
      } catch (error) {
        console.error("Erro ao buscar plataformas do usuário:", error);
      }
    }
    fetchUserPlatforms();
  }, [currentUser]);
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
  async function handleSubmit() {
    if (!isStepComplete(1) || !isStepComplete(2) || !isStepComplete(3)) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }
    const durationValue = (formValues.hours || 0) * 60 + (formValues.minutes || 0);
    const customDateTime =
      formValues.useManualDate && formValues.date && formValues.manualTime
        ? new Date(`${formValues.date}T${formValues.manualTime}:00`)
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
        mileage: 0,
        hours: 0,
        minutes: 0,
        amount: 0,
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
