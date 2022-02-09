import useConstantCallback from './useConstantCallback'
import EditorContext from './EditorContext'
import { useAutoMemo } from 'hooks.macro'
import expandSchema from './expandSchema'
import Editor from './Editor'
import React from 'react'

export function DefaultArrayEditor({ children, add }) {
  return (
    <div>
      {children}
      <button onClick={add}>Add item</button>
    </div>
  )
}

const ObjectEditor = ({ children }) => {
  return <div>{children}</div>
}

export default function JsonForm(options = {}) {
  options = { ...options }

  if (!options.types) throw Error('"types" is a required option')

  if (!options.createArray) {
    options.createArray = () => []
  }

  if (!options.types.$array) {
    options.types.$array = DefaultArrayEditor
  }

  if (!options.types.$object) {
    options.types.$object = ObjectEditor
  }

  return function Form({ schema, onChange, value }) {
    if (typeof onChange !== 'function') {
      throw Error(
        'You must pass an onChange function to the editor created by @adrianhelvik/json-form',
      )
    }

    const cachedOnChange = useConstantCallback((nextValue) => {
      if (typeof nextValue === 'function') {
        nextValue = nextValue(value)
      }
      onChange(nextValue)
    })

    const getRootValue = useConstantCallback(() => {
      return value
    })

    const contextValue = useAutoMemo({
      onChange: cachedOnChange,
      options,
      editors: options.types,
      schema: expandSchema(schema),
      getRootValue,
    })

    return (
      <EditorContext.Provider value={contextValue}>
        <Editor onChange={onChange} value={value} />
      </EditorContext.Provider>
    )
  }
}
