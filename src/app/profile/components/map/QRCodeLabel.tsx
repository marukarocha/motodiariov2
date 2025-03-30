"use client";

import React, { FC, useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeLabelProps {
  value: string; // valor a ser codificado, por exemplo, URL do destino
  size?: number;
}

const QRCodeLabel: FC<QRCodeLabelProps> = ({ value, size = 120 }) => {
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    const generateQrCode = async () => {
      try {
        const qrDataUrl = await QRCode.toDataURL(value);
        setQrUrl(qrDataUrl);
      } catch (error) {
        console.error("Erro ao gerar o QR Code:", error);
      }
    };

    generateQrCode();
  }, [value]);

  return (
    <div className="flex items-center justify-center">
      {qrUrl ? (
        <img src={qrUrl} alt="QR Code" width={size} height={size} />
      ) : (
        <span>Carregando QR Code...</span>
      )}
    </div>
  );
};

export default QRCodeLabel;
