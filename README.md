# @adrianhelvik/json-form

[![Build Status](https://travis-ci.org/adrianhelvik/json-form.svg?branch=master)](https://travis-ci.org/adrianhelvik/json-form)
[![Coverage Status](https://coveralls.io/repos/github/adrianhelvik/json-form/badge.svg?branch=master)](https://coveralls.io/github/adrianhelvik/json-form?branch=master)

This package can be used to generate forms from a JSON object.
It has 100% test coverage. Contributions are welcome!

# Note
This is still experimental.

## Example

```javascript
import JsonForm from '@adrianhelvik/json-form'

const Form = JsonForm({
  types: {
    string: ({ onChange, value, label }) => (
      <div>
        {label}: <input onChange={e => onChange(e.target.value)} value={value} />
      </div>
    ),
    text: ({ onChange, value, label }) => (
      <div>
        {label}: <textarea onChange={e => onChange(e.target.value)} value={value} />
      </div>
    )
  }
})

const schema = {
  authorName: 'string',
  articles: [{
    title: 'string',
    content: 'text',
  }]
}

<Form schema={schema} value={...} onChange={...} />
```

Renders the following html:

```html
<div>
  Author name: <input>
</div>
<div>
  <div>
    Title: <input>
  </div>
  <div>
    Title: <input>
  </div>
  ...
  <button>Add item</button>
</div>
```

As you can see, the keys are transformed from camel case to
space delimited words, with the first letter in upper case.

### Explicit labels

If you need to use a custom label, use the format below.
Specify a type as you normally would, but under a $type
key, and specify a label under the $label key.

```javascript
const schema = {
  author: {
    $type: 'string',
    $label: 'Your name'
  },
  articles: {
    $type: [{
      title: 'string',
      content: 'text',
    }],
    $label: 'A list of nice articles',
  }
}
```

### Multiple array editors

In some cases you might want to define multiple types of array
editors. One example that I need is a paginated list and a
non-paginated.

Custom array editors are denoted with a symbol in the types
object and with an array with its first item being the given
symbol in the schema.

```javascript
const types = {
  string: StringEditor,
  [Symbol.for('paginated')]: PaginatedEditor,
}
const schema = {
  list: [Symbol.for('paginated'), {
    title: 'string'
  }]
}
```

### Dynamic editors with $computedProps

It is often necessary to change the value of something based
on an independent variable. A rather poor, but quite simple
example of this is an input field with a max length.

```javascript
const types = {
  string({ value, onChange, maxLength }) {
    return (
      <input
        value={value}
        onChange={e => {
          if (maxLength != null && e.target.value.length >= maxLength)
            e.target.value = e.target.value.slice(0, maxLength)
          onChange(e.target.value)
        }}
      />
    )
  },
  number({ value, onChange }) {
    return (
      <input
        type="number"
        value={value == null ? '' : String(value)}
        onChange={e => {
          onChange(parseInt(e.target.value, 10))
        }}
      />
    )
  }
}
const schema = {
  text: {
    $type: 'string',
    $computedProps({ maxLength }) {
      return { maxLength }
    }
  },
  maxLength: 'number',
}
```

Additionally you can use the prop `computedPropsRest` on the
form component. (The one returned from JsonForm). this prop
should be an array. `$computedProps` is called with the value
as its first argument and the `computedPropsRest` as the
rest argument. See the tests for more info on this.

# Licence
MIT, see LICENCE file
