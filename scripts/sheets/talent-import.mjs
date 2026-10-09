const BASE_VALUE_KEYS = new Map([
  ["str", "str"],
  ["starke", "str"],
  ["strength", "str"],
  ["agi", "agi"],
  ["gewandtheit", "agi"],
  ["gewandheit", "agi"],
  ["agility", "agi"],
  ["pre", "pre"],
  ["prazision", "pre"],
  ["precision", "pre"],
  ["con", "con"],
  ["konstitution", "con"],
  ["constitution", "con"],
  ["int", "int"],
  ["intelligenz", "int"],
  ["intelligence", "int"],
  ["cha", "cha"],
  ["charisma", "cha"],
  ["wil", "wil"],
  ["wille", "wil"],
  ["will", "wil"],
  ["willpower", "wil"]
]);

const PROFILE_FIELD_KEYS = new Map([
  ["playername", "playername"],
  ["player name", "playername"],
  ["spielername", "playername"],
  ["name", "name"],
  ["charactername", "name"],
  ["character name", "name"],
  ["charaktername", "name"],
  ["age", "age"],
  ["alter", "age"],
  ["date of birth (age)", "age"],
  ["geburtstag (alter)", "age"],
  ["placeofbirth", "placeofbirth"],
  ["place of birth", "placeofbirth"],
  ["geburtsort", "placeofbirth"],
  ["home", "home"],
  ["heimat", "home"],
  ["appearance", "appearance"],
  ["aussehen", "appearance"],
  ["height", "height"],
  ["grosse", "height"],
  ["groesse", "height"],
  ["weight", "weight"],
  ["gewicht", "weight"],
  ["backstory", "backstory"],
  ["characterstory", "backstory"],
  ["character story", "backstory"],
  ["charaktergeschichte", "backstory"]
]);

const ATTRIBUTE_KEYS = new Map([
  ...BASE_VALUE_KEYS,
  ["see", "see"],
  ["sehen", "see"],
  ["hear", "hear"],
  ["horen", "hear"],
  ["hoeren", "hear"],
  ["smell", "smell"],
  ["riechen", "smell"],
  ["luck", "luck"],
  ["gluck", "luck"],
  ["glueck", "luck"]
]);

const CALCULATED_VALUE_KEYS = new Map([
  ["leben", "hp"],
  ["lebenspunkte", "hp"],
  ["hit points", "hp"],
  ["ausdauer", "ep"],
  ["endurance", "ep"],
  ["mana", "mp"],
  ["karma", "kp"],
  ["geist", "sp"],
  ["spirit", "sp"],
  ["widerstand / magie resistenz", "rst"],
  ["magie resistenz", "rst"],
  ["magic resistance", "rst"],
  ["resistance", "rst"],
  ["belastbarkeit / geistige resistenz", "res"],
  ["geistige resistenz", "res"],
  ["mental resistance", "res"],
  ["resilience", "res"],
  ["zähigkeit / physische resistenz", "tou"],
  ["zahigkeit / physische resistenz", "tou"],
  ["physische resistenz", "tou"],
  ["physical resistance", "tou"],
  ["toughness", "tou"],
  ["geschwindigkeit", "speed"],
  ["speed", "speed"]
]);

function normalizeLabel(label) {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[\u200b-\u200d\ufeff]/g, "")
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, " ");
}

function splitImportRow(line) {
  if (line.includes("\t")) return line.split("\t").map(cell => cell.trim());
  if (line.includes("|")) {
    return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map(cell => cell.trim());
  }
  return [line.trim()];
}

function parseNumber(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return null;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

function parseTalentRow(row) {
  for (let nameIndex = 0; nameIndex <= row.length - 7; nameIndex++) {
    const name = row[nameIndex]?.trim();
    if (!name) continue;

    const baseLabels = row.slice(nameIndex + 1, nameIndex + 4).map(label => label?.trim());
    if (baseLabels.some(label => !label)) continue;

    const baseOptions = baseLabels.map(label => label.split("/").map(option => BASE_VALUE_KEYS.get(normalizeLabel(option))));
    const variantCount = Math.max(...baseOptions.map(options => options.length));
    if (baseOptions.some(options => options.some(option => !option) || (options.length !== 1 && options.length !== variantCount))) continue;

    const values = row.slice(nameIndex + 4, nameIndex + 7).map(parseNumber);
    if (values.some(value => value === null)) continue;

    return {
      name,
      baseOptions,
      value: values[1]
    };
  }

  return null;
}

export function parseTalentImport(text) {
  const rows = text.split(/\r?\n/).map(splitImportRow);
  const talentSectionIndex = rows.findIndex(row => row.some(cell => ["talente", "talents"].includes(normalizeLabel(cell))));
  const profile = {};
  const baseValues = {};
  const calculatedValues = {};
  const characterRows = rows.slice(0, talentSectionIndex === -1 ? rows.length : talentSectionIndex);

  for (const row of characterRows) {
    const label = normalizeLabel(row[0] ?? "");
    const value = row[1]?.trim();
    if (!label || !value) continue;

    const profileField = PROFILE_FIELD_KEYS.get(label);
    if (profileField) {
      if (profileField === "age") {
        const ageText = value.match(/\(([\d.,]+)\)/)?.[1] ?? value;
        const age = parseNumber(ageText);
        if (age !== null) profile.age = age;
      } else {
        profile[profileField] = value;
      }
      continue;
    }

    const attribute = ATTRIBUTE_KEYS.get(label);
    const attributeValue = parseNumber(value);
    if (attribute && attributeValue !== null) {
      baseValues[attribute] = attributeValue;
      continue;
    }

    const calculatedValue = CALCULATED_VALUE_KEYS.get(label);
    if (calculatedValue && attributeValue !== null) {
      calculatedValues[calculatedValue] = attributeValue;
    }
  }

  const talents = [];
  let skippedRows = 0;

  for (const row of rows) {
    const parsedRow = parseTalentRow(row);
    if (!parsedRow) continue;

    const { name, baseOptions, value } = parsedRow;
    const variantCount = Math.max(...baseOptions.map(options => options.length));
    for (let variant = 0; variant < variantCount; variant++) {
      talents.push({
        name,
        base1: baseOptions[0][baseOptions[0].length === 1 ? 0 : variant],
        base2: baseOptions[1][baseOptions[1].length === 1 ? 0 : variant],
        base3: baseOptions[2][baseOptions[2].length === 1 ? 0 : variant],
        value
      });
    }
  }

  return { profile, baseValues, calculatedValues, talents, skippedRows, sectionFound: talentSectionIndex !== -1 };
}
