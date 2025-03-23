// app/api/generate-image/route.js
export async function POST(request) {
  // Extrai o campo "prompt" do corpo da requisição JSON
  const { prompt } = await request.json();
  // Remove quebras de linha e espaços extras
  const trimmedPrompt = prompt.replace(/\n/g, " ").trim();

  const apiKey = process.env.STABILITY_API_KEY;
  const url = "https://api.stability.ai/v2beta/stable-image/generate/sd3";

  // Monta o payload como multipart/form-data
  const formData = new FormData();
  formData.append("prompt", trimmedPrompt);
  formData.append("cfg_scale", "7");
  formData.append("clip_guidance_preset", "FAST_BLUE");
  formData.append("height", "512");
  formData.append("width", "512");
  formData.append("samples", "1");
  formData.append("steps", "30");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro na API da Stability:", errorText);
      return new Response(JSON.stringify({ error: errorText }), { status: response.status });
    }

    const result = await response.json();
    console.log("Resultado da API:", result); // Log para depuração

    if (result.artifacts && result.artifacts.length > 0) {
      const base64Image = result.artifacts[0].base64;
      const imageUrl = `data:image/png;base64,${base64Image}`;
      return new Response(JSON.stringify({ imageUrl }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ error: "Nenhuma imagem foi gerada." }), { status: 500 });
    }
  } catch (error) {
    console.error("Erro interno:", error);
    return new Response(JSON.stringify({ error: "Erro interno ao gerar a imagem." }), { status: 500 });
  }
}
