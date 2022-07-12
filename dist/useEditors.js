"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useEditors;

var _EditorContext = _interopRequireDefault(require("./EditorContext"));

var _react = require("react");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function useEditors() {
  const {
    editors
  } = (0, _react.useContext)(_EditorContext.default);
  return editors;
}