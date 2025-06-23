'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Info, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

export default function GpsControl() {
  const [started, setStarted] = useState(false);

  return (
    <Card className="p-4 mt-4">
      <CardContent className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-500" />
          Rastreamento por GPSLogger
        </h2>

        <p>
          Para iniciar a contagem de rodagem diária por GPS, instale o app{' '}
          <Link
            href="https://f-droid.org/packages/com.mendhak.gpslogger/"
            target="_blank"
            className="text-blue-600 underline inline-flex items-center gap-1"
          >
            GPSLogger <LinkIcon className="w-4 h-4" />
          </Link>{' '}
          e configure o envio para:
        </p>
        <div className="bg-gray-100 p-2 rounded text-sm text-gray-800 break-all">
          https://seusite.com/api/GPSTRACK
        </div>

        <Button onClick={() => setStarted(true)}>
          Iniciar Rastreamento GPS
        </Button>

        {started && (
          <div className="text-green-600 flex items-center gap-2 mt-2">
            <CheckCircle className="w-5 h-5" />
            GPS Ativo. Enviando localização em tempo real.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
