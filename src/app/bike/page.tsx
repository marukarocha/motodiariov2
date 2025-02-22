import { Header } from '@/components/header';
import RegisterBikePage from './register'; // Import the RegisterBike component

export default function BikePage() {
  return (
    <>
      <Header />
      <RegisterBikePage /> {/* Renderiza o componente RegisterBike */}
    </>
  );
}