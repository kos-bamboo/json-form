import typeOf from './typeOf'

export default function determineTypeName(type) {
  switch (typeOf(type)) {
    case 'object':
      return '$object'
    case 'array':
      return '$array'
    case 'string':
      return type
    // istanbul ignore next
    default:
      throw Error('Invalid type: ' + typeOf(type))
  }
}
