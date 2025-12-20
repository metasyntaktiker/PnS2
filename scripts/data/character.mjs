export class PnS2CharacterData extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      hp: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ initial: 10, min: 0 }),
        max: new foundry.data.fields.NumberField({ initial: 10, min: 0 })
      })
    };
  }
}