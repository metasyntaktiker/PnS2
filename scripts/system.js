globalThis.activateLogging = true;

import { PnS2CharacterData } from "./data/character.mjs";
import { PnS2CharacterSheet } from "./sheets/character-sheet.mjs";

Hooks.once("init", () => {
  console.log("PnS2 | Initializing Pen and Syntax 2");

  // Register data model
  CONFIG.Actor.dataModels.character = PnS2CharacterData;

  // Register sheet
  foundry.documents.collections.Actors.registerSheet(
    "PnS2",
    PnS2CharacterSheet,
    {
      types: ["character"],
      makeDefault: true
    }
  );
});

// Ensure default HP on creation
Hooks.on("preCreateActor", (actor) => {
  if (actor.type === "character") {
    actor.update({
      "system.hp.value": actor.system.hp?.value ?? 10,
      "system.hp.total": actor.system.hp?.total ?? 10
    });
  }
});
