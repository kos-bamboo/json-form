import objectKeyToLabel from './objectKeyToLabel'
import { useAutoMemo } from 'hooks.macro'
import defaultValue from './defaultValue'
import useEditors from './useEditors'
import inspect from 'util-inspect'
import pluralize from 'pluralize'
import typeOf from './typeOf'
import React from 'react'

const tryInspect = (value) => {
  try {
    return inspect(value)
  } catch (error) {
    return `FAILED TO INSPECT VALUE`
  }
}

export default function SubEditor({
  value: inputValue,
  schema,
  onChange,
  path,
  label,
}) {
  const editors = useEditors()

  let editorProperty
  let Editor

  if (typeOf(schema.editor) === 'symbol') {
    editorProperty = schema.editor
  } else if (typeof schema.type === 'string') {
    editorProperty = schema.type
  } else if (typeOf(schema.type) === 'array') {
    editorProperty = schema.type[0]
  }

  // An array with a symbol caused an error stack
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
  //
  // Fuck this shit.
  if (
    typeof editorProperty !== 'string' &&
    typeof editorProperty !== 'symbol'
  ) {
    throw Error(
      'Expected schema editor property to be a symbol or a string. Got: ' +
        tryInspect(editorProperty),
    )
  }

  Editor = editors[editorProperty]

  if (!Editor) {
    switch (typeOf(editorProperty)) {
      case 'symbol':
        throw Error(
          `Missing custom array editor for ${editorProperty.toString()}`,
        )
      case 'string':
        throw Error(`Missing editor: ${editorProperty}`)
      default:
        throw Error('Missing editor')
    }
  }

  const value = useAutoMemo(() => {
    switch (schema.type) {
      case '$array': {
        if (!Array.isArray(inputValue)) {
          return []
        }
        return inputValue
      }
      case '$object': {
        if (typeOf(inputValue) !== 'object') {
          return {}
        }
        return inputValue
      }
      default: {
        return inputValue
      }
    }
  })

  const add = useAutoMemo(() => {
    if (schema.type !== '$array') return null

    return () => {
      onChange([...value, defaultValue(schema.items, editors)])
    }
  })

  const children = useAutoMemo(() => {
    if (schema.type === '$array') {
      return value.map((item, index) => {
        if (!schema.items?.type) {
          throw Error('Malformed array schema: ' + typeof schema)
        }
        return (
          <SubEditor
            key={index}
            path={path.concat(index)}
            value={item}
            schema={schema.items}
            label={`${pluralize.singular(label)} ${index + 1}`}
            onChange={(childValue) => {
              const nextValue = [...value]
              nextValue[index] = childValue
              onChange(nextValue)
            }}
          />
        )
      })
    }
    if (schema.type === '$object') {
      return Object.entries(schema.items).map(([key, subSchema]) => {
        return (
          <SubEditor
            key={key}
            path={path.concat(key)}
            value={value?.[key]}
            schema={subSchema}
            label={objectKeyToLabel(key)}
            onChange={(childValue) => {
              const nextValue = { ...value }
              nextValue[key] = childValue
              onChange(nextValue)
            }}
          />
        )
      })
    }
  })

  return (
    <Editor
      onChange={onChange}
      value={value}
      add={add}
      label={label}
      choices={schema.choices}
      {...schema.props}
    >
      {children}
    </Editor>
  )
}
