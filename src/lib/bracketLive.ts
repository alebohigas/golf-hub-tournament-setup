/**
 * bracketLive
 * ----------------------------------------------------------------------------
 * Canal de sincronización EN VIVO (push) para los brackets de Match Play /
 * Putt, incluido el match por 3er lugar.
 *
 * ¿Por qué no polling?
 *   El backend es PHP/MySQL en hosting compartido: no hay WebSockets ni un
 *   proceso persistente donde sostener SSE. La alternativa fiable es un push
 *   basado en eventos del navegador, que entrega la actualización de forma
 *   INMEDIATA (no en el próximo tick de un intervalo):
 *
 *     1. `BroadcastChannel` — pestañas del mismo navegador/origen.
 *     2. `localStorage` + evento `storage` — respaldo para navegadores sin
 *        BroadcastChannel (Safari antiguo) y para pestañas de otra ventana.
 *     3. Evento DOM local (`window`) — la misma pestaña que emite también se
 *        actualiza (BroadcastChannel no se auto-entrega).
 *     4. `focus` / `visibilitychange` — al volver a la pestaña (o desbloquear
 *        el teléfono) se revalida una vez, cubriendo cambios ocurridos
 *        mientras la pestaña estaba en segundo plano.
 *
 * Uso:
 *   - Admin: `publishBracketChange()` tras capturar score / ganador / reset.
 *   - Público: `subscribeBracketChanges(cb)` (lo hace `useBracketLiveSync`).
 */

/** Nombre del BroadcastChannel y de la clave localStorage / evento DOM. */
const CHANNEL = 'bracket_scores_changed';

/** Payload que viaja por el canal. `at` fuerza cambio de valor en localStorage. */
export interface BracketChangeMessage {
  type: 'changed';
  /** Timestamp de emisión (ms). */
  at: number;
  /** Origen opcional del cambio, útil para depurar. */
  source?: string;
}

/**
 * Publica un cambio de bracket a TODAS las vistas abiertas (esta pestaña
 * incluida). No lanza nunca: si el navegador no soporta alguna vía, las demás
 * siguen funcionando.
 */
export const publishBracketChange = (source?: string): void => {
  const msg: BracketChangeMessage = { type: 'changed', at: Date.now(), source };

  // 1) BroadcastChannel → otras pestañas del mismo origen.
  try {
    const ch = new BroadcastChannel(CHANNEL);
    ch.postMessage(msg);
    ch.close();
  } catch {
    /* navegador sin soporte: quedan las vías 2 y 3 */
  }

  // 2) localStorage → dispara `storage` en las demás pestañas.
  try {
    localStorage.setItem(CHANNEL, String(msg.at));
  } catch {
    /* modo privado / cuota: ignorar */
  }

  // 3) Evento DOM → la pestaña que emite (admin) se refresca igual.
  try {
    window.dispatchEvent(new CustomEvent<BracketChangeMessage>(CHANNEL, { detail: msg }));
  } catch {
    /* SSR / entorno sin window */
  }
};

/**
 * Suscribe un callback a los cambios de bracket. Devuelve la función de
 * limpieza que hay que llamar al desmontar.
 */
export const subscribeBracketChanges = (onChange: () => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const cleanups: Array<() => void> = [];

  // 1) BroadcastChannel
  try {
    const ch = new BroadcastChannel(CHANNEL);
    ch.onmessage = () => onChange();
    cleanups.push(() => {
      ch.onmessage = null;
      ch.close();
    });
  } catch {
    /* sin soporte */
  }

  // 2) localStorage (`storage` sólo llega a las OTRAS pestañas)
  const onStorage = (e: StorageEvent) => {
    if (e.key === CHANNEL) onChange();
  };
  window.addEventListener('storage', onStorage);
  cleanups.push(() => window.removeEventListener('storage', onStorage));

  // 3) Evento DOM local (misma pestaña)
  const onLocal = () => onChange();
  window.addEventListener(CHANNEL, onLocal as EventListener);
  cleanups.push(() => window.removeEventListener(CHANNEL, onLocal as EventListener));

  // 4) Revalidación al recuperar foco / visibilidad
  const onFocus = () => onChange();
  const onVisible = () => {
    if (document.visibilityState === 'visible') onChange();
  };
  window.addEventListener('focus', onFocus);
  document.addEventListener('visibilitychange', onVisible);
  cleanups.push(() => {
    window.removeEventListener('focus', onFocus);
    document.removeEventListener('visibilitychange', onVisible);
  });

  return () => cleanups.forEach((fn) => fn());
};
