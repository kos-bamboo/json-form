"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const typeOf = x => Object.prototype.toString.call(x).slice(8, -1).toLowerCase();

var _default = typeOf;
exports.default = _default;