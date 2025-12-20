export class PnS2CharacterData extends foundry.abstract.DataModel {
  static defineSchema() {
    return {

      // --- Base stats --- 
      /* ------------------------ Example ------------------------
      **          | Basevalue | Modifier (whatever reason) | Total
      ** STRENGTH | 15        | 6                          | 21
      */      
      // Strength
      str: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0, max: 100 }),
        modifier: new foundry.data.fields.NumberField({ initial: 0 })
      }),

      // Agility
      agi: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0, max: 100 }),
        modifier: new foundry.data.fields.NumberField({ initial: 0 })
      }),
      
      // Precision
      pre: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0, max: 100 }),
        modifier: new foundry.data.fields.NumberField({ initial: 0 })
      }),
      
      // Constitution
      con: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0, max: 100 }),
        modifier: new foundry.data.fields.NumberField({ initial: 0 })
      }),

      // Intelligence
      int: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0, max: 100 }),
        modifier: new foundry.data.fields.NumberField({ initial: 0 })
      }),
      
      // Charisma
      cha: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0, max: 100 }),
        modifier: new foundry.data.fields.NumberField({ initial: 0 })
      }),

      // Will
      wil: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0, max: 100 }),
        modifier: new foundry.data.fields.NumberField({ initial: 0 })
      }),

      // --- Sensory stats ---
      // See
      see: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0, max: 100 }),
        modifier: new foundry.data.fields.NumberField({ initial: 0 })
      }),

      // Hear
      hear: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0, max: 100 }),
        modifier: new foundry.data.fields.NumberField({ initial: 0 })
      }),

      // Smell
      small: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0, max: 100 }),
        modifier: new foundry.data.fields.NumberField({ initial: 0 })
      }),

      // --- Extra stats ---
      // Experience
      xp: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0 }),
        modifier: new foundry.data.fields.NumberField({ initial: 0 })
      }),

      // Luck
      luck: new foundry.data.fields.NumberField({ initial: 10, min: 0, max: 100 }),

      // --- Calculated stats ---
      // Health / Health Points
      hp: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0 }),
        modifier: new foundry.data.fields.NumberField({ initial: 0 }),
        max: new foundry.data.fields.NumberField({ initial: 10, min: 0 })
      }),

      // Endurance / Endurance Points
      ep: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0 }),
        modifier: new foundry.data.fields.NumberField({ initial: 0 }),
        max: new foundry.data.fields.NumberField({ initial: 10, min: 0 })
      }),

      // Mana / Mana Points
      mp: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0 }),
        modifier: new foundry.data.fields.NumberField({ initial: 0 }),
        max: new foundry.data.fields.NumberField({ initial: 10, min: 0 })
      }),

      // Karma / Karma Points
      kp: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0 }),
        modifier: new foundry.data.fields.NumberField({ initial: 0 }),
        max: new foundry.data.fields.NumberField({ initial: 10, min: 0 })
      }),

      // Spirit / Spirit Points
      sp: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0 }),
        modifier: new foundry.data.fields.NumberField({ initial: 0 }),
        max: new foundry.data.fields.NumberField({ initial: 10, min: 0 })
      }),

      // Magic Resistance
      rst: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0 }),
        modifier: new foundry.data.fields.NumberField({ initial: 0 })
      }),

      // Mental Resistance
      res: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0 }),
        modifier: new foundry.data.fields.NumberField({ initial: 0 })
      }),

      // Physical Resistance
      tou: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0 }),
        modifier: new foundry.data.fields.NumberField({ initial: 0 })
      }),
      
      // Speed
      speed: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0 }),
        modifier: new foundry.data.fields.NumberField({ initial: 0 })
      }),
    };
  }
}