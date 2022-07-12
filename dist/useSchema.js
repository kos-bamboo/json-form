"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useSchema;

var _EditorContext = _interopRequireDefault(require("./EditorContext"));

var _react = require("react");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function useSchema() {
  return (0, _react.useContext)(_EditorContext.default).schema;
}