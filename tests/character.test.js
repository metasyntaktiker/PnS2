import { describe, it, expect } from 'vitest';
import { PnS2CharacterData } from '../scripts/data/character.mjs';

describe('PnS2CharacterData', () => {
  it('should define the schema', () => {
    const schema = PnS2CharacterData.defineSchema();
    expect(schema).toBeDefined();
    expect(schema.character).toBeDefined();
    expect(schema.str).toBeDefined();
    expect(schema.agi).toBeDefined();
    expect(schema.pre).toBeDefined();
    expect(schema.con).toBeDefined();
    expect(schema.int).toBeDefined();
    expect(schema.cha).toBeDefined();
    expect(schema.wil).toBeDefined();
  });

  it('should have default values for stats', () => {
    const schema = PnS2CharacterData.defineSchema();
    expect(schema.str.value.initial).toBe(10);
    expect(schema.agi.value.initial).toBe(10);
    expect(schema.pre.value.initial).toBe(10);
    expect(schema.con.value.initial).toBe(10);
    expect(schema.int.value.initial).toBe(10);
    expect(schema.cha.value.initial).toBe(10);
    expect(schema.wil.value.initial).toBe(10);
  });
});