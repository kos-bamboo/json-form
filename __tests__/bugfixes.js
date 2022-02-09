import JsonForm, { DefaultArrayEditor } from '../src'
import { mount } from 'enzyme'
import assert from 'assert'
import React from 'react'

function Noop() {
  return null
}

const consoleError = console.error

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

const createComplexSetup = () => {
  const availableOptions = {
    dropdown: {
      $type: [
        Symbol.for('outer'),
        {
          placeholder: {
            $type: 'placeholder',
            $label: 'placeholder inside the dropdown List',
            $placeholder: 'Choose from the list',
          },
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

  const StringEditor = ({ value, onChange }) => (
    <input
      data-test-id="string-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
  StringEditor.defaultValue = ''

  const PlaceholderEditor = ({ value, onChange }) => (
    <input
      data-test-id="placeholder-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
  PlaceholderEditor.defaultValue = ''

  const Form = JsonForm({
    types: {
      string: StringEditor,
      placeholder: PlaceholderEditor,
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

  const self = {}

  self.value = {
    dropdown: [
      {
        choices: ['A1', 'A2'],
      },
      {
        choices: ['B1', 'B2'],
      },
    ],
  }

  const Container = () => {
    const [value, setValue] = React.useState(self.value)

    return (
      <Form
        onChange={(value) => {
          self.value = value
          setValue(value)
        }}
        schema={availableOptions}
        value={value}
      />
    )
  }

  self.wrapper = mount(<Container />)

  return self
}

test('[pt1] bugfix: add should alter the correct array with expanded schema types', () => {
  const data = createComplexSetup()

  data.wrapper.find('[data-test-id="inner-add"]').first().simulate('click')

  expect(data.value).toEqual({
    dropdown: [
      {
        choices: ['A1', 'A2', ''],
      },
      {
        choices: ['B1', 'B2'],
      },
    ],
  })
})

test('[pt2] bugfix: add should alter the correct array with expanded schema types', () => {
  const data = createComplexSetup()

  global.DEBUG = true
  data.wrapper.find('[data-test-id="outer-add"]').first().simulate('click')
  global.debug = false

  expect(data.value).toEqual({
    dropdown: [
      {
        choices: ['A1', 'A2'],
      },
      {
        choices: ['B1', 'B2'],
      },
      {
        choices: [],
        placeholder: '',
      },
    ],
  })
})

test('[pt3] bugfix: add should alter the correct array with expanded schema types', () => {
  const data = createComplexSetup()

  // Add a new dropdown
  data.wrapper.find('[data-test-id="outer-add"]').first().simulate('click')

  expect(data.value).toEqual({
    dropdown: [
      {
        choices: ['A1', 'A2'],
      },
      {
        choices: ['B1', 'B2'],
      },
      {
        choices: [],
        placeholder: '',
      },
    ],
  })

  // Set placeholder for dropdown
  data.wrapper
    .find('[data-test-id="placeholder-editor"]')
    .last()
    .simulate('change', { target: { value: 'Hello world' } })

  expect(data.value.dropdown[2].placeholder).toBe('Hello world')

  expect(data.value).toEqual({
    dropdown: [
      {
        choices: ['A1', 'A2'],
      },
      {
        choices: ['B1', 'B2'],
      },
      {
        choices: [],
        placeholder: 'Hello world',
      },
    ],
  })
})
