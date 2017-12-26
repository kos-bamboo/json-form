import renderSchema from '../testUtil/renderSchema'

describe('array editor', () => {
  describe('nested array editors', () => {
    let wrapper

    beforeEach(() => {
        wrapper = renderSchema({
          articles: [{
            tags: [{
              name: 'string'
            }]
          }]
        }, {
          articles: [{
            tags: [{
              name: 'foobar'
            }]
          }]
        })
    })

    it('should render correctly', () => {
      expect(wrapper.html()).toBe(
        '<array-editor>'+
            '<h3>Articles</h3>'+
            '<object-editor>'+
                '<h3>Article 1</h3>'+
                '<array-editor>'+
                    '<h3>Tags</h3>'+
                    '<object-editor>'+
                        '<h3>Tag 1</h3>'+
                        '<string-editor>'+
                            '<string-editor-label>Name</string-editor-label>'+
                            '<input value="foobar">'+
                        '</string-editor>'+
                    '</object-editor>'+
                    '<button>Add</button>'+
                '</array-editor>'+
            '</object-editor>'+
            '<button>Add</button>'+
        '</array-editor>'
      )
    })

    it('should be possible to add an item to the inner array', () => {
      // Click on add label
      wrapper
        .find('button')
        .first()
        .simulate('click')

      expect(wrapper.getValue()).toEqual({
        articles: [{
          tags: [
            { name: 'foobar' },
            null
          ]
        }]
      })
    })
  })
})
