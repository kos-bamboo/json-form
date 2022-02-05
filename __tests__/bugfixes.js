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

test('bugfix: add should alter the correct array with expanded schema types', () => {
  const availableOptions = {
    dropdown: {
      $type: [
        Symbol.for('outer'),
        {
          choices: {
            $type: [
              Symbol.for('inner'),
              {
                $type: 'string',
                $label: 'choice',
              },
            ],
          },
        },
      ],
    },
  }

  const StringEditor = () => null
  StringEditor.defaultValue = ''

  const Form = JsonForm({
    types: {
      string: StringEditor,
      [Symbol.for('outer')]: ({ children, add }) => {
        return (
          <>
            {children.map((child, i) => (
              <div key={i}>{child}</div>
            ))}
            <button type="button" data-test-id="outer-add" onClick={add}>
              Outer add
            </button>
          </>
        )
      },
      [Symbol.for('inner')]: ({ children, add }) => {
        return (
          <>
            {children.map((child, i) => (
              <div key={i}>{child}</div>
            ))}
            <button type="button" data-test-id="inner-add" onClick={add}>
              Inner add
            </button>
          </>
        )
      },
    },
  })

  let changedValue

  const wrapper = mount(
    <Form
      onChange={(value) => {
        changedValue = value
      }}
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

  wrapper.find('[data-test-id="inner-add"]').first().simulate('click')

  expect(changedValue).toEqual({
    dropdown: [
      {
        choices: ['A1', 'A2', ''],
      },
      {
        choices: ['B1', 'B2'],
      },
    ],
  })

  wrapper.find('[data-test-id="outer-add"]').first().simulate('click')

  expect(changedValue).toEqual({
    dropdown: [
      {
        choices: ['A1', 'A2'],
      },
      {
        choices: ['B1', 'B2'],
      },
      null,
    ],
  })
})
