"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = access;

function access(object, keyChain, defaultValues) {
  if (!keyChain) throw Error('The required parameter keyChain was not supplied');
  if (!keyChain.length) return object;
  if (!object || typeof object !== 'object' || object[keyChain[0]] == null) return undefined;
  return access(object[keyChain[0]], keyChain.slice(1), (defaultValues || {})[keyChain[0]]);
}