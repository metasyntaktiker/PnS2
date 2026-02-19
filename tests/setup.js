// Mock for foundry.abstract.DataModel
class DataModel {
  static defineSchema() {
    return {};
  }
  constructor(data) {
    Object.assign(this, data);
  }
}

// Mock for foundry.data.fields
class StringField {
    constructor(options) {
        Object.assign(this, { type: 'String', ...options });
    }
}
class NumberField {
    constructor(options) {
        Object.assign(this, { type: 'Number', ...options });
    }
}
class SchemaField {
    constructor(options) {
        Object.assign(this, { type: 'Schema', ...options });
    }
}
class ArrayField {
    constructor(element) {
        Object.assign(this, { type: 'Array', element, ...element });
    }
}
class ObjectField {
    constructor(fields) {
        Object.assign(this, { type: 'Object', fields, ...fields });
    }
}


// Mock global 'foundry' object
global.foundry = {
  abstract: {
    DataModel,
  },
  data: {
    fields: {
      StringField,
      NumberField,
      SchemaField,
      ArrayField,
      ObjectField
    },
  },
};