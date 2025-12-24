export class PnS2CharacterData extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      character: new foundry.data.fields.SchemaField({
        playername: new foundry.data.fields.StringField({ initial: "" }),
        age: new foundry.data.fields.NumberField({ initial: 0 }),
        placeofbirth: new foundry.data.fields.StringField({ initial: "" }),
        home: new foundry.data.fields.StringField({ initial: "" }),
        appearance: new foundry.data.fields.StringField({ initial: "" }),
        gender: new foundry.data.fields.StringField({ initial: "" }),
        job: new foundry.data.fields.StringField({ initial: "" }),
        affiliation: new foundry.data.fields.StringField({ initial: "" }),
        height: new foundry.data.fields.StringField({ initial: "" }),
        weight: new foundry.data.fields.StringField({ initial: "" }),
        backstory: new foundry.data.fields.StringField({ initial: "" }),
        notes: new foundry.data.fields.StringField({ initial: "" })
      }),
      // --- Base stats --- 
      /* ------------------------ Example ------------------------
      **          | Basevalue | Modifier (whatever reason) | Total
      ** STRENGTH | 15        | 6                          | 21
      */      
      // Strength
      str: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0 }),
        modifier: new foundry.data.fields.NumberField({ initial: 0 }),
        total: new foundry.data.fields.NumberField({ initial: 0 })
      }),

      // Agility
      agi: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0 }),
        modifier: new foundry.data.fields.NumberField({ initial: 0 }),
        total: new foundry.data.fields.NumberField({ initial: 0 })        
      }),
      
      // Precision
      pre: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0}),
        modifier: new foundry.data.fields.NumberField({ initial: 0 }),
        total: new foundry.data.fields.NumberField({ initial: 0 })
      }),
      
      // Constitution
      con: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0 }),
        modifier: new foundry.data.fields.NumberField({ initial: 0 }),
        total: new foundry.data.fields.NumberField({ initial: 0 })
      }),

      // Intelligence
      int: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0}),
        modifier: new foundry.data.fields.NumberField({ initial: 0 }),
        total: new foundry.data.fields.NumberField({ initial: 0 })
      }),
      
      // Charisma
      cha: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0 }),
        modifier: new foundry.data.fields.NumberField({ initial: 0 }),
        total: new foundry.data.fields.NumberField({ initial: 0 })
      }),

      // Will
      wil: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0 }),
        modifier: new foundry.data.fields.NumberField({ initial: 0 }),
        total: new foundry.data.fields.NumberField({ initial: 0 })
      }),

      // --- Sensory stats ---
      // See
      see: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0 }),
        modifier: new foundry.data.fields.NumberField({ initial: 0 }),
        total: new foundry.data.fields.NumberField({ initial: 0 })
      }),

      // Hear
      hear: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0 }),
        modifier: new foundry.data.fields.NumberField({ initial: 0 }),
        total: new foundry.data.fields.NumberField({ initial: 0 })
      }),

      // Smell
      smell: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0 }),
        modifier: new foundry.data.fields.NumberField({ initial: 0 }),
        total: new foundry.data.fields.NumberField({ initial: 0 })
      }),

      // --- Extra stats ---
      // Experience
      exp: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0 })
      }),


      // Luck
      luck: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0 })
      }),

      // --- Calculated stats ---
      // Health / Health Points
      hp: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0 }), // Later calculated
        currentValue: new foundry.data.fields.NumberField({ initial: 10, min: 0 }),
        modifier: new foundry.data.fields.NumberField({ initial: 0 }),
        total: new foundry.data.fields.NumberField({ initial: 0 })
      }),

      // Endurance / Endurance Points
      ep: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0 }), // Later calculated
        currentValue: new foundry.data.fields.NumberField({ initial: 10, min: 0 }),
        modifier: new foundry.data.fields.NumberField({ initial: 0 }),
        total: new foundry.data.fields.NumberField({ initial: 0 })
      }),

      // Mana / Mana Points
      mp: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0 }), // Later calculated
        currentValue: new foundry.data.fields.NumberField({ initial: 10, min: 0 }),
        modifier: new foundry.data.fields.NumberField({ initial: 0 }),
        total: new foundry.data.fields.NumberField({ initial: 0 })
      }),

      // Karma / Karma Points
      kp: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0 }), // Later calculated
        currentValue: new foundry.data.fields.NumberField({ initial: 10, min: 0 }),
        modifier: new foundry.data.fields.NumberField({ initial: 0 }),
        total: new foundry.data.fields.NumberField({ initial: 0 })
      }),

      // Spirit / Spirit Points
      sp: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0 }), // Later calculated
        currentValue: new foundry.data.fields.NumberField({ initial: 10, min: 0 }),
        modifier: new foundry.data.fields.NumberField({ initial: 0 }),
        total: new foundry.data.fields.NumberField({ initial: 0 })
      }),

      // Magic Resistance
      rst: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 0 }), // Later calculated
        modifier: new foundry.data.fields.NumberField({ initial: 0 }),
        total: new foundry.data.fields.NumberField({ initial: 0 })
      }),

      // Mental Resistance
      res: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 0 }), // Later calculated
        modifier: new foundry.data.fields.NumberField({ initial: 0 }),
        total: new foundry.data.fields.NumberField({ initial: 0 })
      }),

      // Physical Resistance
      tou: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 0 }), // Later calculated
        modifier: new foundry.data.fields.NumberField({ initial: 0 }),
        total: new foundry.data.fields.NumberField({ initial: 0 })
      }),
      
      // Speed
      speed: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 1, min: 1}), // Later calculated
        modifier: new foundry.data.fields.NumberField({ initial: 0 }),
        total: new foundry.data.fields.NumberField({ initial: 0 })
      }),

      talents: new foundry.data.fields.ArrayField(new foundry.data.fields.ObjectField({
        name: new foundry.data.fields.StringField({ initial: "" }),
        base1: new foundry.data.fields.StringField({ initial: "" }),
        base2: new foundry.data.fields.StringField({ initial: "" }),
        base3: new foundry.data.fields.StringField({ initial: "" }),
        value: new foundry.data.fields.NumberField({ initial: 0 })
      }))
    };
  }
}