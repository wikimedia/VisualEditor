Workaround for browser bugs in Range.prototype.getClientRects and Range.prototype.getBoundingClientRect.

In particular:

* A Chrome bug which results in selections spanning multiple nodes returning rects for all the parents of the endContainer. See https://code.google.com/p/chromium/issues/detail?id=324437
* A bug in IE (<=10) which results in scaled rectangles when using the browser's zoom feature.

Usage
=====
Include the rangefix.js library in your project.

Replace instances of `Range.prototype.getClientRects`/`getBoundingClientRect` with `RangeFix.getClientRects`/`getBoundingClientRect`:

```javascript
range = document.getSelection().getRangeAt( 0 );

// Before
rects = range.getClientRects();
boundingRect = range.getBoundingClientRect();

// After
rects = RangeFix.getClientRects( range );
boundingRect = RangeFix.getBoundingClientRect( range );
```

Demo
====
https://rawgit.com/edg2s/rangefix/master/demo.html
