import JsonForm from '../src/index'
import * as types from './types'
import { mount } from 'enzyme'
import React from 'react'

const Form = JsonForm({ types })

export default (schema, value) => {
  let wrapper

  const onChange = x => {
    value = x
    wrapper.setProps({ value })
  }

  wrapper = mount(
    <Form
      schema={schema}
      onChange={onChange}
      value={value}
    />
  )

  return wrapper
}
