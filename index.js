var visit = require('unist-util-visit')
var remove = require('unist-util-remove')

function md2html (processor) {
  return function transformer (tree) {
    visit(tree,   function visitor (node, i, parent) {
      if (!node.children) return
      var data = parseMarkdown(node, i, parent, tree)

      if (data) {
        parent.children[i] = {
          type: 'html',
          value: data.html
        }

        if (data.trailingText) {
          parent.children[i + 1] = {
            type: 'text',
            value: data.trailingText
          }
        } else {
          remove(parent, parent.children[i + 1])
        }
      }
    })
  }
}

/*
* if a bracket span statement is found: returns an object 
* with id, classList, attr, and children properties
* else returns false
*/
function parseMarkdown (node, i, parent, tree) {
  if (!node.children) return false

  if (node.type &&
    node.type === 'linkReference' &&
    node.children && node.children[0].value &&
    parent.children[i + 1].value &&
    parent.children[i + 1].value.match(/\{(.+)\}/).length
  ) {
    var text = node.children[0].value
    var value = parent.children[i + 1].value
    var data = {
      id: null,
      classList: [],
      attr: {}
    }

    var idMatch = value.match(/\#\w+/)
    var classMatch = value.match(/\.\w+(\-)?\w+/g)
    var attrMatch = value.match(/([^=]\w+)=([^=]\w+\s*)/g)
    var bracketMatch = value.match(/\{(.+)\}/)

    if (idMatch) {
      data.id = idMatch[0].replace('#', '')
    }

    if (classMatch) {
      data.classList = classMatch.map(function (cls) {
        return cls.replace('.', '')
      })
    }

    if (attrMatch) {
      attrMatch.map(function (item) {
        var split = item.split('=')
        var key = split[0].trim()
        var val = split[1].trim()
        data.attr[key] = val
      })
    }

    data.text = text
    data.trailingText = value.split('}')[1]
    data.html = createSpan(data)
    return data
  } else  {
    return false
  }
}

function createSpan (data) {
  var classes = data.classList ? data.classList.join(' ') : ''
  var children = data.children
  var text = data.text
  var attrs = data.attrs
  var id = data.id

  var attr = Object.keys(data.attr).map(function (key) {
    return `data-${key}="${data.attr[key]}"`
  }).join(' ')

  return `<span${id ? ` id="${id}"` : ''} ${classes ? `class="${classes}"` : ''} ${attr ? attr : ''}>${text}</span>`
}

function html2md () {
  return function transformer (tree) {
    visit(tree, visitor)
  }

  function visitor(node, index, parent) {
    if (
      node.tagName &&
      node.tagName === 'span' &&
      node.properties &&
      (
        node.properties.className ||
        node.properties.id ||
        hasDataAttr(node.properties)
      )
    ) {
      var props = node.properties
      var text = '[' + node.children[0].value + ']{'
      var attrs = []
      if (props.id) {
        attrs.push('#' + props.id)
        delete props.id
      }

      if (props.className) {
        attrs.push(props.className.map(function (name) {
          return '.' + name
        }).join(' '))
        delete props.className
      }

      var dataKeys = Object.keys(props)

      dataKeys.forEach(function (key) {
        var attrkey = key.replace('data', '').toLowerCase()
        attrs.push(attrkey + '=' + props[key])
      })

      text += attrs.join(' ') + '}'

      parent.children[index] = {
        type: 'text',
        value: text.trim()
      }
    }
  }
}

function hasDataAttr (props) {
  if (!props) return false
  var keys = Object.keys(props)
  if (!keys.length) return false
  var i = 0
  for (i; i < keys.length; i++) {
    var key = keys[i]
    if (key.indexOf('data') === 0) {
      return true
    }
  }
  return false
}

/* clean up md output */
function mdVisitors (processor) {
  var Compiler = processor.Compiler
  var visitors = Compiler.prototype.visitors
  var text = visitors.text

  /* Add a visitor for `heading`s. */
  visitors.text = function (node, parent) {
    var textMatch = node.value.match(/\[(.*?)\]/)
    var bracketMatch = node.value.match(/\{(.+)\}/)
    if (
      textMatch &&
      bracketMatch
    ) {
      node.value = node.value.replace(/\//g, '')
      return node.value.replace(/\/+?(?=\[)/g, '')
    } else {
      return text.apply(this, arguments)
    }
  }
}

module.exports = {
  md2html: md2html,
  html2md: html2md,
  mdVisitors: mdVisitors,
  parseMarkdown: parseMarkdown
}
