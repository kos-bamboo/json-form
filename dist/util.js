"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decamelizeAndUppercaseFirst = decamelizeAndUppercaseFirst;
exports.isArrayLike = isArrayLike;
exports.singular = singular;

var _pluralize = _interopRequireDefault(require("pluralize"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function decamelizeAndUppercaseFirst(value) {
  const result = [];
  result.push(value[0].toUpperCase());

  for (let i = 1; i < value.length; i++) {
    if (value[i].toLowerCase() !== value[i]) {
      result.push(' ');
      result.push(value[i].toLowerCase());
    } else {
      result.push(value[i]);
    }
  }

  return result.join('');
}

function singular(string) {
  return _pluralize.default.singular(string);
}

function isArrayLike(object) {
  return object && typeof object === 'object' && typeof object.length === 'number' && typeof object.push === 'function' && typeof object.concat === 'function';
}