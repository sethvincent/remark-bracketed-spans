var fs = require('fs')
var path = require('path')

var test = require('tape')

var remark = require('remark')
var toHTML = require('remark-html')
var toMarkdown = require('remark-stringify')
var rehype = require('rehype')

var bracketedSpans = require('../index')

test('parse bracketed span', function (t) {
  var md = fs.readFileSync(path.join(__dirname, 'simple.md'), 'utf8')
  var html = remark().use(bracketedSpans).use(toHTML).process(md)
  var expected = fs.readFileSync(path.join(__dirname, 'simple.html'), 'utf8')
  t.equal(html.contents, expected)
  t.end()
})

test('parse nested bracketed span', function (t) {
  var md = fs.readFileSync(path.join(__dirname, 'nested.md'))
  var html = remark().use(bracketedSpans).use(toHTML).process(md)
  var expected = fs.readFileSync(path.join(__dirname, 'nested.html'), 'utf8')
  t.equal(html.contents, expected)
  t.end()
})

// test('stringify bracketed span', function (t) {
//   t.end()
// })
