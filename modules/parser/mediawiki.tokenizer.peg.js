/**
 * Tokenizer for wikitext, using PEG.js and a separate PEG grammar file
 * (pegTokenizer.pegjs.txt)
 *
 * Use along with a HTML5TreeBuilder and the DOMPostProcessor(s) for HTML
 * output.
 */

var PEG = require('pegjs'),
	path = require('path'),
	fs = require('fs');

function PegTokenizer() {
	var pegSrcPath = path.join( __dirname, 'pegTokenizer.pegjs.txt' );
	this.src = fs.readFileSync( pegSrcPath, 'utf8' );
}

PegTokenizer.src = false;

PegTokenizer.prototype.tokenize = function( text ) {
	var out, err;
	if ( !this.parser ) {
		this.parser = PEG.buildParser(this.src);
	}

	// some normalization
	if ( text.substring(text.length - 1) !== "\n" ) {
		text += "\n";
	}

	try {
		out = this.parser.parse(text);
	} catch (e) {
		err = e;
		console.trace();
	} finally {

		// Append the end (for obvious reasons this should not
		// be part of a stream, only when tokenizing complete
		// texts)
		out.push({type: 'END'});

		return {tokens: out, err: err};
	}
}

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
			})
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
					callback()
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
