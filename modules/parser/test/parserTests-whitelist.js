/* A map of test titles and their manually verified output. If the parser
 * output matches the expected output listed here, the test can be marked as
 * passing in parserTests.js. */

testWhiteList = {};

// Italic/link nesting is changed in this test, but the rendered result is the
// same. Currently the result is actually an improvement over the MediaWiki
// output.
testWhiteList["Bug 2702: Mismatched <i>, <b> and <a> tags are invalid"] = "<p><i><a href=\"http://example.com\">text</a></i><a href=\"http://example.com\"><b>text</b></a><i>Something <a href=\"http://example.com\">in italic</a></i><i>Something <a href=\"http://example.com\">mixed</a></i><a href=\"http://example.com\"><b>, even bold</b></a><i><b>Now <a href=\"http://example.com\">both</a></b></i></p>";

// The expected result for this test is really broken html.
testWhiteList["Link containing double-single-quotes '' in text embedded in italics (bug 4598 sanity check)"] = "<p><i>Some <a href=\"/wiki/Link\">pretty </a></i><a href=\"/wiki/Link\">italics<i> and stuff</i></a><i>!</i></p>";

testWhiteList["External link containing double-single-quotes in text embedded in italics (bug 4598 sanity check)"] = "<p><i>Some <a href=\"http://example.com/\">pretty </a></i><a href=\"http://example.com/\">italics<i> and stuff</i></a><i>!</i></p>";

// This is a rare edge case, and the new behavior is arguably more consistent
testWhiteList["5 quotes, code coverage +1 line"] = "<p><i><b></b></i></p>";

// The comment in the test already suggests this result as correct, but
// supplies the old result without preformatting.
testWhiteList["Bug 6200: Preformatted in <blockquote>"] = "<blockquote><pre>\nBlah</pre></blockquote>";

// empty table tags / with only a caption are legal in HTML5.
testWhiteList["A table with no data."] = "<table></table>";
testWhiteList["A table with nothing but a caption"] = "<table><caption> caption</caption></table>";
testWhiteList["Fuzz testing: Parser22"] = "<p><a href=\"http://===r:::https://b\">http://===r:::https://b</a></p><table></table>";

/** 
 * Small whitespace differences that we now start to care about for
 * round-tripping 
 */

// Very minor whitespace difference at end of cell (MediaWiki inserts a
// newline before the close tag even if there was no trailing space in the cell)
//testWhiteList["Table rowspan"] = "<table border=\"1\"><tbody><tr><td> Cell 1, row 1 </td><td rowspan=\"2\"> Cell 2, row 1 (and 2) </td><td> Cell 3, row 1 </td></tr><tr><td> Cell 1, row 2 </td><td> Cell 3, row 2 </td></tr></tbody></table>";

// Inter-element whitespace only
//testWhiteList["Indented table markup mixed with indented pre content (proposed in bug 6200)"] = "   \n\n<table><tbody><tr><td><pre>\nText that should be rendered preformatted\n</pre></td></tr></tbody></table>";


/* Misc sanitizer / HTML5 differences */

// Single quotes are legal in HTML5 URIs. See 
// http://www.whatwg.org/specs/web-apps/current-work/multipage/urls.html#url-manipulation-and-creation
testWhiteList["Link containing double-single-quotes '' (bug 4598)"] = "<p><a href=\"/wiki/Lista_d''e_paise_d''o_munno\">Lista d''e paise d''o munno</a></p>";


// Sanitizer
// testWhiteList["Invalid attributes in table cell (bug 1830)"] = "<table><tbody><tr><td Cell:=\"\">broken</td></tr></tbody></table>";
// testWhiteList["Table security: embedded pipes (http://lists.wikimedia.org/mailman/htdig/wikitech-l/2006-April/022293.html)"] = "<table><tbody><tr><td> |<a href=\"ftp://|x||\">[1]</a>\" onmouseover=\"alert(document.cookie)\"&gt;test</td></tr></tbody></table>";

// Sanitizer, but UTF8 in link is ok in HTML5
testWhiteList["External link containing double-single-quotes with no space separating the url from text in italics"] = "<p><a href=\"http://www.musee-picasso.fr/pages/page_id18528_u1l2.htm\" data-rt=\"{&quot;sourcePos&quot;:[0,146]}\"><i>La muerte de Casagemas</i> (1901) en el sitio de </a><a href=\"/wiki/Museo_Picasso_(París)\">Museo Picasso</a>.</p>";

testWhiteList["External links: wiki links within external link (Bug 3695)"] = "<p><a href=\"http://example.com\"></a><a href=\"/wiki/Wikilink\">wikilink</a> embedded in ext link</p>";


// This is valid, just confusing for humans. The reason for disallowing this
// might be history by now. XXX: Check this!
testWhiteList["Link containing % as a double hex sequence interpreted to hex sequence"] = "<p><a href=\"/wiki/7%2525_Solution\">7%25 Solution</a></p>";

if (typeof module == "object") {
	module.exports.testWhiteList = testWhiteList;
}
