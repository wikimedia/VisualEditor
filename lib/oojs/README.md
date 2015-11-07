[![npm](https://img.shields.io/npm/v/oojs.svg?style=flat)](https://www.npmjs.com/package/oojs) [![David](https://img.shields.io/david/dev/wikimedia/oojs.svg?style=flat)](https://david-dm.org/wikimedia/oojs#info=devDependencies)

OOjs
=================

OOjs is a JavaScript library for working with objects.

Key features include inheritance, mixins and utilities for working with objects.

<pre lang="javascript">
/* Example */
( function ( oo ) {
    function Animal() {}
    function Magic() {}
    function Unicorn() {
        Animal.call( this );
        Magic.call( this );
    }
    oo.inheritClass( Unicorn, Animal );
    oo.mixinClass( Unicorn, Magic );
}( OO ) );
</pre>

Quick start
----------

This library is available as an [npm](https://npmjs.org/) package! Install it right away:
<pre lang="bash">
npm install oojs
</pre>

Or clone the repo, `git clone https://git.wikimedia.org/git/oojs/core.git`.

ECMAScript 5
----------

OOjs is optimised for modern ECMAScript 5 environments. However, care has been taken to maintain
parser compatibility with ES3 engines (such as for IE 6-8).

No ES5 syntax or unpolyfillable features are used. To support ES3 engines, ensure an appropriate
polyfill is loaded before OOjs.

These are the methods used:

* Array.isArray
* Object.keys
* JSON.stringify

Additionally, Object.create is used if available. As it is impossible to fully polyfill, OOjs
includes a fallback implementing the minimal set of required features.

While there are no plans to ship a polyfill for remaining methods, we recommend the following and
use them ourselves in the unit tests to assert support for older browsers.

* [json2.js](https://github.com/douglascrockford/JSON-js) (only for IE6/IE7)
* [es5-shim.js](https://github.com/es-shims/es5-shim)

jQuery
----------

If your project uses jQuery, use the optimised `oojs.jquery.js` build instead.

This build assumes jQuery is present and omits various chunks of code in favour of references to jQuery.

jQuery 1.8.3 or higher is recommended.

Versioning
----------

We use the Semantic Versioning guidelines as much as possible.

Releases will be numbered in the following format:

`<major>.<minor>.<patch>`

For more information on SemVer, please visit http://semver.org/.

Bug tracker
-----------

Found a bug? Please report it in the [issue tracker](https://phabricator.wikimedia.org/maniphest/task/create/?projects=OOjs)!

Release
----------

Release process:
<pre lang="bash">
$ cd path/to/oojs/
$ git remote update
$ git checkout -B release -t origin/master

# Ensure tests pass
$ npm install && npm test

# Avoid using "npm version patch" because that creates
# both a commit and a tag, and we shouldn't tag until after
# the commit is merged.

# Update release notes
# Copy the resulting list into a new section on History.md
$ git log --format='* %s (%aN)' --no-merges --reverse v$(node -e 'console.log(require("./package.json").version);')...HEAD
$ edit History.md

# Update the version number
$ edit package.json

$ git add -p
$ git commit -m "Tag vX.X.X"
$ git review

# After merging:
$ git remote update
$ git checkout origin/master
$ git tag "vX.X.X"
$ git push --tags
$ npm publish
</pre>
