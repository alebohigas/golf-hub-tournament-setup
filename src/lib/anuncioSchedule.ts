/**
 * anuncioSchedule
 * -----------------------------------------------------------------------
 * Utilidades para el temporizador de la tira de anuncios (Admin > Anuncio).
 *
 * La ventana de publicación se define con un día (YYYY-MM-DD) y dos horas
 * (HH:MM inicio / HH:MM fin) y SIEMPRE se evalúa con la hora de Ciudad de
 * México, de modo que el anuncio aparece y desaparece a la misma hora para
 * cualquier visitante, sin importar la zona horaria de su dispositivo.
 */

import type { AnuncioConfig } from '@/hooks/useSiteConfig';

/** Zona horaria de referencia para todos los horarios del torneo. */
const TZ = 'America/Mexico_City';

/**
 * Devuelve la fecha y hora actuales de Ciudad de México como cadenas
 * comparables: { date: 'YYYY-MM-DD', time: 'HH:MM' }.
 */
export const getCdMxNowParts = (now: Date = new Date()): { date: string; time: string } => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const hour = get('hour') === '24' ? '00' : get('hour');
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    time: `${hour}:${get('minute')}`,
  };
};

/**
 * ¿El anuncio está dentro de su ventana de publicación?
 * Sin temporizador (o incompleto) devuelve true: se publica siempre.
 * La ventana ahora puede abarcar varios días (startDate → endDate).
 */
export const isAnuncioWithinSchedule = (cfg: AnuncioConfig, now: Date = new Date()): boolean => {
  const s = cfg.schedule;
  if (!s?.enabled) return true;
  const startDate = s.startDate || s.date;
  const endDate = s.endDate || startDate;
  if (!startDate || !endDate || !s.startTime || !s.endTime) return true;
  const { date: today, time } = getCdMxNowParts(now);

  if (today < startDate) return false;
  if (today > endDate) return false;

  if (startDate === endDate) {
    // Ventana que cruza la medianoche: se trata como "desde el inicio hasta las 23:59".
    if (s.endTime <= s.startTime) return time >= s.startTime;
    return time >= s.startTime && time <= s.endTime;
  }

  if (today === startDate) return time >= s.startTime;
  if (today === endDate) return time <= s.endTime;
  return true; // días intermedios del rango
};

/** Texto legible del temporizador para el panel de administración. */
export const describeAnuncioSchedule = (cfg: AnuncioConfig): string => {
  const s = cfg.schedule;
  const startDate = s?.startDate || s?.date;
  const endDate = s?.endDate || startDate;
  if (!s?.enabled || !startDate || !endDate || !s.startTime || !s.endTime) return 'Sin temporizador';
  if (startDate === endDate) {
    return `Se publica el ${startDate} de ${s.startTime} a ${s.endTime} (hora CDMX)`;
  }
  return `Se publica del ${startDate} ${s.startTime} al ${endDate} ${s.endTime} (hora CDMX)`;
};
