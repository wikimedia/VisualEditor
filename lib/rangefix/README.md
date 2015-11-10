Workaround for browser bugs in Range.getClientRects and Range.getBoundingClientRect.

In particular a Chrome bug which results in selections spanning multiple nodes returning rects for the all the parents of the endContainer.

See https://code.google.com/p/chromium/issues/detail?id=324437

Demo
====
https://rawgit.com/edg2s/rangefix/master/demo.html
