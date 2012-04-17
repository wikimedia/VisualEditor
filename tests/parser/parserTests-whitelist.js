/* A map of test titles and their manually verified output. If the parser
 * output matches the expected output listed here, the test can be marked as
 * passing in parserTests.js. */

testWhiteList = {};

// The nesting of italic/bold tags is changed in this test, but the resulting
// formatting is identical
testWhiteList["Italics and bold"] = "<ul><li> plain</li><li> plain<i>italic</i>plain</li><li> plain<i>italic</i>plain<i>italic</i>plain</li><li> plain<b>bold</b>plain</li><li> plain<b>bold</b>plain<b>bold</b>plain</li><li> plain<i>italic</i>plain<b>bold</b>plain</li><li> plain<b>bold</b>plain<i>italic</i>plain</li><li> plain<i>italic<b>bold-italic</b>italic</i>plain</li><li> plain<b>bold<i>bold-italic</i>bold</b>plain</li><li> plain<i><b>bold-italic</b>italic</i>plain</li><li> plain<i><b>bold-italic</b></i><b>bold</b>plain</li><li> plain<i>italic<b>bold-italic</b></i>plain</li><li> plain<b>bold<i>bold-italic</i></b>plain</li><li> plain l'<i>italic</i>plain</li><li> plain l'<b>bold</b> plain</li></ul>";

testWhiteList["Bug 2702: Mismatched <i>, <b> and <a> tags are invalid"] = "<p><i><a href=\"http://example.com\">text</a></i><a href=\"http://example.com\"><b>text</b></a><i>Something <a href=\"http://example.com\">in italic</a></i><i>Something <a href=\"http://example.com\">mixed</a></i><a href=\"http://example.com\"><b>, even bold</b></a><i><b>Now <a href=\"http://example.com\">both</a></b></i></p>";

testWhiteList["Unclosed and unmatched quotes"] = "<p><i><b>Bold italic text </b>with bold deactivated<b> in between.</b></i></p><p><i><b>Bold italic text </b></i><b>with italic deactivated<i> in between.</i></b></p><p><b>Bold text..</b></p><p>..spanning two paragraphs (should not work).<b></b></p><p><b>Bold tag left open</b></p><p><i>Italic tag left open</i></p><p>Normal text.<!-- Unmatching number of opening, closing tags: -->\n</p><p><b>This year'</b>s election <i>should</i> beat <b>last year'</b>s.</p><p><i>Tom<b>s car is bigger than </b></i><b>Susan</b>s.</p>";

// The expected result for this test is really broken html.
testWhiteList["Link containing double-single-quotes '' in text embedded in italics (bug 4598 sanity check)"] = "<p><i>Some <a href=\"/wiki/Link\">pretty </a></i><a href=\"/wiki/Link\">italics<i> and stuff</i></a><i>!</i></p>";

testWhiteList["External link containing double-single-quotes in text embedded in italics (bug 4598 sanity check)"] = "<p><i>Some <a href=\"http://example.com/\">pretty </a></i><a href=\"http://example.com/\">italics<i> and stuff</i></a><i>!</i></p>";

// This is a rare edge case, and the new behavior is arguably more consistent
testWhiteList["5 quotes, code coverage +1 line"] = "<p>'<i></i></p>";

// The comment in the test already suggests this result as correct, but
// supplies the old result without preformatting.
testWhiteList["Bug 6200: Preformatted in <blockquote>"] = "<blockquote><pre>\nBlah</pre></blockquote>";


// empty table tags / with only a caption are legal in HTML5.
testWhiteList["A table with no data."] = "<table></table>";
testWhiteList["A table with nothing but a caption"] = "<table><caption> caption</caption></table>";
testWhiteList["Fuzz testing: Parser22"] = "<p><a href=\"http://===r:::https://b\">http://===r:::https://b</a></p><table></table>";

// Very minor whitespace difference at end of cell (MediaWiki inserts a
// newline before the close tag even if there was no trailing space in the cell)
testWhiteList["Table rowspan"] = "<table border=\"1\"><tbody><tr><td> Cell 1, row 1 </td><td rowspan=\"2\"> Cell 2, row 1 (and 2) </td><td> Cell 3, row 1 </td></tr><tr><td> Cell 1, row 2 </td><td> Cell 3, row 2 </td></tr></tbody></table>";

// Inter-element whitespace only
testWhiteList["Indented table markup mixed with indented pre content (proposed in bug 6200)"] = "   \n\n<table><tbody><tr><td><pre>\nText that should be rendered preformatted\n</pre></td></tr></tbody></table>";



/* Missing token transform functionality */

// Single quotes are legal in HTML5 URIs. See 
// http://www.whatwg.org/specs/web-apps/current-work/multipage/urls.html#url-manipulation-and-creation
testWhiteList["Link containing double-single-quotes '' (bug 4598)"] = "<p><a href=\"/wiki/Lista_d''e_paise_d''o_munno\">Lista d''e paise d''o munno</a></p>";


// Sanitizer
testWhiteList["Invalid attributes in table cell (bug 1830)"] = "<table><tbody><tr><td Cell:=\"\">broken</td></tr></tbody></table>";
testWhiteList["Table security: embedded pipes (http://lists.wikimedia.org/mailman/htdig/wikitech-l/2006-April/022293.html)"] = "<table><tbody><tr><td> |<a href=\"ftp://|x||\">[1]</a>\" onmouseover=\"alert(document.cookie)\"&gt;test</td></tr></tbody></table>";

// Sanitizer, but UTF8 in link is ok in HTML5
testWhiteList["External link containing double-single-quotes with no space separating the url from text in italics"] = "<p><a href=\"http://www.musee-picasso.fr/pages/page_id18528_u1l2.htm\" data-mw=\"{&quot;sourcePos&quot;:[0,146]}\"><i>La muerte de Casagemas</i> (1901) en el sitio de </a><a href=\"/wiki/Museo_Picasso_(París)\">Museo Picasso</a>.</p>";

testWhiteList["External links: wiki links within external link (Bug 3695)"] = "<p><a href=\"http://example.com\"></a><a href=\"/wiki/Wikilink\">wikilink</a> embedded in ext link</p>";


// This is valid, just confusing for humans. The reason for disallowing this
// might be history by now. XXX: Check this!
testWhiteList["Link containing % as a double hex sequence interpreted to hex sequence"] = "<p><a href=\"/wiki/7%2525_Solution\">7%25 Solution</a></p>";

if (typeof module == "object") {
	module.exports.testWhiteList = testWhiteList;
}
