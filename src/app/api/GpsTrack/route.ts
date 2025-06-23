import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/db/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    // Captura o userId da URL (?uid=...)
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('uid');

    if (!userId) {
      return NextResponse.json({ message: 'Usuário não identificado' }, { status: 400 });
    }

    // Captura o JSON enviado pelo GPSLogger
    const body = await req.json();
    const { latitude, longitude, speed, time } = body;

    if (!latitude || !longitude || !time) {
      return NextResponse.json({ message: 'Dados incompletos' }, { status: 400 });
    }

    // Converte valores
    const parsedLat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
    const parsedLon = typeof longitude === 'string' ? parseFloat(longitude) : longitude;
    const parsedSpeed = typeof speed === 'string' ? parseFloat(speed) : speed;
    const parsedTime = new Date(time);

    if (isNaN(parsedLat) || isNaN(parsedLon) || isNaN(parsedSpeed) || isNaN(parsedTime.getTime())) {
      return NextResponse.json({ message: 'Dados inválidos' }, { status: 400 });
    }

    // Salva na subcoleção do usuário
    await adminDb
      .collection('users')
      .doc(userId)
      .collection('gpsLogs')
      .add({
        latitude: parsedLat,
        longitude: parsedLon,
        speed: parsedSpeed,
        time: parsedTime,
        createdAt: new Date(),
      });

    return NextResponse.json({ message: 'Localização registrada com sucesso' });
  } catch (error) {
    console.error('Erro ao registrar localização:', error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}
