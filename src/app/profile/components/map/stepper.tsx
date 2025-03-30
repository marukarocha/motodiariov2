"use client";
import React, { FC } from "react";

export interface StepperProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

const Stepper: FC<StepperProps> = ({ steps, currentStep, onStepClick, className }) => {
  return (
    <div className={`flex items-center justify-center ${className || ""}`}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-center cursor-pointer" onClick={() => onStepClick && onStepClick(index + 1)}>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 ${
              currentStep === index + 1 ? "bg-blue-500 text-white" : "bg-gray-300 text-black hover:bg-gray-400"
            }`}
          >
            {index + 1}
          </div>
          {index < steps.length - 1 && (
            <div className="w-8 h-px bg-gray-400 mx-2" />
          )}
        </div>
      ))}
    </div>
  );
};

export default Stepper;
