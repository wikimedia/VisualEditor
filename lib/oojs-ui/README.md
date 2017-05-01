[![npm](https://img.shields.io/npm/v/oojs-ui.svg?style=flat)](https://www.npmjs.com/package/oojs-ui) [![Packagist](https://img.shields.io/packagist/v/oojs/oojs-ui.svg?style=flat)](https://packagist.org/packages/oojs/oojs-ui) [![David](https://img.shields.io/david/dev/wikimedia/oojs-ui.svg?style=flat)](https://david-dm.org/wikimedia/oojs-ui#info=devDependencies)

OOjs UI
=================

OOjs UI is a modern JavaScript UI toolkit for browsers. It provides a library of common widgets, layouts and windows that are ready to use, as well as many foundational classes for constructing custom user interfaces. The library was originally created for use by [VisualEditor](https://www.mediawiki.org/wiki/VisualEditor), which uses it for its entire user interface, and is now completely independent, and more useful and convenient for other use cases.

Quick start
----------

This library is available as an [npm](https://npmjs.org/) package! Install it right away:
<pre lang="bash">
npm install oojs-ui
</pre>

If you don't want to use npm, you can:

1. Clone the repo and move into it, `$ git clone https://phabricator.wikimedia.org/diffusion/GOJU/oojs-ui.git oojs-ui && cd oojs-ui`.

2. Install Grunt command-line utility:<br/>`$ npm install -g grunt-cli`

3. Install [composer](https://getcomposer.org/download/) and make sure running `composer` will execute it (*e.g.* add it to `$PATH` in POSIX environments).

4. Install dev dependencies:<br/>`$ npm install`

5. Build the library (you can alternatively use `grunt quick-build` if you don't need to rebuild the PNGs):<br/>`$ grunt build`

6. You can now copy the distribution files from the dist directory into your project.

7. You can see a suite of demos in `/demos` by executing:<br/>`$ npm run-script demos`


Loading the library
-------------------

While the distribution directory is chock-full of files, you will normally only need to load three:

* `oojs-ui.js`, containing the full library
* One of `oojs-ui-apex.css` or `oojs-ui-mediawiki.css`, containing theme-specific styles
* One of `oojs-ui-apex.js` or `oojs-ui-mediawiki.js`, containing theme-specific code

You can load additional icon packs from files named `oojs-ui-apex-icons-*.css` or `oojs-ui-mediawiki-icons-*.css`.

The remaining files make it possible to load only parts of the whole library.

Furthermore, every CSS file has a right-to-left (RTL) version available, to be used on pages using right-to-left languages if your environment doesn't automatically flip them as needed.


Versioning
----------

We use the Semantic Versioning guidelines as much as possible.

Releases will be numbered in the following format:

`<major>.<minor>.<patch>`

For more information on SemVer, please visit http://semver.org/.


Issue tracker
-------------

Found a bug or missing feature? Please report it in the [issue tracker](https://phabricator.wikimedia.org/maniphest/task/edit/form/1/?projects=PHID-PROJ-dgmoevjqeqlerleqzzx5)!


Contributing
------------

We are always delighted when people contribute patches. We recommend a few things to make it quicker and easier for you to contribute:

* You will need a [wikitech account](https://wikitech.wikimedia.org/w/index.php?title=Special:UserLogin&returnto=Help%3AGetting+Started&type=signup) which you can use to login to [gerrit](https://gerrit.wikimedia.org/), our code review system.
* You will need a [Wikimedia account](https://www.mediawiki.org/w/index.php?title=Special:UserLogin&type=signup), which you can [use to login to Phabricator](https://www.mediawiki.org/w/index.php?title=Special:UserLogin&returnto=Special%3AOAuth%2Fauthorize&returntoquery=oauth_token%3D2fa60627878b83173e0196040b983326%26oauth_consumer_key%3D038ec949b263dc807b0079fd88538f37).
* You should [create a Phabricator ticket](https://phabricator.wikimedia.org/maniphest/task/edit/form/1/?projects=PHID-PROJ-dgmoevjqeqlerleqzzx5) describing the issue you wish to change.
* We automatically lint and style-check changes to JavaScript, PHP, CSS, Ruby and JSON files. You can test these yourself with `npm test` and `composer test` locally before pushing changes. SVG files should be squashed in advance of committing with [SVGO](https://github.com/svg/svgo) using `svgo --pretty --disable=removeXMLProcInst --disable=cleanupIDs <filename>`.
* To submit your patch, follow [the "getting started" quick-guide](https://www.mediawiki.org/wiki/Gerrit/Getting_started). You should expect to get code review within a day or two.
* A new version of the library is cut and released most weeks on Tuesdays.


Release
----------

Release process:
<pre lang="bash">
$ cd path/to/oojs-ui/
$ git remote update
$ git checkout -B release -t origin/master

# Ensure tests pass
$ npm install && composer update && npm test && composer test

# Avoid using "npm version patch" because that creates
# both a commit and a tag, and we shouldn't tag until after
# the commit is merged.

# Update release notes
# Copy the resulting list into a new section at the top of History.md and edit
# into five sub-sections, in order:
# * Breaking changes
# * Deprecations
# * Features
# * Styles
# * Code
$ git log --format='* %s (%aN)' --no-merges --reverse v$(node -e 'console.log(require("./package.json").version);')...HEAD | grep -v "Localisation updates from" | sort
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
$ npm run publish-build && git push --tags && npm publish
</pre>
