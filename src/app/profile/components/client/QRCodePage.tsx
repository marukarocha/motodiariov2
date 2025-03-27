"use client";

import React, { FC } from "react";
import QRCode from "react-qr-code";

interface QRCodePageProps {
  profileId: string;
}

const QRCodePage: FC<QRCodePageProps> = ({ profileId }) => {
  // Gera a URL do perfil usando o window.location.origin (disponível em componentes cliente)
  const profileUrl = `${window.location.origin}/profile/${profileId}`;

  return (
    <div className="flex flex-col items-center justify-center p-4 border rounded shadow">
      <QRCode value={profileUrl} size={100} />
    </div>
  );
};

export default QRCodePage;
