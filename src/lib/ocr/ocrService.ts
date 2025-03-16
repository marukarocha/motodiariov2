import Tesseract from "tesseract.js";

/**
 * Processa a imagem e extrai o valor do odômetro.
 */
export async function extractOdometerValue(imageFile: File): Promise<string | null> {
  try {
    const { data: { text } } = await Tesseract.recognize(imageFile, "eng", {
      logger: (m) => console.log(m), // Log do progresso do OCR
    });

    // Filtra apenas números com 4 a 6 dígitos (exemplo: 51220)
    const odometerMatch = text.match(/\b\d{4,6}\b/);
    
    return odometerMatch ? odometerMatch[0] : null;
  } catch (error) {
    console.error("Erro no OCR:", error);
    return null;
  }
}
