import access from '../src/access'

describe('access', () => {
  it('can access an object', () => {
    expect(access({ foo: 'bar' }, ['foo'])).toBe('bar')
  })

  it('returns undefined if there is no object at the given position', () => {
    expect(access({}, ['foo'])).toBe(undefined)
  })

  it('returns undefined if a key is a non-object', () => {
    expect(
      access({ foo: '10' }, ['foo', '0'])
    ).toBe(undefined)
  })

  it('throws an error if no keyChain is provided', () => {
    expect(() => access()).toThrow(/keyChain/)
  })
})
