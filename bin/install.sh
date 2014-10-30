#!/bin/bash

BASEDIR=$PWD/$(dirname $0)

pushd "$BASEDIR/../../tahi"
TAHI_PATH=$PWD
popd

pushd "$BASEDIR/../"
VE_DIR=$PWD
popd

cp ./dist/visualEditor.tahi.min.css.erb "$TAHI_PATH/app/assets/stylesheets/"
cp ./dist/visualEditor.min.js "$TAHI_PATH/public/"

echo "VE_DIR" $VE_DIR

for dir in "$VE_DIR/lib" "$VE_DIR/modules" "$VE_DIR/i18n"
do
  cp -R $dir "$TAHI_PATH/public/visual-editor"
done

echo "$TAHI_PATH/public/visual-editor/lib/oojs/i18n/en.json" "$TAHI_PATH/public/visual-editor/lib/oojs/i18n/en-us.json"
echo "$TAHI_PATH/public/visual-editor/lib/oojs-ui/i18n/en.json" "$TAHI_PATH/public/visual-editor/lib/oojs-ui/i18n/en-us.json"
