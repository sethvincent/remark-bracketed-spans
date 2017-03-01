# remark-bracketed-spans

Add an id, classes, and data attributes to `<span>` tags in markdown.

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]
[![standard][standard-image]][standard-url]
[![conduct][conduct]][conduct-url]

[npm-image]: https://img.shields.io/npm/v/remark-bracketed-spans.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/remark-bracketed-spans
[travis-image]: https://img.shields.io/travis/sethvincent/remark-bracketed-spans.svg?style=flat-square
[travis-url]: https://travis-ci.org/sethvincent/remark-bracketed-spans
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[standard-url]: http://npm.im/standard
[conduct]: https://img.shields.io/badge/code%20of%20conduct-contributor%20covenant-green.svg?style=flat-square
[conduct-url]: CONDUCT.md

## About

A [remark](http://npmjs.com/remark) plugin for adding attributes to span tags in markdown that works even when the span is nested inside other markdown elements.

Usage looks like this:

```md
[text in the span]{.class .other-class key=val another=example}
```

And results in HTML like this:

```html
<p><span class="class other-class" data-key="val" data-another="example">text in the span</span></p>
```

## Install

```sh
npm install --save remark-bracketed-spans
```

## Usage

This module is a [remark](http://npmjs.com/remark) plugin, and can be used like this:

```js
var remark = require('remark')
var toHTML = require('remark-html')
var bracketedSpans = require('remark-bracketed-spans')

var md = '[text in the span]{.class .other-class key=val another=example}'

var html = remark().use(bracketedSpans).use(toHTML).processSync(md).toString()

console.log(html)
```

## License

[ISC](LICENSE.md)
