var visit = require('unist-util-visit')
var remove = require('unist-util-remove')

function md2html (processor) {
  return function transformer (tree) {
    visit(tree,   function visitor (node, i, parent) {
      if (!node.children) return

      if (node.type &&
        node.type === 'linkReference' &&
        node.children && node.children[0].value &&
        parent.children[i + 1].value &&
        parent.children[i + 1].value.match(/\{(.+)\}/).length
      ) {
        var text = node.children[0].value
        var value = parent.children[i + 1].value
        var data = {}

        var idMatch = value.match(/\#\w+/)
        var classMatch = value.match(/\.\w+(\-)?\w+/g)
        var dataMatch = value.match(/([^=]\w+)=([^=]\w+\s*)/g)
        var bracketMatch = value.match(/\{(.+)\}/)

        var trailingText = value.split('}')[1]
    
        if (idMatch) {
          var id = idMatch[0].replace('#', '')
        }
    
        if (classMatch) {
          var classNames = classMatch.map(function (cls) {
            return cls.replace('.', '')
          })
        }
    
        if (dataMatch) {
          dataMatch.map(function (item) {
            var split = item.split('=')
            var key = split[0].trim()
            var val = split[1].trim()
            data[key] = val
          })
        }

        parent.children[i] = {
          type: 'html',
          value: createSpan(classNames, id, data, text)
        }

        if (trailingText) {
          parent.children[i + 1] = {
            type: 'text',
            value: trailingText
          }
        } else {
          remove(parent, parent.children[i + 1])
        }
      }
    })
  }
}

function createSpan (classes, id, data, children) {
  classes = classes ? classes.join(' ') : ''

  var data = Object.keys(data).map(function (key) {
    return `data-${key}="${data[key]}"`
  }).join(' ')

  return `<span${id ? ` id="${id}"` : ''} ${classes ? `class="${classes}"` : ''} ${data ? data : ''}>${children}</span>`
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
  mdVisitors: mdVisitors
}
