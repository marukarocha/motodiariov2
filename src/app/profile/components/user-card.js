// profile/components/user-card.js
"use client";

import { useState } from "react";

export default function UserCard() {
  // Estados para cada opção do formulário
  const [skinColor, setSkinColor] = useState("Light");
  const [hairType, setHairType] = useState("Straight");
  const [bodyType, setBodyType] = useState("Athletic");
  const [height, setHeight] = useState("Medium");
  const [styleCharacteristics, setStyleCharacteristics] = useState("Modern");
  const [musicalTaste, setMusicalTaste] = useState("Rock");
  const [clothingStyle, setClothingStyle] = useState("Urban");
  const [environmentLocation, setEnvironmentLocation] = useState("City");
  const [timeOfDay, setTimeOfDay] = useState("Day");
  const [weather, setWeather] = useState("Sunny");

  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  const handleGenerateImage = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Monta o prompt em inglês com os valores escolhidos
    const prompt = `Generate an image of a card for user "motodelivery", a delivery person with the following features: 
      skin color: ${skinColor}, 
      hair type: ${hairType}, 
      body type: ${bodyType}, 
      height: ${height}, 
      style: ${styleCharacteristics}, 
      musical taste: ${musicalTaste}, 
      clothing style: ${clothingStyle}, 
      environment location: ${environmentLocation}, 
      time of day: ${timeOfDay}, 
      weather: ${weather}.`;

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const result = await response.json();
      if (result.imageUrl) {
        setImageUrl(result.imageUrl);
      } else {
        console.error("Erro:", result.error);
      }
    } catch (error) {
      console.error("Erro ao gerar a imagem:", error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6  rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Generate User Image</h2>
      <form onSubmit={handleGenerateImage} className="space-y-4">
        {/* Skin Color */}
        <div>
          <label className="block mb-1 font-medium">Skin Color</label>
          <select
            value={skinColor}
            onChange={(e) => setSkinColor(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm"
          >
            <option value="Light">Light</option>
            <option value="Medium">Medium</option>
            <option value="Dark">Dark</option>
          </select>
        </div>

        {/* Hair Type */}
        <div>
          <label className="block mb-1 font-medium">Hair Type</label>
          <select
            value={hairType}
            onChange={(e) => setHairType(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm"
          >
            <option value="Straight">Straight</option>
            <option value="Wavy">Wavy</option>
            <option value="Curly">Curly</option>
            <option value="Bald">Bald</option>
          </select>
        </div>

        {/* Body Type */}
        <div>
          <label className="block mb-1 font-medium">Body Type</label>
          <select
            value={bodyType}
            onChange={(e) => setBodyType(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm"
          >
            <option value="Slim">Slim</option>
            <option value="Athletic">Athletic</option>
            <option value="Average">Average</option>
            <option value="Heavy">Heavy</option>
          </select>
        </div>

        {/* Height */}
        <div>
          <label className="block mb-1 font-medium">Height</label>
          <select
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm"
          >
            <option value="Short">Short</option>
            <option value="Medium">Medium</option>
            <option value="Tall">Tall</option>
            <option value="Very Tall">Very Tall</option>
          </select>
        </div>

        {/* Style Characteristics */}
        <div>
          <label className="block mb-1 font-medium">Style Characteristics</label>
          <select
            value={styleCharacteristics}
            onChange={(e) => setStyleCharacteristics(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm"
          >
            <option value="Modern">Modern</option>
            <option value="Casual">Casual</option>
            <option value="Vintage">Vintage</option>
            <option value="Elegant">Elegant</option>
          </select>
        </div>

        {/* Musical Taste */}
        <div>
          <label className="block mb-1 font-medium">Musical Taste</label>
          <select
            value={musicalTaste}
            onChange={(e) => setMusicalTaste(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm"
          >
            <option value="Rock">Rock</option>
            <option value="Pop">Pop</option>
            <option value="Jazz">Jazz</option>
            <option value="Classical">Classical</option>
            <option value="Hip-Hop">Hip-Hop</option>
          </select>
        </div>

        {/* Clothing Style */}
        <div>
          <label className="block mb-1 font-medium">Clothing Style</label>
          <select
            value={clothingStyle}
            onChange={(e) => setClothingStyle(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm"
          >
            <option value="Urban">Urban</option>
            <option value="Sporty">Sporty</option>
            <option value="Formal">Formal</option>
            <option value="Bohemian">Bohemian</option>
          </select>
        </div>

        {/* Environment Location */}
        <div>
          <label className="block mb-1 font-medium">Environment Location</label>
          <select
            value={environmentLocation}
            onChange={(e) => setEnvironmentLocation(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm"
          >
            <option value="City">City</option>
            <option value="Suburb">Suburb</option>
            <option value="Countryside">Countryside</option>
          </select>
        </div>

        {/* Time of Day */}
        <div>
          <label className="block mb-1 font-medium">Time of Day</label>
          <select
            value={timeOfDay}
            onChange={(e) => setTimeOfDay(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm"
          >
            <option value="Day">Day</option>
            <option value="Night">Night</option>
          </select>
        </div>

        {/* Weather */}
        <div>
          <label className="block mb-1 font-medium">Weather</label>
          <select
            value={weather}
            onChange={(e) => setWeather(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm"
          >
            <option value="Sunny">Sunny</option>
            <option value="Cloudy">Cloudy</option>
            <option value="Rainy">Rainy</option>
            <option value="Snowy">Snowy</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Image"}
        </button>
      </form>

      {imageUrl && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Generated Image:</h3>
          <img src={imageUrl} alt="Generated" className="rounded shadow-md" />
        </div>
      )}
    </div>
  );
}
