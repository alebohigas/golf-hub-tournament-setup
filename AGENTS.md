# Project architecture rules

- Keep Time Line print density, block measurements, page cuts, browser printing, and PDF slicing driven by the same CSS variables and page geometry so previews match final output.
- Store each tournament's rules-official heading, name, and phone in `convocatoria_content.reglas_oficial` so the public contact stays tournament-specific.
- Keep SHEET LIVE scale and one/two-column layout in URL parameters and apply them to the same report container for screen and print consistency.
- Classify generated calendar groups by their actual tee times, fall back only to occupied planned tees when no groups exist, and merge category/day records before both calendar views render so unused tee times never create mixed sessions and totals stay consistent.