import JsonForm from '../src/index.js'
import { mount } from 'enzyme'
import React from 'react'

const StringEditor = ({ onChange, value, label }) => (
  <div>
    <label>
      <div className="label-text">{label}</div>
      <input onChange={(e) => onChange(e.target.value)} value={value} />
    </label>
  </div>
)

StringEditor.defaultValue = ''

const Form = JsonForm({
  types: {
    string: StringEditor,
  },
})

describe('labels', () => {
  it('uses the keys as labels by default', () => {
    const schema = {
      someTitle: 'string',
    }

    const wrapper = mount(<Form schema={schema} onChange={() => {}} />)

    const labelText = wrapper.find('.label-text').text()

    expect(labelText).toBe('Some title')
  })

  describe('setting explicit labels', () => {
    let value, wrapper

    beforeEach(() => {
      const schema = {
        someTitle: {
          $type: 'string',
          $label: 'MY TITLE',
        },
      }

      value = null
      const setValue = (x) => (value = x)
      wrapper = mount(<Form schema={schema} onChange={setValue} />)
    })

    it('sets the value for the correct key', () => {
      wrapper
        .find('input')
        .first()
        .simulate('change', { target: { value: 'Hello world' } })

      expect(value).toEqual({ someTitle: 'Hello world' })
    })
  })
})
