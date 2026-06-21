/**
 * banderasData.ts
 * ---------------------------------------------------------------
 * Hard-coded pin-sheet data for the current tournament round.
 *
 * Source: PDF "Banderas-Torneo-Anual-Sabado-6-de-junio-2026.pdf"
 * (LXVI Torneo Anual de Golf — Club Campestre Monterrey AC).
 *
 * Per-hole fields:
 *  - hole         hole number (1..18)
 *  - depth        total green depth, front → back, in paces (yards)
 *  - pinFromFront paces from the FRONT edge of the green to the pin
 *  - pinFromSide  paces from the NEAREST side edge to the pin
 *  - pinSide      'L' | 'R' — which side that "nearest edge" is, viewed
 *                  from the player approaching the green
 *  - slope        boxed +/- number on the original sheet. Per the user
 *                  this represents the local PIN SLOPE / pendiente at the
 *                  pin (positive = uphill putt tendency, negative =
 *                  downhill). Units as printed on the sheet.
 *  - title        free-form title shown at the top of each card
 */

export type PinSide = 'L' | 'R';

export interface PinSheetHole {
  hole: number;
  depth: number;
  pinFromFront: number;
  pinFromSide: number;
  pinSide: PinSide;
  slope: number;
  title?: string;
}

export interface PinSheetMeta {
  title: string;
  subtitle: string;
  /** Date label shown in the hero / sub-header. */
  dateLabel: string;
}

/** Header metadata mirrored from the official PDF. */
export const PIN_SHEET_META: PinSheetMeta = {
  title: 'Posición de Banderas',
  subtitle: 'LXVI Torneo Anual de Golf — Club Campestre Monterrey',
  dateLabel: 'Sábado 6 de junio 2026',
};

/**
 * Pin positions for the 18 holes, exactly as printed on the official
 * pin sheet for this round. Update this list when a new round publishes.
 */
export const PIN_SHEET_HOLES: PinSheetHole[] = [
  { hole: 1,  depth: 36, pinFromFront: 10, pinFromSide: 12, pinSide: 'L', slope: -6  },
  { hole: 2,  depth: 35, pinFromFront: 13, pinFromSide: 26, pinSide: 'L', slope: 9   },
  { hole: 3,  depth: 39, pinFromFront: 8,  pinFromSide: 10, pinSide: 'L', slope: -10 },
  { hole: 4,  depth: 27, pinFromFront: 10, pinFromSide: 19, pinSide: 'L', slope: 6   },
  { hole: 5,  depth: 39, pinFromFront: 10, pinFromSide: 12, pinSide: 'R', slope: -8  },
  { hole: 6,  depth: 37, pinFromFront: 9,  pinFromSide: 30, pinSide: 'L', slope: 12  },
  { hole: 7,  depth: 43, pinFromFront: 11, pinFromSide: 32, pinSide: 'L', slope: 11  },
  { hole: 8,  depth: 28, pinFromFront: 10, pinFromSide: 13, pinSide: 'R', slope: -1  },
  { hole: 9,  depth: 35, pinFromFront: 8,  pinFromSide: 8,  pinSide: 'R', slope: -10 },
  { hole: 10, depth: 36, pinFromFront: 8,  pinFromSide: 26, pinSide: 'L', slope: 8   },
  { hole: 11, depth: 34, pinFromFront: 7,  pinFromSide: 11, pinSide: 'R', slope: -6  },
  { hole: 12, depth: 35, pinFromFront: 7,  pinFromSide: 28, pinSide: 'L', slope: 11  },
  { hole: 13, depth: 33, pinFromFront: 7,  pinFromSide: 13, pinSide: 'L', slope: -4  },
  { hole: 14, depth: 38, pinFromFront: 8,  pinFromSide: 11, pinSide: 'R', slope: -8  },
  { hole: 15, depth: 34, pinFromFront: 6,  pinFromSide: 7,  pinSide: 'L', slope: -10 },
  { hole: 16, depth: 33, pinFromFront: 16, pinFromSide: 21, pinSide: 'L', slope: 5   },
  { hole: 17, depth: 33, pinFromFront: 7,  pinFromSide: 27, pinSide: 'R', slope: 11  },
  { hole: 18, depth: 35, pinFromFront: 8,  pinFromSide: 20, pinSide: 'R', slope: 3   },
];