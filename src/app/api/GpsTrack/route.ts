import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/db/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    // Captura o userId da query string
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('uid');

    if (!userId) {
      return NextResponse.json({ message: 'Usuário não identificado' }, { status: 400 });
    }

    // Captura o JSON enviado
    const body = await req.json();
    const { latitude, longitude, speed, time } = body;

    if (!latitude || !longitude || !time) {
      return NextResponse.json({ message: 'Dados incompletos' }, { status: 400 });
    }

    // Salva na subcoleção do usuário
    await adminDb
      .collection('users')
      .doc(userId)
      .collection('gpsLogs')
      .add({
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
