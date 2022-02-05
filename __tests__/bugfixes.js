import JsonForm, { DefaultArrayEditor } from '../src'
import { mount } from 'enzyme'
import React from 'react'

const consoleError = console.error
const Noop = () => null

beforeEach(() => {
  console.error = () => {}
})

afterEach(() => {
  console.error = consoleError
})

test('bugfix: schemaKeyChain should respect expanded type definitions', () => {
  const availableOptions = {
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
  }

  const Form = JsonForm({
    types: {
      string: Noop,
    },
  })

  expect(() => {
    mount(
      <Form
        onChange={() => {}}
        schema={availableOptions}
        value={{
          dropdown: [
            {
              choices: ['A1', 'A2'],
            },
            {
              choices: ['B1', 'B2'],
            },
          ],
        }}
      />,
    )
  }).not.toThrow()
})

test('[p]repro: expansion of object type', () => {
  const availableOptions = {
    foo: {
      bar: {
        $type: {
          hello: 'string',
        },
      },
    },
  }

  const Form = JsonForm({
    types: {
      string: Noop,
    },
  })

  expect(() => {
    mount(
      <Form
        onChange={() => {}}
        schema={availableOptions}
        value={{
          foo: {
            bar: {
              hello: 'world',
            },
          },
        }}
      />,
    )
  }).not.toThrow()
})
