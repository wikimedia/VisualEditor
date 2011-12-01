/* A map of test titles and their manually verified output. If the parser
 * output matches the expected output listed here, the test can be marked as
 * passing in parserTests.js. */

testWhiteList = {};

// The nesting of italic/bold tags is changed in this test, but the resulting
// formatting is identical
testWhiteList['Italics and bold'] = "<ul><li> plain</li><li> plain<i>italic</i>plain</li><li> plain<i>italic</i>plain<i>italic</i>plain</li><li> plain<b>bold</b>plain</li><li> plain<b>bold</b>plain<b>bold</b>plain</li><li> plain<i>italic</i>plain<b>bold</b>plain</li><li> plain<b>bold</b>plain<i>italic</i>plain</li><li> plain<i>italic<b>bold-italic</b>italic</i>plain</li><li> plain<b>bold<i>bold-italic</i>bold</b>plain</li><li> plain<i><b>bold-italic</b>italic</i>plain</li><li> plain<i><b>bold-italic</b></i><b>bold</b>plain</li><li> plain<i>italic<b>bold-italic</b></i>plain</li><li> plain<b>bold<i>bold-italic</i></b>plain</li><li> plain l'<i>italic</i>plain</li><li> plain l'<b>bold</b> plain</li></ul>";

// We don't care about existing or non-existing pages for now, so don't fail
// on missing redlink
testWhiteList["Definition list with wikilink containing colon"] = "<dl><dt> <a data-type=\"internal\" href=\"Help:FAQ\">Help:FAQ</a></dt><dd> The least-read page on Wikipedia</dd></dl>";

if (typeof module == "object") {
	module.exports.testWhiteList = testWhiteList;
}
