// components/ui/stepper.tsx
import React, { useRef } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface Step {
  number: number;
  label: string;          // Mantemos label se quiser usar em outro lugar
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; // O ícone importado
}

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
    <ScrollArea className={cn("w-full overflow-x-auto", className)}>
      <div className="flex items-center p-4 gap-2" ref={scrollAreaRef}>
        {steps.map((step, index) => {
          const isActive = step.number === currentStep;
          const isComplete = step.number < currentStep;
          const IconComp = step.icon; // Ícone do step

          return (
            <div key={step.number} className="flex flex-col items-center shrink-0">
              <div className="flex items-center">
                <motion.div
                  // Usamos Motion para aplicar scale no step ativo
                  animate={isActive ? { scale: 1.5 } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center"
                >
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
                      <Check className="w-5 h-5" />
                    ) : (
                      <IconComp className="w-5 h-5" />
                    )}
                  </div>
                </motion.div>

                {/* Linha entre os steps */}
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
