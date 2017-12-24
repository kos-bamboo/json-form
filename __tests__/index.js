import EnzymeAdapter from 'enzyme-adapter-react-16'
import JsonForm, { access, deepSet } from '../src'
import enzyme, { mount } from 'enzyme'
import React from 'react'

enzyme.configure({
  adapter: new EnzymeAdapter()
})

class FauxArray {
  length = 0

  constructor(items) {
    for (let i = 0; i < items.length; i++)
      this.push(items[i])
  }

  push(item) {
    this[this.length++] = item
  }

  concat(item) {
    const items = []
    for (let i = 0; i < this.length; i++)
      items.push(this[i])
    items.push(item)
    return new this.constructor(items)
  }

  fauxArray = true
}

function fauxArray(array = []) {
  return new FauxArray(array)
}

describe('json-form', () => {
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

  it('throws an error unless the types property is supplied', () => {
    expect(() => JsonForm()).toThrow(/"types" is a required option/)
  })

  describe('single level', () => {
    it('creates the correct react elements', () => {
      const InputEditor = ({ onChange, value }) => (
        <input onChange={onChange} />
      )

      const Form = JsonForm({
        types: {
          input: InputEditor,
        }
      })

      const schema = {
        title: 'input'
      }

      class FormContainer extends React.Component {
        state = {
          value: {}
        }

        onChange = value => {
          this.setState({ value })
        }

        render() {
          return (
            <Form
              schema={schema}
              onChange={this.onChange}
              value={this.state}
            />
          )
        }
      }

      const wrapper = mount(<FormContainer />)

      const input = wrapper
        .find('input')
        .first()

      expect(input).toBeDefined()
      expect(input.html()).toBe('<input>')
      input.simulate('change', { target: { value: 'Hello world' } })
      expect(wrapper.state('value').title).toBe('Hello world')
    })
  })

  describe('multi level', () => {
    describe('object editor', () => {
      let wrapper
      let noObjectEditor = false

      beforeEach(() => {
        const InputEditor = ({ onChange, value = '' }) => (
          <input onChange={onChange} value={value} />
        )
        InputEditor.defaultValue = ''
        const ObjectEditor = ({ children }) => (
          <div className="object-editor">{children}</div>
        )

        const Form = JsonForm({
          types: {
            input: InputEditor,
            $object: noObjectEditor ? null : ObjectEditor,
          }
        })

        const schema = {
          general: {
            title: 'input'
          }
        }

        class FormContainer extends React.Component {
          state = {
            value: {
              general: {
                title: ''
              }
            }
          }

          onChange = value => {
            this.setState({ value })
          }

          render() {
            return (
              <Form
                schema={schema}
                onChange={this.onChange}
                value={this.state.value}
              />
            )
          }
        }

        wrapper = mount(<FormContainer />)
        noObjectEditor = false
      })

      it('defaults to a simple div', () => {
        const value = {}
        const Form = JsonForm({
          types: {
            input: () => <input />
          }
        })
        const schema = { general: { title: 'input' } }
        const wrapper = mount(
          <Form schema={schema} value={value} />
        )

        expect(wrapper.html()).toBe(
          '<div>' +
          /**/'<input>' +
          '</div>'
        )
      })

      it('can create object editors', () => {
        const objectEditor = wrapper
          .find('.object-editor')
        expect(objectEditor.length).toBe(1)

        const input = wrapper
          .find('input')
          .first()

        expect(input.length).toBe(1)
        input.simulate('change', { target: { value: 'Hello world' } })
        expect(wrapper.state('value').general.title).toBe('Hello world')
      })
    })

    describe('array editors', () => {
      let wrapper
        , value
        , createArray
        , types

      beforeEach(() => {
        types = {
          input: ({ value, onChange }) => <input className="input" value={value} onChange={onChange}/>,
          $object: ({ children }) => <div className="object">{children}</div>,
          $array: ({ children, add }) => <div className="array">{children}<button onClick={add}>Add item</button></div>,
        }
      })

      const render = () => {
        const Form = JsonForm({
          types,
          createArray,
        })

        const schema = {
          options: [{
            text: 'input',
          }]
        }

        wrapper = mount(
          <Form
            schema={schema}
            onChange={x => value = x}
            value={value}
          />
        )
      }

      afterEach(() => {
        value = {}
        createArray = null
        wrapper = null
      })

      it('passes the correct children to array editors', () => {
        value = {
          options: [
            { text: 'foo' },
          ]
        }
        render()
        expect(wrapper.html()).toBe(
          '<div class="array">' +
          /**/'<div class="object">' +
          /**//**/'<input class="input">' +
          /**/'</div>' +
          /**/'<button>Add item</button>' +
          '</div>'
        )
      })

      it('passes the correct default children to array editors', () => {
        types.$array = null
        value = {
          options: [
            { text: 'foo' },
          ]
        }
        render()
        expect(wrapper.html()).toBe(
          '<div>' +
          /**/'<div class="object">' +
          /**//**/'<input class="input">' +
          /**/'</div>' +
          /**/'<button>Add item</button>' +
          '</div>'
        )
      })

      it('changes the state correctly for array editors', () => {
        value = {
          options: [
            { text: 'foo' },
          ]
        }
        render()
        wrapper
          .find('input')
          .first()
          .simulate('change', { target: { value: 'Hello world' } })
        expect(value.options[0].text).toBe('Hello world')
      })

      it('discards non-array values', () => {
        value = {
          options: 'non-array'
        }
        render()

        const count = wrapper
          .find('input')
          .length

        expect(count).toBe(0)
      })

      it('supports adding a new array item', () => {
        value = {
          options: []
        }

        render()

        wrapper
          .find('button')
          .simulate('click')

        expect(value.options.length).toBe(1)
      })

      it('supports creating an initial array', () => {
        value = {}
        render()
        wrapper
          .find('button')
          .simulate('click')
        expect(value.options.length).toBe(1)
      })

      it('supports a custom createArray function', () => {
        createArray = fauxArray

        render()

        wrapper
          .find('button')
          .simulate('click')

        expect(value.options instanceof FauxArray).toBe(true)
      })
    })
  })

  describe('coverage of defensive programming', () => {
    let Form
      , SubEditor

    beforeEach(() => {
      Form = JsonForm({ types: {} })
      SubEditor = Form.SubEditor
    })

    it('throws an error if no type could be found', () => {
      let console = global.console
      global.console = {
        error: jest.fn()
      }

      expect(() => {
        SubEditor.prototype.type.call({
          props: {
            keyChain: []
          }
        })
      }).toThrow(/Invalid type: undefined/)

      expect(global.console.error).toHaveBeenCalledWith('Schema:', undefined)
      expect(global.console.error).toHaveBeenCalledWith('Key chain:', [])

      global.console = console
    })

    it('throws an error if no valid type name was found', () => {
      expect(() => {
        SubEditor.prototype.typeName.call({
          props: {
            keyChain: []
          },
          type: () => {},
        })
      }).toThrow(/Invalid type: undefined/)
    })

    it('type returns array like values', () => {
      const value = SubEditor.prototype.value.call({
        props: {
          keyChain: [],
          value: fauxArray([
            'This is',
            'array like'
          ]),
        },
        typeName: () => '$array',
      })

      expect(value).toEqual(fauxArray(['This is', 'array like']))
    })

    test('value() returns the value by default', () => {
      const actual = SubEditor.prototype.value.call({
        props: {
          keyChain: [],
          value: 'something',
        },
        typeName: () => '...',
      })
      const expected = 'something'

      expect(actual).toBe(expected)
    })

    test('typeName() returns "$array" if the type is an array like object', () => {
      const actual = SubEditor.prototype.typeName.call({
        type: () => ({
          length: 0,
          map: () => {},
          slice: () => {},
          concat: () => {},
          push: () => {},
        })
      })
      const expected = '$array'
      expect(actual).toBe(expected)
    })

    test('An error is thrown if no editor matches a given type', () => {
      expect(() => {
        SubEditor.prototype.render.call({
          editor: () => {},
          children: () => {},
          typeName: () => 'foobar',
        })
      }).toThrow('No type with the name "foobar" has been registered')
    })

    test('you cannot call add for non-array types', () => {
      expect(() => {
        const instance = new SubEditor()
        instance.typeName = () => 'non-array'
        instance.add()
      }).toThrow('Invalid type for add')
    })
  })
})
