# Contributing to VisualEditor

Thank you for helping us develop VisualEditor!

This document describes how to report bugs, set up your development
environment, run tests, and build documentation. It also provides the coding
conventions we use in the project.

## Bug reports

Please report bugs to [phabricator.wikimedia.org](https://phabricator.wikimedia.org/maniphest/task/create/?projects=VisualEditor)
using the `VisualEditor` project.

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

Set `FIREFOX_BIN` – you may wish to add this to your `.bashrc` or equivalent:
```sh
export FIREFOX_BIN=`which firefox`
```

To run the tests, use:
```sh
$ grunt test
```

For other grunt tasks, see:
```sh
$ grunt --help
```

To run the tests in a web browser, open `tests/index.html`.

## Building documentation

VisualEditor uses [jsdoc](https://jsdoc.app/) to process documentation comments
embedded in the code.  To build the documentation, you will need to run `npm run doc`.

## VisualEditor Code Guidelines

We inherit the code structure (about whitespace, naming and comments) conventions
from MediaWiki. See [Manual:Coding conventions/JavaScript](https://www.mediawiki.org/wiki/Manual:Coding_conventions/JavaScript)
on mediawiki.org.

Git commit messages should follow the conventions described in
<https://www.mediawiki.org/wiki/Gerrit/Commit_message_guidelines>.

### Documentation comments

In addition to the [MediaWiki conventions for JavaScript documentation](https://www.mediawiki.org/wiki/Manual:Coding_conventions/JavaScript#Documentation):

We have the following custom tags:

* @until Text: Optional text.
* @source Text
* @context {Type} Optional text.
* @fires name

They should be used in the order as they are described here. Here's a slightly more complete list
indicating their order between the standard tags.

* @property
* @until Text: Optional text.
* @source Text
* @context {Type} Optional text.
* @inheritable
* @param
* @fires name
* @return

### Adding a new JavaScript class

When a new JavaScript class is added, the file must be referenced in the build manifest
before it can be used. Add the file to build/modules.json in visualEditor.core.build (or
somewhere more specific), and then run `grunt build`.
