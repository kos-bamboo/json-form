import expandSchema, { expandSubSchema } from '../src/expandSchema.js'

let input
let output

beforeEach(() => {
  let actual

  input = (_) => {
    actual = expandSchema(_)
  }

  output = (expected) => {
    expect(actual).toEqual(expected)
  }
})

it('does nothing to the root schema', () => {
  input({})
  output({})
})

it('dealiases $type', () => {
  input({
    foo: {
      $type: 'string',
    },
  })
  output({
    foo: {
      type: 'string',
    },
  })
})

test('expands objects', () => {
  input({
    foo: {
      name: 'string',
    },
  })
  output({
    foo: {
      type: '$object',
      items: {
        name: {
          type: 'string',
        },
      },
    },
  })
})

test('strings expand to the explicit form', () => {
  input({ foo: 'string' })

  output({
    foo: {
      type: 'string',
    },
  })
})

test('the basic array type is expanded', () => {
  input({ foo: ['string'] })

  output({
    foo: {
      type: '$array',
      editor: '$array',
      items: {
        type: 'string',
      },
    },
  })
})

test('the custom array type is expanded', () => {
  input({
    foo: [Symbol.for('paginated'), 'string'],
  })

  output({
    foo: {
      type: '$array',
      editor: Symbol.for('paginated'),
      items: {
        type: 'string',
      },
      params: 'string'
    },
  })
})

test('the dropdown type is expanded', () => {
  input({ language: ['English', 'Norwegian'] })

  output({
    language: {
      type: 'dropdown',
      choices: ['English', 'Norwegian'],
    },
  })
})

it('passes $-prefixed properties as props', () => {
  input({
    name: {
      $type: 'string',
      $placeholder: 'Enter your name',
    },
  })

  output({
    name: {
      type: 'string',
      props: {
        placeholder: 'Enter your name',
      },
    },
  })
})

test('wtf', () => {
  input({
    dropdown: {
      $type: [
        {
          choices: {
            $type: [
              {
                choice: {
                  $type: 'string',
                  $label: 'choice',
                },
              },
            ],
          },
        },
      ],
    },
  })

  output({
    dropdown: {
      type: '$array',
      editor: '$array',
      items: {
        type: '$object',
        items: {
          choices: {
            type: '$array',
            editor: '$array',
            items: {
              type: '$object',
              items: {
                choice: {
                  type: 'string',
                  props: {
                    label: 'choice',
                  },
                },
              },
            },
          },
        },
      },
    },
  })
})

test('wtf - sub schema', () => {
  const schema = {
    choices: [
      {
        choice: {
          $type: 'string',
          $label: 'choice',
        },
      },
    ],
  }

  const expected = {
    type: '$object',
    items: {
      choices: {
        editor: '$array',
        type: '$array',
        items: {
          type: '$object',
          items: {
            choice: {
              type: 'string',
              props: {
                label: 'choice',
              },
            },
          },
        },
      },
    },
  }

  expect(expandSubSchema(schema)).toEqual(expected)
})
