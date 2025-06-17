"use client";

import { useState } from "react";


export type PinPositionProps = {
  onSelectPosition: (position: { top: string; left: string }) => void;
};

export default function PinPosition({ onSelectPosition }: PinPositionProps) {
  const [pin, setPin] = useState<{ top: string; left: string } | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const left = ((x / rect.width) * 100).toFixed(2) + "%";
    const top = ((y / rect.height) * 100).toFixed(2) + "%";

    const position = { top, left };
    setPin(position);
    onSelectPosition(position);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div
        className="relative w-full h-[400px] bg-gray-200 border rounded overflow-hidden cursor-crosshair"
        onClick={handleClick}
        style={{ backgroundImage: "url(/bike/model1.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        {pin && (
          <div
            className="absolute w-4 h-4 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg"
            style={{ top: pin.top, left: pin.left }}
          ></div>
        )}
      </div>
    </div>
  );
}
