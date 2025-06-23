'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Info, Link as LinkIcon, XCircle, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useGpsStatus } from '@/hooks/useGpsStatus';
import { useAuth } from '@/components/USER/Auth/AuthContext'; // ajuste ao seu auth

export default function GpsControl() {
  const [started, setStarted] = useState(false);
  const { currentUser } = useAuth();
  const { status, lastUpdate, position } = useGpsStatus(currentUser?.uid || '');

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
          https://seusite.com/api/GpsTrack?uid={currentUser?.uid}
        </div>

        <Button onClick={() => setStarted(true)}>
          Iniciar Rastreamento GPS
        </Button>

        {started && (
          <div className="mt-4 space-y-2">
            <div className={`flex items-center gap-2 ${status === 'online' ? 'text-green-600' : 'text-red-600'}`}>
              {status === 'online' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              {status === 'online' ? 'GPS Ativo. Dados sendo recebidos.' : 'GPS Inativo ou sem dados recentes.'}
            </div>

            {position && (
              <div className="flex items-center gap-2 text-gray-700 text-sm">
                <MapPin className="w-4 h-4" />
                Última posição: {position.lat.toFixed(5)}, {position.lon.toFixed(5)}
              </div>
            )}

            {lastUpdate && (
              <p className="text-xs text-gray-500">
                Atualizado em: {lastUpdate.toLocaleTimeString()}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
