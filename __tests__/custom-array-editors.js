import JsonForm from '../src/index.js'
import { mount } from 'enzyme'
import React from 'react'

const consoleError = console.error

afterEach(() => {
  console.error = consoleError
})

describe('Custom array editors', () => {
  let wrapper, value

  beforeEach(() => {
    class PaginatedEditor extends React.Component {
      state = {
        index: 0,
      }

      children() {
        return React.Children.toArray(this.props.children)
      }

      child() {
        if (this.state.index > this.children().length)
          return this.children()[this.children().length - 1] || null
        if (this.state.index < 0) return this.children()[0]

        return this.children()[this.state.index]
      }

      render() {
        const buttons = []

        for (let i = 0; i < this.children().length; i++)
          buttons.push(
            <button key={i} onClick={() => this.setIndex(i)}>
              {i + 1}
            </button>,
          )

        return (
          <paginated-editor>
            {this.child()}
            {buttons}
          </paginated-editor>
        )
      }
    }

    const Form = JsonForm({
      types: {
        string: ({ onChange, value, label }) => (
          <div className="string">
            {label}:{' '}
            <input value={value} onChange={(e) => onChange(e.target.value)} />
          </div>
        ),
        $object: ({ children }) => <object-editor>{children}</object-editor>,
        [Symbol.for('paginated')]: PaginatedEditor,
      },
    })

    const schema = {
      list: [
        Symbol.for('paginated'),
        {
          title: 'string',
        },
      ],
    }

    value = {
      list: [{ title: 'foobar' }, { title: 'something' }],
    }

    wrapper = mount(
      <Form schema={schema} value={value} onChange={(x) => (value = x)} />,
    )
  })

  it('is renders the correct html', () => {
    expect(wrapper.html()).toBe(
      '<paginated-editor>' +
        /**/ '<object-editor>' +
        /**/ /**/ '<div class="string">' +
        /**/ /**/ /**/ 'Title: <input value="foobar">' +
        /**/ /**/ '</div>' +
        /**/ '</object-editor>' +
        /**/ '<button>1</button>' +
        /**/ '<button>2</button>' +
        '</paginated-editor>',
    )
  })

  it('sets the value of the input element', () => {
    expect(wrapper.find('input').props().value).toBe('foobar')
  })

  it('can be altered', () => {
    wrapper
      .find('input')
      .first()
      .simulate('change', { target: { value: 'new val' } })

    expect(value.list[0].title).toBe('new val')
  })

  it('throws an appropriate error message when an editor has not been registered', () => {
    const Form = JsonForm({
      types: {},
    })

    console.error = () => {}

    expect(() => {
      mount(
        <Form
          schema={{
            items: {
              $type: [Symbol.for('not-a-valid-type')],
            },
          }}
          onChange={() => {}}
          value={{}}
        />,
      )
    }).toThrow('Missing custom array editor for Symbol(not-a-valid-type)')
  })
})
