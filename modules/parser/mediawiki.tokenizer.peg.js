/**
 * Tokenizer for wikitext, using PEG.js and a separate PEG grammar file
 * (pegTokenizer.pegjs.txt)
 *
 * Use along with a HTML5TreeBuilder and the DOMPostProcessor(s) for HTML
 * output.
 */

var PEG = require('pegjs'),
	path = require('path'),
	fs = require('fs'),
	$ = require('jquery'),
	events = require('events');

function PegTokenizer() {
	var pegSrcPath = path.join( __dirname, 'pegTokenizer.pegjs.txt' );
	this.src = fs.readFileSync( pegSrcPath, 'utf8' );
}

// Inherit from EventEmitter
PegTokenizer.prototype = new events.EventEmitter();
PegTokenizer.prototype.constructor = PegTokenizer;

PegTokenizer.src = false;

PegTokenizer.prototype.tokenize = function( text ) {
	var out, err;
	if ( !this.parser ) {
		this.parser = PEG.buildParser(this.src);
		// add reference to this for event emission
		this.parser._tokenizer = this;
		// Print the generated parser source
		//console.log(this.parser.toSource());
	}

	// some normalization
	if ( text.substring(text.length - 1) !== "\n" ) {
		text += "\n";
	}

	// XXX: Commented out exception handling during development to get
	// reasonable traces. Calling a trace on the extension does not really cut
	// it.
	//try {
		out = this.parser.parse(text);
		// emit tokens here until we get that to work per toplevelblock in the
		// actual tokenizer
		this.emit('chunk', out);
		this.emit('end');
	//} catch (e) {
		//err = e;
		//console.trace();
	//} finally {
		return { err: err };
	//}
};

/*****************************************************************************
 * LEGACY stuff
 *
 * This is kept around as a template for the ongoing template expansion work!
 * It won't work with the token infrastructure.
 */


/**
 * @param {object} tree
 * @param {function(tree, error)} callback
 */
PegTokenizer.prototype.expandTree = function(tree, callback) {
	var self = this;
	var subParseArray = function(listOfTrees) {
		var content = [];
		$.each(listOfTrees, function(i, subtree) {
			self.expandTree(subtree, function(substr, err) {
				content.push(tree);
			});
		});
		return content;
	};
	var src;
	if (typeof tree === "string") {
		callback(tree);
		return;
	}
	if (tree.type == 'template') {
		// expand a template node!
		
		// Resolve a possibly relative link
		var templateName = this.env.resolveTitle( tree.target, 'Template' );
		this.env.fetchTemplate( tree.target, tree.params || {}, function( templateSrc, error ) {
			// @fixme should pre-parse/cache these too?
			self.parseToTree( templateSrc, function( templateTree, error ) {
				if ( error ) {
					callback({
						type: 'placeholder',
						orig: tree,
						content: [
							{
								// @fixme broken link?
								type: 'link',
								target: templateName
							}
						]
					});
				} else {
					callback({
						type: 'placeholder',
						orig: tree,
						content: self.env.expandTemplateArgs( templateTree, tree.params )
					});
				}
			});
		} );
		// Wait for async...
		return;
	}
	var out = $.extend( tree ); // @fixme prefer a deep copy?
	if (tree.content) {
		out.content = subParseArray(tree.content);
	}
	callback(out);
};

PegTokenizer.prototype.initSource = function(callback) {
	if (PegTokenizer.src) {
		callback();
	} else {
		if ( typeof parserPlaygroundPegPage !== 'undefined' ) {
			$.ajax({
				url: wgScriptPath + '/api' + wgScriptExtension,
				data: {
					format: 'json',
					action: 'query',
					prop: 'revisions',
					rvprop: 'content',
					titles: parserPlaygroundPegPage
				},
				success: function(data, xhr) {
					$.each(data.query.pages, function(i, page) {
						if (page.revisions && page.revisions.length) {
							PegTokenizer.src = page.revisions[0]['*'];
						}
					});
					callback();
				},
				dataType: 'json',
				cache: false
			}, 'json');
		} else {
			$.ajax({
				url: mw.config.get('wgParserPlaygroundAssetsPath', mw.config.get('wgExtensionAssetsPath')) + '/ParserPlayground/modules/pegParser.pegjs.txt',
				success: function(data) {
					PegTokenizer.src = data;
					callback();
				},
				dataType: 'text',
				cache: false
			});
		}
	}
};

if (typeof module == "object") {
	module.exports.PegTokenizer = PegTokenizer;
}
