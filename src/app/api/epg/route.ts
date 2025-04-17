
import { NextRequest } from 'next/server';
import { format, parse, isAfter, isBefore } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

const timeZone = 'America/Puerto_Rico';

type Show = {
  start: string;
  end: string;
  title: string;
};

type ChannelSchedule = {
  name: string;
  id: string;
  schedule: Show[];
};

const channels: ChannelSchedule[] = [
  {
    name: 'KQ105 Radio',
    id: 'kq105radio',
    schedule: [
      { start: '00:00', end: '06:00', title: 'Carlos Gabriel' },
      { start: '06:00', end: '10:00', title: 'Héctor Ortiz' },
      { start: '10:00', end: '15:00', title: 'Alex Díaz' },
      { start: '15:00', end: '18:00', title: 'La Tendencia de Molusco' },
      { start: '18:00', end: '19:00', title: 'Pedro Villegas' },
      { start: '19:00', end: '24:00', title: 'Edwin Negrón' },
    ],
  },
  {
    name: 'KQ105 TV',
    id: 'kq105tv',
    schedule: [
      { start: '06:00', end: '12:00', title: 'KQ105 Mañana TV' },
      { start: '12:00', end: '17:00', title: 'KQ105 en la Tarde' },
      { start: '17:00', end: '21:00', title: 'KQ105 PrimeTime' },
      { start: '21:00', end: '24:00', title: 'KQ105 Nocturno' },
    ],
  },
  {
    name: 'Netflix',
    id: 'netflix',
    schedule: [
      { start: '00:00', end: '06:00', title: 'Stranger Things' },
      { start: '06:00', end: '12:00', title: 'The Witcher' },
      { start: '12:00', end: '18:00', title: 'Lupin' },
      { start: '18:00', end: '24:00', title: 'Cobra Kai' },
    ],
  },
];

function getCurrentShow(schedule: Show[], now: Date): string {
  const current = zonedTimeToUtc(now, timeZone);

  for (const block of schedule) {
    const start = zonedTimeToUtc(parse(block.start, 'HH:mm', now), timeZone);
    const end = zonedTimeToUtc(parse(block.end === '24:00' ? '23:59' : block.end, 'HH:mm', now), timeZone);

    if (isAfter(current, start) && isBefore(current, end)) {
      return block.title;
    }
  }

  return 'OFF AIR';
}

export async function GET(req: NextRequest) {
  const now = utcToZonedTime(new Date(), timeZone);
  const currentHour = format(now, 'HH:mm');

  const epg = channels.map((channel) => ({
    id: channel.id,
    name: channel.name,
    now: currentHour,
    currentShow: getCurrentShow(channel.schedule, now),
  }));

  return new Response(JSON.stringify(epg), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
