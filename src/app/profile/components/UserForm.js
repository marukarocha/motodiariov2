// components/UserForm.js
import { useState } from 'react';

export default function UserForm({ onSubmit }) {
  const [skinColor, setSkinColor] = useState('');
  const [hairType, setHairType] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [height, setHeight] = useState(50);
  const [styleCharacteristics, setStyleCharacteristics] = useState('');
  const [musicalTaste, setMusicalTaste] = useState('');
  const [clothingStyle, setClothingStyle] = useState('');
  const [environment, setEnvironment] = useState({
    location: '',
    timeOfDay: 'day',
    weather: 'sunny'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ skinColor, hairType, bodyType, height, styleCharacteristics, musicalTaste, clothingStyle, environment });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-lg shadow-md">
      <div>
        <label className="block text-sm font-medium text-gray-700">Cor de Pele:</label>
        <input
          type="text"
          value={skinColor}
          onChange={(e) => setSkinColor(e.target.value)}
          placeholder="Ex: Bronzeado"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Tipo de Cabelo:</label>
        <input
          type="text"
          value={hairType}
          onChange={(e) => setHairType(e.target.value)}
          placeholder="Ex: Cacheado, Liso"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Tipo Físico:</label>
        <input
          type="text"
          value={bodyType}
          onChange={(e) => setBodyType(e.target.value)}
          placeholder="Ex: Atlético, Magro"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Tamanho (Altura):</label>
        <input
          type="range"
          min="0"
          max="100"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          className="w-full"
        />
        <p className="text-sm text-gray-600">Valor: {height}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Características do Estilo:</label>
        <input
          type="text"
          value={styleCharacteristics}
          onChange={(e) => setStyleCharacteristics(e.target.value)}
          placeholder="Ex: Moderno, Casual"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Gosto Musical:</label>
        <input
          type="text"
          value={musicalTaste}
          onChange={(e) => setMusicalTaste(e.target.value)}
          placeholder="Ex: Rock, Pop"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Estilo de Roupa:</label>
        <input
          type="text"
          value={clothingStyle}
          onChange={(e) => setClothingStyle(e.target.value)}
          placeholder="Ex: Urbano, Esportivo"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Local (Ambiente):</label>
        <input
          type="text"
          value={environment.location}
          onChange={(e) => setEnvironment({ ...environment, location: e.target.value })}
          placeholder="Ex: Cidade, Campo"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Hora do Dia:</label>
        <select
          value={environment.timeOfDay}
          onChange={(e) => setEnvironment({ ...environment, timeOfDay: e.target.value })}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        >
          <option value="day">Dia</option>
          <option value="night">Noite</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Tempo:</label>
        <select
          value={environment.weather}
          onChange={(e) => setEnvironment({ ...environment, weather: e.target.value })}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        >
          <option value="sunny">Sol</option>
          <option value="cloudy">Tempo Fechado</option>
        </select>
      </div>
      <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded-md">
        Gerar Imagem
      </button>
    </form>
  );
}
