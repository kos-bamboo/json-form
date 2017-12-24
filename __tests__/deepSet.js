import deepSet from '../src/deepSet'

describe('deepSet', () => {
  it('can set the property of an object', () => {
    expect(deepSet({}, ['foo'], 'bar')).toEqual({ foo: 'bar' })
  })

  it('throws an error if a chain is not predetermined', () => {
    expect(() => {
      deepSet({}, ['foo', 'bar', 'baz'], 'cool')
    }).toThrow(/All editors should have a default value!/)
  })

  it('throws an error if the key is null or undefined', () => {
    expect(() => {
      deepSet({}, [null])
    }).toThrow(/Cannot call deepSet with null\/undefined as a key/)
  })
})
