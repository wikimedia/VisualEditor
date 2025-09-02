/**
 * TinyVE converter — convert between html DOM and linear model representations
 *
 * This is a toy version of ve.dm.Converter which illustrates the main concepts
 */

tinyve.dm.converter = {};

/**
 * Test whether a DOM node should be represented as a text annotation in the linear model
 *
 * In full VE, this is done with a model registry so extensions can add types
 *
 * @see {ve.dm.ModelRegistry#isAnnotation}
 * @param {Node} node A dom node, like `p` or `b` or `img`
 * @return {boolean} Whether the node should be represented as a text annotation in the linear model
 */
tinyve.dm.converter.isNodeAnnotation = function isNodeAnnotation( node ) {
	return node.tagName && [ 'b', 'i', 'a' ].includes( node.tagName.toLowerCase() );
};

/**
 * Test whether a DOM node's contents should be linearized when creating the linear model
 *
 * In full VE, this is done with a node factory so extensions can add types
 *
 * @see {ve.dm.NodeFactory#canNodeContainContent}
 * @param {Node} node A DOM node, like p or div
 * @return {boolean} Whether the node's contents should be linearized when creating the linear model
 */
tinyve.dm.converter.canNodeContainContent = function canNodeContainContent( node ) {
	return node.tagName && [ 'p', 'h1', 'h2', 'h3' ].includes( node.tagName.toLowerCase() );
};

/**
 * Create ContentBranchNode linearized data from a DOM node like p, h1, h2 etc
 *
 * This is only for nodes that should have linearized content (like p, h1 or h2). Linearization
 * is NOT used for "structural" nodes like `div` or `li`. These cannot directly contain content.
 *
 * In full VE, this process cannot be cleanly separated from converting structural nodes,
 * because we auto-generate paragraphs if we do encounter, say, a text node directly inside a
 * div. The requirement to round-trip whitespace makes that code very fiddly.
 *
 * Here we represent annotations directly strings like '<b>' or '<a href="foo">', but real VE
 * represents them with hashes like 'h8e79483a29e62bdb' that are keys in a HashValueStore
 * owned by the document. The corresponding values are instances of ve.dm.Annotation, e.g.
 * ve.dm.BoldAnnotation and ve.dm.LinkAnnotation.
 *
 * @see {ve.dm.Converter#getDataFromDomSubtree}
 * @see {ve.dm.HashValueStore}
 * @see {ve.dm.Annotation}
 * @param {Node} contentBranchDomNode A DOM node for a p, h1, h2 etc
 * @param {string[]} annotations List of open annotations, e.g. [ '<b>', '<a href="foo">' ]
 * @return {Array} Linear data
 */
tinyve.dm.converter.linearize = function linearize( contentBranchDomNode, annotations = [] ) {
	function getOpenTag( node ) {
		return node.cloneNode().outerHTML.replace( /(<.*?>).*/, '$1' );
	}

	const data = [];

	Array.from( contentBranchDomNode.childNodes ).forEach( ( childNode ) => {
		if ( childNode.nodeType === 3 ) {
			// Text node
			const chars = Array.from( childNode.textContent );
			if ( annotations.length === 0 ) {
				// Push each character separately, e.g. 'f', 'o', 'o'
				data.push( ...chars );
			} else {
				// Push each character separately, each annotated, e.g.
				// [ 'f', [ '<b>', '<a href="foo">' ] ],
				// [ 'o', [ '<b>', '<a href="foo">' ] ],
				// [ 'o', [ '<b>', '<a href="foo">' ] ]
				const annotatedChars = chars.map( ( ch ) => [ ch, annotations.slice() ] );
				data.push( ...annotatedChars );
			}
		} else if ( tinyve.dm.converter.isNodeAnnotation( childNode ) ) {
			annotations.push( getOpenTag( childNode ) );
			data.push( ...tinyve.dm.converter.linearize( childNode, annotations ) );
			annotations.pop();
		} else {
			throw new Error( 'Unsupported node' );
		}
	} );
	return data;
};

/**
 * Create linear data for a DOM subtree
 *
 * @see {ve.dm.Converter#getDataFromDomSubtree}
 * @param {Node} node The DOM node to process, e.g. document.body
 * @return {Array} Linear data
 */
tinyve.dm.converter.getDataFromDomSubtree = function getDataFromDomSubtree( node ) {
	const data = [];
	Array.from( node.childNodes ).forEach( ( childNode ) => {
		if ( childNode.nodeType === 3 ) {
			// Text node outside p/h1/h2 etc (e.g. whitespace) ... just ignore(!)
			return;
		}
		const tag = childNode.tagName.toLowerCase();
		data.push( { type: tag } );
		if ( tinyve.dm.converter.canNodeContainContent( childNode ) ) {
			data.push( ...tinyve.dm.converter.linearize( childNode ) );
		} else {
			data.push( ...tinyve.dm.converter.getDataFromDomSubtree( childNode ) );
		}
		data.push( { type: '/' + tag } );
	} );
	return data;
};
