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

    // 🔄 Converte para fuso horário de São Paulo (UTC-3)
    const formatterDate = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const formatterTime = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const dateParts = formatterDate.formatToParts(parsedTime);
    const timeParts = formatterTime.formatToParts(parsedTime);

    const dateKey = `${dateParts.find(p => p.type === 'year')?.value}-${dateParts.find(p => p.type === 'month')?.value}-${dateParts.find(p => p.type === 'day')?.value}`;
    const timeKey = `${timeParts.find(p => p.type === 'hour')?.value}${timeParts.find(p => p.type === 'minute')?.value}${timeParts.find(p => p.type === 'second')?.value}`;

    // 📍 Salva no caminho: gpsLogs/{dateKey}/{timeKey}
    await adminDb
      .collection('users')
      .doc(userId)
      .collection('gpsLogs')
      .doc(dateKey)
      .collection(dateKey)
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
