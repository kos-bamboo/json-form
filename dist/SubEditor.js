"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = SubEditor;

var _react = _interopRequireWildcard(require("react"));

var _objectKeyToLabel = _interopRequireDefault(require("./objectKeyToLabel"));

var _defaultValue = _interopRequireDefault(require("./defaultValue"));

var _useEditors = _interopRequireDefault(require("./useEditors"));

var _utilInspect = _interopRequireDefault(require("util-inspect"));

var _pluralize = _interopRequireDefault(require("pluralize"));

var _typeOf = _interopRequireDefault(require("./typeOf"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

const tryInspect = value => {
  try {
    return (0, _utilInspect.default)(value);
  } catch (error) {
    return `FAILED TO INSPECT VALUE`;
  }
};

function SubEditor({
  value: inputValue,
  schema,
  onChange,
  path,
  label,
  params
}) {
  const editors = (0, _useEditors.default)();
  let editorProperty;
  let Editor;

  if ((0, _typeOf.default)(schema.editor) === 'symbol') {
    editorProperty = schema.editor;
  } else if (typeof schema.type === 'string') {
    editorProperty = schema.type;
  } else if ((0, _typeOf.default)(schema.type) === 'array') {
    editorProperty = schema.type[0];
  } // An array with a symbol caused an error stack
  // that made my brain turn into finely minced
  // ground meat for a couple of days.
  //
  // If you see an error like this:
  //
  //    TypeError: Cannot convert a Symbol value to a string
  //        at Array.join (<anonymous>)
  //        at Array.toString (<anonymous>)
  //
  // You are accessing an object with a property
  // which is an array with a symbol.


  if (typeof editorProperty !== 'string' && typeof editorProperty !== 'symbol') {
    throw Error('Expected schema editor property to be a symbol or a string. Got: ' + tryInspect(editorProperty));
  }

  Editor = editors[editorProperty];

  if (!Editor) {
    switch ((0, _typeOf.default)(editorProperty)) {
      case 'symbol':
        throw Error(`Missing custom array editor for ${editorProperty.toString()}`);

      case 'string':
        throw Error(`Missing editor: ${editorProperty}`);

      default:
        throw Error('Missing editor');
    }
  }

  const value = (0, _react.useMemo)(() => {
    switch (schema.type) {
      case '$array':
        {
          if (!Array.isArray(inputValue)) {
            return [];
          }

          return inputValue;
        }

      case '$object':
        {
          if ((0, _typeOf.default)(inputValue) !== 'object') {
            return {};
          }

          return inputValue;
        }

      default:
        {
          return inputValue;
        }
    }
  }, [schema, inputValue]);
  const add = (0, _react.useMemo)(() => {
    if (schema.type !== '$array') return null;
    return () => {
      onChange([...value, (0, _defaultValue.default)(schema.items, editors)]);
    };
  }, [schema, onChange, value, editors]);
  const children = (0, _react.useMemo)(() => {
    if (schema.type === '$array') {
      return value.map((item, index) => {
        var _schema$items;

        if (!((_schema$items = schema.items) !== null && _schema$items !== void 0 && _schema$items.type)) {
          throw Error('Malformed array schema: ' + typeof schema);
        }

        return /*#__PURE__*/_react.default.createElement(SubEditor, {
          key: index,
          path: path.concat(index),
          value: item,
          schema: schema.items,
          label: `${_pluralize.default.singular(label)} ${index + 1}`,
          onChange: childValue => {
            const nextValue = [...value];
            nextValue[index] = childValue;
            onChange(nextValue);
          },
          params: schema.params
        });
      });
    }

    if (schema.type === '$object') {
      return Object.entries(schema.items).map(([key, subSchema]) => {
        return /*#__PURE__*/_react.default.createElement(SubEditor, {
          key: key,
          path: path.concat(key),
          value: value === null || value === void 0 ? void 0 : value[key],
          schema: subSchema,
          label: (0, _objectKeyToLabel.default)(key),
          onChange: childValue => {
            const nextValue = { ...value
            };
            nextValue[key] = childValue;
            onChange(nextValue);
          },
          params: subSchema.params
        });
      });
    }
  }, [schema, value, path, label, onChange]);
  return /*#__PURE__*/_react.default.createElement(Editor, _extends({
    onChange: onChange,
    value: value,
    add: add,
    label: label,
    choices: schema.choices,
    params: params
  }, schema.props), children);
}