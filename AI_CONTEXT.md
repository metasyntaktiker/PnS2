# Project: Pen and Syntax 2 (PnS2) - AI Context

## System Overview
- **Target Platform**: Foundry VTT (Verified v13)
- **Documentation Target Platform**: https://foundryvtt.com/api/index.html
- **Link to the FoundryVTT Discord Server:** https://discord.com/invite/foundryvtt
- **System ID**: `PnS2`
- **Manifest**: `system.json`

## Tech Stack
- **Language**: JavaScript (ES Modules)
- **Styles**: CSS
- **Architecture**: Foundry VTT Document/DataModel Architecture

## Project Structure
- **Root**: `e:\Foundry\FoundryWorlds\Data\systems\PnS2\`
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
| `scripts/sheets/character-sheet.mjs` | `PnS2CharacterSheet` class definition. |
| `styles/PnS2.css` | Main stylesheet. |
| `lang/*.json` | Localization files (en, de). |

## Development Patterns
- **Data Models**: Used for Actor system data (`CONFIG.Actor.dataModels`).
- **Hooks**: Used for lifecycle events (`init`, `preCreateActor`).
- **ESM**: All scripts are modules; imports are relative.

## Important 
- Never delete any kind of logging mechanisms
- Never commit any kind of changes into git