# Guia para IA (ChatGPT, Copilot, etc.)

Este documento tem como objetivo fornecer diretrizes para IA e assistentes de código compreenderem e ajudarem no desenvolvimento do projeto **Moto Diário V2**.

## 📌 Visão Geral
Moto Diário V2 é uma aplicação web desenvolvida em **Next.js, TypeScript e Tailwind CSS** com integração ao **Firebase**. A aplicação gerencia registros de motoentregadores, incluindo **ganhos, abastecimentos, manutenção e quilômetros rodados**.

## 🛠️ Arquivos Importantes
Os seguintes arquivos são essenciais para o desenvolvimento e devem ser referenciados sempre que forem feitas alterações significativas:

- **Banco de dados e autenticação:**
  - `src/lib/db/firebaseServices.ts` → Serviços de conexão ao Firebase
  - `src/lib/db/firebaseContext.tsx` → Contexto de autenticação e estados globais

- **Componentes UI Reutilizáveis:**
  - `src/components/ui/button.tsx` → Botão customizado utilizado em toda a aplicação
  - `src/components/ui/input.tsx` → Campo de entrada padrão

- **Funcionalidades principais:**
  - `src/app/fuelings/RegisterFuelings.tsx` → Componente para registrar abastecimentos
  - `src/app/earnings/RegisterEarnings.tsx` → Componente para registrar ganhos
  - `src/app/bike/OverviewBike.tsx` → Componente que exibe dados da motocicleta

## ⚡ Como Gerar Código de Forma Precisa
1. **Sempre respeitar a estrutura do projeto.**  
2. **Evitar arquivos JSX.** O projeto está sendo convertido para TypeScript (TSX).  
3. **Seguir o padrão de componentes ShadCN UI e Tailwind.**  
4. **Sempre utilizar `useState`, `useEffect` e `useContext` com tipagem em TypeScript.**  
5. **Ao criar funções, manter os estilos e tipagens já existentes.**  
6. **Se precisar modificar `firebaseServices.ts`, sempre validar as regras do Firebase.**

## 🔥 Exemplo de Padrão de Código
```tsx
// Exemplo de um botão tipado corretamente para este projeto
import React from "react";

interface ButtonProps {
  label: string;
  onClick: () => void;
}

const CustomButton: React.FC<ButtonProps> = ({ label, onClick }) => {
  return (
    <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={onClick}>
      {label}
    </button>
  );
};

export default CustomButton;
