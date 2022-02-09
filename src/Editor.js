import objectKeyToLabel from './objectKeyToLabel'
import SubEditor from './SubEditor'
import useSchema from './useSchema'
import React from 'react'

export default function Editor({ onChange, value }) {
  const schema = useSchema()

  return (
    <>
      {Object.keys(schema).map((key) => (
        <SubEditor
          key={key}
          schema={schema[key]}
          path={[key]}
          value={value?.[key]}
          label={objectKeyToLabel(key)}
          onChange={(childValue) => {
            if (typeof childValue === 'function') {
              childValue = childValue(value?.[key])
            }
            onChange({
              ...value,
              [key]: childValue,
            })
          }}
        />
      ))}
    </>
  )
}
