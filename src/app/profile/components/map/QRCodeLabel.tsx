// src/app/profile/components/map/QRCodeLabel.tsx
"use client";
import React, { FC } from 'react';
import QRCode from 'react-qr-code';

interface QRCodeLabelProps {
  value: string; // o valor a ser codificado, por exemplo a URL do destino
  size?: number;
}

const QRCodeLabel: FC<QRCodeLabelProps> = ({ value, size = 120 }) => {
  return (
    <div className="flex items-center justify-center">
      <QRCode value={value} size={size} />
    </div>
  );
};

export default QRCodeLabel;
