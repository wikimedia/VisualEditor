# Contributing to VisualEditor

Thank you for helping us develop VisualEditor!

This document describes how to report bugs, set up your development
environment, run tests, and build documentation. It also provides the coding
conventions we use in the project.

## Bug reports

Please report bugs to [bugzilla.wikimedia.org](https://bugzilla.wikimedia.org/enter_bug.cgi?product=VisualEditor&component=General)
using the `VisualEditor` product.  Feel free to use the `General`
component if you don't know where else your bug might belong. Don't
worry about specifying version, severity, hardware, or OS.

## Running tests

VisualEditor's build scripts use the [Grunt](http://gruntjs.com/) task runner.
To install it make sure you have [node and npm](http://nodejs.org/download/)
installed, then run:

```sh
# Install Grunt command-line utility
$ npm install -g grunt-cli

# Install VisualEditor's dev dependencies
$ npm install
```

To run the tests, use:
```sh
$ grunt test
```

For other grunt tasks, see:
```sh
$ grunt --help
```

To run the tests in a web browser, open `modules/ve/test/index.html`.

## Building documentation

VisualEditor uses [JSDuck](https://github.com/senchalabs/jsduck) to process
documentation comments embedded in the code.  To build the documentation, you
will need `ruby`, `gem`, and `jsduck` installed.

### Installing ruby and gem

You're mostly on your own here, but we can give some hints for Mac OS X.

##### Installing Gem in Mac OS X
Ruby ships with OSX but may be outdated. Use [Homebrew](http://mxcl.github.com/homebrew/):
```sh
$ brew install ruby
```

If you've never used `gem` before, don't forget to add the gem's bin to your
`PATH` ([howto](http://stackoverflow.com/a/14138490/319266)).

### Installing jsduck

Once you have gem, installing [JSDuck](https://github.com/senchalabs/jsduck) is easy:
```sh
$ gem install --user-install jsduck
```

### Running jsduck

Creating the documentation is easy:
```sh
$ cd VisualEditor
$ bin/generateDocs.sh
```

The generated documentation is in the `docs/` subdirectory.  View the
documentation in a web browser by opening `docs/index.html`.

Note that `jsduck` doesn't support live previews when browsing using the
`file:` protocol; this only works when using HTTP/HTTPS.

## VisualEditor Code Guidelines

We inherit the code structure (about whitespace, naming and comments) conventions
from MediaWiki. See [Manual:Coding conventions/JavaScript](https://www.mediawiki.org/wiki/Manual:Coding_conventions/JavaScript)
on mediawiki.org.

Git commit messages should follow the conventions described in
<https://www.mediawiki.org/wiki/Gerrit/Commit_message_guidelines>.

### Documentation comments

* End sentences in a full stop.
* Continue sentences belonging to an annotation on the next line, indented with an
  additional space.
* Types in documentation comments should be separated by a pipe character. Use types
  that are listed in the Types section of this document, otherwise use the identifier
  (full path from the global scope) of the constructor function (e.g. `{ve.dm.BranchNode}`).

### Annotations

We use the following annotations. They should be used in the order as they are described
here, for consistency. See [JSDuck/Tags](https://github.com/senchalabs/jsduck/wiki/Tags) for more elaborate documentation.

* @class Name (optional, guessed)
* @abstract
* @extends ClassName
* @mixins ClassName
* @constructor
* @private
* @static
* @method name (optional, guessed)
* @template
* @property name (optional, guessed)
* @until Text: Optional text.
* @source Text
* @context {Type} Optional text.
* @inheritable
* @param {Type} name Optional text.
* @fires name
* @returns {Type} Optional text.
* @chainable
* @throws {Type}

### Types

Special values:
* undefined
* null
* this

Primitive types:
* boolean
* number
* string

Built-in classes:
* Array
* Date
* Function
* RegExp
* Object

Browser classes:
* HTMLElement

jQuery classes:
* jQuery
* jQuery.Event

## Add a new javascript class

When a new javascript class is added, the file must be referenced in a number of places
before it can be used.

Test files:
* modules/ve/test/index.html.template

Regular files:
* .docs/categories.json in General->Utilities (or somewhere more specific)
* modules.json in visualEditor.core (or somewhere more specific)
* Run `grunt build`
