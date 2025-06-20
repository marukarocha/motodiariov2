"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Tip {
  id: string;
  title: string;
  message: string;
  icon?: string;
  visible: boolean;
  categoryId?: string;
}

export default function Tips() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [randomTip, setRandomTip] = useState<Tip | null>(null);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(true);
  const [typedMessage, setTypedMessage] = useState("");
  const [categoriesMap, setCategoriesMap] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchTips() {
      try {
        const [tipsRes, catRes] = await Promise.all([
          fetch("/api/admin/maintenance/tips"),
          fetch("/api/admin/maintenance/categories")
        ]);
        const tipsData = await tipsRes.json();
        const catData = await catRes.json();

        const visibles = tipsData.filter((t: Tip) => t.visible);
        setTips(visibles);
        if (visibles.length > 0) {
          const random = visibles[Math.floor(Math.random() * visibles.length)];
          setRandomTip(random);
        }

        const catMap: Record<string, string> = {};
        catData.forEach((cat: any) => {
          catMap[cat.id] = cat.category;
        });
        setCategoriesMap(catMap);
      } catch (error) {
        console.error("Erro ao buscar dicas ou categorias:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTips();
  }, []);

  useEffect(() => {
    if (randomTip?.message) {
      let i = 0;
      const interval = setInterval(() => {
        setTypedMessage((prev) => prev + randomTip.message[i]);
        i++;
        if (i >= randomTip.message.length) clearInterval(interval);
      }, 30);
      return () => clearInterval(interval);
    }
  }, [randomTip]);

  useEffect(() => {
    const timeout = setTimeout(() => setShow(false), 10000);
    return () => clearTimeout(timeout);
  }, []);

  if (loading || !randomTip || !show) return null;

  const Icon = randomTip.icon ? require("react-icons/gi")[randomTip.icon] || null : null;
  const categoryName = randomTip.categoryId ? categoriesMap[randomTip.categoryId] : "";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5 }}
        className="origin-left mb-4"
      >
        <Card className="relative bg-gray-900 dark:bg-gray900 border-gray-300 dark:border-gray-700 p-3 shadow-md overflow-hidden">
          <CardContent className="flex items-start gap-3 text-blue-800 dark:text-blue-100">
            {Icon && <Icon size={24} className="min-w-[24px] mt-1" />}
            <div>
              <h3 className="text-base font-bold mb-1">
                {randomTip.title}
                {categoryName && ` – ${categoryName}`}
              </h3>
              <h4 className="text-base whitespace-pre-line">{typedMessage}</h4>
            </div>
            <button onClick={() => setShow(false)} className="absolute top-2 right-2 text-blue-500 hover:text-blue-700">
              <X size={16} />
            </button>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
