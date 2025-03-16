import { FaOilCan, FaTools } from "react-icons/fa";
import { GiFlatTire, GiPokecog } from "react-icons/gi";

// ✅ Agora os ícones são referenciados corretamente pelo nome recebido da API
export const iconsMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  "FaOilCan": FaOilCan,
  "FaTools": FaTools,
  "GiFlatTire": GiFlatTire,
  "GiPokecog": GiPokecog,
};
