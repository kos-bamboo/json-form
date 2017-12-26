import renderSchema from '../testUtil/renderSchema'

describe('array editor', () => {
  it('should allow nested array editors', () => {
    const wrapper = renderSchema({
      articles: [{
        tags: [{
          name: 'string'
        }]
      }]
    }, {
      articles: [{
        tags: ['foobar']
      }]
    })

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
                          '<input>'+
                      '</string-editor>'+
                  '</object-editor>'+
                  '<button>Add</button>'+
              '</array-editor>'+
          '</object-editor>'+
          '<button>Add</button>'+
      '</array-editor>'
    )
  })
})
