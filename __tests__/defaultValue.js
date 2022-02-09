import defaultValue from '../src/defaultValue'

it('can return Editor.defaultValue', () => {
  expect(
    defaultValue({ type: 'string' }, { string: { defaultValue: '' } }),
  ).toBe('')
})

it('can set the default value of an array', () => {
  expect(
    defaultValue(
      {
        type: '$array',
        items: {
          type: 'string',
        },
      },
      {
        string: {
          defaultValue: 'Some default value',
        },
      },
    ),
  ).toEqual([])
})

it('can set the default value of an object', () => {
  expect(
    defaultValue(
      {
        type: '$object',
        items: {
          title: {
            type: 'string',
          },
          subtitle: {
            type: 'string',
          },
        },
      },
      {
        string: {
          defaultValue: 'Some default value',
        },
      },
    ),
  ).toEqual({
    title: 'Some default value',
    subtitle: 'Some default value',
  })
})
