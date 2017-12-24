import React from 'react'

const typeOf = x => Object.prototype.toString.call(x)
  .slice(8, -1)
  .toLowerCase()

export function access(object, keyChain, defaultValues) {
  if (! keyChain)
    throw Error('The required parameter keyChain was not supplied')

  if (! keyChain.length)
    return object

  if (! object || typeof object !== 'object' || object[keyChain[0]] == null)
    return undefined

  return access(object[keyChain[0]], keyChain.slice(1), (defaultValues||{})[keyChain[0]])
}

export function deepSet(object, keyChain, value) {
  let pointer = { ...object }
  let rootValue = pointer

  for (const key of keyChain)
    if (key == null)
      throw Error('Cannot call deepSet with null/undefined as a key')

  for (const key of keyChain.slice(0, keyChain.length-1)) {
    if (pointer[key] == null) {
      throw Error('All editors should have a default value!')
    } else {
      pointer[key] = { ...pointer[key] }
      pointer = pointer[key]
    }
  }

  pointer[keyChain[keyChain.length-1]] = value
  return rootValue
}

function isArrayLike(object) {
  return (
    object
    && typeof object === 'object'
    && typeof object.length === 'number'
    && typeof object.push === 'function'
    && typeof object.concat === 'function'
  )
}

export default function JsonForm(options = {}) {
  options = { ...options }

  if (! options.types)
    throw Error('"types" is a required option')

  if (! options.createArray)
    options.createArray = () => ([])

  if (! options.types.$array) {
    options.types.$array = ({ children, add }) => 
      <div>
        {children}
        <button onClick={add}>Add item</button>
      </div>
  }

  if (! options.types.$object) {
    options.types.$object = ({ children }) => <div>{children}</div>
  }

  options.types.$array.defaultValue = options.createArray()
  options.types.$object.defaultValue = {}

  class SubEditor extends React.Component {
    onChange = event => {
      this.props.onChange(
        this.props.keyChain,
        event
      )
    }

    type() {
      const type = access(this.props.schema, this.props.keyChain)

      if (! type) {
        console.error('Schema:', this.props.schema)
        console.error('Key chain:', this.props.keyChain)
        throw Error('Invalid type: ' + type)
      }

      return type
    }

    typeName() {
      const type = this.type()
      switch (typeOf(type)) {
        case 'object':
          if (isArrayLike(type))
            return '$array'
          return '$object'
        case 'array':
          return '$array'
        case 'string':
          return type
        default:
          throw Error('Invalid type: ' + typeOf(type))
      }
    }

    editor() {
      return options.types[this.typeName()]
    }

    value() {
      const value = access(this.props.value, this.props.keyChain)

      switch (this.typeName()) {
        case '$object':
          if (typeOf(value) !== 'object')
            return {}
          return value
        case '$array':
          if (! isArrayLike(value))
            return options.createArray()
          return value
        default:
          if (value === undefined)
            return this.editor().defaultValue
          return value
      }
    }

    objectChildren() {
      const children = []
      const value = this.value()

      for (const key of Object.keys(this.type())) {
        children.push(
          <SubEditor
            key={key}
            keyChain={this.props.keyChain.concat([key])}
            onChange={this.props.onChange}
            value={value[key]}
            Editor={SubEditor}
            schema={this.props.schema}
          />
        )
      }

      return children
    }

    arrayChildren() {
      const children = []
      const value = this.value()

      for (let i = 0; i < value.length; i++) {
        children.push(
          <SubEditor
            key={i+'/'+value.length}
            keyChain={this.props.keyChain.concat([0])}
            onChange={this.props.onChange}
            value={value[i]}
            Editor={SubEditor}
            schema={this.props.schema}
          />
        )
      }

      return children
    }

    children() {
      switch (this.typeName()) {
        case '$object':
          return this.objectChildren()
        case '$array':
          return this.arrayChildren()
        default:
          return null
      }
    }

    render() {
      const Editor = this.editor()
      const children = this.children()

      if (! Editor)
        throw Error(`No type with the name "${this.typeName()}" has been registered`)

      return (
        <Editor
          onChange={this.onChange}
          keyChain={this.props.keyChain}
          schema={this.props.schema}
          value={this.value()}
          Editor={SubEditor}
          children={children}
          add={this.add}
        />
      )
    }

    add = () => {
      if (this.typeName() !== '$array')
        throw Error('Invalid type for add')

      const array = (access(this.props.value, this.props.keyChain) || options.createArray())
        .concat(null)
      const newValue = deepSet(this.props.value, this.props.keyChain, array)

      this.props.originalOnChange(newValue)
    }
  }

  return class Editor extends React.Component {
    static SubEditor = SubEditor

    onChange = (keyChain, event) => {
      const nextValue = deepSet(this.props.value, keyChain, event.target.value)
      this.props.onChange(nextValue)
    }

    createEditor(schema) {
      return Object.keys(schema).map(key =>
        <SubEditor
          key={key}
          keyChain={[key]}
          onChange={this.onChange}
          originalOnChange={this.props.onChange}
          value={this.props.value}
          Editor={SubEditor}
          schema={schema}
        />
      )
    }

    render() {
      return this.createEditor(this.props.schema)
    }
  }
}
