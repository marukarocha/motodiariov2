"use client";

import { useState, useEffect } from "react";

interface MaintenanceItem {
  id: string;
  label: string;
  number: number;
  category: string;
  position: { top: string; left: string };
}

interface MotoMapaProps {
  onSelectItem: (itemId: string) => void;
  highlightedItemId?: string;
}

const maintenanceMap: MaintenanceItem[] = [
  { id: "brake-pad-replacement", label: "Pastilhas de Freio", number: 1, category: "Sistema de Freios", position: { top: "66.06%", left: "31%" } },
  { id: "brake-disc-change", label: "Discos de Freio", number: 2, category: "Sistema de Freios", position: { top: "75%", left: "28.34%" } },
  { id: "brake-drum-change", label: "Tambor/Lonas de Freio", number: 3, category: "Sistema de Freios", position: { top: "67%", left: "76%" } },
  { id: "spark-plug-change", label: "Vela de Ignição", number: 4, category: "Motor", position: { top: "50%", left: "46%" } },
  { id: "oil-change", label: "Troca de Óleo", number: 5, category: "Lubrificação e Filtros", position: { top: "61%", left: "45%" } },
  { id: "air-filter-change", label: "Filtro de Ar", number: 6, category: "Lubrificação e Filtros", position: { top: "43%", left: "53%" } },
  { id: "fuel-filter-change", label: "Filtro de Combustível", number: 7, category: "Lubrificação e Filtros", position: { top: "46%", left: "57%" } },
  { id: "chain-replacement", label: "Corrente", number: 8, category: "Transmissão", position: { top: "73%", left: "66%" } },
  { id: "battery-check", label: "Bateria", number: 9, category: "Sistema Elétrico", position: { top: "46%", left: "55%" } },
  { id: "lamp-replacement", label: "Lâmpadas", number: 10, category: "Sistema Elétrico", position: { top: "31%", left: "32%" } },
  { id: "lamp-replacement2", label: "Lâmpadas", number: 10, category: "Sistema Elétrico", position: { top: "35%", left: "82%" } },
  { id: "tire-change", label: "Pneu Traseiro", number: 11, category: "Rodagem", position: { top: "68%", left: "83%" } },
  { id: "wheel-alignment", label: "Alinhamento", number: 12, category: "Rodagem", position: { top: "67%", left: "10%" } },
  { id: "steering-box-replacement", label: "Troca Caixa de Direção", number: 13, category: "Rodagem", position: { top: "29%", left: "39%" } }
];

const categoryColors: Record<string, string> = {
  "Sistema de Freios": "red",
  "Motor": "blue",
  "Lubrificação e Filtros": "orange",
  "Transmissão": "fuchsia",
  "Sistema Elétrico": "purple",
  "Rodagem": "green",
};

const motoModels = [
  { id: "model1", label: "Modelo 1", image: "/bike/model1.jpg" },
  { id: "model2", label: "Modelo 2", image: "/bike/model2.png" },
];

export default function MotoMapaInterativoComMenu({ onSelectItem, highlightedItemId }: MotoMapaProps) {
  const [visibleCategories, setVisibleCategories] = useState<Record<string, boolean>>({});
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [debugCoords, setDebugCoords] = useState<{ top: string; left: string } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedModel, setSelectedModel] = useState(motoModels[0].id);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const groupedByCategory = maintenanceMap.reduce<Record<string, MaintenanceItem[]>>((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const toggleCategory = (category: string) => {
    setVisibleCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const currentModel = motoModels.find((m) => m.id === selectedModel);

  return (
    <div className={`flex ${isMobile ? "flex-col" : "flex-row"} w-full max-w-7xl mx-auto mt-6 gap-4`}>
      <div className="relative flex-1 border border-zinc-700 rounded overflow-hidden">
        <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
          <img
            src={currentModel?.image}
            alt="Diagrama da Moto"
            className="absolute top-0 left-0 w-full h-full object-contain"
            onClick={(e) => {
              const bounds = e.currentTarget.getBoundingClientRect();
              const top = ((e.clientY - bounds.top) / bounds.height) * 100;
              const left = ((e.clientX - bounds.left) / bounds.width) * 100;
              setDebugCoords({ top: `${top.toFixed(2)}%`, left: `${left.toFixed(2)}%` });
            }}
          />

          {maintenanceMap.map(({ id, label, number, category, position }) => {
            const isVisible = visibleCategories[category];
            return (
              isVisible && (
                <div
                  key={id}
                  title={`${label} - ${category}`}
                  className={`absolute flex items-center justify-center text-xs font-bold text-white rounded-full cursor-pointer transition-transform z-10 ${
                    highlightedItemId === id || hoveredItemId === id ? "scale-125 ring-2 ring-white" : ""
                  }`}
                  style={{
                    top: position.top,
                    left: position.left,
                    width: "30px",
                    height: "30px",
                    backgroundColor: categoryColors[category] || "gray",
                  }}
                  onClick={() => onSelectItem(id)}
                  onMouseEnter={() => setHoveredItemId(id)}
                  onMouseLeave={() => setHoveredItemId(null)}
                >
                  {number}
                </div>
              )
            );
          })}

          {debugCoords && (
            <div
              className="absolute bg-white text-black text-xs px-1 py-0.5 rounded border border-black z-20"
              style={{
                top: debugCoords.top,
                left: debugCoords.left,
                transform: "translate(-50%, -50%)",
              }}
            >
              {`top: ${debugCoords.top}, left: ${debugCoords.left}`}
            </div>
          )}
        </div>
      </div>

      <aside className={`p-4 ${isMobile ? "w-full" : "w-64"} bg-zinc-900 border border-zinc-700 rounded shadow-sm h-fit text-white`}>        
        <h2 className="text-lg font-semibold mb-4">Modelos</h2>
        <select
          className="mb-4 w-full p-2 bg-zinc-800 border border-zinc-600 rounded text-white"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
        >
          {motoModels.map((model) => (
            <option key={model.id} value={model.id}>
              {model.label}
            </option>
          ))}
        </select>

        <h2 className="text-lg font-semibold mb-4">Manutenções</h2>
        <ul className="space-y-2">
          {Object.entries(groupedByCategory).map(([category, items]) => (
            <li key={category}>
              <div className="flex items-center justify-between cursor-pointer mb-1" onClick={() => toggleCategory(category)}>
                <span className="font-semibold" style={{ color: categoryColors[category] }}>{category}</span>
                <input
                  type="checkbox"
                  checked={!!visibleCategories[category]}
                  onChange={() => toggleCategory(category)}
                  className="ml-2 accent-current"
                />
              </div>
              {visibleCategories[category] && (
                <ul className="pl-3 space-y-1">
                  {items.map((item) => (
                    <li key={item.id}>
                      <button
                        className={`w-full text-left px-2 py-1 rounded hover:bg-zinc-800 transition ${
                          highlightedItemId === item.id ? "bg-zinc-700" : ""
                        }`}
                        onClick={() => onSelectItem(item.id)}
                        onMouseEnter={() => setHoveredItemId(item.id)}
                        onMouseLeave={() => setHoveredItemId(null)}
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
