"use client";

import React from "react";
import { Mail } from "lucide-react";

interface ContactStatusProps {
  contactEmail: string;
  online: boolean;
}

export default function ContactStatus({ contactEmail, online }: ContactStatusProps) {
  return (
    <div className="p-4 border rounded-lg shadow-sm flex flex-col md:flex items-center justify-between">
      <div className="flex items-center  gap-2">
        <span className={`h-3 w-3 rounded-full ${online ? "bg-green-500" : "bg-red-400"}`}></span>
        <span className="text-sm font-medium">{online ? "Online" : "Offline"}</span>
      </div>
      <div className="flex items-center gap-2">
        <Mail className="h-5 w-5 text-gray-60" />
        <span className="text-sm text-gray-90">{contactEmail}</span>
      </div>
    </div>
  );
}
