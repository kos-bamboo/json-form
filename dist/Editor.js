"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Editor;

var _objectKeyToLabel = _interopRequireDefault(require("./objectKeyToLabel"));

var _SubEditor = _interopRequireDefault(require("./SubEditor"));

var _useSchema = _interopRequireDefault(require("./useSchema"));

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Editor({
  onChange,
  value
}) {
  const schema = (0, _useSchema.default)();
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, Object.keys(schema).map(key => /*#__PURE__*/_react.default.createElement(_SubEditor.default, {
    key: key,
    schema: schema[key],
    path: [key],
    value: value === null || value === void 0 ? void 0 : value[key],
    label: (0, _objectKeyToLabel.default)(key),
    onChange: childValue => {
      if (typeof childValue === 'function') {
        childValue = childValue(value === null || value === void 0 ? void 0 : value[key]);
      }

      onChange({ ...value,
        [key]: childValue
      });
    },
    params: schema[key].params
  })));
}