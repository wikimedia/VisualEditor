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
			'actual': doc.selectNodes( new ve.Range( 0, 11 ), 'leaves' ),
			'expected': [
				// heading/text
				{
					'node': lookup( documentNode, 0, 0 ),
					'index': 0,
					'nodeRange': new ve.Range( 1, 4 ),
					'nodeOuterRange': new ve.Range( 1, 4 )
				},
				// table/tableSection/tableRow/tableCell/paragraph/text
				{
					'node': lookup( documentNode, 1, 0, 0, 0, 0, 0 ),
					'index': 0,
					'nodeRange': new ve.Range( 10, 11 ),
					'nodeOuterRange': new ve.Range( 10, 11 )
				}
			],
			'msg': 'leaf nodes do not have ranges, leaf nodes from different levels'
		},
		{
			'actual': doc.selectNodes( new ve.Range( 29, 43 ), 'leaves' ),
			'expected': [
				// table/tableSection/tableRow/tableCell/list/listItem/paragraph/text
				{
					'node': lookup( documentNode, 1, 0, 0, 0, 2, 0, 0, 0 ),
					'index': 0,
					'nodeRange': new ve.Range( 29, 30 ),
					'nodeOuterRange': new ve.Range( 29, 30 )
				},
				// preformatted/text
				{
					'node': lookup( documentNode, 2, 0 ),
					'index': 0,
					'nodeRange': new ve.Range( 38, 39 ),
					'nodeOuterRange': new ve.Range( 38, 39 )
				},
				// preformatted/image
				{
					'node': lookup( documentNode, 2, 1 ),
					'index': 1,
					'nodeRange': new ve.Range( 40, 40 ),
					'nodeOuterRange': new ve.Range( 39, 41 )
				},
				// preformatted/text
				{
					'node': lookup( documentNode, 2, 2 ),
					'index': 2,
					'nodeRange': new ve.Range( 41, 42 ),
					'nodeOuterRange': new ve.Range( 41, 42 )
				}
			],
			'msg': 'leaf nodes that are not text nodes'
		},
		{
			'actual': doc.selectNodes( new ve.Range( 2, 16 ), 'siblings' ),
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
					'range': new ve.Range( 6, 16 ),
					'index': 1,
					'nodeRange': new ve.Range( 6, 36 ),
					'nodeOuterRange': new ve.Range( 5, 37 )
				}
			],
			'msg': 'siblings at the document level'
		},
		{
			'actual': doc.selectNodes( new ve.Range( 2, 51 ), 'siblings' ),
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
					'nodeRange': new ve.Range( 6, 36 ),
					'nodeOuterRange': new ve.Range( 5, 37 )
				},
				// preformatted
				{
					'node': lookup( documentNode, 2 ),
					'index': 2,
					'nodeRange': new ve.Range( 38, 42 ),
					'nodeOuterRange': new ve.Range( 37, 43 )
				},
				// definitionList
				{
					'node': lookup( documentNode, 3 ),
					'range': new ve.Range( 44, 51 ),
					'index': 3,
					'nodeRange': new ve.Range( 44, 54 ),
					'nodeOuterRange': new ve.Range( 43, 55 )
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
					'nodeRange': new ve.Range( 0, 61 ),
					'nodeOuterRange': new ve.Range( 0, 61 )
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
					'nodeRange': new ve.Range( 0, 61 ),
					'nodeOuterRange': new ve.Range( 0, 61 )
				}
			],
			'msg': 'zero-length range at the start of the document'
		},
		{
			'actual': doc.selectNodes( new ve.Range( 32, 39 ), 'leaves' ),
			'expected': [
				// preformatted/text
				{
					'node': lookup( documentNode, 2, 0 ),
					// no 'range' because the text node is covered completely
					'index': 0,
					'nodeRange': new ve.Range( 38, 39 ),
					'nodeOuterRange': new ve.Range( 38, 39 )
				}
			],
			'msg': 'range with 5 closings and a text node'
		},
		{
			'actual': doc.selectNodes( new ve.Range( 2, 57 ), 'covered' ),
			'expected': [
				// heading/text
				{
					'node': lookup( documentNode, 0, 0 ),
					'range': new ve.Range( 2, 4 ),
					'index': 0,
					'nodeRange': new ve.Range( 1, 4 ),
					'nodeOuterRange': new ve.Range( 1, 4 )
				},
				// table
				{
					'node': lookup( documentNode, 1 ),
					// no 'range' because the table is covered completely
					'index': 1,
					'nodeRange': new ve.Range( 6, 36 ),
					'nodeOuterRange': new ve.Range( 5, 37 )
				},
				// preformatted
				{
					'node': lookup( documentNode, 2 ),
					// no 'range' because the node is covered completely
					'index': 2,
					'nodeRange': new ve.Range( 38, 42 ),
					'nodeOuterRange': new ve.Range( 37, 43 )
				},
				// definitionList
				{
					'node': lookup( documentNode, 3 ),
					// no 'range' because the node is covered completely
					'index': 3,
					'nodeRange': new ve.Range( 44, 54 ),
					'nodeOuterRange': new ve.Range( 43, 55 )
				},
				// paragraph/text
				{
					'node': lookup( documentNode, 4, 0 ),
					// no 'range' because the text node is covered completely
					'index': 0,
					'nodeRange': new ve.Range( 56, 57 ),
					'nodeOuterRange': new ve.Range( 56, 57 )
				}
			],
			'msg': 'range from the first heading into the second-to-last paragraph, in covered mode'
		},
		{
			'actual': doc.selectNodes( new ve.Range( 14, 14 ), 'siblings' ),
			'expected': [
				// table/tableSection/tableRow/tableCell/list/listItem
				{
					'node': lookup( documentNode, 1, 0, 0, 0, 1, 0 ),
					'range': new ve.Range( 14, 14 ),
					'index': 0,
					'indexInNode': 0,
					'nodeRange': new ve.Range( 14, 24 ),
					'nodeOuterRange': new ve.Range( 13, 25 )
				}
				],
			'msg': 'zero-length range at the beginning of a listItem, in siblings mode'
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
	var i,
		summary = {
		'getType': node.getType(),
		'getLength': node.getLength(),
		'getOuterLength': node.getOuterLength(),
		'attributes': node.attributes
	};
	if ( node.children !== undefined ) {
		summary['children.length'] = node.children.length;
		if ( !shallow ) {
			summary.children = [];
			for ( i = 0; i < node.children.length; i++ ) {
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
	var i,
		summary = {
		'length': selection.length
	};
	if ( selection.length ) {
		summary.results = [];
		for ( i = 0; i < selection.length; i++ ) {
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
 * Summaries include node name, text, attributes and recursive summaries of children.
 *
 * @method
 * @param {HTMLElement} element Element to summarize
 * @returns {Object} Summary of element
 */
ve.example.getDomElementSummary = function( element ) {
	var $element = $( element ),
		summary = {
			'type': element.nodeName.toLowerCase(),
			'text': $element.text(),
			'attributes': {},
			'children': []
		},
		i;
	// Gather attributes
	for ( i = 0; i < element.attributes.length; i++ ) {
		summary.attributes[element.attributes[i].name] = element.attributes[i].value;
	}
	// Summarize children
	for ( i = 0; i < element.children.length; i++ ) {
		summary.children.push( ve.example.getDomElementSummary( element.children[i] ) );
	}
	return summary;
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
	var i,
		node = root;
	for ( i = 1; i < arguments.length; i++ ) {
		node = node.children[arguments[i]];
	}
	return node;
};

ve.example.createDomElement = function( type, attributes ) {
	var key,
		element = document.createElement( type );
	for ( key in attributes ) {
		element.setAttribute( key, attributes[key] );
	}
	return element;
};
