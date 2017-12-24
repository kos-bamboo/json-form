# @adrianhelvik/json-form
This package can be used to generate forms from a JSON object.
It is still a work in progress. It has 100% test coverage and
I plan to keep it that way. Contributions are welcome!

## Example

```javascript
import JsonForm from '@adrianhelvik/json-form'

const Form = JsonForm({
  string: ({ onChange, value }) => (
    <input onChange={onChange} value={value} />
  ),
  test: ({ onChange, value }) => (
    <textarea onChange={onChange} value={value} />
  )
})

const schema = {
  author: 'string',
  articles: [{
    title: 'string',
    content: 'text',
  }]
}

<Form schema={schema} value={...} onChange={...} />
```

This will generate a form where you can add articles,
which consist of a title and a content field.

## To do

### Create label from key functionality
Default to the key of the object uppercased and decamelized

### Create explicit label functionality
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
