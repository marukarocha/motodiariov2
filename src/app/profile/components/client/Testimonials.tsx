"use client";

import React from "react";

const testimonials = [
  {
    id: 1,
    name: "João Silva",
    text: "O entregador é extremamente pontual e atencioso. Recomendo!",
  },
  {
    id: 2,
    name: "Maria Oliveira",
    text: "Serviço de primeira! Super confiável e profissional.",
  },
];

export default function Testimonials() {
  return (
    <div className="p-4 h-auto border rounded-lg shadow-md ">
      <h2 className="text-xl font-bold mb-4">Depoimentos</h2>
      <div className="space-y-4">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="border-l-4 pl-4">
            <p className="text-sm text-gray-200 italic">"{testimonial.text}"</p>
            <p className="text-xs text-gray-100">- {testimonial.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
