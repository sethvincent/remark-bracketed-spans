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
  var html = remark().use(bracketedSpans.md2html).use(toHTML).process(md)
  var expectedHTML = fs.readFileSync(path.join(__dirname, 'simple.html'), 'utf8')
  var outputMD = rehype().use(bracketedSpans.html2md).use(rehype2remark).use(toMarkdown).use(bracketedSpans.mdVisitor).process(html.contents)
  t.equal(html.contents, expectedHTML)
  t.equal(outputMD.contents, md)
  t.end()
})

test('nested bracketed span', function (t) {
  var md = fs.readFileSync(path.join(__dirname, 'nested.md'), 'utf8')
  var html = remark().use(bracketedSpans.md2html).use(toHTML).process(md)
  var expected = fs.readFileSync(path.join(__dirname, 'nested.html'), 'utf8')
  var outputMD = rehype().use(bracketedSpans.html2md).use(rehype2remark).use(toMarkdown).use(bracketedSpans.mdVisitor).process(html.contents)
  t.equal(html.contents, expected)
  t.equal(outputMD.contents, md)
  t.end()
})
