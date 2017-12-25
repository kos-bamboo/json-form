import JsonForm from '../src/index'
import { mount } from 'enzyme'
import React from 'react'

const Form = JsonForm({
  types: {
    number: ({ onChange, value }) => (
      <input type="number" onChange={onChange} value={value} />
    ),
    $object: ({ children, label }) => (
      <object-editor>
        <h3>{label}</h3>
        {children}
      </object-editor>
    ),
    $array: ({ children, label, add }) => (
      <array-editor>
        <h3>{label}</h3>
        {children}
        <button onClick={add}>Add</button>
      </array-editor>
    ),
  }
})

describe('object editor', () => {
  it('provides a useful label within array editors', () => {
    const schema = {
      peaches: [{
        weight: 'number'
      }]
    }
    const value = {
      peaches: [{
        weight: 10
      }]
    }

    const wrapper = mount(<Form schema={schema} value={value} />)

    expect(wrapper.html()).toBe(
      '<array-editor>'+
      /**/'<h3>Peaches</h3>'+
      /**/'<object-editor>'+
      /**//**/'<h3>Peach</h3>'+
      /**//**/'<input type="number" value="10">'+
      /**/'</object-editor>'+
      /**/'<button>Add</button>'+
      '</array-editor>'
    )
  })
})
