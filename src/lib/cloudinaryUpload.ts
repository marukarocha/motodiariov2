import axios from "axios";

// Obtém as variáveis de ambiente do Next.js
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

if (!CLOUD_NAME || !UPLOAD_PRESET) {
  throw new Error("Variáveis de ambiente do Cloudinary não configuradas corretamente.");
}

/**
 * Faz o upload de uma imagem para o Cloudinary e retorna a URL da imagem.
 * @param file Arquivo de imagem a ser enviado.
 * @returns URL da imagem no Cloudinary.
 */
export async function uploadProfileImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET); // Obtido do .env.local
  formData.append("folder", "user_profiles"); // Pasta no Cloudinary

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      formData
    );

    return response.data.secure_url; // Retorna a URL da imagem hospedada
  } catch (error) {
    console.error("Erro ao fazer upload da imagem:", error);
    throw new Error("Falha ao enviar a imagem");
  }
}
