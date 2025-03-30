"use client";

import React, { FC, useEffect, useState } from "react";
import QRCode from "qrcode";

interface QRCodePageProps {
  profileId: string;
}

const QRCodePage: FC<QRCodePageProps> = ({ profileId }) => {
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    const generateQrCode = async () => {
      const profileUrl = `${window.location.origin}/profile/${profileId}`;
      try {
        const qrDataUrl = await QRCode.toDataURL(profileUrl);
        setQrUrl(qrDataUrl);
      } catch (error) {
        console.error("Erro ao gerar o QR Code:", error);
      }
    };

    generateQrCode();
  }, [profileId]);

  return (
    <div className="flex flex-col items-center justify-center p-4 border rounded shadow">
      {qrUrl ? (
        <img src={qrUrl} alt="QR Code do perfil" width={100} height={100} />
      ) : (
        <span>Carregando QR Code...</span>
      )}
    </div>
  );
};

export default QRCodePage;
