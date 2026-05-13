/**
 * Registro Page (Pre-Registro)
 * --------------------------------------------------------------------
 * Public registration form for the active tournament.
 *
 * The set of rendered fields, their labels and required-state come from
 * /api/registro_fields.php (admin-configurable). Some fields trigger
 * additional UI logic on the client:
 *
 *   - reg_nombre + reg_apellido + reg_fechanac
 *       → if a matching row exists in `jugadores` we auto-fill the rest.
 *   - reg_es_socio (SI/NO) → toggles reg_tipo_socio (Titular/Emérito/Dependiente).
 *   - reg_pais → loads states; reg_estado → loads cities (cascading).
 *   - reg_handicap + reg_sexo + reg_fechanac → restricts the categoría
 *       options to those the player is eligible for.
 *   - reg_archivo → file input, posted as multipart and stored as LONGBLOB.
 *
 * Submission goes to /api/registro.php as multipart/form-data.
 */

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Layout from '@/components/layout/Layout';
import PageHero from '@/components/shared/PageHero';
import registroHero from '@/assets/registro-hero.jpg';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle2, Send, HelpCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useRegistroFields } from '@/hooks/useRegistroFields';
import { useCategories } from '@/hooks/usePlayersData';
import { useTournamentInfo } from '@/hooks/useTournamentData';
import { useToast } from '@/hooks/use-toast';
import {
  getRegistroSubmitUrl,
  getLocationsCountriesUrl,
  getLocationsStatesUrl,
  getLocationsCitiesUrl,
  getClubsUrl,
  getClubLookupUrl,
  getEmailValidateUrl,
  getPlayerLookupByIdUrl,
} from '@/config/api';

// ============= Types =============

/** Row returned by /api/locations.php */
interface LocationRow { id: number; name: string }

/** Row returned by /api/clubs.php */
interface ClubRow {
  id: number;
  nombre: string;
  /** Optional location strings (whichever exist in the `clubs` table). */
  ciudad?: string;
  estado?: string;
  pais?: string;
  /** Optional location IDs (preferred when present — exact match). */
  id_pais?: number;
  id_estado?: number;
  id_ciudad?: number;
}

/** Field-name → suggested placeholder text shown as greyed example. */
const PLACEHOLDERS: Record<string, string> = {
  reg_nombre:     'Ej: Juan Carlos',
  reg_apellido:   'Ej: Pérez González',
  reg_correo:     'tu@correo.com',
  reg_telefono:   '+52 55 1234 5678',
  reg_handicap:   'Ej: 14.2',
  reg_club:       'Ej: Club de Golf Valle Alto',
  reg_ghin:       'Ej: 123456789',
  numghinspei:    'Ej: 123456789',
  reg_spei:       'Tu ID interno (si lo conoces)',
  reg_notas:      'Notas adicionales para el comité…',
  reg_mensaje:    'Notas adicionales para el comité…',
  reg_fechanac:   'dd/mm/aaaa',
  reg_direccion:  'Calle, número, colonia',
  reg_cp:         'Ej: 64000',
};

// ============= Date helpers (dd/mm/aaaa) =============

/** Parse a dd/mm/aaaa string into {y,m,d} or null if invalid. */
const parseDmy = (s: string): { y: number; m: number; d: number } | null => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec((s || '').trim());
  if (!m) return null;
  const d = +m[1], mo = +m[2], y = +m[3];
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return { y, m: mo, d };
};
/** Convert dd/mm/aaaa → YYYY-MM-DD (or '' if invalid). */
const dmyToIso = (s: string): string => {
  const p = parseDmy(s);
  return p ? `${p.y.toString().padStart(4, '0')}-${String(p.m).padStart(2, '0')}-${String(p.d).padStart(2, '0')}` : '';
};
/** Convert YYYY-MM-DD → dd/mm/aaaa (or '' if invalid). */
const isoToDmy = (s: string): string => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || '');
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
};
/** Auto-mask digit input as dd/mm/aaaa while typing. */
const maskDmy = (raw: string): string => {
  const d = raw.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
};
/** Validate a dd/mm/aaaa birthdate: not in future, not today, not >120 years ago. */
const validateBirthDmy = (s: string): string => {
  if (!s) return '';
  const p = parseDmy(s);
  if (!p) return 'Formato inválido. Usa dd/mm/aaaa.';
  const dt  = new Date(p.y, p.m - 1, p.d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (dt >= today)                return 'La fecha no puede ser hoy ni futura.';
  if (p.y < (now.getFullYear() - 120)) return 'Fecha demasiado antigua.';
  return '';
};

// ============= Helpers =============

/** Calculate age in completed years from a YYYY-MM-DD birthdate. */
const calcAge = (yyyymmdd: string): number | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(yyyymmdd)) return null;
  const [y, m, d] = yyyymmdd.split('-').map(Number);
  const dob = new Date(y, m - 1, d);
  if (isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const beforeBirthday =
    now.getMonth() < dob.getMonth() ||
    (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate());
  if (beforeBirthday) age -= 1;
  return age;
};

/**
 * Normalize a string for tolerant matching: lowercase, trimmed, and with
 * combining diacritics stripped ("México" → "mexico", "Nuevo León" →
 * "nuevo leon"). Used when matching club location strings against the
 * country/state/city dropdown lists.
 */
const norm = (s: string): string =>
  (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

/**
 * Aliases used when matching club.estado strings to the `states` dropdown.
 * The `clubs` table sometimes stores short forms ("CDMX") while the
 * `states` table uses the full name ("Ciudad de México"). Keys/values are
 * pre-normalized (no accents, lowercase). All entries are bidirectional.
 */
const STATE_ALIASES: Record<string, string[]> = {
  'cdmx':              ['ciudad de mexico', 'distrito federal', 'df', 'mexico df', 'mexico city'],
  'ciudad de mexico':  ['cdmx', 'distrito federal', 'df'],
  'edomex':            ['estado de mexico', 'mexico'],
  'estado de mexico':  ['edomex'],
  'nuevo leon':        ['nl', 'n.l.'],
  'baja california':   ['bc', 'b.c.'],
  'baja california sur': ['bcs', 'b.c.s.'],
  'quintana roo':      ['qroo', 'q. roo', 'qr'],
  'san luis potosi':   ['slp', 's.l.p.'],
};

/** Returns true if two location strings refer to the same place,
 *  considering the alias table above. Both inputs may be raw. */
const locMatches = (a: string, b: string): boolean => {
  const na = norm(a);
  const nb = norm(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if ((STATE_ALIASES[na] || []).some(x => norm(x) === nb)) return true;
  if ((STATE_ALIASES[nb] || []).some(x => norm(x) === na)) return true;
  return false;
};

// ============= Phone country codes =============
/** Mini list of country dial codes shown in the phone <Select>. MX first. */
const PHONE_CODES: { code: string; flag: string; label: string; len: number }[] = [
  { code: '+52', flag: '🇲🇽', label: 'México',         len: 10 },
  { code: '+1',  flag: '🇺🇸', label: 'EE. UU. / CAN', len: 10 },
  { code: '+34', flag: '🇪🇸', label: 'España',         len: 9  },
  { code: '+54', flag: '🇦🇷', label: 'Argentina',      len: 10 },
  { code: '+55', flag: '🇧🇷', label: 'Brasil',         len: 11 },
  { code: '+56', flag: '🇨🇱', label: 'Chile',          len: 9  },
  { code: '+57', flag: '🇨🇴', label: 'Colombia',       len: 10 },
  { code: '+58', flag: '🇻🇪', label: 'Venezuela',      len: 10 },
  { code: '+51', flag: '🇵🇪', label: 'Perú',           len: 9  },
  { code: '+593', flag: '🇪🇨', label: 'Ecuador',       len: 9  },
  { code: '+502', flag: '🇬🇹', label: 'Guatemala',     len: 8  },
  { code: '+503', flag: '🇸🇻', label: 'El Salvador',   len: 8  },
  { code: '+506', flag: '🇨🇷', label: 'Costa Rica',    len: 8  },
];

// ============= Component =============

const Registro = () => {
  const { data: fieldsData, isLoading: loadingFields } = useRegistroFields();
  const { data: categories = [] } = useCategories();
  const { data: tournamentInfo } = useTournamentInfo();
  const { toast } = useToast();

  /** Values for every form field, keyed by field_name. */
  const [values, setValues] = useState<Record<string, string>>({});
  /** Selected file for reg_archivo (kept outside `values` since it's binary). */
  const [file, setFile] = useState<File | null>(null);
  /** Submission state */
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /** Cascading dropdown data + selected ids */
  const [countries, setCountries] = useState<LocationRow[]>([]);
  const [states, setStates]       = useState<LocationRow[]>([]);
  const [cities, setCities]       = useState<LocationRow[]>([]);

  /** Full club list (for the reg_club autocomplete datalist). */
  const [clubs, setClubs] = useState<ClubRow[]>([]);

  /**
   * Tracks the last "nombre|apellido|fechanac" key for which we performed
   * an existing-player lookup, so we don't re-fire on every keystroke or
   * overwrite an edited club value.
   */
  const [lastLookupKey, setLastLookupKey] = useState<string>('');

  /** Tracks whether we already auto-filled the club from "soy socio = SI"
   *  so toggling NO doesn't keep clobbering manual edits. */
  const [socioClubAutofilled, setSocioClubAutofilled] = useState(false);

  /** Inline error message for the handicap field (shown on blur). */
  const [handicapError, setHandicapError] = useState<string>('');

  /** Inline error / suggestion for the email field (shown on blur). */
  const [emailError, setEmailError] = useState<string>('');
  const [emailSuggestion, setEmailSuggestion] = useState<string>('');
  const [emailChecking, setEmailChecking] = useState(false);

  /** Inline error for the phone field. */
  const [phoneError, setPhoneError] = useState<string>('');
  /** Selected dial code (defaults to MX). */
  const [phoneCode, setPhoneCode] = useState<string>('+52');
  /** Local 10-digit (or country-specific) phone digits, no spaces. */
  const [phoneLocal, setPhoneLocal] = useState<string>('');

  /** Inline error for the birthdate field (dd/mm/aaaa). */
  const [birthError, setBirthError] = useState<string>('');
  /** Visible dd/mm/aaaa string for the birthdate input. */
  const [birthDmy, setBirthDmy]     = useState<string>('');

  /** Tracks the last lookup key for SPEI/GHIN to avoid spamming. */
  const [lastIdLookup, setLastIdLookup] = useState<string>('');

  /**
   * Field config sorted by display_order, enabled only.
   * UX rule: `reg_sexo` and `reg_fechanac` MUST always render right
   * before `reg_categoria` because they drive the eligible-categories
   * filter. We re-order them client-side regardless of admin display_order.
   */
  const visibleFields = useMemo(() => {
    if (!fieldsData?.fields) return [];
    const enabled = [...fieldsData.fields]
      .filter(f => !!f.is_enabled)
      .sort((a, b) => a.display_order - b.display_order);

    const sexo = enabled.find(f => f.field_name === 'reg_sexo');
    const fnac = enabled.find(f => f.field_name === 'reg_fechanac');
    const cat  = enabled.find(f => f.field_name === 'reg_categoria');
    if (!cat || (!sexo && !fnac)) return enabled;

    const without = enabled.filter(
      f => f.field_name !== 'reg_sexo' && f.field_name !== 'reg_fechanac'
    );
    const catIdx = without.findIndex(f => f.field_name === 'reg_categoria');
    const head = without.slice(0, catIdx);
    const tail = without.slice(catIdx); // starts with reg_categoria
    return [
      ...head,
      ...(sexo ? [sexo] : []),
      ...(fnac ? [fnac] : []),
      ...tail,
    ];
  }, [fieldsData]);

  /** Quick lookup: is a given field configured/enabled? */
  const isFieldEnabled = (name: string) => visibleFields.some(f => f.field_name === name);
  const isFieldRequired = (name: string) =>
    !!visibleFields.find(f => f.field_name === name && f.is_required);

  /**
   * Strict numeric handicap regex: digits, optional single dot, digits.
   * Empty string is treated as "not yet entered" (no error).
   */
  const HANDICAP_RE = /^\d+(\.\d+)?$/;

  /** onBlur validator for the handicap field. */
  const validateHandicapOnBlur = () => {
    const v = (values.reg_handicap || '').trim();
    if (v === '') { setHandicapError(''); return; }
    if (!HANDICAP_RE.test(v)) {
      const msg = 'Hándicap inválido. Usa solo números y punto decimal (ej: 14.2)';
      setHandicapError(msg);
      toast({ title: 'Hándicap inválido', description: msg, variant: 'destructive' });
    } else {
      setHandicapError('');
    }
  };

  // ============= Email validation =============

  /** Strict client-side email syntax. RFC-ish; rejects spaces, multiple @, etc. */
  const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  /** Validate email on blur: regex + server MX check + typo suggestion. */
  const validateEmailOnBlur = async () => {
    const v = (values.reg_correo || '').trim();
    setEmailSuggestion('');
    if (v === '') { setEmailError(''); return; }
    if (!EMAIL_RE.test(v)) {
      const msg = 'Correo inválido. Verifica el formato (ej: nombre@dominio.com)';
      setEmailError(msg);
      toast({ title: 'Correo inválido', description: msg, variant: 'destructive' });
      return;
    }
    setEmailChecking(true);
    try {
      const res = await fetch(getEmailValidateUrl(v));
      const j = await res.json().catch(() => ({}));
      if (j?.valid) {
        setEmailError('');
        return;
      }
      if (j?.reason === 'typo' && j?.suggestion) {
        setEmailSuggestion(j.suggestion);
        const msg = `¿Quisiste decir ${j.suggestion}?`;
        setEmailError(msg);
        toast({ title: 'Posible error en el correo', description: msg, variant: 'destructive' });
      } else if (j?.reason === 'no_mx') {
        const msg = 'El dominio del correo no existe o no recibe correos.';
        setEmailError(msg);
        toast({ title: 'Correo inválido', description: msg, variant: 'destructive' });
      } else {
        const msg = 'Correo inválido.';
        setEmailError(msg);
        toast({ title: 'Correo inválido', description: msg, variant: 'destructive' });
      }
    } catch {
      // Network failure — don't block, server check is best-effort.
      setEmailError('');
    } finally {
      setEmailChecking(false);
    }
  };

  /** Apply the typo suggestion banner. */
  const acceptEmailSuggestion = () => {
    if (!emailSuggestion) return;
    setValue('reg_correo', emailSuggestion);
    setEmailError('');
    setEmailSuggestion('');
  };

  // ============= Phone validation =============

  /** Selected country's required digit length. */
  const phoneLenRequired = useMemo(
    () => PHONE_CODES.find(p => p.code === phoneCode)?.len ?? 10,
    [phoneCode]
  );

  /** Re-compose reg_telefono whenever code or local digits change. */
  useEffect(() => {
    if (!phoneLocal) {
      setValue('reg_telefono', '');
      return;
    }
    setValue('reg_telefono', `${phoneCode} ${phoneLocal}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneCode, phoneLocal]);

  /** Validate the phone on blur (length + digits-only). */
  const validatePhoneOnBlur = () => {
    if (!phoneLocal) { setPhoneError(''); return; }
    if (!/^\d+$/.test(phoneLocal)) {
      const msg = 'Sólo se permiten números (sin espacios ni guiones).';
      setPhoneError(msg);
      toast({ title: 'Teléfono inválido', description: msg, variant: 'destructive' });
      return;
    }
    if (phoneLocal.length !== phoneLenRequired) {
      const msg = `Debe tener exactamente ${phoneLenRequired} dígitos.`;
      setPhoneError(msg);
      toast({ title: 'Teléfono inválido', description: msg, variant: 'destructive' });
      return;
    }
    setPhoneError('');
  };

  /** Load countries on mount (only if the field is enabled). */
  useEffect(() => {
    if (!isFieldEnabled('reg_pais')) return;
    fetch(getLocationsCountriesUrl())
      .then(r => r.json())
      .then((rows: LocationRow[]) => setCountries(rows || []))
      .catch(() => setCountries([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleFields.length]);

  /** Cascade states when country changes. */
  useEffect(() => {
    const cid = values.reg_pais;
    if (!cid) { setStates([]); return; }
    fetch(getLocationsStatesUrl(cid))
      .then(r => r.json())
      .then((rows: LocationRow[]) => setStates(rows || []))
      .catch(() => setStates([]));
    // Note: we intentionally do NOT auto-clear estado/ciudad here so that
    // the club-autofill chain (which sets pais → states load → estado →
    // cities load → ciudad) doesn't wipe its own intermediate value. The
    // user-driven dropdowns also re-validate against the loaded list.
  }, [values.reg_pais]);

  /** Cascade cities when state changes. */
  useEffect(() => {
    const sid = values.reg_estado;
    if (!sid) { setCities([]); return; }
    fetch(getLocationsCitiesUrl(sid))
      .then(r => r.json())
      .then((rows: LocationRow[]) => setCities(rows || []))
      .catch(() => setCities([]));
  }, [values.reg_estado]);

  /** Load full clubs list once, when reg_club is enabled. */
  useEffect(() => {
    if (!isFieldEnabled('reg_club')) return;
    fetch(getClubsUrl())
      .then(r => r.json())
      .then(j => setClubs(Array.isArray(j?.clubs) ? j.clubs : []))
      .catch(() => setClubs([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleFields.length]);

  /**
   * When the user has filled nombre + apellido (and optionally fechanac),
   * look up an existing `jugadores` row and pre-fill the club. Field stays
   * fully editable in case the player has switched clubs since.
   */
  useEffect(() => {
    if (!isFieldEnabled('reg_club')) return;
    const nombre   = (values.reg_nombre   || '').trim();
    const apellido = (values.reg_apellido || '').trim();
    const fechanac = (values.reg_fechanac || '').trim();
    if (nombre.length < 2 || apellido.length < 2) return;
    const key = `${nombre.toLowerCase()}|${apellido.toLowerCase()}|${fechanac}`;
    if (key === lastLookupKey) return;

    let cancelled = false;
    const t = setTimeout(() => {
      setLastLookupKey(key);
      fetch(getClubLookupUrl(nombre, apellido, fechanac))
        .then(r => r.json())
        .then(j => {
          if (cancelled) return;
          // Tag whether we found this player at all — used by the
          // es_socio NO branch to decide between "leave blank" vs autofill.
          setValues(v => ({ ...v, __player_found: j?.found ? '1' : '0' }));
          if (!j?.found || !j?.club) return;
          // Only auto-fill club when the user hasn't typed one yet.
          setValues(v => v.reg_club ? v : { ...v, reg_club: String(j.club) });
        })
        .catch(() => { /* silent — autofill is best-effort */ });
    }, 400);
    return () => { cancelled = true; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.reg_nombre, values.reg_apellido, values.reg_fechanac, visibleFields.length]);

  /**
   * Es-socio autofill rules:
   *  - SI  → reg_club = host tournament club name (always overwrites).
   *  - NO  → if we previously autofilled from SI, clear it so the user
   *          (or the player-lookup effect above) can fill the real club.
   */
  useEffect(() => {
    const ans = values.reg_es_socio;
    if (ans === 'SI' && tournamentInfo?.club) {
      setSocioClubAutofilled(true);
      setValues(v => ({ ...v, reg_club: tournamentInfo.club }));
    } else if (ans === 'NO' && socioClubAutofilled) {
      setSocioClubAutofilled(false);
      // Clear the SI-injected value so the player-lookup effect (or the
      // user) can re-populate it. If we already have player data the
      // lookup effect will refill on the next debounce tick.
      setValues(v => ({ ...v, reg_club: '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.reg_es_socio, tournamentInfo?.club]);

  /**
   * When the typed club name matches a known club row, auto-fill país /
   * estado / ciudad by case-insensitive name match against the cascading
   * dropdown lists. We only set values that resolve cleanly to an ID.
   */
  useEffect(() => {
    const clubName = norm(values.reg_club || '');
    if (!clubName) return;
    const match = clubs.find(c => norm(c.nombre) === clubName);
    if (!match) return;

    // 1) Country resolution priority:
    //    a) explicit id_pais from clubs table
    //    b) name match (accent-insensitive) against countries list
    //    c) sensible default of "mexico" / "méxico" / "mx" / "mex"
    let country = match.id_pais
      ? countries.find(c => c.id === match.id_pais)
      : undefined;
    if (!country) {
      const paisName = norm(match.pais || '');
      country = paisName
        ? countries.find(c => norm(c.name) === paisName)
        : countries.find(c => ['mexico', 'mx', 'mex'].includes(norm(c.name)));
    }
    if (country && values.reg_pais !== String(country.id)) {
      setValues(v => ({ ...v, reg_pais: String(country.id) }));
      return; // wait for states to load on next render
    }

    // 2) State (depends on states list being loaded for current country)
    let st = match.id_estado && states.length
      ? states.find(s => s.id === match.id_estado)
      : undefined;
    if (!st && states.length) {
      const estadoName = norm(match.estado || '');
      if (estadoName) {
        st = states.find(s => locMatches(s.name, match.estado || ''))
          || states.find(s => norm(s.name).includes(estadoName)
                           || estadoName.includes(norm(s.name)));
      }
    }
    if (st && values.reg_estado !== String(st.id)) {
      setValues(v => ({ ...v, reg_estado: String(st.id) }));
      return;
    }

    // 3) City (depends on cities list being loaded for current state)
    let ci = match.id_ciudad && cities.length
      ? cities.find(c => c.id === match.id_ciudad)
      : undefined;
    if (!ci && cities.length) {
      const ciudadName = norm(match.ciudad || '');
      if (ciudadName) {
        ci = cities.find(c => locMatches(c.name, match.ciudad || ''))
          || cities.find(c => norm(c.name).includes(ciudadName)
                           || ciudadName.includes(norm(c.name)));
      }
    }
    if (ci && values.reg_ciudad !== String(ci.id)) {
      setValues(v => ({ ...v, reg_ciudad: String(ci.id) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.reg_club, clubs, countries, states, cities]);

  /** Eligible categories given hcp/sex/age (when those values are present). */
  const eligibleCategories = useMemo(() => {
    const hcp  = parseFloat(values.reg_handicap);
    const sex  = (values.reg_sexo || '').toUpperCase();
    const age  = calcAge(values.reg_fechanac || '');
    return categories.filter(c => {
      // Handicap range — only filter when user has typed a number AND the
      // category has a usable range (max > 0 in legacy data sometimes is 0).
      if (!isNaN(hcp) && c.hcpMax > 0 && (hcp < c.hcpMin || hcp > c.hcpMax)) return false;
      // Gender filter when category restricts it (M/F).
      if (sex && c.gender && (c.gender === 'M' || c.gender === 'F') && c.gender !== sex) return false;
      // Age range filter (senior categories with min/max set).
      if (age !== null) {
        if (c.ageMin != null && age < c.ageMin) return false;
        if (c.ageMax != null && age > c.ageMax) return false;
      }
      return true;
    });
  }, [categories, values.reg_handicap, values.reg_sexo, values.reg_fechanac]);

  /** Generic value setter. */
  const setValue = (name: string, v: string) =>
    setValues(prev => ({ ...prev, [name]: v }));

  /**
   * SPEI / GHIN lookup: when either reg_spei or numghinspei has a long
   * enough value, query /api/clubs.php?action=lookup&spei=…&ghin=… and
   * pre-fill any empty top-level fields (nombre, apellido, correo, club,
   * sexo, fechanac). Existing user input is never overwritten.
   */
  useEffect(() => {
    const spei = (values.reg_spei || '').trim();
    const ghin = (values.numghinspei || values.reg_ghin || '').trim();
    if (spei.length < 3 && ghin.length < 3) return;
    const key = `${spei}|${ghin}`;
    if (key === lastIdLookup) return;
    let cancelled = false;
    const t = setTimeout(() => {
      setLastIdLookup(key);
      fetch(getPlayerLookupByIdUrl(spei, ghin))
        .then(r => r.json())
        .then(j => {
          if (cancelled || !j?.found) return;
          /** Only fill empty fields — never clobber user input. */
          setValues(v => {
            const next = { ...v };
            const fill = (k: string, val: any) => {
              if (val == null || val === '') return;
              if (!next[k]) next[k] = String(val);
            };
            fill('reg_nombre',   j.nombre);
            fill('reg_apellido', j.apellido);
            fill('reg_correo',   j.correo);
            fill('reg_club',     j.club);
            const sx = j.sexo || j.genero;
            if (sx) fill('reg_sexo', String(sx).toUpperCase().startsWith('F') ? 'F' : 'M');
            if (j.fechanac && /^\d{4}-\d{2}-\d{2}/.test(j.fechanac)) {
              fill('reg_fechanac', j.fechanac.slice(0, 10));
              if (!birthDmy) setBirthDmy(isoToDmy(j.fechanac));
            }
            return next;
          });
        })
        .catch(() => { /* silent */ });
    }, 500);
    return () => { cancelled = true; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.reg_spei, values.numghinspei, values.reg_ghin]);

  /** Submit the form as multipart/form-data. */
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Validate birthdate dd/mm/aaaa if rendered.
    if (isFieldEnabled('reg_fechanac')) {
      const err = validateBirthDmy(birthDmy);
      if (err) {
        setBirthError(err);
        toast({ title: 'Fecha de nacimiento inválida', description: err, variant: 'destructive' });
        return;
      }
    }
    // Block submission when the handicap value is malformed.
    if (isFieldEnabled('reg_handicap')) {
      const v = (values.reg_handicap || '').trim();
      if (v && !HANDICAP_RE.test(v)) {
        validateHandicapOnBlur();
        return;
      }
    }
    // Block submission when email failed validation.
    if (isFieldEnabled('reg_correo') && (emailError || (values.reg_correo && !EMAIL_RE.test(values.reg_correo.trim())))) {
      validateEmailOnBlur();
      return;
    }
    // Block submission when phone is incomplete or invalid.
    if (isFieldEnabled('reg_telefono')) {
      const requiredPhone = isFieldRequired('reg_telefono');
      if (requiredPhone && !phoneLocal) {
        setPhoneError('Ingresa tu teléfono.');
        toast({ title: 'Teléfono requerido', variant: 'destructive' });
        return;
      }
      if (phoneLocal && (phoneLocal.length !== phoneLenRequired || !/^\d+$/.test(phoneLocal))) {
        validatePhoneOnBlur();
        return;
      }
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(values).forEach(([k, v]) => {
        // Skip our internal/private flags (prefixed with __).
        if (k.startsWith('__')) return;
        if (v !== '' && v !== undefined && v !== null) fd.append(k, v);
      });
      if (file) fd.append('reg_archivo', file);

      const res = await fetch(getRegistroSubmitUrl(), { method: 'POST', body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !(json as any).saved) {
        throw new Error((json as any).error || 'Error al enviar el formulario');
      }
      setSubmitted(true);
      toast({ title: '¡Pre-registro enviado!', description: 'Recibirás confirmación por correo.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  /** Render one field row by its config entry. */
  const renderField = (name: string, label: string, required: boolean) => {
    const placeholder = PLACEHOLDERS[name] ?? '';
    const id = `f-${name}`;
    const common = { id, required, placeholder } as const;

    // ----- Specialized renderers -----
    if (name === 'reg_es_socio') {
      return (
        <div className="space-y-2" key={name}>
          <Label htmlFor={id}>{label}{required && <span className="text-destructive"> *</span>}</Label>
          <Select value={values[name] || ''} onValueChange={v => setValue(name, v)}>
            <SelectTrigger id={id}><SelectValue placeholder="Selecciona una opción" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="SI">Sí, soy socio</SelectItem>
              <SelectItem value="NO">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (name === 'reg_tipo_socio') {
      const enabled = values.reg_es_socio === 'SI';
      return (
        <div className="space-y-2" key={name}>
          <Label htmlFor={id}>{label}{required && enabled && <span className="text-destructive"> *</span>}</Label>
          <Select value={values[name] || ''} onValueChange={v => setValue(name, v)} disabled={!enabled}>
            <SelectTrigger id={id}>
              <SelectValue placeholder={enabled ? 'Selecciona el tipo' : 'Solo para socios'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TITULAR">Titular</SelectItem>
              <SelectItem value="EMERITO">Emérito</SelectItem>
              <SelectItem value="DEPENDIENTE">Dependiente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (name === 'reg_sexo') {
      // UX: stored as M/F in the DB, presented as Hombre/Mujer with the
      // localized label "Género" regardless of what the admin configured.
      return (
        <div className="space-y-2" key={name}>
          <Label htmlFor={id}>Género{required && <span className="text-destructive"> *</span>}</Label>
          <Select value={values[name] || ''} onValueChange={v => setValue(name, v)}>
            <SelectTrigger id={id}><SelectValue placeholder="Selecciona" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="M">Hombre</SelectItem>
              <SelectItem value="F">Mujer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (name === 'reg_categoria') {
      return (
        <div className="space-y-2" key={name}>
          {/* Label + Popover help (works on tap mobile and click desktop,
              same pattern as the HI/HJ/HN headers in /jugadores). */}
          <div className="flex items-center gap-1.5">
            <Label htmlFor={id}>{label}{required && <span className="text-destructive"> *</span>}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="¿Cómo se eligen las categorías?"
                  className="inline-flex items-center text-muted-foreground hover:text-foreground cursor-help"
                >
                  <HelpCircle className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="top" className="max-w-[260px] w-auto text-xs p-3">
                Las categorías mostradas se filtran automáticamente con base en
                tu <strong>género</strong>, <strong>edad</strong> (fecha de
                nacimiento) y <strong>hándicap</strong>.
              </PopoverContent>
            </Popover>
          </div>
          <Select value={values[name] || ''} onValueChange={v => setValue(name, v)}>
            <SelectTrigger id={id}>
              <SelectValue placeholder={eligibleCategories.length ? 'Selecciona categoría' : 'Completa hcp/sexo/edad'} />
            </SelectTrigger>
            <SelectContent>
              {eligibleCategories.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {eligibleCategories.length} categoría(s) compatible(s) con tus datos.
          </p>
        </div>
      );
    }

    if (name === 'reg_correo') {
      // Email input with onBlur server-side MX/typo validation. Inline
      // suggestion banner lets the user accept "did you mean ..." with one click.
      return (
        <div className="space-y-2" key={name}>
          <Label htmlFor={id}>{label}{required && <span className="text-destructive"> *</span>}</Label>
          <Input
            id={id}
            type="email"
            inputMode="email"
            autoComplete="email"
            required={required}
            placeholder={PLACEHOLDERS[name] ?? 'tu@correo.com'}
            value={values[name] || ''}
            onChange={e => {
              setValue(name, e.target.value);
              if (emailError) setEmailError('');
              if (emailSuggestion) setEmailSuggestion('');
            }}
            onBlur={validateEmailOnBlur}
            aria-invalid={!!emailError}
            className={emailError ? 'border-destructive focus-visible:ring-destructive' : ''}
          />
          {emailChecking && (
            <p className="text-xs text-muted-foreground">Verificando dominio…</p>
          )}
          {emailError && !emailSuggestion && (
            <p className="text-xs text-destructive">{emailError}</p>
          )}
          {emailSuggestion && (
            <p className="text-xs text-destructive">
              ¿Quisiste decir{' '}
              <button
                type="button"
                className="underline font-medium"
                onClick={acceptEmailSuggestion}
              >
                {emailSuggestion}
              </button>
              ?
            </p>
          )}
        </div>
      );
    }

    if (name === 'reg_telefono') {
      // Composite phone input: dial-code <Select> with flag emoji + digits-only
      // text input. Joined value is mirrored into reg_telefono ("+52 5512345678").
      const expectedLen = phoneLenRequired;
      return (
        <div className="space-y-2" key={name}>
          <Label htmlFor={id}>{label}{required && <span className="text-destructive"> *</span>}</Label>
          <div className="flex gap-2">
            <Select value={phoneCode} onValueChange={setPhoneCode}>
              <SelectTrigger className="w-[120px]" aria-label="Lada">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PHONE_CODES.map(p => (
                  <SelectItem key={p.code} value={p.code}>
                    <span className="mr-2">{p.flag}</span>{p.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              id={id}
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              required={required}
              maxLength={expectedLen}
              placeholder={`${expectedLen} dígitos`}
              value={phoneLocal}
              onChange={e => {
                // Strip everything that isn't a digit; cap at expected length.
                const digits = e.target.value.replace(/\D/g, '').slice(0, expectedLen);
                setPhoneLocal(digits);
                if (phoneError) setPhoneError('');
              }}
              onBlur={validatePhoneOnBlur}
              aria-invalid={!!phoneError}
              className={phoneError ? 'border-destructive focus-visible:ring-destructive flex-1' : 'flex-1'}
            />
          </div>
          {phoneError ? (
            <p className="text-xs text-destructive">{phoneError}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Selecciona la lada y escribe {expectedLen} dígitos sin espacios.
            </p>
          )}
        </div>
      );
    }

    if (name === 'reg_club') {
      // Editable text input + native <datalist> autocomplete reduces options
      // as the user types. Auto-filled from existing jugadores match when
      // available; user can overwrite freely (e.g. they changed clubs).
      const listId = `${id}-clubs`;
      return (
        <div className="space-y-2" key={name}>
          <Label htmlFor={id}>{label}{required && <span className="text-destructive"> *</span>}</Label>
          <Input
            id={id}
            type="text"
            required={required}
            placeholder={PLACEHOLDERS[name] ?? 'Ej: Club de Golf…'}
            value={values[name] || ''}
            onChange={e => setValue(name, e.target.value)}
            list={listId}
            autoComplete="off"
          />
          <datalist id={listId}>
            {clubs.map(c => (
              <option key={c.id} value={c.nombre} />
            ))}
          </datalist>
        </div>
      );
    }

    if (name === 'reg_pais') {
      return (
        <div className="space-y-2" key={name}>
          <Label htmlFor={id}>{label}{required && <span className="text-destructive"> *</span>}</Label>
          <Select value={values[name] || ''} onValueChange={v => setValue(name, v)}>
            <SelectTrigger id={id}><SelectValue placeholder="Selecciona país" /></SelectTrigger>
            <SelectContent>
              {countries.map(c => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (name === 'reg_estado') {
      return (
        <div className="space-y-2" key={name}>
          <Label htmlFor={id}>{label}{required && <span className="text-destructive"> *</span>}</Label>
          <Select value={values[name] || ''} onValueChange={v => setValue(name, v)} disabled={!values.reg_pais}>
            <SelectTrigger id={id}>
              <SelectValue placeholder={values.reg_pais ? 'Selecciona estado' : 'Selecciona país primero'} />
            </SelectTrigger>
            <SelectContent>
              {states.map(s => (
                <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (name === 'reg_ciudad') {
      return (
        <div className="space-y-2" key={name}>
          <Label htmlFor={id}>{label}{required && <span className="text-destructive"> *</span>}</Label>
          <Select value={values[name] || ''} onValueChange={v => setValue(name, v)} disabled={!values.reg_estado}>
            <SelectTrigger id={id}>
              <SelectValue placeholder={values.reg_estado ? 'Selecciona ciudad' : 'Selecciona estado primero'} />
            </SelectTrigger>
            <SelectContent>
              {cities.map(c => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (name === 'reg_archivo') {
      return (
        <div className="space-y-2" key={name}>
          <Label htmlFor={id}>{label}{required && <span className="text-destructive"> *</span>}</Label>
          <Input
            id={id}
            type="file"
            accept="image/*,application/pdf"
            required={required}
            onChange={e => setFile(e.target.files?.[0] ?? null)}
          />
          <p className="text-xs text-muted-foreground">PDF o imagen, máximo 15 MB.</p>
        </div>
      );
    }

    if (name === 'reg_notas') {
      return (
        <div className="space-y-2 md:col-span-2" key={name}>
          <Label htmlFor={id}>{label}{required && <span className="text-destructive"> *</span>}</Label>
          <Textarea
            id={id} required={required} placeholder={placeholder}
            value={values[name] || ''}
            onChange={e => setValue(name, e.target.value)}
            rows={4}
          />
        </div>
      );
    }

    /** Default: text/email/number/date input. */
    let type: string = 'text';
    if (name === 'reg_correo')     type = 'email';
    if (name === 'reg_telefono')   type = 'tel';

    /**
     * Specialized birthdate input: dd/mm/aaaa with auto-mask while typing,
     * and on-blur validation against future/today/200-years-ago. The ISO
     * version is mirrored into values.reg_fechanac so all downstream
     * effects (categoría eligibility, jugadores lookup, server-side
     * akron_edad) keep working unchanged.
     */
    if (name === 'reg_fechanac') {
      return (
        <div className="space-y-2" key={name}>
          <Label htmlFor={id}>{label}{required && <span className="text-destructive"> *</span>}</Label>
          <Input
            id={id}
            type="text"
            inputMode="numeric"
            autoComplete="bday"
            placeholder="dd/mm/aaaa"
            maxLength={10}
            required={required}
            value={birthDmy}
            onChange={e => {
              const masked = maskDmy(e.target.value);
              setBirthDmy(masked);
              if (birthError) setBirthError('');
              setValue('reg_fechanac', dmyToIso(masked));
            }}
            onBlur={() => {
              const err = validateBirthDmy(birthDmy);
              setBirthError(err);
              if (err) {
                toast({ title: 'Fecha inválida', description: err, variant: 'destructive' });
              }
            }}
            aria-invalid={!!birthError}
            className={birthError ? 'border-destructive focus-visible:ring-destructive' : ''}
          />
          {birthError ? (
            <p className="text-xs text-destructive">{birthError}</p>
          ) : (
            <p className="text-xs text-muted-foreground">Formato dd/mm/aaaa</p>
          )}
        </div>
      );
    }

    // Specialized handicap input: text + decimal inputMode so mobile keyboards
    // expose the dot, and a strict regex pattern that rejects commas / letters.
    if (name === 'reg_handicap') {
      return (
        <div className="space-y-2" key={name}>
          <Label htmlFor={id}>{label}{required && <span className="text-destructive"> *</span>}</Label>
          <Input
            id={id}
            type="text"
            inputMode="decimal"
            pattern="[0-9]+(\\.[0-9]+)?"
            placeholder={PLACEHOLDERS[name]}
            required={required}
            value={values[name] || ''}
            onChange={e => {
              setValue(name, e.target.value);
              if (handicapError) setHandicapError('');
            }}
            onBlur={validateHandicapOnBlur}
            aria-invalid={!!handicapError}
            className={handicapError ? 'border-destructive focus-visible:ring-destructive' : ''}
          />
          {handicapError && (
            <p className="text-xs text-destructive">{handicapError}</p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-2" key={name}>
        <Label htmlFor={id}>{label}{required && <span className="text-destructive"> *</span>}</Label>
        <Input
          {...common}
          type={type}
          value={values[name] || ''}
          onChange={e => setValue(name, e.target.value)}
        />
      </div>
    );
  };

  return (
    <Layout>
      <PageHero
        title="Pre-Registro"
        subtitle="Inscríbete al torneo. Verificaremos tus datos y te enviaremos confirmación por correo."
        backgroundImage={registroHero}
      />

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          {submitted ? (
            <Card>
              <CardContent className="py-12 text-center space-y-4">
                <CheckCircle2 className="w-16 h-16 mx-auto text-primary" />
                <h2 className="text-2xl font-bold">¡Pre-registro recibido!</h2>
                <p className="text-muted-foreground">
                  Hemos guardado tu solicitud. El comité revisará tus datos
                  y te contactará por correo para confirmar tu inscripción.
                </p>
                <Button variant="outline" onClick={() => { setSubmitted(false); setValues({}); setFile(null); }}>
                  Enviar otro pre-registro
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Formulario de Pre-Registro</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingFields ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Cargando formulario…
                  </div>
                ) : (
                  <form onSubmit={onSubmit} className="space-y-8">
                    {(() => {
                      // Group enabled fields by section while preserving order.
                      const order: Array<{ key: string; title: string }> = [
                        { key: 'basica',      title: 'Información básica' },
                        { key: 'socios',      title: '¿Eres socio?' },
                        { key: 'adicionales', title: 'Información adicional' },
                      ];
                      const grouped: Record<string, typeof visibleFields> = {};
                      visibleFields.forEach(f => {
                        const k = (f.section as string) || 'basica';
                        (grouped[k] ||= []).push(f);
                      });
                      // Any custom section keys not in `order` go after.
                      Object.keys(grouped).forEach(k => {
                        if (!order.find(o => o.key === k)) {
                          order.push({ key: k, title: k.charAt(0).toUpperCase() + k.slice(1) });
                        }
                      });

                      /**
                       * Progressive reveal: section N renders only when every
                       * required field in sections 0..N-1 has a value.
                       */
                      const isSectionComplete = (key: string) => {
                        const list = grouped[key] || [];
                        return list.every(f => {
                          if (!f.is_required) return true;
                          // Conditional required: tipo_socio only when es_socio = SI
                          if (f.field_name === 'reg_tipo_socio' && values.reg_es_socio !== 'SI') return true;
                          return !!(values[f.field_name] || '').trim();
                        });
                      };

                      const blocks: JSX.Element[] = [];
                      let revealUpTo = true;
                      order.forEach((sec, idx) => {
                        const list = grouped[sec.key];
                        if (!list || list.length === 0) return;
                        if (!revealUpTo) return;

                        blocks.push(
                          <section key={sec.key} className="space-y-4">
                            {/* Section header + thin divider as visual spacer */}
                            <div className="space-y-2">
                              <h3 className="text-base font-semibold text-foreground">{sec.title}</h3>
                              <div className="h-px bg-border" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {list
                                .filter(f => {
                                  // Hide reg_tipo_socio entirely until es_socio = SI.
                                  if (f.field_name === 'reg_tipo_socio' && values.reg_es_socio !== 'SI') return false;
                                  return true;
                                })
                                .map(f => renderField(f.field_name, f.field_label, !!f.is_required))}
                            </div>
                          </section>
                        );

                        // Decide if the next section should be revealed.
                        if (idx < order.length - 1 && !isSectionComplete(sec.key)) {
                          revealUpTo = false;
                        }
                      });
                      return blocks;
                    })()}
                    <div className="flex justify-end pt-2">
                      <Button type="submit" disabled={submitting} className="gap-2" size="lg">
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Enviar pre-registro
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Registro;