import useConstantCallback from './useConstantCallback'
import EditorContext from './EditorContext'
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

  return function Form({ schema, onChange, value, computedPropsRest }) {
    if (typeof onChange !== 'function') {
      throw Error(
        'You must pass an onChange function to the editor created by @adrianhelvik/json-form',
      )
    }

    const originalOnChange = useConstantCallback(onChange)

    const contextValue = React.useMemo(
      () => ({
        originalOnChange,
        options,
        schema,
      }),
      [originalOnChange, schema],
    )

    return (
      <EditorContext.Provider value={contextValue}>
        <Editor value={value} computedPropsRest={computedPropsRest} />
      </EditorContext.Provider>
    )
  }
}
