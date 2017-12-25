import deepSet from '../src/deepSet'

describe('deepSet', () => {
  it('can set the property of an object', () => {
    expect(deepSet({}, ['foo'], 'bar')).toEqual({ foo: 'bar' })
  })

  it('throws an error if the key is null or undefined', () => {
    expect(() => {
      deepSet({}, [null])
    }).toThrow(/Cannot call deepSet with null\/undefined as a key/)
  })

  it('can utilize a schema and a schema key chain to set undefined keys', () => {
    const valueKeyChain = ['list', '0', 'title']
    const schemaKeyChain = ['list', '1', 'title']
    const schema = {
      list: [Symbol.for('paginated'), {
        title: 'string'
      }]
    }
    const newValue = deepSet(
      null,
      valueKeyChain,
      'new value',
      schemaKeyChain,
      schema,
    )

    expect(newValue).toEqual({
      list: [{
        title: 'new value'
      }]
    })
  })

  it('throws an error if the schema has no setting strategy', () => {
    expect(() => {
      deepSet(null, ['list', '0'], 'some value', ['list', '1'], {
        list: 'string'
      })
    }).toThrow(/Unhandled schema type/)
  })
})
