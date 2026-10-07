# Project architecture rules

- Keep Time Line print density, block measurements, page cuts, browser printing, and PDF slicing driven by the same CSS variables and page geometry so previews match final output.
- Store each tournament's rules-official heading, name, and phone in `convocatoria_content.reglas_oficial` so the public contact stays tournament-specific.
- Keep SHEET LIVE scale and one/two-column layout in URL parameters and apply them to the same report container for screen and print consistency.
- Keep calendar color eligibility separate from group counts: use actual tee times when available, otherwise scheduled starts even before groups exist; authorize mixed cells only for occupied A/B subgroups and merge category/day records without inventing mixed sessions so both calendar views and totals stay consistent.