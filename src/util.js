import pluralize from 'pluralize'

export function decamelizeAndUppercaseFirst(value) {
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

export function singular(string) {
  return pluralize.singular(string)
}

export function isArrayLike(object) {
  return (
    object &&
    typeof object === 'object' &&
    typeof object.length === 'number' &&
    typeof object.push === 'function' &&
    typeof object.concat === 'function'
  )
}
