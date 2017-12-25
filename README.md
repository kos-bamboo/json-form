# @adrianhelvik/json-form
This package can be used to generate forms from a JSON object.
It has 100% test coverage. Contributions are welcome!

## Example

```javascript
import JsonForm from '@adrianhelvik/json-form'

const Form = JsonForm({
  string: ({ onChange, value, label }) => (
    <div>
      {label}: <input onChange={onChange} value={value} />
    </div>
  ),
  test: ({ onChange, value, label }) => (
    <div>
      {label}: <textarea onChange={onChange} value={value} />
    </div>
  )
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

# Licence
MIT, see LICENCE file
