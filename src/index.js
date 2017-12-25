import pluralize from 'pluralize'
import deepSet from './deepSet'
import access from './access'
import typeOf from './typeOf'
import React from 'react'

function decamelizeAndUppercaseFirst(value) {
  const result = []
  result.push(value[0].toUpperCase())
  for (let i = 1; i < value.length; i++) {
    if (value[i].toLowerCase() !== value[i]) {
      result.push(' ')
      result.push(value[i].toLowerCase())
    } else {
      result.push(value[i])
    }
  }
  return result.join('')
}

function singular(string) {
  return pluralize.singular(string)
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

  if (! options.types.$object)
    options.types.$object = ({ children }) => (<div>{children}</div>)

  options.types.$array.defaultValue = options.createArray()

  options.types.$object.defaultValue = {}

  class SubEditor extends React.Component {
    onChange = event => {
      this.props.onChange(
        this.props.valueKeyChain,
        this.props.schemaKeyChain,
        event
      )
    }

    fullType() {
      const type = access(this.props.schema, this.props.schemaKeyChain)

      if (! type) {
        console.error('Schema:', this.props.schema)
        console.error('Key chain:', this.props.schemaKeyChain)
        throw Error('Invalid type: ' + type)
      }

      return type
    }

    type() {
      const type = this.fullType()
      if (type.$type)
        return type.$type
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

    isCustomArray() {
      return (
        this.typeName() === '$array'
        && typeof this.type()[0] === 'symbol'
      )
    }

    customArrayType() {
      return options.types[this.type()[0]]
    }

    editor() {
      if (this.isCustomArray()) {
        return this.customArrayType()
      }
      return options.types[this.typeName()]
    }

    value() {
      const value = access(this.props.value, this.props.valueKeyChain)

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

      for (const key of Object.keys(this.type())) {
        children.push(
          <SubEditor
            key={key}
            schemaKeyChain={this.props.schemaKeyChain.concat([key])}
            valueKeyChain={this.props.valueKeyChain.concat([key])}
            onChange={this.props.onChange}
            value={this.props.value}
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
        const nextKeyChain = this.props.schemaKeyChain
          .concat([this.isCustomArray() ? '1' : '0'])
        const nextValueKeyChain = this.props.valueKeyChain
          .concat([i])

        children.push(
          <SubEditor
            key={i+'/'+value.length}
            schemaKeyChain={nextKeyChain}
            valueKeyChain={nextValueKeyChain}
            onChange={this.props.onChange}
            value={this.props.value}
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

    parentType() {
      const type = access(this.props.schema, this.props.schemaKeyChain.slice(0, -1))

      /*
      if (! type) {
        console.error('Schema:', this.props.schema)
        console.error('Key chain:', this.props.schemaKeyChain)
        throw Error('Invalid type: ' + type)
      }
      */

      return type
    }

    label() {
      const parentType = this.parentType()

      if (Array.isArray(parentType)) {
        return decamelizeAndUppercaseFirst(
          singular(
            this.props.schemaKeyChain[this.props.schemaKeyChain.length - 2]
          ) + ' ' + (Number(this.props.valueKeyChain[this.props.valueKeyChain.length - 1]) + 1)
        )
      }

      const fullType = this.fullType()

      if (fullType && fullType.$label)
        return fullType.$label

      let label = this.props.schemaKeyChain[this.props.schemaKeyChain.length - 1]

      return decamelizeAndUppercaseFirst(label)
    }

    render() {
      const Editor = this.editor()
      const children = this.children()

      if (! Editor)
        throw Error(`No type with the name "${this.typeName()}" has been registered`)

      return (
        <Editor
          onChange={this.onChange}
          schemaKeyChain={this.props.schemaKeyChain}
          valueKeyChain={this.props.valueKeyChain}
          schema={this.props.schema}
          label={this.label()}
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

      const array = (access(this.props.value, this.props.schemaKeyChain) || options.createArray())
        .concat(null)

      const newValue = deepSet(this.props.value, this.props.valueKeyChain, array, this.props.schemaKeyChain, this.props.schema)

      this.props.originalOnChange(newValue)
    }
  }

  return class Editor extends React.Component {
    static SubEditor = SubEditor

    onChange = (valueKeyChain, schemaKeyChain, event) => {
      const nextValue = deepSet(this.props.value, valueKeyChain, event.target.value, schemaKeyChain, this.props.schema)
      this.props.onChange(nextValue)
    }

    createEditor(schema) {
      return Object.keys(schema).map(key =>
        <SubEditor
          key={key}
          schemaKeyChain={[key]}
          valueKeyChain={[key]}
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
