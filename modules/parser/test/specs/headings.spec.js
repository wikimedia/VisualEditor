var should  = require('should'),
	parsoid = require('../parsoid').Parsoid;

// Helpers
function dom(snippet) {
	return parsoid.html5.parse( '<html><body>' + snippet + '</body></html>');
}

function wikitext(dom) {
	var out = [];
	var content = parsoid.html5.tree.document.childNodes[0].childNodes[1];
    parsoid.serializer.serializeDOM(content, function(c) {
		out.push(c);
	});
	return out.join('');
}

// Specs
describe("Headings", function() {
	// Regular non-empty specs
	it("should be serialized properly when non-empty", function() {
		wikitext(dom("<h1>foo</h1>")).should.equal("=foo=");
		wikitext(dom("<h2>foo</h2>")).should.equal("==foo==");
		wikitext(dom("<h3>foo</h3>")).should.equal("===foo===");
		wikitext(dom("<h4>foo</h4>")).should.equal("====foo====");
		wikitext(dom("<h5>foo</h5>")).should.equal("=====foo=====");
		wikitext(dom("<h6>foo</h6>")).should.equal("======foo======");
	});

	// Empty heading specs
	it("should be serialized properly when empty", function() {
		wikitext(dom("<h1></h1>")).should.equal("=<nowiki></nowiki>=");
		wikitext(dom("<h2></h2>")).should.equal("==<nowiki></nowiki>==");
		wikitext(dom("<h3></h3>")).should.equal("===<nowiki></nowiki>===");
		wikitext(dom("<h4></h4>")).should.equal("====<nowiki></nowiki>====");
		wikitext(dom("<h5></h5>")).should.equal("=====<nowiki></nowiki>=====");
		wikitext(dom("<h6></h6>")).should.equal("======<nowiki></nowiki>======");
	});
});
