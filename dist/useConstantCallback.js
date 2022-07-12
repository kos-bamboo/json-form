"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useConstantCallback;

var _react = require("react");

function useConstantCallback(callback) {
  const ref = (0, _react.useRef)();
  ref.current = callback;
  return (0, _react.useCallback)((...args) => {
    return ref.current(...args);
  }, [ref]);
}