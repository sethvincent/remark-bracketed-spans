var fs = require('fs')
var path = require('path')

var test = require('tape')

var remark = require('remark')
var toHTML = require('remark-html')
var toMarkdown = require('remark-stringify')
var rehype = require('rehype')
var rehype2remark = require('rehype-remark')

var bracketedSpans = require('../index')

test('bracketed span', function (t) {
  var md = fs.readFileSync(path.join(__dirname, 'simple.md'), 'utf8')
  var html = remark().use(bracketedSpans).use(toHTML).processSync(md).toString()
  var expectedHTML = fs.readFileSync(path.join(__dirname, 'simple.html'), 'utf8')
  var outputMD = rehype().use(bracketedSpans.html2md).use(rehype2remark).use(toMarkdown).use(bracketedSpans.mdVisitors).processSync(html).toString()
  t.equal(html, expectedHTML)
  t.equal(outputMD, md)
  t.end()
})

test('nested bracketed span', function (t) {
  var md = fs.readFileSync(path.join(__dirname, 'nested.md'), 'utf8')
  var html = remark().use(bracketedSpans).use(toHTML).processSync(md).toString()
  var expected = fs.readFileSync(path.join(__dirname, 'nested.html'), 'utf8')
  var outputMD = rehype().use(bracketedSpans.html2md).use(rehype2remark).use(toMarkdown).use(bracketedSpans.mdVisitors).processSync(html).toString()
  t.equal(html, expected)
  t.equal(outputMD, md)
  t.end()
})
