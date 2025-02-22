import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils'; // Se você estiver usando a função cn do shadcn/ui
import { MusicIcon } from 'lucide-react'; // Importe o ícone

interface MotivationProps {
  className?: string; // Para classes personalizadas externas
}

const phrases = [
  "Na frente da meta eu não posso errar — ('Vida Loka II')",
  "Viver, lutar, sofrer, vencer — ('Negro Drama')",
  "Jamais o brilho da favela se apagará — ('Jesus Chorou')",
  "Eu sei que o meu valor é mais que ouro e prata — ('Capítulo 4, Versículo 3')",
  "Cada lágrima que cai alimenta minha fé — ('Vida Loka I')",
  "Eu sou aquele louco que não pode errar — ('Negro Drama')",
  "A vida é um desafio, e cada um escolhe o seu caminho — ('A Vida é Desafio')",
  "Se você não tem motivo pra viver, não encontre pra morrer — ('Homem na Estrada')",
  "Paz interior é o que o homem busca — ('Periferia é Periferia')"
];


const Motivation: React.FC<MotivationProps> = ({ className }) => {
  const [phrase, setPhrase] = useState('');

  useEffect(() => {
    setPhrase(phrases[Math.floor(Math.random() * phrases.length)]);
  }, []);

  return (
    <div className={cn("motivation-container p-4 rounded-lg bg-muted border border-border text-muted-foreground flex items-center gap-4", className)}> {/* Adicione flex, items-center e gap-4 */}
    <MusicIcon className="h-6 w-6 text-accent" /> {/* Adicione o ícone */}
    <p className="motivation-phrase font-medium text-lg">"{phrase}"</p>
  </div>
  );
};

export default Motivation;
