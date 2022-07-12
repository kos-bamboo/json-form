"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DefaultArrayEditor = DefaultArrayEditor;
exports.default = JsonForm;

var _react = _interopRequireWildcard(require("react"));

var _useConstantCallback = _interopRequireDefault(require("./useConstantCallback"));

var _EditorContext = _interopRequireDefault(require("./EditorContext"));

var _expandSchema = _interopRequireDefault(require("./expandSchema"));

var _Editor = _interopRequireDefault(require("./Editor"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function DefaultArrayEditor({
  children,
  add
}) {
  return /*#__PURE__*/_react.default.createElement("div", null, children, /*#__PURE__*/_react.default.createElement("button", {
    onClick: add
  }, "Add item"));
}

const ObjectEditor = ({
  children
}) => {
  return /*#__PURE__*/_react.default.createElement("div", null, children);
};

function JsonForm(options = {}) {
  options = { ...options
  };
  if (!options.types) throw Error('"types" is a required option');

  if (!options.createArray) {
    options.createArray = () => [];
  }

  if (!options.types.$array) {
    options.types.$array = DefaultArrayEditor;
  }

  if (!options.types.$object) {
    options.types.$object = ObjectEditor;
  }

  return function Form({
    schema,
    onChange,
    value
  }) {
    if (typeof onChange !== 'function') {
      throw Error('You must pass an onChange function to the editor created by @adrianhelvik/json-form');
    }

    const cachedOnChange = (0, _useConstantCallback.default)(nextValue => {
      if (typeof nextValue === 'function') {
        nextValue = nextValue(value);
      }

      onChange(nextValue);
    });
    const getRootValue = (0, _useConstantCallback.default)(() => {
      return value;
    });
    const contextValue = (0, _react.useMemo)(() => ({
      onChange: cachedOnChange,
      options,
      editors: options.types,
      schema: (0, _expandSchema.default)(schema, value),
      getRootValue
    }), [cachedOnChange, schema, value, getRootValue]);
    return /*#__PURE__*/_react.default.createElement(_EditorContext.default.Provider, {
      value: contextValue
    }, /*#__PURE__*/_react.default.createElement(_Editor.default, {
      onChange: onChange,
      value: value
    }));
  };
}