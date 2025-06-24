import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/db/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('uid');

    if (!userId) {
      return NextResponse.json({ message: 'Usuário não identificado' }, { status: 400 });
    }

    const body = await req.json();
    const { latitude, longitude, speed = 0, time, context = null } = body;

    if (!latitude || !longitude || !time) {
      return NextResponse.json({ message: 'Dados incompletos' }, { status: 400 });
    }

    const parsedLat = parseFloat(latitude);
    const parsedLon = parseFloat(longitude);
    const parsedSpeed = parseFloat(speed);
    const parsedTime = new Date(time);

    if (
      isNaN(parsedLat) ||
      isNaN(parsedLon) ||
      isNaN(parsedSpeed) ||
      isNaN(parsedTime.getTime())
    ) {
      return NextResponse.json({ message: 'Dados inválidos' }, { status: 400 });
    }

    const dateKey = parsedTime.toISOString().split('T')[0]; // 2025-06-23
    const timeKey = parsedTime.toTimeString().slice(0, 8).replace(/:/g, ''); // 214251

    // Novo caminho: gpsLogs/{dateKey}/{timeKey}
    await adminDb
      .collection('users')
      .doc(userId)
      .collection('gpsLogs')
      .doc(dateKey)
      .collection(dateKey) // <- nome da subcoleção igual à data
      .doc(timeKey)
      .set({
        latitude: parsedLat,
        longitude: parsedLon,
        speed: parsedSpeed,
        time: parsedTime,
        context,
        createdAt: new Date(),
      });

    return NextResponse.json({ message: 'Localização registrada com sucesso' });
  } catch (error) {
    console.error('Erro ao registrar localização:', error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}
