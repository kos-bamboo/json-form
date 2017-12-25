import typeOf from './typeOf'

export default function deepSet(
  object,
  valueKeyChain,
  value,
  schemaKeyChain,
  schema,
) {
  let pointer = { ...object }
  let schemaPointer = schema
  let rootValue = pointer

  for (const key of valueKeyChain)
    if (key == null)
      throw Error('Cannot call deepSet with null/undefined as a key')

  for (let i = 0; i < valueKeyChain.length - 1; i++) {
    const key = valueKeyChain[i]
    const schemaKey = schemaKeyChain[i]

    switch (typeOf(pointer[key])) {
      case 'array':
        pointer[key] = pointer[key].slice(0)
        pointer = pointer[key]
        break
      case 'object':
        pointer[key] = { ...pointer[key] }
        pointer = pointer[key]
        break
      default:
        switch (typeOf(schemaPointer[schemaKey])) {
          case 'array':
            pointer[key] = []
            pointer = pointer[key]
            break
          case 'object':
            pointer[key] = {}
            pointer = pointer[key]
            break
          default:
            throw Error(
              'Unhandled schema type: ' + typeOf(schema[schemaKey]) + '\n'
              + ', value type: ' + typeOf(pointer[key]) + '\n'
              + ', value key chain: "' + valueKeyChain.slice(0, i).join('.') + '"\n'
              + ', schema key chain: "' + schemaKeyChain.slice(0, i).join('.') + '"\n'
              + ', schema: ' + JSON.stringify(schema, null, 2) + '\n'
              + ', key: "' + key + '"\n'
              + ', schemaKey: "' + schemaKey + '"'
            )
        }
    }

    schemaPointer = schemaPointer[schemaKey]
  }

  pointer[valueKeyChain[valueKeyChain.length-1]] = value
  return rootValue
}
