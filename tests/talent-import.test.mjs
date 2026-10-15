import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parseTalentImport } from "../scripts/sheets/talent-import.mjs";

const examples = [
  {
    file: "Example1GermanImport.md",
    baseValues: { str: 36, agi: 59, pre: 35, con: 25, int: 74, cha: 43, wil: 26, see: 27, hear: 22, smell: 27, luck: 22 },
    calculatedValues: { hp: 16, ep: 23, mp: 49, kp: 17, sp: 19, rst: 7, res: 2, tou: 2, speed: 6, initiative: 5, dodge: 23 },
    balanceValue: 10
  },
  {
    file: "Example2GermanImport.md",
    baseValues: { str: 71, agi: 26, pre: 26, con: 60, int: 75, cha: 70, wil: 27, see: 36, hear: 25, smell: 47, luck: 21 },
    calculatedValues: { hp: 40, ep: 31, mp: 50, kp: 18, sp: 20, rst: 7, res: 2, tou: 6, speed: 5, initiative: 2, dodge: 22 },
    balanceValue: 13
  },
  {
    file: "Example3GermanImport.md",
    baseValues: { str: 51, agi: 36, pre: 33, con: 28, int: 57, cha: 60, wil: 54, see: 29, hear: 27, smell: 51, luck: 21 },
    calculatedValues: { hp: 18, ep: 22, mp: 38, kp: 36, sp: 21, rst: 5, res: 5, tou: 2, speed: 5, initiative: 3, dodge: 18 },
    balanceValue: 60
  }
];

for (const example of examples) {
  test(`imports profile, stats, calculated values, and talents from ${example.file}`, async () => {
    const text = await readFile(new URL(`${example.file}`, import.meta.url), "utf8");
    const result = parseTalentImport(text);

    assert.equal(result.sectionFound, true);
    assert.deepEqual(result.profile, {
      playername: "Andy",
      name: "NagisaImportDeutsch",
      species: "Mensch",
      age: 19,
      placeofbirth: "Kalleth",
      home: "Kalleth",
      appearance: "Klein, zierlich, lumpig",
      height: "152cm",
      weight: "44kg",
      backstory: "Siehe Discord"
    });
    assert.deepEqual(result.baseValues, example.baseValues);
    assert.deepEqual(result.calculatedValues, example.calculatedValues);
    assert.equal(result.talents.length, 77);
    assert.equal(result.skippedRows, 0);
    assert.deepEqual(result.talents.find(talent => talent.name === "Balance"), {
      name: "Balance",
      base1: "agi",
      base2: "agi",
      base3: "str",
      value: example.balanceValue
    });
  });
}

test("expands slash-separated combat bases into aligned talent variants", async () => {
  const text = await readFile(new URL("Example1GermanImport.md", import.meta.url), "utf8");
  const talents = parseTalentImport(text).talents.filter(talent => talent.name === "Faust");

  assert.deepEqual(talents, [
    { name: "Faust", base1: "agi", base2: "agi", base3: "agi", value: 59 },
    { name: "Faust", base1: "str", base2: "str", base3: "str", value: 59 }
  ]);
});

test("parses talent rows despite leading blank columns and without a section header", () => {
  const pastedTable = [
    "\t\tBalance\tGewandtheit\tGewandtheit\tStärke\t23\t1\t24",
    "\t\tKlettern\tGewandtheit\tStärke\tWille\t24\t3\t27"
  ].join("\n");

  const result = parseTalentImport(pastedTable);

  assert.equal(result.sectionFound, false);
  assert.equal(result.talents.length, 2);
  assert.deepEqual(result.talents[0], {
    name: "Balance",
    base1: "agi",
    base2: "agi",
    base3: "str",
    value: 1
  });
  assert.deepEqual(result.talents[1], {
    name: "Klettern",
    base1: "agi",
    base2: "str",
    base3: "wil",
    value: 3
  });
});

test("imports English profile and stat labels without requiring talent rows", () => {
  const result = parseTalentImport([
    "Playername\tPlayer",
    "Charactername\tHero",
    "Age\t32",
    "Strength\t55",
    "See\t40",
    "Hear\t42",
    "Smell\t44",
    "Luck\t21",
    "Lebenspunkte\t50",
    "Geistige Resistenz\t4"
  ].join("\n"));

  assert.equal(result.profile.name, "Hero");
  assert.equal(result.profile.age, 32);
  assert.deepEqual(result.baseValues, { str: 55, see: 40, hear: 42, smell: 44, luck: 21 });
  assert.deepEqual(result.calculatedValues, { hp: 50, res: 4 });
  assert.equal(result.talents.length, 0);
  assert.equal(result.sectionFound, false);
});

test("recognizes every supported profile label and parses ages with or without a birth year", () => {
  const labels = [
    ["Playername", "playername"],
    ["Player Name", "playername"],
    ["Spielername", "playername"],
    ["Name", "name"],
    ["Charactername", "name"],
    ["Character Name", "name"],
    ["Charaktername", "name"],
    ["Species", "species"],
    ["Race", "species"],
    ["Rasse", "species"],
    ["Spezies", "species"],
    ["Age", "age"],
    ["Alter", "age"],
    ["Date of Birth (Age)", "age"],
    ["Geburtstag (Alter)", "age"],
    ["PlaceOfBirth", "placeofbirth"],
    ["Place of Birth", "placeofbirth"],
    ["Geburtsort", "placeofbirth"],
    ["Home", "home"],
    ["Heimat", "home"],
    ["Appearance", "appearance"],
    ["Aussehen", "appearance"],
    ["Height", "height"],
    ["Größe", "height"],
    ["Groesse", "height"],
    ["Weight", "weight"],
    ["Gewicht", "weight"],
    ["Backstory", "backstory"],
    ["Characterstory", "backstory"],
    ["Character Story", "backstory"],
    ["Charaktergeschichte", "backstory"]
  ];

  for (const [label, field] of labels) {
    const value = field === "age" ? "788 BF (19)" : "Imported value";
    const result = parseTalentImport(`${label}\t${value}`);
    assert.deepEqual(result.profile, { [field]: field === "age" ? 19 : value }, label);
  }
});

test("recognizes every supported base and additional attribute label", () => {
  const labels = [
    ["STR", "str"], ["Stärke", "str"], ["Strength", "str"],
    ["AGI", "agi"], ["Gewandtheit", "agi"], ["Gewandheit", "agi"], ["Agility", "agi"],
    ["PRE", "pre"], ["Präzision", "pre"], ["Precision", "pre"],
    ["CON", "con"], ["Konstitution", "con"], ["Constitution", "con"],
    ["INT", "int"], ["Intelligenz", "int"], ["Intelligence", "int"],
    ["CHA", "cha"], ["Charisma", "cha"],
    ["WIL", "wil"], ["Wille", "wil"], ["Will", "wil"], ["Willpower", "wil"],
    ["See", "see"], ["Sehen", "see"],
    ["Hear", "hear"], ["Hören", "hear"], ["Hoeren", "hear"],
    ["Smell", "smell"], ["Riechen", "smell"],
    ["Luck", "luck"], ["Glück", "luck"], ["Glueck", "luck"]
  ];

  for (const [label, field] of labels) {
    const result = parseTalentImport(`${label}\t37`);
    assert.deepEqual(result.baseValues, { [field]: 37 }, label);
  }
});

test("recognizes every supported calculated-value label", () => {
  const labels = [
    ["Leben", "hp"], ["Lebenspunkte", "hp"], ["Hit Points", "hp"],
    ["Ausdauer", "ep"], ["Endurance", "ep"],
    ["Mana", "mp"],
    ["Karma", "kp"],
    ["Geist", "sp"], ["Spirit", "sp"],
    ["Widerstand / Magie Resistenz", "rst"], ["Widerstand", "rst"], ["Magie Resistenz", "rst"],
    ["Magic Resistance", "rst"], ["Resistance", "rst"],
    ["Belastbarkeit / Geistige Resistenz", "res"], ["Belastbarkeit", "res"], ["Geistige Resistenz", "res"],
    ["Mental Resistance", "res"], ["Resilience", "res"],
    ["Zähigkeit / Physische Resistenz", "tou"], ["Zahigkeit / Physische Resistenz", "tou"],
    ["Zähigkeit", "tou"], ["Zahigkeit", "tou"],
    ["Physische Resistenz", "tou"], ["Physical Resistance", "tou"], ["Toughness", "tou"],
    ["Geschwindigkeit", "speed"], ["Speed", "speed"],
    ["Initiative", "initiative"],
    ["Dodge", "dodge"], ["Ausweichen", "dodge"]
  ];

  for (const [label, field] of labels) {
    const result = parseTalentImport(`${label}\t6`);
    assert.deepEqual(result.calculatedValues, { [field]: 6 }, label);
  }
});

test("parses pipe-separated talent rows and aligned alternatives with decimal-comma values", () => {
  const result = parseTalentImport([
    "| Talents |",
    "| Cross-training | Agility / Strength | Constitution | Will / Charisma | 24 | 2,5 | 26,5 |"
  ].join("\r\n"));

  assert.equal(result.sectionFound, true);
  assert.deepEqual(result.talents, [
    { name: "Cross-training", base1: "agi", base2: "con", base3: "wil", value: 2.5 },
    { name: "Cross-training", base1: "str", base2: "con", base3: "cha", value: 2.5 }
  ]);
});

test("does not import talent rows with unknown bases, mismatched alternatives, or invalid numbers", () => {
  const result = parseTalentImport([
    "Talents",
    "Unknown base\tNot an attribute\tAgility\tWill\t10\t2\t12",
    "Mismatched alternatives\tAgility / Strength\tAgility / Strength / Precision\tWill\t10\t2\t12",
    "Invalid points\tAgility\tAgility\tWill\t10\tinvalid\t12",
    "Missing base\tAgility\t\tWill\t10\t2\t12"
  ].join("\n"));

  assert.deepEqual(result.talents, []);
  assert.equal(result.sectionFound, true);
});

test("ignores invalid numeric values in profile and stat fields", () => {
  const result = parseTalentImport([
    "Age\tnot an age",
    "Strength\tNaN",
    "Hit Points\tInfinity"
  ].join("\n"));

  assert.deepEqual(result.profile, {});
  assert.deepEqual(result.baseValues, {});
  assert.deepEqual(result.calculatedValues, {});
});

test("imports profile, stats, calculated values, and talents from Example1EnglishImport.md", async () => {
  const text = await readFile(new URL("Example1EnglishImport.md", import.meta.url), "utf8");
  const result = parseTalentImport(text);

  assert.equal(result.sectionFound, true);
  assert.deepEqual(result.profile, {
    playername: "Andy",
    name: "Chicken",
    species: "Mensch",
    age: 19,
    placeofbirth: "Kalleth",
    home: "Kalleth",
    appearance: "Klein, zierlich, lumpig",
    height: "152cm",
    weight: "44kg",
    backstory: "Siehe Discord"
  });
  assert.deepEqual(result.baseValues, {
    str: 38,
    agi: 46,
    pre: 59,
    con: 63,
    int: 36,
    cha: 54,
    wil: 34,
    see: 55,
    hear: 46,
    smell: 36,
    luck: 21
  });
  assert.deepEqual(result.calculatedValues, {
    hp: 42,
    ep: 28,
    mp: 24,
    kp: 22,
    sp: 13,
    rst: 3,
    res: 3,
    tou: 6,
    speed: 6,
    initiative: 4,
    dodge: 32
  });
  assert.equal(result.talents.length, 77);
  assert.equal(result.skippedRows, 0);
  assert.deepEqual(result.talents.find(talent => talent.name === "Balance"), {
    name: "Balance",
    base1: "agi",
    base2: "agi",
    base3: "str",
    value: 24
  });
  assert.deepEqual(result.talents.filter(talent => talent.name === "Fist"), [
    { name: "Fist", base1: "agi", base2: "agi", base3: "agi", value: 14 },
    { name: "Fist", base1: "str", base2: "str", base3: "str", value: 14 }
  ]);
});
