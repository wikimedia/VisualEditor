# VisualEditor for Tahi

## Update to lastest master version of VisualEditor

```
$ git remote add upstream git@github.com:wikimedia/VisualEditor.git
$ git fetch upstream
$ git merge upstream/master
```

## Get latest hawtness to Tahi Project
To get started you will need Node. Then:

```
$ npm install
```

— AND THEN:

Open `./build/modules.json` and delete the `scripts` property from the jquery hash. We don't want to build jquery in with VisualEditor!

```
"jquery": {
  "scripts": [
    "lib/jquery/jquery.js"
    ]
  }
```

— AND THEN:


```
$ grunt tahi
```

— AND THEN:

Undo your changes to `./build/modules.json`

The good stuff will be in the `dist` directory.

— AND THEN:

Copy:

* `./dist/visualEditor.tahi.min.css.erb` to `[tahi-directory]/app/assets/stylesheets/`

* `./dist/visualEditor.min.js` to `[tahi-directory]/public/`

* ~~contents of `./dist/images/` to `[tahi-directory]/app/assets/images/visual-editor/`~~

* remove `[tahi-directory]/public/visual-editor/lib` and `[tahi-directory]/public/visual-editor/modules`

* copy `./lib`, `./modules` and `./i18n` to `[tahi-directory]/public/visual-editor/`

* copy `[tahi-directory]/public/visual-editor/lib/oojs-ui/i18n/en.json` to `[tahi-directory]/public/visual-editor/lib/oojs-ui/i18n/en-us.json`

* ~~copy `[tahi-directory]/public/visual-editor/modules/ve/i18n/en.json` to `[tahi-directory]/public/visual-editor/modules/ve/i18n/en-us.json`~~

NOTE: the capitalization of the `en-us.json` files is **very important**!