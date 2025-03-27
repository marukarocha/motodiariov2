"use client";

import React, { FC } from "react";

interface StepperProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

const Stepper: FC<StepperProps> = ({ steps, currentStep, onStepClick, className }) => {
  return (
    <div className={`flex gap-2 ${className}`}>
      {steps.map((step, index) => (
        <button
          key={index}
          onClick={() => onStepClick && onStepClick(index + 1)}
          className={`px-3 py-1 rounded transition-colors duration-300 ${
            currentStep === index + 1
              ? "bg-blue-500 text-white"
              : "bg-gray-300 text-black hover:bg-gray-400"
          }`}
        >
          {step}
        </button>
      ))}
    </div>
  );
};

export default Stepper;
