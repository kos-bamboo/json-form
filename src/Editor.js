import EditorContext from './EditorContext'
import SubEditor from './SubEditor'
import deepSet from './deepSet'
import React from 'react'

export default function Editor({ value: valueFromProps, computedPropsRest }) {
  const { originalOnChange, schema } = React.useContext(EditorContext)

  const onChange = (valueKeyChain, schemaKeyChain, value) => {
    const nextValue = deepSet(
      valueFromProps,
      valueKeyChain,
      value,
      schemaKeyChain,
      schema,
    )
    originalOnChange(nextValue)
  }

  const createEditor = () => {
    return Object.keys(schema).map((key) => (
      <SubEditor
        key={key}
        schemaKeyChain={[key]}
        valueKeyChain={[key]}
        onChange={onChange}
        computedPropsRest={computedPropsRest}
        value={valueFromProps}
        Editor={SubEditor}
      />
    ))
  }

  return createEditor()
}
