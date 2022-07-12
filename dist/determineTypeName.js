"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = determineTypeName;

var _typeOf = _interopRequireDefault(require("./typeOf"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function determineTypeName(type) {
  switch ((0, _typeOf.default)(type)) {
    case 'object':
      return '$object';

    case 'array':
      return '$array';

    case 'string':
      return type;
    // istanbul ignore next

    default:
      throw Error('Invalid type: ' + (0, _typeOf.default)(type));
  }
}