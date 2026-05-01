---
name: LOCKED — everything except pre-registros
description: All features/files are LOCKED and working. Only pre-registros may be modified. Never touch anything else.
type: constraint
---
# 🔒 LOCKED PROJECT STATE

**As of 2026-05-01, the entire app is working correctly EXCEPT pre-registros.**

## Hard rules
1. **ONLY** modify code related to **pre-registros**. Nothing else.
2. **DO NOT** touch ANY other file, query, component, hook, PHP endpoint, column config, type, route, or memory — even if it looks wrong, redundant, or "easy to improve".
3. **DO NOT** refactor, rename, reorder, "clean up", consolidate, or generalize anything outside pre-registros.
4. **DO NOT** expand scope. If the user asks for a tiny UI fix (e.g. "yds vs mts"), make the **smallest possible** change in the **fewest files** and stop. No "while I'm here" edits.
5. **DO NOT** re-read or modify any of these areas unless the user explicitly mentions them by name in the current message:
   - `server/api/competencias.php`, `salidas_det.php`, `resultados*.php`, `live_*.php`, `oyes*.php`, `putt.php`, `skin_game.php`
   - `src/data/competencias/*`, `src/components/competencias/*`, `src/pages/Competencias.tsx`
   - `src/pages/Resultados.tsx`, `src/pages/Live.tsx`, `src/pages/Salidas.tsx`
   - Tie-breaking, ordering, scoring, round keys, column configs
6. **Why:** The user has lost trust due to repeated regressions where unrelated working code was broken during unrelated edits. Stability > improvements.

## When in doubt
- Ask the user before touching anything outside pre-registros.
- Prefer "I won't touch that" over "let me also fix this".
