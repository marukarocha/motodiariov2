// components/ui/stepper.tsx
import React, { useRef } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
// Importe os ícones que deseja usar
import {
  User,
  MapPin,
  DollarSign,
  ClipboardList,
} from "lucide-react";

interface Step {
  number: number;
  label: string;
  icon: keyof typeof icons; // Chave do objeto icons
}

// Mapeamos as chaves para os componentes de ícone
const icons = {
  user: User,
  mappin: MapPin,
  dollar: DollarSign,
  clipboard: ClipboardList,
  // Adicione quantos quiser
};

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepNumber: number) => void;
  className?: string;
}

const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  className,
}) => {
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  return (
    <ScrollArea
      className={cn(
        "w-full whitespace-nowrap rounded-md flex justify-center",
        className
      )}
    >
      <div className="flex items-center p-4 gap-6" ref={scrollAreaRef}>
        {steps.map((step, index) => {
          const isActive = step.number === currentStep;
          const isComplete = step.number < currentStep;

          // Obtemos o ícone a partir da chave step.icon
          const IconComponent = icons[step.icon];

          return (
            <div key={step.number} className="flex flex-col items-center">
              <div className="flex items-center">
                <div className="flex flex-col items-center justify-center">
                  <div
                    onClick={() => onStepClick(step.number)}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer",
                      isActive
                        ? "bg-primary text-white"
                        : isComplete
                        ? "bg-primary text-white"
                        : "bg-secondary text-white"
                    )}
                  >
                    {isComplete ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      // Renderiza o ícone do step
                      IconComponent ? <IconComponent className="w-5 h-5" /> : step.number
                    )}
                  </div>

                  {/* Exibe o label como Badge outline */}
                  <div className="mt-2 w-10  flex justify-center">
                    <Badge variant="outline" className="text-center">
                      {step.label}
                    </Badge>
                  </div>
                </div>

                {/* Linha horizontal entre steps */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-[2px] mb-5 mx-2 w-10",
                      isComplete ? "bg-white" : "bg-slate-400"
                    )}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default Stepper;
