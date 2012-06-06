/* Static Members */

ve.example = {};

/* Methods */

ve.example.getSelectNodesCases = function( doc ) {
	var lookup = ve.example.lookupNode,
		documentNode = doc.getDocumentNode();
	return [
		{
			'actual': doc.selectNodes( new ve.Range( 0, 3 ), 'leaves' ),
			'expected': [
				// heading/text
				{
					'node': lookup( documentNode, 0, 0 ),
					'range': new ve.Range( 1, 3 ),
					'index': 0,
					'nodeRange': new ve.Range( 1, 4 ),
					'nodeOuterRange': new ve.Range( 1, 4 )
				}
			],
			'msg': 'partial leaf results have ranges with global offsets'
		},
		{
			'actual': doc.selectNodes( new ve.Range( 0, 10 ), 'leaves' ),
			'expected': [
				// heading/text
				{
					'node': lookup( documentNode, 0, 0 ),
					'index': 0,
					'nodeRange': new ve.Range( 1, 4 ),
					'nodeOuterRange': new ve.Range( 1, 4 )
				},
				// table/tableRow/tableCell/paragraph/text
				{
					'node': lookup( documentNode, 1, 0, 0, 0, 0 ),
					'index': 0,
					'nodeRange': new ve.Range( 9, 10 ),
					'nodeOuterRange': new ve.Range( 9, 10 )
				}
			],
			'msg': 'leaf nodes do not have ranges, leaf nodes from different levels'
		},
		{
			'actual': doc.selectNodes( new ve.Range( 28, 41 ), 'leaves' ),
			'expected': [
				// table/tableRow/tableCell/list/listItem/paragraph/text
				{
					'node': lookup( documentNode, 1, 0, 0, 2, 0, 0, 0 ),
					'index': 0,
					'nodeRange': new ve.Range( 28, 29 ),
					'nodeOuterRange': new ve.Range( 28, 29 )
				},
				// preformatted/text
				{
					'node': lookup( documentNode, 2, 0 ),
					'index': 0,
					'nodeRange': new ve.Range( 36, 37 ),
					'nodeOuterRange': new ve.Range( 36, 37 )
				},
				// preformatted/image
				{
					'node': lookup( documentNode, 2, 1 ),
					'index': 1,
					'nodeRange': new ve.Range( 38, 38 ),
					'nodeOuterRange': new ve.Range( 37, 39 )
				},
				// preformatted/text
				{
					'node': lookup( documentNode, 2, 2 ),
					'index': 2,
					'nodeRange': new ve.Range( 39, 40 ),
					'nodeOuterRange': new ve.Range( 39, 40 )
				}
			],
			'msg': 'leaf nodes that are not text nodes'
		},
		{
			'actual': doc.selectNodes( new ve.Range( 2, 15 ), 'siblings' ),
			'expected': [
				// heading
				{
					'node': lookup( documentNode, 0 ),
					'range': new ve.Range( 2, 4 ),
					'index': 0,
					'nodeRange': new ve.Range( 1, 4 ),
					'nodeOuterRange': new ve.Range( 0, 5 )
				},
				// table
				{
					'node': lookup( documentNode, 1 ),
					'range': new ve.Range( 6, 15 ),
					'index': 1,
					'nodeRange': new ve.Range( 6, 34 ),
					'nodeOuterRange': new ve.Range( 5, 35 )
				}
			],
			'msg': 'siblings at the document level'
		},
		{
			'actual': doc.selectNodes( new ve.Range( 2, 49 ), 'siblings' ),
			'expected': [
				// heading
				{
					'node': lookup( documentNode, 0 ),
					'range': new ve.Range( 2, 4 ),
					'index': 0,
					'nodeRange': new ve.Range( 1, 4 ),
					'nodeOuterRange': new ve.Range( 0, 5 )
				},
				// table
				{
					'node': lookup( documentNode, 1 ),
					'index': 1,
					'nodeRange': new ve.Range( 6, 34 ),
					'nodeOuterRange': new ve.Range( 5, 35 )
				},
				// preformatted
				{
					'node': lookup( documentNode, 2 ),
					'index': 2,
					'nodeRange': new ve.Range( 36, 40 ),
					'nodeOuterRange': new ve.Range( 35, 41 )
				},
				// definitionList
				{
					'node': lookup( documentNode, 3 ),
					'range': new ve.Range( 42, 49 ),
					'index': 3,
					'nodeRange': new ve.Range( 42, 52 ),
					'nodeOuterRange': new ve.Range( 41, 53 )
				}
			],
			'msg': 'more than 2 siblings at the document level'
		},
		{
			'actual': doc.selectNodes( new ve.Range( 1, 1 ), 'leaves' ),
			'expected': [
				// heading/text
				{
					'node': lookup( documentNode, 0, 0 ),
					'range': new ve.Range( 1, 1 ),
					'index': 0,
					'nodeRange': new ve.Range( 1, 4 ),
					'nodeOuterRange': new ve.Range( 1, 4 )
				}
			],
			'msg': 'zero-length range at the start of a text node returns text node rather than parent'
		},
		{
			'actual': doc.selectNodes( new ve.Range( 4, 4 ), 'leaves' ),
			'expected': [
				// heading/text
				{
					'node': lookup( documentNode, 0, 0 ),
					'range': new ve.Range( 4, 4 ),
					'index': 0,
					'nodeRange': new ve.Range( 1, 4 ),
					'nodeOuterRange': new ve.Range( 1, 4 )
				}
			],
			'msg': 'zero-length range at the end of a text node returns text node rather than parent'
		},
		{
			'actual': doc.selectNodes( new ve.Range( 2, 3 ), 'leaves' ),
			'expected': [
				// heading/text
				{
					'node': lookup( documentNode, 0, 0 ),
					'range': new ve.Range( 2, 3 ),
					'index': 0,
					'nodeRange': new ve.Range( 1, 4 ),
					'nodeOuterRange': new ve.Range( 1, 4 )
				}
			],
			'msg': 'range entirely within one leaf node'
		},
		{
			'actual': doc.selectNodes( new ve.Range( 5, 5 ), 'leaves' ),
			'expected': [
				// document
				{
					'node': documentNode,
					'range': new ve.Range( 5, 5 ),
					// no 'index' because documentNode has no parent
					'indexInNode': 1,
					'nodeRange': new ve.Range( 0, 59 ),
					'nodeOuterRange': new ve.Range( 0, 59 )
				}
			],
			'msg': 'zero-length range between two children of the document'
		},
		{
			'actual': doc.selectNodes( new ve.Range( 0, 0 ), 'leaves' ),
			'expected': [
				// document
				{
					'node': documentNode,
					'range': new ve.Range( 0, 0 ),
					// no 'index' because documentNode has no parent
					'indexInNode': 0,
					'nodeRange': new ve.Range( 0, 59 ),
					'nodeOuterRange': new ve.Range( 0, 59 )
				}
			],
			'msg': 'zero-length range at the start of the document'
		},
		{
			'actual': doc.selectNodes( new ve.Range( 30, 37 ), 'leaves' ),
			'expected': [
				// preformatted/text
				{
					'node': lookup( documentNode, 2, 0 ),
					// no 'range' because the text node is covered completely
					'index': 0,
					'nodeRange': new ve.Range( 36, 37 ),
					'nodeOuterRange': new ve.Range( 36, 37 )
				}
			],
			'msg': 'range with 5 closings and a text node'
		}
	];
};

/**
 * Builds a summary of a node tree.
 *
 * Generated summaries contain node types, lengths, outer lengths, attributes and summaries for
 * each child recusively. It's simple and fast to use deepEqual on this.
 *
 * @method
 * @param {ve.Node} node Node tree to summarize
 * @param {Boolean} [shallow] Do not summarize each child recursively
 * @returns {Object} Summary of node tree
 */
ve.example.getNodeTreeSummary = function( node, shallow ) {
	var summary = {
		'getType': node.getType(),
		'getLength': node.getLength(),
		'getOuterLength': node.getOuterLength(),
		'attributes': node.attributes
	};
	if ( node.children !== undefined ) {
		summary['children.length'] = node.children.length;
		if ( !shallow ) {
			summary.children = [];
			for ( var i = 0; i < node.children.length; i++ ) {
				summary.children.push( ve.example.getNodeTreeSummary( node.children[i] ) );
			}
		}
	}
	return summary;
};

/**
 * Builds a summary of a node selection.
 *
 * Generated summaries contain length of results as well as node summaries, ranges, indexes, indexes
 * within parent and node ranges for each result. It's simple and fast to use deepEqual on this.
 *
 * @method
 * @param {Object[]} selection Selection to summarize
 * @returns {Object} Summary of selection
 */
ve.example.getNodeSelectionSummary = function( selection ) {
	var summary = {
		'length': selection.length
	};
	if ( selection.length ) {
		summary.results = [];
		for ( var i = 0; i < selection.length; i++ ) {
			summary.results.push( {
				'node': ve.example.getNodeTreeSummary( selection[i].node, true ),
				'range': selection[i].range,
				'index': selection[i].index,
				'indexInNode': selection[i].indexInNode,
				'nodeRange': selection[i].nodeRange,
				'nodeOuterRange': selection[i].nodeOuterRange
			} );
		}
	}
	return summary;
};

/**
 * Builds a summary of an HTML element.
 *
 * Generated summaries contain...
 *
 * @method
 * @param {HTMLElement} element Element to summarize
 * @returns {Object} Summary of element
 */
ve.example.getHtmlElementSummary = function( element ) {
	var $element = $( element );
	return {
		'type': element.nodeName.toLowerCase(),
		'text': $element.text(),
		'html': $element.html()
	};
};

/**
 * Looks up a value in a node tree.
 *
 * @method
 * @param {ve.Node} root Root node to lookup from
 * @param {Integer} [...] Index path
 * @param {ve.Node} Node at given path
 */
ve.example.lookupNode = function( root ) {
	var node = root;
	for ( var i = 1; i < arguments.length; i++ ) {
		node = node.children[arguments[i]];
	}
	return node;
};
