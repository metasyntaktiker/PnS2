# Copilot instructions for Pen and Syntax 2

## Project purpose

PnS2 (Pen and Syntax 2) is a Foundry Virtual Tabletop game system for an original tabletop RPG. Its rules are project-specific; do not assume compatibility with another game system or import rules from one. A core feature is the actor-owned talent system: users can add and remove talents, choose each talent's three base attributes, and set its value.

The current Foundry compatibility range is defined by `system.json`. Treat that manifest as authoritative when documentation or old context notes disagree.

## Repository map

- `system.json` — Foundry system ID, version, compatibility, entry points, languages, and document types.
- `scripts/system.js` — Foundry initialization; registers the character data model and sheet, a Handlebars helper, and a default HP hook.
- `scripts/data/character.mjs` — `PnS2CharacterData` schema for character profile, settings, attributes, resources, resistances, speed, and talents.
- `scripts/sheets/character-sheet.mjs` — Character-sheet context, input handling, edit and visibility controls, talent management, progress bars, and roll dialogs/results.
- `templates/actor/character.hbs` — Character sheet UI, including profile, stats, resource bars, and tabs.
- `templates/dialog/add-talent.hbs` and `templates/dialog/roll-dialog.hbs` — Talent creation and roll modifier dialogs.
- `styles/PnS2.css` — Character sheet and dialog styling.
- `lang/en.json` and `lang/de.json` — English and German localization.
- `assets/success.svg` and `assets/fail.svg` — Roll-result art.
- `README.md` — Project/release notes; check `system.json` for current release metadata.
- `AI_CONTEXT.md` — Supplemental project notes; verify time-sensitive facts against the source files.

## Runtime and data flow

This is a plain JavaScript ES-module Foundry system. The manifest loads `scripts/system.js`, which imports the data model and sheet. Character data is stored on the Foundry Actor under `system`; the model schema is the source of valid fields and defaults.

The character sheet reads Actor data in `_prepareContext`, renders Handlebars templates, and writes edits through `actor.update`. Attribute totals are updated by sheet input handling. Rolls use Foundry's `Roll` and `DialogV2` APIs, then report results through chat. Keep template field names, event handlers, schema paths, and localization keys consistent.

## Talent-system rules for code changes

- Talents are an `ArrayField` of objects on each character, with `name`, `base1`, `base2`, `base3`, and `value`.
- Base selections refer to character attribute keys. The add-talent dialog currently offers STR, AGI, PRE, CON, INT, CHA, and WIL.
- Adding, deleting, editing, displaying, and rolling talents are wired through the character sheet. Keep these surfaces consistent when changing the talent data or behavior.
- The current talent calculation is implemented in the sheet, not as a separate game-wide rules engine. Check both displayed totals and roll target calculations before changing it.
- Preserve the ability to customize talents per character. Do not replace the actor's talent list with a hard-coded global list unless the user explicitly changes this design.

## Working conventions

- Follow existing Foundry v13+ APIs and project patterns. Check the current manifest before relying on version-specific APIs.
- Keep scripts as ES modules and use relative imports between source modules.
- Add or change user-visible text in both `lang/en.json` and `lang/de.json`; use the existing localization keys and conventions.
- Preserve existing logging, including the `activateLogging` switch. Do not remove logging as incidental cleanup.
- Do not commit or push changes unless the user explicitly asks.
- Avoid unrelated changes. There is no package manifest or automated test suite in this repository; validate JavaScript syntax and JSON/template consistency, then test behavior in Foundry when runtime behavior changes.
- For releases, keep the version and manifest/download URLs in `system.json` aligned with the intended GitHub release. Do not create releases or publish files unless asked.
