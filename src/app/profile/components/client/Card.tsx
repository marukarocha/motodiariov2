"use client";

import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { format } from "date-fns";
import { useDashboardData } from "@/hooks/useDashboardData";

const availableServices = ["Entregas", "Passageiro", "Compras", "Viagens"];

export default function CardForm() {
  // Obter os dados do usuário via useDashboardData
  const { userData, loading, error } = useDashboardData();

  // Estado para a orientação: "horizontal" ou "vertical"
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">("horizontal");

  // Estados do formulário e pré-visualizações
  const [formData, setFormData] = useState({
    profileId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    services: [] as string[],
    region: "",
    logo: null as File | null,
  });
  const [logoPreview, setLogoPreview] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");

  // Atualiza o profileId quando os dados do usuário estiverem disponíveis
  useEffect(() => {
    if (userData) {
      setFormData((prev) => ({ ...prev, profileId: userData.uid }));
    }
  }, [userData]);

  // Gera o QR Code usando o profileId
  useEffect(() => {
    if (formData.profileId) {
      const url = `${window.location.origin}/profile/${formData.profileId}`;
      console.log("Gerando QR Code para URL:", url);
      QRCode.toDataURL(url)
        .then((generatedUrl) => {
          console.log("QR Code gerado:", generatedUrl);
          setQrDataUrl(generatedUrl);
        })
        .catch((err) => {
          console.error("Erro ao gerar o QR Code:", err);
        });
    }
  }, [formData.profileId]);

  // Manipulação dos inputs do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        services: checked
          ? [...prev.services, value]
          : prev.services.filter((s) => s !== value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, logo: file }));
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const formatPhone = (phone: string) =>
    phone.replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3");

  const readFileAsDataURL = (file: File): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

  // Gera o PDF com base na orientação
  const generatePdf = async () => {
    const doc = new jsPDF("portrait", "mm", "a4");
    // Define a espessura da borda para 0.8 mm
    doc.setLineWidth(0.8);

    const logoDataUrl = formData.logo ? await readFileAsDataURL(formData.logo) : "";
    let cardWidth: number, cardHeight: number;
    if (orientation === "vertical") {
      // Para o layout vertical, definimos dimensões invertidas
      cardWidth = 50;
      cardHeight = 90;
    } else {
      cardWidth = 90;
      cardHeight = 50;
    }
    const margin = 5;
    const cols = Math.floor((210 - margin * 2) / cardWidth);
    const rows = Math.floor((297 - margin * 2) / cardHeight);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const posX = margin + x * cardWidth;
        const posY = margin + y * cardHeight;

        // Desenha o contorno do cartão
        doc.rect(posX, posY, cardWidth, cardHeight);

        // Header (exibido em ambos os layouts)
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text("Moto Boy", posX + cardWidth / 2, posY + 5, { align: "center" });

        if (orientation === "vertical") {
          // Layout vertical:
          // QR Code centralizado na parte superior
          if (qrDataUrl) {
            doc.addImage(qrDataUrl, "PNG", posX + (cardWidth - 20) / 2, posY + 6, 20, 20);
          }
          // Área de destaque para Nome e Sobrenome com fundo cinza claro
          const nameRectX = posX + 2;
          const nameRectY = posY + 28;
          const nameRectW = cardWidth - 4;
          const nameRectH = 10;
          doc.setFillColor(240, 240, 240);
          doc.roundedRect(nameRectX, nameRectY, nameRectW, nameRectH, 2, 2, "F");
          // Nome e Sobrenome com destaque
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text(
            `${formData.firstName} ${formData.lastName}`,
            posX + cardWidth / 2,
            nameRectY + nameRectH / 2 + 3,
            { align: "center" }
          );
          // Telefone abaixo do nome, sem fundo
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(
            `Tel: ${formatPhone(formData.phone)}`,
            posX + cardWidth / 2,
            nameRectY + nameRectH + 8,
            { align: "center" }
          );
          // Email e demais informações (sem fundo) centralizados abaixo
          doc.setFontSize(8);
          doc.text(
            `Email: ${formData.email}`,
            posX + cardWidth / 2,
            posY + cardHeight - 50,
            { align: "center" }
          );
          // Região e Serviços com quebra automática (usando splitTextToSize)
          const infoText = `Região: ${formData.region}\nServiços: ${formData.services.join(", ")}`;
          const splitted = doc.splitTextToSize(infoText, cardWidth - 4);
          doc.text(splitted, posX + cardWidth / 2, posY + cardHeight - 25, { align: "center" });
          // Footer
          doc.setFontSize(8);
          doc.text("www.motodiario.cc", posX + cardWidth / 2, posY + cardHeight - 3, { align: "center" });
        } else {
          // Layout horizontal:
          // Informações dispostas à esquerda e QR Code no canto superior direito
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text(`${formData.firstName} ${formData.lastName}`, posX + 5, posY + 12);
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(`Email: ${formData.email}`, posX + 5, posY + 18);
          doc.text(`WhatsApp: ${formatPhone(formData.phone)}`, posX + 5, posY + 24);
          doc.text(`Região: ${formData.region}`, posX + 5, posY + 30);
          // Para os serviços, fazemos a quebra automática do texto
          const servicesText = `Serviços: ${formData.services.join(", ")}`;
          const servicesLines = doc.splitTextToSize(servicesText, cardWidth - 10);
          doc.text(servicesLines, posX + 5, posY + 36);
          if (qrDataUrl) {
            doc.addImage(qrDataUrl, "PNG", posX + cardWidth - 25, posY + 5, 20, 20);
          }
          // Exibe logo se houver
          if (logoDataUrl) {
            doc.addImage(logoDataUrl, "PNG", posX + cardWidth - 25, posY + cardHeight - 25, 20, 20);
          }
          // Footer
          doc.setFontSize(8);
          doc.text("www.motodiario.cc", posX + cardWidth / 2, posY + cardHeight - 3, { align: "center" });
        }
      }
    }
    doc.save(`cartoes-${format(new Date(), "dd-MM-yyyy")}.pdf`);
  };

  // Para o preview, ajusta o estilo conforme a orientação
  const previewStyle =
    orientation === "vertical"
      ? { width: "50mm", height: "90mm" }
      : { width: "90mm", height: "50mm" };

  // Estilos de texto para o preview (aumentados para melhor visualização)
  const previewTextStyle = { fontSize: "12px", lineHeight: "1.2" };

  return (
    <div className="container mx-auto p-4">
      {/* Seletor de orientação */}
      <div className="mb-4">
        <label className="mr-2 font-semibold">Orientação do Cartão:</label>
        <select
          value={orientation}
          onChange={(e) =>
            setOrientation(e.target.value as "horizontal" | "vertical")
          }
          className="border rounded p-1"
        >
          <option value="horizontal">Horizontal</option>
          <option value="vertical">Vertical</option>
        </select>
      </div>

      {/* Mensagens de loading ou erro */}
      {loading && <div>Carregando dados...</div>}
      {error && <div>{error}</div>}
      {!loading && !userData && <div>Nenhum usuário encontrado.</div>}

      {/* Preview do cartão */}
      {!loading && userData && (
        <>
          <div className="border p-4 mb-6 relative" style={previewStyle}>
            {orientation === "vertical" ? (
              <>
                <div style={{ ...previewTextStyle, textAlign: "center", fontSize: "8px" }}>
                  Moto Boy
                </div>
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR Code"
                    style={{
                      display: "block",
                      margin: "6px auto",
                      width: "30mm",
                      height: "30mm",
                    }}
                  />
                ) : (
                  <p style={{ textAlign: "center" }}>QR Code não gerado</p>
                )}
                <div style={{ ...previewTextStyle, textAlign: "center", fontWeight: "bold", backgroundColor: "rgb(240,240,240)", borderRadius: "4px", margin: "4px" }}>
                  {formData.firstName} {formData.lastName}
                </div>
                <div style={{ ...previewTextStyle, textAlign: "center" }}>
                  Tel: {formatPhone(formData.phone)}
                </div>
                <div style={{ ...previewTextStyle, textAlign: "center" }}>
                  Email: {formData.email}
                </div>
                <div style={{ ...previewTextStyle, textAlign: "center", whiteSpace: "pre-wrap" }}>
                  {`Região: ${formData.region}\nServiços: ${formData.services.join(", ")}`}
                </div>
                <div style={{ ...previewTextStyle, textAlign: "center", fontSize: "8px", position: "absolute", bottom: "3mm", width: "100%" }}>
                  www.motodiario.cc
                </div>
              </>
            ) : (
              <>
                <div style={{ ...previewTextStyle }}>
                  {formData.firstName} {formData.lastName}
                </div>
                <div style={{ ...previewTextStyle }}>Email: {formData.email}</div>
                <div style={{ ...previewTextStyle }}>WhatsApp: {formatPhone(formData.phone)}</div>
                <div style={{ ...previewTextStyle }}>Região: {formData.region}</div>
                <div style={{ ...previewTextStyle, whiteSpace: "pre-wrap" }}>
                  Serviços: {formData.services.join(", ")}
                </div>
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR Code"
                    style={{ position: "absolute", bottom: "2mm", right: "2mm", width: "16mm", height: "16mm" }}
                  />
                ) : (
                  <p>QR Code não gerado</p>
                )}
                <div style={{ ...previewTextStyle, textAlign: "center", fontSize: "8px", position: "absolute", bottom: "2mm", width: "100%" }}>
                  www.motodiario.cc
                </div>
              </>
            )}
          </div>

          {/* Formulário para entrada dos dados */}
          <form className="grid grid-cols-2 gap-4 mb-6">
            <input
              name="firstName"
              placeholder="Nome"
              onChange={handleChange}
              className="border rounded p-2"
            />
            <input
              name="lastName"
              placeholder="Sobrenome"
              onChange={handleChange}
              className="border rounded p-2"
            />
            <input
              name="email"
              placeholder="Email"
              onChange={handleChange}
              className="border rounded p-2"
            />
            <input
              name="phone"
              placeholder="Telefone"
              onChange={handleChange}
              className="border rounded p-2"
            />
            <input
              name="region"
              placeholder="Região"
              onChange={handleChange}
              className="border rounded p-2 col-span-2"
            />
            <div className="col-span-2">
              <label>Serviços:</label>
              {availableServices.map((s) => (
                <label key={s} className="ml-2">
                  <input type="checkbox" value={s} onChange={handleChange} /> {s}
                </label>
              ))}
            </div>
            <div className="col-span-2">
              <label>Logo:</label>
              <input type="file" accept="image/*" onChange={handleLogoChange} />
            </div>
          </form>

          <button className="bg-blue-500 text-white p-2 rounded" onClick={generatePdf}>
            Gerar PDF
          </button>
        </>
      )}
    </div>
  );
}
