/*!
 * VisualEditor ContentEditable ime tests.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see http://ve.mit-license.org
 */

//QUnit.module( 've.ce' );

/* Stubs */

ve.ce.imetests = [];

ve.ce.imetestsFailAt = {
	'backspace-firefox-ubuntu-none': 17,
	'input-ie-win-chinese-traditional-handwriting': 4,
	'input-ie-win-korean': 4
};

ve.ce.imetestsPhantomFailAt = {
	'input-chromium-ubuntu-ibus-chinese-cantonese': 27,
	'input-chromium-ubuntu-ibus-korean-korean': 35,
	'input-firefox-ubuntu-ibus-chinese-cantonese': 22,
	'input-firefox-ubuntu-ibus-japanese-anthy--hiraganaonly': 8,
	'input-firefox-ubuntu-ibus-korean-korean': 7,
	'input-firefox-ubuntu-ibus-malayalam-swanalekha': 8,
	'backspace-chromium-ubuntu-none': 3,
	'backspace-firefox-ubuntu-none': 17,
	'input-ie-win-chinese-traditional-handwriting': 4,
	'input-ie-win-korean': 4,
	'leftarrow-chromium-ubuntu-none': 3
};
