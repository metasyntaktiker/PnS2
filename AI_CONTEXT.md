# Project: Pen and Syntax 2 (PnS2) - AI Context

## System Overview
- **Target Platform**: Foundry VTT (minimum v13, verified v14; see `system.json`)
- **Documentation Target Platform**: https://foundryvtt.com/api/index.html
- **Link to the FoundryVTT Discord Server:** https://discord.com/invite/foundryvtt
- **System ID**: `PnS2`
- **Manifest**: `system.json`

## Tech Stack
- **Language**: JavaScript (ES Modules)
- **Styles**: CSS
- **Architecture**: Foundry VTT Document/DataModel Architecture

## Project Structure
- **Root**: Repository root.
- **Entry Point**: `scripts/system.js`
  - Handles `init` hook.
  - Registers `PnS2CharacterData` (DataModel).
  - Registers `PnS2CharacterSheet` (Sheet).
  - Handles `preCreateActor` for default HP.

## Key Files & Directories
| Path | Description |
|------|-------------|
| `system.json` | System configuration, authors, styles, and language definitions. |
| `scripts/system.js` | Main entry point. Initializes system and registers components. |
| `scripts/data/character.mjs` | `PnS2CharacterData` class definition (DataModel). |
| `scripts/sheets/character-sheet.mjs` | `PnS2CharacterSheet`; handles sheet UI, editing, imports, and rolls. |
| `scripts/sheets/talent-import.mjs` | Parses pasted character/profile, stat, calculated-value, and talent data. |
| `templates/actor/character.hbs` | Character sheet tabs and form controls, including the Import tab. |
| `styles/PnS2.css` | Main stylesheet. |
| `lang/*.json` | Localization files (en, de). |

## Development Patterns
- **Data Models**: Used for Actor system data (`CONFIG.Actor.dataModels`).
- **Hooks**: Used for lifecycle events (`init`, `preCreateActor`).
- **ESM**: All scripts are modules; imports are relative.

## Character Import
- The Import tab is available only while the sheet's edit mode is enabled. Its textarea is temporary; imported text is not saved to the Actor.
- `scripts/sheets/talent-import.mjs` parses tab-separated and pipe-separated pasted rows. It recognizes English and German labels and tolerates shifted/blank columns in talent rows.
- Imported profile fields are player name, character name (written to the Actor's `name`), species (`system.character.species`), age, birthplace, home, appearance, height, weight, and backstory. Species labels include Species, Rasse, and Spezies; legacy Race labels also map to `species`. Actor data uses `species`, not `race`. Age can be extracted from values such as `788 BF (19)`.
- Imported primary/additional base values are STR, AGI, PRE, CON, INT, CHA, WIL, SEE, HEAR, SMELL, and LUCK.
- Imported calculated values map to existing schema fields: Leben/Lebenspunkte/Hit Points → `hp`; Ausdauer/Endurance → `ep`; Mana → `mp`; Karma → `kp`; Geist/Spirit → `sp`; magic resistance → `rst`; mental resistance → `res`; physical resistance → `tou`; Geschwindigkeit/Speed → `speed`; Initiative → `initiative`; Dodge/Ausweichen → `dodge`.
- Stat imports update each field's `value` and `total`, preserving its existing modifier. Import does not overwrite current HP or other current resource values.
- Talent rows require a name, three recognized base labels, and three numeric cells. The imported talent `value` is taken from the second numeric cell ("Werte zuweisen"), not the base-value bonus or calculated sum. Existing talents are appended to, not replaced.
- Slash-separated combat base alternatives expand to aligned variants. For example, three `Gewandtheit / Stärke` labels produce one talent with all three bases set to `agi` and another with all three set to `str`; alternatives are not mixed across base positions.
- `tests/Example1EnglishImport.md` and `tests/Example1GermanImport.md`, `tests/Example2GermanImport.md`, and `tests/Example3GermanImport.md` are representative source documents. Keep parser mappings and import updates consistent with their table layout and the Actor schema, and keep all four covered by `tests/talent-import.test.mjs`.

## Character sheet and rolls
- The actor schema stores species under `system.character.species`; the profile sheet edits that field. Import recognizes old `Race` labels but maps them to `species`.
- Initiative and Dodge appear directly below Luck in the base-values tab. Both have `value`, `modifier`, and `total`.
- Roll formulas come from each rollable element's `data-roll`: current base attributes, Luck, and Dodge use `1d100`; Initiative uses `1d20`; talents currently use `1d100`.
- Luck targets its base `value` without a modifier. Other stat rolls, including Initiative and Dodge, target `total` (`value + modifier`). The roll dialog can add a temporary modifier.
- Critical thresholds depend on die size: `1d20` uses natural 1/20; other rolls use totals ≤2/≥98. Success otherwise means roll total ≤ target.
- Initiative label localization uses `PnS2.INIT`, and Dodge uses `PnS2.DOD`; their data keys are `initiative` and `dodge`.

## Validation
- Node.js 18+ is required for the dependency-free test procedure. Run `npm test` for automated tests or `npm run check` for JavaScript syntax checks followed by the tests.
- Tests use Node's built-in test runner. Keep parsing logic independent of Foundry globals. Import tests cover all four example documents, supported English/German label aliases, tab- and pipe-separated rows, optional/shifted/blank columns, age extraction, numeric parsing and invalid values, profile/base/calculated mappings, the assigned talent-points cell, aligned combat alternatives, section detection, and malformed talent rows.
- Test both localization JSON files, check dotted keys for namespace collisions, and require English/German key parity.
- For Foundry-dependent changes, also smoke-test imports in a disposable Foundry world; verify Actor data and sheet rendering. Do not use a live world as a test fixture.
- At minimum, run JavaScript syntax checks and parse both localization JSON files after relevant changes. Preserve the repository's existing staged and unstaged changes when validating.

## Important 
- NEVER delete any kind of logging mechanisms
- NEVER commit anything by git or bash
- NEVER push anything by git or bash