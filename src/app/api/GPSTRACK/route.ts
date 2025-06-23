import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/lib/db/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { latitude, longitude, speed, time } = body;

    if (!latitude || !longitude || !time) {
      return NextResponse.json({ message: 'Dados incompletos' }, { status: 400 });
    }

    await firestore.collection('gpsLogs').add({
      latitude,
      longitude,
      speed,
      time: new Date(time),
      createdAt: new Date(),
    });

    return NextResponse.json({ message: 'Localização registrada com sucesso' });
  } catch (error) {
    console.error('Erro ao registrar localização:', error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}
