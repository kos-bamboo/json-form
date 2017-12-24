export default function deepSet(object, keyChain, value) {
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
