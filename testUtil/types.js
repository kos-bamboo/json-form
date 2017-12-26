import React from 'react'

export const string = ({ onChange, label, value }) => (
  <string-editor>
    <string-editor-label>{label}</string-editor-label>
    <input
      value={value}
      onChange={onChange}
    />
  </string-editor>
)

export const $object = ({ children, label }) => (
  <object-editor>
    <h3>{label}</h3>
    {children}
  </object-editor>
)

export const $array = ({ children, label, add }) => (
  <array-editor>
    <h3>{label}</h3>
    {children}
    <button onClick={add}>Add</button>
  </array-editor>
)
