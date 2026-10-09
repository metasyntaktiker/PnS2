import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parseTalentImport } from "../scripts/sheets/talent-import.mjs";

const examples = [
  {
    file: "Example1GermanImport.md",
    baseValues: { str: 35, agi: 55, pre: 70, con: 60, int: 40, cha: 55, wil: 60, see: 22, hear: 50, smell: 33, luck: 26 },
    calculatedValues: { hp: 40, ep: 30, mp: 26, kp: 40, sp: 20, rst: 4, res: 6, tou: 6, speed: 6 },
    balanceValue: 1
  },
  {
    file: "Example2GermanImport.md",
    baseValues: { str: 45, agi: 71, pre: 42, con: 68, int: 59, cha: 71, wil: 41, see: 53, hear: 41, smell: 42, luck: 27 },
    calculatedValues: { hp: 45, ep: 36, mp: 39, kp: 27, sp: 19, rst: 5, res: 4, tou: 6, speed: 7 },
    balanceValue: 60
  },
  {
    file: "Example3GermanImport.md",
    baseValues: { str: 29, agi: 42, pre: 70, con: 26, int: 50, cha: 31, wil: 58, see: 32, hear: 35, smell: 59, luck: 20 },
    calculatedValues: { hp: 17, ep: 18, mp: 33, kp: 38, sp: 21, rst: 5, res: 5, tou: 2, speed: 6 },
    balanceValue: 29
  }
];

for (const example of examples) {
  test(`imports profile, stats, calculated values, and talents from ${example.file}`, async () => {
    const text = await readFile(new URL(`${example.file}`, import.meta.url), "utf8");
    const result = parseTalentImport(text);

    assert.equal(result.sectionFound, true);
    assert.deepEqual(result.profile, {
      playername: "Andy",
      name: "Nagisa",
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
    { name: "Faust", base1: "agi", base2: "agi", base3: "agi", value: 22 },
    { name: "Faust", base1: "str", base2: "str", base3: "str", value: 22 }
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
    ["Widerstand / Magie Resistenz", "rst"], ["Magie Resistenz", "rst"],
    ["Magic Resistance", "rst"], ["Resistance", "rst"],
    ["Belastbarkeit / Geistige Resistenz", "res"], ["Geistige Resistenz", "res"],
    ["Mental Resistance", "res"], ["Resilience", "res"],
    ["Zähigkeit / Physische Resistenz", "tou"], ["Zahigkeit / Physische Resistenz", "tou"],
    ["Physische Resistenz", "tou"], ["Physical Resistance", "tou"], ["Toughness", "tou"],
    ["Geschwindigkeit", "speed"], ["Speed", "speed"]
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
    age: 19,
    placeofbirth: "Kalleth",
    home: "Kalleth",
    appearance: "Klein, zierlich, lumpig",
    height: "152cm",
    weight: "44kg",
    backstory: "Siehe Discord"
  });
  assert.deepEqual(result.baseValues, {
    str: 61,
    agi: 61,
    pre: 66,
    con: 60,
    int: 31,
    cha: 30,
    wil: 25,
    see: 30,
    hear: 39,
    smell: 25,
    luck: 29
  });
  assert.deepEqual(result.calculatedValues, {
    hp: 40,
    ep: 36,
    mp: 20,
    kp: 16,
    sp: 11,
    rst: 3,
    res: 2,
    tou: 6,
    speed: 7
  });
  assert.equal(result.talents.length, 77);
  assert.equal(result.skippedRows, 0);
  assert.deepEqual(result.talents.find(talent => talent.name === "Balance"), {
    name: "Balance",
    base1: "agi",
    base2: "agi",
    base3: "str",
    value: 15
  });
  assert.deepEqual(result.talents.filter(talent => talent.name === "Fist"), [
    { name: "Fist", base1: "agi", base2: "agi", base3: "agi", value: 48 },
    { name: "Fist", base1: "str", base2: "str", base3: "str", value: 48 }
  ]);
});
