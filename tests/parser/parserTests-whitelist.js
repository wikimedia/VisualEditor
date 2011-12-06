/* A map of test titles and their manually verified output. If the parser
 * output matches the expected output listed here, the test can be marked as
 * passing in parserTests.js. */

testWhiteList = {};

// The nesting of italic/bold tags is changed in this test, but the resulting
// formatting is identical
testWhiteList['Italics and bold'] = "<ul><li> plain</li><li> plain<i>italic</i>plain</li><li> plain<i>italic</i>plain<i>italic</i>plain</li><li> plain<b>bold</b>plain</li><li> plain<b>bold</b>plain<b>bold</b>plain</li><li> plain<i>italic</i>plain<b>bold</b>plain</li><li> plain<b>bold</b>plain<i>italic</i>plain</li><li> plain<i>italic<b>bold-italic</b>italic</i>plain</li><li> plain<b>bold<i>bold-italic</i>bold</b>plain</li><li> plain<i><b>bold-italic</b>italic</i>plain</li><li> plain<i><b>bold-italic</b></i><b>bold</b>plain</li><li> plain<i>italic<b>bold-italic</b></i>plain</li><li> plain<b>bold<i>bold-italic</i></b>plain</li><li> plain l'<i>italic</i>plain</li><li> plain l'<b>bold</b> plain</li></ul>";

testWhiteList["Bug 2702: Mismatched <i>, <b> and <a> tags are invalid"] = "<p><i><a href=\"http://example.com\">text</a></i><a href=\"http://example.com\"><b>text</b></a><b></b><i>Something <a href=\"http://example.com\">in italic</a></i><i>Something <a href=\"http://example.com\">mixed</a></i><a href=\"http://example.com\"><b>, even bold</b></a><b></b><i><b>Now <a href=\"http://example.com\">both</a></b></i></p>";

testWhiteList["Unclosed and unmatched quotes"] = "<p><i><b>Bold italic text </b>with bold deactivated<b> in between.</b></i></p><p><i><b>Bold italic text </b></i><b>with italic deactivated<i> in between.</i></b></p><p><b>Bold text..</b></p><p>..spanning two paragraphs (should not work).<b></b></p><p><b>Bold tag left open</b></p><p><i>Italic tag left open</i></p><p>Normal text.<!-- Unmatching number of opening, closing tags: -->\n</p><p><b>This year'</b>s election <i>should</i> beat <b>last year'</b>s.</p><p><i>Tom<b>s car is bigger than </b></i><b>Susan</b>s.</p>";

// empty table tags / with only a caption are legal in HTML5.
testWhiteList["A table with no data."] = "<table></table>";
testWhiteList["A table with nothing but a caption"] = "<table><caption> caption</caption></table>";

if (typeof module == "object") {
	module.exports.testWhiteList = testWhiteList;
}
