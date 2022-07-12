"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = expandSchema;
exports.expandSubSchema = expandSubSchema;

var _typeOf = _interopRequireDefault(require("./typeOf"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function expandSchema(schema, rootValue) {
  switch ((0, _typeOf.default)(schema)) {
    case 'object':
      {
        const result = {};

        for (const [key, val] of Object.entries(schema)) {
          result[key] = expandSubSchema(val, rootValue);
        }

        return result;
      }

    case 'string':
      return schema;

    default:
      throw Error('Failed to parse schema');
  }
}

function expandSubSchema(schema, rootValue) {
  switch ((0, _typeOf.default)(schema)) {
    case 'object':
      {
        if (schema.$type) {
          let type = expandSubSchema(schema.$type, rootValue);
          let props = null;

          for (const [key, val] of Object.entries(schema)) {
            if (key === '$type') continue;

            if (key[0] === '$') {
              if (!props) props = {};
              props[key.slice(1)] = val;
            }
          }

          if (props) {
            type = { ...type,
              props: { ...type.props,
                ...props
              }
            };
          }

          return type;
        }

        const result = {};

        for (const [key, val] of Object.entries(schema)) {
          result[key] = expandSubSchema(val, rootValue);
        }

        return {
          type: '$object',
          items: result
        };
      }

    case 'array':
      {
        if (schema.length === 1) {
          return {
            type: '$array',
            editor: '$array',
            items: expandSubSchema(schema[0], rootValue)
          };
        }

        if (typeof schema[0] === 'symbol') {
          const subSchema = typeof schema[1] === 'function' ? schema[1](rootValue) : schema[1];
          return {
            type: '$array',
            editor: schema[0],
            items: expandSubSchema(subSchema, rootValue),
            params: subSchema
          };
        }

        return {
          type: 'dropdown',
          choices: schema
        };
      }

    case 'string':
      {
        return {
          type: schema
        };
      }

    case 'function':
      {
        return expandSubSchema(schema(rootValue), rootValue);
      }

    default:
      {
        throw Error('Failed to parse schema');
      }
  }
}