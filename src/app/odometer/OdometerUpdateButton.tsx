"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import OdometerUpdateModal from "./OdometerUpdateModal";

interface OdometerUpdateButtonProps {
  onUpdated: () => void;
}

export default function OdometerUpdateButton({ onUpdated }: OdometerUpdateButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Atualizar Odômetro
      </Button>
      <OdometerUpdateModal
        open={open}
        onClose={() => setOpen(false)}
        onUpdated={onUpdated}
      />
    </>
  );
}
