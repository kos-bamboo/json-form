import { useAutoCallback, useAutoMemo } from 'hooks.macro'
import determineTypeName from './determineTypeName'
import EditorContext from './EditorContext'
import { useContext } from 'react'
import deepSet from './deepSet'
import * as util from './util'
import access from './access'
import typeOf from './typeOf'
import React from 'react'

function isCustomArray(typeName, type) {
  return typeName === '$array' && typeof type[0] === 'symbol'
}

function resolveEditor({ typeName, types, type }) {
  if (isCustomArray(typeName, type)) {
    const arrayType = type[0]
    if (!types[arrayType]) {
      throw Error(`Missing custom array editor for ${String(arrayType)}`)
    }
    return types[arrayType]
  } else {
    return types[typeName]
  }
}

function coerceType(value, Editor, types, typeName) {
  if (
    (typeName === '$array' || Editor === types.$array) &&
    typeOf(value) !== 'array'
  ) {
    return []
  }

  if (
    (typeName === '$object' || Editor === types.$object) &&
    typeOf(value) !== 'object'
  ) {
    return {}
  }

  if (value === undefined && Editor?.defaultValue !== null) {
    return Editor.defaultValue
  }

  return value
}

function resolveType(schema, schemaKeyChain) {
  const fullType = access(schema, schemaKeyChain)
  const isExpanded = Boolean(fullType.$type)

  return isExpanded ? fullType.$type : fullType
}

export default function SubEditor({
  onChange,
  schemaKeyChain,
  valueKeyChain,
  rootValue,
  computedPropsRest,
}) {
  const { originalOnChange, options, schema } = useContext(EditorContext)

  const parentType = access(schema, schemaKeyChain.slice(0, -1))
  const fullType = access(schema, schemaKeyChain)
  const value = access(rootValue, valueKeyChain)

  // istanbul ignore next
  if (!fullType) {
    console.error('Schema:', schema)
    console.error('Key chain:', schemaKeyChain)
    throw Error(
      `Invalid type found at ${schemaKeyChain.join(
        '.',
      )}: ${fullType}\n\n  schema: ${JSON.stringify(schema, null, 2)}`,
    )
  }

  const scopedOnChange = useAutoCallback((value) => {
    onChange(valueKeyChain, schemaKeyChain, value)
  })

  const isExpanded = Boolean(fullType.$type)

  const type = resolveType(schema, schemaKeyChain)

  const typeName = useAutoMemo(() => {
    return determineTypeName(type)
  })

  const Editor = useAutoMemo(() => {
    return resolveEditor({
      types: options.types,
      typeName,
      type,
    })
  })

  const arrayChildTypeIndex = isCustomArray(typeName, type) ? '1' : '0'

  const childTypeName = useAutoMemo(() => {
    if (typeName !== '$array') return null

    let subType = type[arrayChildTypeIndex]

    const expandedSubType = subType.$type ? subType.$type : subType

    return determineTypeName(expandedSubType)
  })

  const ArrayChildEditor = useAutoMemo(() => {
    if (childTypeName == null) return null
    return resolveEditor({
      types: options.types,
      typeName: childTypeName,
      type: resolveType(
        schema,
        schemaKeyChain.concat(
          isExpanded ? ['$type', arrayChildTypeIndex] : [arrayChildTypeIndex],
        ),
      ),
    })
  })

  const coercedValue = coerceType(value, Editor, options.types, typeName)

  // istanbul ignore next
  if (typeName === '$array' && typeOf(coercedValue) !== 'array') {
    throw Error('Array type was not coerced into array.')
  }

  const children = useAutoMemo(() => {
    switch (typeName) {
      case '$object': {
        const children = []

        for (const key of Object.keys(type)) {
          children.push(
            <SubEditor
              key={key}
              schemaKeyChain={schemaKeyChain.concat(
                isExpanded ? ['$type', key] : [key],
              )}
              valueKeyChain={valueKeyChain.concat(key)}
              onChange={onChange}
              rootValue={rootValue}
            />,
          )
        }

        return children
      }
      case '$array': {
        const children = []

        for (let i = 0; i < coercedValue.length; i++) {
          const nextKeyChain = schemaKeyChain.concat(
            isExpanded ? ['$type', arrayChildTypeIndex] : arrayChildTypeIndex,
          )
          const nextValueKeyChain = valueKeyChain.concat(i)

          children.push(
            <SubEditor
              key={i + '/' + coercedValue.length}
              schemaKeyChain={nextKeyChain}
              valueKeyChain={nextValueKeyChain}
              onChange={onChange}
              rootValue={rootValue}
            />,
          )
        }

        return children
      }
      default:
        return null
    }
  })

  const label = useAutoMemo(() => {
    if (util.isArrayLike(parentType)) {
      return util.decamelizeAndUppercaseFirst(
        util.singular(schemaKeyChain[schemaKeyChain.length - 2]) +
          ' ' +
          (Number(valueKeyChain[valueKeyChain.length - 1]) + 1),
      )
    }

    if (fullType && fullType.$label) return fullType.$label

    let label = schemaKeyChain[schemaKeyChain.length - 1]

    return util.decamelizeAndUppercaseFirst(label)
  })

  const computedProps = useAutoMemo(() => {
    if (typeof fullType.$computedProps === 'function') {
      const rest = util.isArrayLike(computedPropsRest) ? computedPropsRest : []
      return fullType.$computedProps(rootValue, ...rest)
    }
    return {}
  })

  const add = useAutoCallback(() => {
    if (typeName !== '$array') {
      throw Error('add() can only be called from array editors')
    }

    const defaultValue = coerceType(
      undefined,
      ArrayChildEditor,
      options.types,
      childTypeName,
    )

    const array = (
      util.isArrayLike(value) ? value : options.createArray()
    ).concat(defaultValue)

    const newValue = deepSet(
      rootValue,
      valueKeyChain,
      array,
      schemaKeyChain,
      schema,
    )

    originalOnChange(newValue)
  })

  // istanbul ignore next
  if (!Editor) {
    throw Error(`No type with the name "${typeName}" has been registered`)
  }

  return useAutoMemo(
    <Editor
      onChange={scopedOnChange}
      schemaKeyChain={schemaKeyChain}
      valueKeyChain={valueKeyChain}
      schema={schema}
      label={label}
      value={coercedValue}
      add={add}
      {...computedProps}
    >
      {children}
    </Editor>,
  )
}
