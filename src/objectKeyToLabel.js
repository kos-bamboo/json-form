export default function objectKeyToLabel(key) {
  const result = []
  for (const letter of key) {
    if (letter !== letter.toLowerCase()) {
      result.push(' ')
    }
    result.push(letter.toLowerCase())
  }
  result[0] = result[0].toUpperCase()
  return result.join('')
}
