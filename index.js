var visit = require('unist-util-visit')
var remove = require('unist-util-remove')

function parse (processor) {
  return function transformer (tree) {
    visit(tree, visitor)
  }

  function visitor (node) {
    if (node.children && node.children.length >= 2) {
      var l = node.children.length
      var i = 0

      for (i; i < l; i++) {
        if (node.children[i]
        && node.children[i].type === 'linkReference'
        && node.children[i + 1]
        && node.children[i + 1].value.match(/\{(.+)\}/).length) {
          var value = node.children[i + 1].value
          var text = node.children[i].children[0].value
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

          node.children[i] = {
            type: 'html',
            value: createSpan(classNames, id, data, text)
          }

          if (trailingText) {
            node.children[i + 1] = {
              type: 'text',
              value: trailingText
            }
          } else {
            remove(node, node.children[i + 1])
          }
        }
      }
    }
  }
}

function createSpan (classes, id, data, children) {
  classes = classes.join(' ')

  var data = Object.keys(data).map(function (key) {
    return `data-${key}="${data[key]}"`
  }).join(' ')

  return `<span${id ? ` id="${id}"` : ''} ${classes ? `class="${classes}"` : ''} ${data ? data : ''}>${children}</span>`
}

function stringify () {
  return function transformer (tree) {
    throw new Error('not yet implemented')
    visit(tree, visitor)
  }

  function visitor(node) {
    console.log('node', node)
  }
}

module.exports = parse
module.exports.parse = parse
module.exports.stringify = stringify
