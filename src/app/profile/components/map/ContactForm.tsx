"use client";
import React, { FC, ChangeEvent } from 'react';

export interface Contact {
  name: string;
  phone: string;
  email: string;
}

interface ContactFormProps {
  contact: Contact;
  setContact: (contact: Contact) => void;
}

const ContactForm: FC<ContactFormProps> = ({ contact, setContact }) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setContact({ ...contact, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Contato</h2>
      <div className="mb-4">
        <input
          type="text"
          name="name"
          placeholder="Nome"
          value={contact.name}
          onChange={handleChange}
          className="border p-2 w-full mb-2"
        />
        <input
          type="text"
          name="phone"
          placeholder="Telefone"
          value={contact.phone}
          onChange={handleChange}
          className="border p-2 w-full mb-2"
        />
        <input
          type="email"
          name="email"
          placeholder="E-mail"
          value={contact.email}
          onChange={handleChange}
          className="border p-2 w-full"
        />
      </div>
    </div>
  );
};

export default ContactForm;
