/* A map of test titles and their manually verified output. If the parser
 * output matches the expected output listed here, the test can be marked as
 * passing in parserTests.js. */

testWhiteList = {};

// The nesting of italic/bold tags is changed in this test, but the resulting
// formatting is identical
testWhiteList["Italics and bold"] = "<ul><li> plain</li><li> plain<i>italic</i>plain</li><li> plain<i>italic</i>plain<i>italic</i>plain</li><li> plain<b>bold</b>plain</li><li> plain<b>bold</b>plain<b>bold</b>plain</li><li> plain<i>italic</i>plain<b>bold</b>plain</li><li> plain<b>bold</b>plain<i>italic</i>plain</li><li> plain<i>italic<b>bold-italic</b>italic</i>plain</li><li> plain<b>bold<i>bold-italic</i>bold</b>plain</li><li> plain<i><b>bold-italic</b>italic</i>plain</li><li> plain<i><b>bold-italic</b></i><b>bold</b>plain</li><li> plain<i>italic<b>bold-italic</b></i>plain</li><li> plain<b>bold<i>bold-italic</i></b>plain</li><li> plain l'<i>italic</i>plain</li><li> plain l'<b>bold</b> plain</li></ul>";

testWhiteList["Bug 2702: Mismatched <i>, <b> and <a> tags are invalid"] = "<p><i><a href=\"http://example.com\">text</a></i><a href=\"http://example.com\" data-sourcePos=\"30:61\"><b>text</b></a><i data-sourcePos=\"62:106\">Something <a href=\"http://example.com\">in italic</a></i><i data-sourcePos=\"107:164\">Something <a href=\"http://example.com\">mixed</a></i><a href=\"http://example.com\"><b>, even bold</b></a><i data-sourcePos=\"165:204\"><b data-sourcePos=\"165:204\">Now <a href=\"http://example.com\">both</a></b></i></p>";

testWhiteList["Unclosed and unmatched quotes"] = "<p><i><b>Bold italic text </b>with bold deactivated<b> in between.</b></i></p><p><i><b>Bold italic text </b></i><b>with italic deactivated<i> in between.</i></b></p><p><b></b>Bold text..</p><p>..spanning two paragraphs (should not work).<b></b></p><p><b></b>Bold tag left open</p><p><i></i>Italic tag left open</p><p>Normal text.<!-- Unmatching number of opening, closing tags: -->\n</p><p><b>This year'</b>s election <i>should</i> beat <b>last year'</b>s.</p><p><i>Tom<b>s car is bigger than </b></i><b>Susan</b>s.</p>";

testWhiteList["Link containing double-single-quotes '' in text embedded in italics (bug 4598 sanity check)"] = "<p><i>Some <a data-type=\"internal\" href=\"Link\">pretty </a></i><a data-type=\"internal\" href=\"Link\">italics<i></i> and stuff</a>!</p>";

testWhiteList["External link containing double-single-quotes in text embedded in italics (bug 4598 sanity check)"] = "<p><i>Some <a href=\"http://example.com/\">pretty </a></i><a href=\"http://example.com/\">italics<i> and stuff</i></a><i>!</i></p>";

// This is a rare edge case, and the new behavior is arguably more consistent
testWhiteList["5 quotes, code coverage +1 line"] = "<p><i>'</i></p>";


// empty table tags / with only a caption are legal in HTML5.
testWhiteList["A table with no data."] = "<table></table>";
testWhiteList["A table with nothing but a caption"] = "<table><caption> caption</caption></table>";

// MediaWiki changes the order of attributes in tables, ignore that
testWhiteList["Multiplication table"] = "<table border=\"1\" cellpadding=\"2\"><caption>Multiplication table</caption><tbody><tr><th> × </th><th> 1 </th><th> 2 </th><th> 3</th></tr><tr><th> 1</th><td> 1 </td><td> 2 </td><td> 3</td></tr><tr><th> 2</th><td> 2 </td><td> 4 </td><td> 6</td></tr><tr><th> 3</th><td> 3 </td><td> 6 </td><td> 9</td></tr><tr><th> 4</th><td> 4 </td><td> 8 </td><td> 12</td></tr><tr><th> 5</th><td> 5 </td><td> 10 </td><td> 15</td></tr></tbody></table>";

testWhiteList["Nested table"] = "<table border=\"1\"><tbody><tr><td> α</td><td><table bgcolor=\"#ABCDEF\" border=\"2\"><tbody><tr><td>nested</td></tr><tr><td>table</td></tr></tbody></table></td><td>the original table again</td></tr></tbody></table>";



/* Missing token transform functionality */

// We don't implement percent encoding for URIs yet.
testWhiteList["Link containing double-single-quotes '' (bug 4598)"] = "<p><a data-type=\"internal\" href=\"Lista d''e paise d''o munno\">Lista d''e paise d''o munno</a></p>";

testWhiteList["Link containing \"<#\" and \">#\" as a hex sequences"] = "<p><a data-type=\"internal\" href=\"&lt;%23\">&lt;%23</a><a data-type=\"internal\" href=\"&gt;%23\">&gt;%23</a></p>";


// Sanitizer
testWhiteList["Invalid attributes in table cell (bug 1830)"] = "<table><tbody><tr><td Cell:=\"\">broken</td></tr></tbody></table>";
testWhiteList["Table security: embedded pipes (http://lists.wikimedia.org/mailman/htdig/wikitech-l/2006-April/022293.html)"] = "<table><tbody><tr><td> |<a href=\"ftp://|x||\">[1]</a>\" onmouseover=\"alert(document.cookie)\"&gt;test</td></tr></tbody></table>";

// Sanitizer, but UTF8 in link might actually be ok in HTML5
testWhiteList["External link containing double-single-quotes with no space separating the url from text in italics"] = "<p><a href=\"http://www.musee-picasso.fr/pages/page_id18528_u1l2.htm\"><i>La muerte de Casagemas</i> (1901) en el sitio de </a><a data-type=\"internal\" href=\"Museo Picasso (París)\">Museo Picasso</a></p>";


if (typeof module == "object") {
	module.exports.testWhiteList = testWhiteList;
}
