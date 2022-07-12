"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = defaultValue;

function defaultValue(schema, editors) {
  if (schema.type === '$array') {
    return [];
  }

  if (schema.type === '$object') {
    const result = {};

    for (const [key, subSchema] of Object.entries(schema.items)) {
      result[key] = defaultValue(subSchema, editors);
    }

    return result;
  }

  return editors[schema.type].defaultValue;
}