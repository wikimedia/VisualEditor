/*!
 * VisualEditor DataModel Document class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel document.
 *
 * WARNING: The data parameter is passed by reference. Do not modify a data array after passing
 * it to this constructor, and do not construct multiple Documents with the same data array. If you
 * need to do these things, make a deep copy (ve.copyArray()) of the data array and operate on the
 * copy.
 *
 * @class
 * @extends ve.Document
 * @constructor
 * @param {Array} data Linear model data to start with
 * @param {ve.dm.Document} [parentDocument] Document to use as root for created nodes
 */
ve.dm.Document = function VeDmDocument( data, parentDocument ) {
	// Parent constructor
	ve.Document.call( this, new ve.dm.DocumentNode() );

	// Properties
	this.parentDocument = parentDocument;
	this.data = ve.isArray( data ) ? data : [];
	// Sparse array containing the metadata for each offset
	// Each element is either undefined, or an array of metadata elements
	// Because the indexes in the metadata array represent offsets in the data array, the
	// metadata array has one element more than the data array.
	this.metadata = new Array( this.data.length + 1 );

	// Initialization
	/*
	 * Build a tree of nodes and nodes that will be added to them after a full scan is complete,
	 * then from the bottom up add nodes to their potential parents. This avoids massive length
	 * updates being broadcast upstream constantly while building is underway.
	 */
	var i, node, children, meta,
		doc = parentDocument || this,
		root = doc.getDocumentNode(),
		textLength = 0,
		inTextNode = false,
		// Stack of stacks, each containing a
		stack = [[this.documentNode], []],
		currentStack = stack[1],
		parentStack = stack[0],
		currentNode = this.documentNode;
	this.documentNode.setDocument( doc );
	this.documentNode.setRoot( root );
	for ( i = 0; i < this.data.length; i++ ) {
		// Infer that if an item in the linear model has a type attribute than it must be an element
		if ( this.data[i].type === undefined ) {
			// Text node opening
			if ( !inTextNode ) {
				// Create a lengthless text node
				node = new ve.dm.TextNode();
				// Set the root pointer now, to prevent cascading updates
				node.setRoot( root );
				// Put the node on the current inner stack
				currentStack.push( node );
				currentNode = node;
				// Set a flag saying we're inside a text node
				inTextNode = true;
			}
			// Track the length
			textLength++;
		} else {
			if (
				this.data[i].type.charAt( 0 ) !== '/' &&
				ve.dm.metaItemFactory.lookup( this.data[i].type )
			) {
				// Metadata
				// Splice the meta element and its closing out of the linmod
				meta = this.data[i];
				this.spliceData( i, 2 );
				// Put the metadata in the meta-linmod
				if ( !this.metadata[i] ) {
					this.metadata[i] = [];
				}
				this.metadata[i].push( meta );
				// Make sure the loop doesn't skip the next element
				i--;
				continue;
			}

			// Text node closing
			if ( inTextNode ) {
				// Finish the text node by setting the length
				currentNode.setLength( textLength );
				// Put the state variables back as they were
				currentNode = parentStack[parentStack.length - 1];
				inTextNode = false;
				textLength = 0;
			}
			// Element open/close
			if ( this.data[i].type.charAt( 0 ) !== '/' ) {
				// Branch or leaf node opening
				// Create a childless node
				node = ve.dm.nodeFactory.create( this.data[i].type, [],
					this.data[i]
				);
				// Set the root pointer now, to prevent cascading updates
				node.setRoot( root );
				// Put the childless node on the current inner stack
				currentStack.push( node );
				if ( ve.dm.nodeFactory.canNodeHaveChildren( node.getType() ) ) {
					// Create a new inner stack for this node
					parentStack = currentStack;
					currentStack = [];
					stack.push( currentStack );
				}
				currentNode = node;
			} else {
				// Branch or leaf node closing
				if ( ve.dm.nodeFactory.canNodeHaveChildren( currentNode.getType() ) ) {
					// Pop this node's inner stack from the outer stack. It'll have all of the
					// node's child nodes fully constructed
					children = stack.pop();
					currentStack = parentStack;
					parentStack = stack[stack.length - 2];
					if ( !parentStack ) {
						// This can only happen if we got unbalanced data
						throw new Error( 'Unbalanced input passed to document' );
					}
					// Attach the children to the node
					ve.batchSplice( currentNode, 0, 0, children );
				}
				currentNode = parentStack[parentStack.length - 1];
			}
		}
	}

	if ( inTextNode ) {
		// Text node ended by end-of-input rather than by an element
		currentNode.setLength( textLength );
		// Don't bother updating currentNode et al, we don't use them below
	}
	// The end state is stack = [ [this.documentNode] [ array, of, its, children ] ]
	// so attach all nodes in stack[1] to the root node
	ve.batchSplice( this.documentNode, 0, 0, stack[1] );
};

/* Inheritance */

ve.inheritClass( ve.dm.Document, ve.Document );

/* Static methods */

/**
 * Pattern that matches anything that's not considered part of a word.
 *
 * This is a very loose definition, it includes some punctuation that can occur around or inside of
 * a word. This may need to be added to for some locales and perhaps made to be extendable for
 * better internationalization support.
 *
 * Allowed characters:
 *     * Unicode 'letters' and 'numbers' categories
 *     * Underscores and dashes: _, -
 *     * Brackets and parenthesis: (), []
 *     * Apostrophes and double quotes: ', "
 *
 * This pattern is tested against one character at a time.
 */
ve.dm.SurfaceFragment.wordBoundaryPattern = new RegExp(
	'[^' +
		// Letters
		'A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC' +
		// Numbers
		'0-9\xB2\xB3\xB9\xBC-\xBE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19' +
		// other word boundary exceptions
		'\'"\\-\\(\\)\\[\\]' +
	']+'
);

/**
 * Apply annotations to content data.
 *
 * This method modifies data in place.
 *
 * @method
 * @param {Array} data Data to remove annotations from
 * @param {ve.AnnotationSet} annotationSet Annotations to apply
 */
ve.dm.Document.addAnnotationsToData = function ( data, annotationSet ) {
	if ( annotationSet.isEmpty() ) {
		// Nothing to do
		return;
	}
	// Apply annotations to data
	for ( var i = 0; i < data.length; i++ ) {
		if ( !ve.isArray( data[i] ) ) {
			data[i] = [data[i], new ve.AnnotationSet()];
		}
		data[i][1].addSet( annotationSet );
	}
};

/**
 * Check if content can be inserted at an offset in document data.
 *
 * This method assumes that any value that has a type property that's a string is an element object.
 *
 * Content offsets:
 *      <heading> a </heading> <paragraph> b c <img> </img> </paragraph>
 *     .         ^ ^          .           ^ ^ ^     .      ^            .
 *
 * Content offsets:
 *      <list> <listItem> </listItem> <list>
 *     .      .          .           .      .
 *
 * @static
 * @method
 * @param {Array} data Document data
 * @param {number} offset Document offset
 * @returns {boolean} Content can be inserted at offset
 */
ve.dm.Document.isContentOffset = function ( data, offset ) {
	// Edges are never content
	if ( offset === 0 || offset === data.length ) {
		return false;
	}
	var left = data[offset - 1],
		right = data[offset],
		factory = ve.dm.nodeFactory;
	return (
		// Data exists at offsets
		( left !== undefined && right !== undefined ) &&
		(
			// If there's content on the left or the right of the offset than we are good
			// <paragraph>|a|</paragraph>
			( typeof left === 'string' || typeof right === 'string' ) ||
			// Same checks but for annotated characters - isArray is slower, try it next
			( ve.isArray( left ) || ve.isArray( right ) ) ||
			// The most expensive test are last, these deal with elements
			(
				// Right of a leaf
				// <paragraph><image></image>|</paragraph>
				(
					// Is an element
					typeof left.type === 'string' &&
					// Is a closing
					left.type.charAt( 0 ) === '/' &&
					// Is a leaf
					factory.isNodeContent( left.type.substr( 1 ) )
				) ||
				// Left of a leaf
				// <paragraph>|<image></image></paragraph>
				(
					// Is an element
					typeof right.type === 'string' &&
					// Is not a closing
					right.type.charAt( 0 ) !== '/' &&
					// Is a leaf
					factory.isNodeContent( right.type )
				) ||
				// Inside empty content branch
				// <paragraph>|</paragraph>
				(
					// Inside empty element
					'/' + left.type === right.type &&
					// Both are content branches (right is the same type)
					factory.canNodeContainContent( left.type )
				)
			)
		)
	);
};

/**
 * Check if structure can be inserted at an offset in document data.
 *
 * If the {unrestricted} param is true than only offsets where any kind of element can be inserted
 * will return true. This can be used to detect the difference between a location that a paragraph
 * can be inserted, such as between two tables but not direclty inside a table.
 *
 * This method assumes that any value that has a type property that's a string is an element object.
 *
 * Structural offsets (unrestricted = false):
 *      <heading> a </heading> <paragraph> b c <img> </img> </paragraph>
 *     ^         . .          ^           . . .     .      .            ^
 *
 * Structural offsets (unrestricted = true):
 *      <heading> a </heading> <paragraph> b c <img> </img> </paragraph>
 *     ^         . .          ^           . . .     .      .            ^
 *
 * Structural offsets (unrestricted = false):
 *      <list> <listItem> </listItem> <list>
 *     ^      ^          ^           ^      ^
 *
 * Content branch offsets (unrestricted = true):
 *      <list> <listItem> </listItem> <list>
 *     ^      .          ^           .      ^
 *
 * @static
 * @method
 * @param {Array} data Document data
 * @param {number} offset Document offset
 * @param {boolean} [unrestricted] Only return true if any kind of element can be inserted at offset
 * @returns {boolean} Structure can be inserted at offset
 */
ve.dm.Document.isStructuralOffset = function ( data, offset, unrestricted ) {
	// Edges are always structural
	if ( offset === 0 || offset === data.length ) {
		return true;
	}
	// Offsets must be within range and both sides must be elements
	var left = data[offset - 1],
		right = data[offset],
		factory = ve.dm.nodeFactory;
	return (
		(
			left !== undefined &&
			right !== undefined &&
			typeof left.type === 'string' &&
			typeof right.type === 'string'
		) &&
		(
			// Right of a branch
			// <list><listItem><paragraph>a</paragraph>|</listItem>|</list>|
			(
				// Is a closing
				left.type.charAt( 0 ) === '/' &&
				// Is a branch or non-content leaf
				(
					factory.canNodeHaveChildren( left.type.substr( 1 ) ) ||
					!factory.isNodeContent( left.type.substr( 1 ) )
				) &&
				(
					// Only apply this rule in unrestricted mode
					!unrestricted ||
					// Right of an unrestricted branch
					// <list><listItem><paragraph>a</paragraph>|</listItem></list>|
					// Both are non-content branches that can have any kind of child
					factory.getParentNodeTypes( left.type.substr( 1 ) ) === null
				)
			) ||
			// Left of a branch
			// |<list>|<listItem>|<paragraph>a</paragraph></listItem></list>
			(
				// Is not a closing
				right.type.charAt( 0 ) !== '/' &&
				// Is a branch or non-content leaf
				(
					factory.canNodeHaveChildren( right.type ) ||
					!factory.isNodeContent( right.type )
				) &&
				(
					// Only apply this rule in unrestricted mode
					!unrestricted ||
					// Left of an unrestricted branch
					// |<list><listItem>|<paragraph>a</paragraph></listItem></list>
					// Both are non-content branches that can have any kind of child
					factory.getParentNodeTypes( right.type ) === null
				)
			) ||
			// Inside empty non-content branch
			// <list>|</list> or <list><listItem>|</listItem></list>
			(
				// Inside empty element
				'/' + left.type === right.type &&
				// Both are non-content branches (right is the same type)
				factory.canNodeHaveChildrenNotContent( left.type ) &&
				(
					// Only apply this rule in unrestricted mode
					!unrestricted ||
					// Both are non-content branches that can have any kind of child
					factory.getChildNodeTypes( left.type ) === null
				)
			)
		)
	);
};

/**
 * Check if data at a given offset is an element.
 *
 * This method assumes that any value that has a type property that's a string is an element object.
 *
 * Element data:
 *      <heading> a </heading> <paragraph> b c <img></img> </paragraph>
 *     ^         . ^          ^           . . ^     ^     ^            .
 *
 * @static
 * @method
 * @param {Array} data Document data
 * @param {number} offset Document offset
 * @returns {boolean} Data at offset is an element
 */
ve.dm.Document.isElementData = function ( data, offset ) {
	// Data exists at offset and appears to be an element
	return data[offset] !== undefined && typeof data[offset].type === 'string';
};

/**
 * Check for elements in document data.
 *
 * This method assumes that any value that has a type property that's a string is an element object.
 * Elements are discovered by iterating through the entire data array (backwards).
 *
 * @static
 * @method
 * @param {Array} data Document data
 * @returns {boolean} At least one elements exists in data
 */
ve.dm.Document.containsElementData = function ( data ) {
	var i = data.length;
	while ( i-- ) {
		if ( data[i].type !== undefined ) {
			return true;
		}
	}
	return false;
};

/**
 * Check for non-content elements in document data.
 *
 * This method assumes that any value that has a type property that's a string is an element object.
 * Elements are discovered by iterating through the entire data array.
 *
 * @static
 * @method
 * @param {Array} data Document data
 * @returns {boolean} True if all elements in data are content elements
 */
ve.dm.Document.isContentData = function ( data ) {
	for ( var i = 0, len = data.length; i < len; i++ ) {
		if ( data[i].type !== undefined &&
			data[i].type.charAt( 0 ) !== '/' &&
			!ve.dm.nodeFactory.isNodeContent( data[i].type )
		) {
			return false;
		}
	}
	return true;
};

/**
 * Get a slice or copy of the provided data.
 *
 * @static
 * @method
 * @param {Array} sourceData Source data to slice up
 * @param {ve.Range} [range] Range of data to get, all data will be given by default
 * @param {boolean} [deep=false] Whether to return a deep copy (WARNING! This may be very slow)
 * @returns {Array} Slice or copy of document data
 */
ve.dm.Document.getDataSlice = function ( sourceData, range, deep ) {
	var end, data,
		start = 0;
	if ( range !== undefined ) {
		start = Math.max( 0, Math.min( sourceData.length, range.start ) );
		end = Math.max( 0, Math.min( sourceData.length, range.end ) );
	}
	// IE work-around: arr.slice( 0, undefined ) returns [] while arr.slice( 0 ) behaves correctly
	data = end === undefined ? sourceData.slice( start ) : sourceData.slice( start, end );
	// Return either the slice or a deep copy of the slice
	return deep ? ve.copyArray( data ) : data;
};

/* Methods */

/**
 * Reverse a transaction's effects on the content data.
 *
 * @method
 * @param {ve.dm.Transaction}
 */
ve.dm.Document.prototype.rollback = function ( transaction ) {
	ve.dm.TransactionProcessor.rollback( this, transaction );
};

/**
 * Apply a transaction's effects on the content data.
 *
 * @method
 * @param {ve.dm.Transaction}
 */
ve.dm.Document.prototype.commit = function ( transaction ) {
	ve.dm.TransactionProcessor.commit( this, transaction );
};

/**
 * Get a slice or copy of the document data.
 *
 * @method
 * @param {ve.Range} [range] Range of data to get, all data will be given by default
 * @param {boolean} [deep=false] Whether to return a deep copy (WARNING! This may be very slow)
 * @returns {Array} Slice or copy of document data
 */
ve.dm.Document.prototype.getData = function ( range, deep ) {
	return this.constructor.getDataSlice( this.data, range, deep );
};

/**
 * Get a slice or copy of the document metadata.
 *
 * @method
 * @param {ve.Range} [range] Range of metadata to get, all metadata will be given by default
 * @param {boolean} [deep=false] Whether to return a deep copy (WARNING! This may be very slow)
 * @returns {Array} Slice or copy of document metadata
 */
ve.dm.Document.prototype.getMetadata = function ( range, deep ) {
	return this.constructor.getDataSlice( this.metadata, range, deep );
};

/**
 * Get the length of the document.
 *
 * @method
 * @returns {number} Document data length
 */
ve.dm.Document.prototype.getLength = function () {
	return this.data.length;
};

/**
 * Splice data into and/or out of the linear model.
 *
 * `this.metadata` will be updated accordingly.
 *
 * Always use this function, never use `this.data.splice()` directly, otherwise the linear model
 * (`this.data`) and the meta-linmod (`this.metadata`) can get out of sync. The semantics of the
 * parameters are identical to those of ve#batchSplice
 *
 * @method
 * @see ve#batchSplice
 * @param offset
 * @param remove
 * @param insert
 */
ve.dm.Document.prototype.spliceData = function ( offset, remove, insert ) {
	var spliced, retain, reaped, reapedFlat, i;
	insert = insert || [];
	spliced = ve.batchSplice( this.data, offset, remove, insert );
	// If we're both inserting and removing in the same operation, don't remove a bunch of metadata
	// elements only to insert a bunch of new ones. Instead, only add or remove as many as the length
	// delta.
	retain = insert.length < remove ? insert.length : remove;
	reaped = ve.batchSplice( this.metadata, offset + retain, remove - retain, new Array( insert.length - retain ) );
	// reaped will be an array of arrays, flatten it
	reapedFlat = [];
	for ( i = 0; i < reaped.length; i++ ) {
		if ( reaped[i] !== undefined ) {
			reapedFlat = reapedFlat.concat( reaped[i] );
		}
	}
	// Add reaped metadata to the metadata that is now at offset (and used to be immediately
	// after the removed data). Add it to the front, because it came from something that was
	// before it.
	if ( reapedFlat.length > 0 ) {
		this.metadata[offset + retain] = reapedFlat.concat( this.metadata[offset] || [] );
	}
	return spliced;
};

/**
 * Splice metadata into and/or out of the linear model.
 *
 * `this.metadata` will be updated accordingly.
 *
 * @method
 * @see ve#batchSplice
 * @param offset
 * @param index
 * @param remove
 * @param insert
 */
ve.dm.Document.prototype.spliceMetadata = function ( offset, index, remove, insert ) {
	var elements = this.metadata[offset];
	if ( !elements ) {
		this.metadata[offset] = elements = [];
	}
	insert = insert || [];
	return ve.batchSplice( elements, index, remove, insert );
};

/**
 * Get the full document data including metadata.
 *
 * Metadata will be into the document data to produce the "full data" result.
 *
 * @returns {Array} Data with metadata interleaved
 */
ve.dm.Document.prototype.getFullData = function () {
	var result = [], i, j, len = this.data.length;
	for ( i = 0; i <= len; i++ ) {
		if ( this.metadata[i] ) {
			for ( j = 0; j < this.metadata[i].length; j++ ) {
				result.push( this.metadata[i][j] );
				result.push( { 'type': '/' + this.metadata[i][j].type } );
			}
		}
		if ( i < len ) {
			result.push( this.data[i] );
		}
	}
	return result;
};

/**
 * Get a node from an offset.
 *
 * @method
 * @param offset
 */
ve.dm.Document.prototype.getNodeFromOffset = function ( offset ) {
	// FIXME duplicated from ve.ce.Document
	if ( offset < 0 || offset > this.data.length ) {
		throw new Error( 've.dm.Document.getNodeFromOffset(): offset ' + offset + ' is out of bounds' );
	}
	var node = this.documentNode.getNodeFromOffset( offset );
	if ( !node.canHaveChildren() ) {
		node = node.getParent();
	}
	return node;
};

/**
 * Get the content data of a node.
 *
 * @method
 * @param {ve.dm.Node} node Node to get content data for
 * @returns {Array|null} List of content and elements inside node or null if node is not found
 */
ve.dm.Document.prototype.getDataFromNode = function ( node ) {
	var length = node.getLength(),
		offset = this.documentNode.getOffsetFromNode( node );
	if ( offset >= 0 ) {
		// XXX: If the node is wrapped in an element than we should increment the offset by one so
		// we only return the content inside the element.
		if ( node.isWrapped() ) {
			offset++;
		}
		return this.data.slice( offset, offset + length );
	}
	return null;
};

/**
 * Get plain text of a range.
 *
 * @method
 * @param {ve.Range} [range] Range of data to get the text of.
 * @returns {string|''} Selected text or an empty string.
 */
ve.dm.Document.prototype.getText = function ( range ) {
	var data = this.getData( range ),
		str = '',
		i;
	for ( i = 0; i < data.length; i++ ) {
		if ( typeof data[i] === 'string' ) {
			str += data[i];
		} else if ( ve.isArray( data[i] ) ) {
			str += data[i][0];
		}
	}
	return str;
};

/**
 * Get annotations covered by an offset.
 *
 * The returned AnnotationSet is a clone of the one in the document data.
 *
 * @method
 * @param {number} offset Offset to get annotations for
 * @returns {ve.AnnotationSet} A set of all annotation objects offset is covered by
 */
ve.dm.Document.prototype.getAnnotationsFromOffset = function ( offset ) {
	if ( offset < 0 || offset > this.data.length ) {
		throw new Error( 've.dm.Document.getAnnotationsFromOffset: offset ' + offset + ' out of bounds' );
	}
	// Since annotations are not stored on a closing leaf node,
	// rewind offset by 1 to return annotations for that structure
	var annotations;
	if (
		ve.isPlainObject( this.data[offset] ) && // structural offset
		this.data[offset].hasOwnProperty( 'type' ) && // just in case
		this.data[offset].type.charAt( 0 ) === '/' && // closing offset
		ve.dm.nodeFactory.canNodeHaveChildren(
			this.data[offset].type.substr( 1 )
		) === false // leaf node
	) {
		offset = this.getRelativeContentOffset( offset, -1 );
	}

	annotations = this.data[offset].annotations || this.data[offset][1];
	return annotations ? annotations.clone() : new ve.AnnotationSet();
};

/**
 * Gets the range of content surrounding a given offset that's covered by a given annotation.
 *
 * @param {number} offset Offset to begin looking forward and backward from
 * @param {Object} annotation Annotation to test for coverage with
 * @returns {ve.Range|null} Range of content covered by annotation, or null if offset is not covered
 */
ve.dm.Document.prototype.getAnnotatedRangeFromOffset = function ( offset, annotation ) {
	var start = offset,
		end = offset;
	if ( this.getAnnotationsFromOffset( offset ).contains( annotation ) === false ) {
		return null;
	}
	while ( start > 0 ) {
		start--;
		if ( this.getAnnotationsFromOffset( start ).contains( annotation ) === false ) {
			start++;
			break;
		}
	}
	while ( end < this.data.length ) {
		if ( this.getAnnotationsFromOffset( end ).contains( annotation ) === false ) {
			break;
		}
		end++;
	}
	return new ve.Range( start, end );
};

/**
 * Get the range of an annotation found within a range.
 *
 * @param {number} offset Offset to begin looking forward and backward from
 * @param {Object} annotation Annotation to test for coverage with
 * @returns {ve.Range|null} Range of content covered by annotation, or a copy of the range.
 */
ve.dm.Document.prototype.getAnnotatedRangeFromSelection = function ( range, annotation ) {
	var start = range.start,
		end = range.end;
	while ( start > 0 ) {
		start--;
		if ( this.getAnnotationsFromOffset( start ).contains( annotation ) === false ) {
			start++;
			break;
		}
	}
	while ( end < this.data.length ) {
		if ( this.getAnnotationsFromOffset( end ).contains( annotation ) === false ) {
			break;
		}
		end++;
	}
	return new ve.Range( start, end );
};

/**
 * Get annotations common to all content in a range.
 *
 * @method
 * @param {ve.Range} range Range to get annotations for
 * @param {boolean} [all] Get all annotations found within the range, not just those that cover it
 * @returns {ve.AnnotationSet} All annotation objects range is covered by
 */
ve.dm.Document.prototype.getAnnotationsFromRange = function ( range, all ) {
	var i,
		left,
		right;
	// Look at left side of range for annotations
	left = this.getAnnotationsFromOffset( range.start );
	// Shortcut for single character and zero-length ranges
	if ( range.getLength() === 0 || range.getLength() === 1 ) {
		return left;
	}
	// Iterator over the range, looking for annotations, starting at the 2nd character
	for ( i = range.start + 1; i < range.end; i++ ) {
		// Skip non character data
		if ( ve.dm.Document.isElementData( this.data, i ) ) {
			continue;
		}
		// Current character annotations
		right = this.getAnnotationsFromOffset( i );
		if ( all && !right.isEmpty() ) {
			left.addSet( right );
		} else if ( !all ) {
			// A non annotated character indicates there's no full coverage
			if ( right.isEmpty() ) {
				return new ve.AnnotationSet();
			}
			// Exclude annotations that are in left but not right
			left.removeNotInSet( right );
			// If we've reduced left down to nothing, just stop looking
			if ( left.isEmpty() ) {
				break;
			}
		}
	}
	return left;
};

/**
 * Get a range without any whitespace content at the beginning and end.
 *
 * @method
 * @param {ve.Range} [range] Range of data to get, all data will be given by default
 * @returns {Object} A new range if modified, otherwise returns passed range.
 */
ve.dm.Document.prototype.trimOuterSpaceFromRange = function ( range ) {
	var start = range.start,
		end = range.end;
	while ( this.data[start][0] === ' ' ) {
		start++;
	}
	while ( this.data[end - 1][0] === ' ' ) {
		end--;
	}
	return range.to < range.end ? new ve.Range( end, start ) : new ve.Range( start, end );
};

/**
 * Rebuild one or more nodes following a change in document data.
 *
 * The data provided to this method may contain either one node or multiple sibling nodes, but it
 * must be balanced and valid. Data provided to this method also may not contain any content at the
 * top level. The tree is updated during this operation.
 *
 * Process:
 *  1. Nodes between {index} and {index} + {numNodes} in {parent} will be removed
 *  2. Data will be retrieved from this.data using {offset} and {newLength}
 *  3. A document fragment will be generated from the retrieved data
 *  4. The document fragment's nodes will be inserted into {parent} at {index}
 *
 * Use cases:
 *  1. Rebuild old nodes and offset data after a change to the linear model.
 *  2. Insert new nodes and offset data after a insertion in the linear model.
 *
 * @param {ve.dm.Node} parent Parent of the node(s) being rebuilt
 * @param {number} index Index within parent to rebuild or insert nodes
 *  - If {numNodes} == 0: Index to insert nodes at
 *  - If {numNodes} >= 1: Index of first node to rebuild
 * @param {number} numNodes Total number of nodes to rebuild
 *  - If {numNodes} == 0: Nothing will be rebuilt, but the node(s) built from data will be
 *    inserted before {index}. To insert nodes at the end, use number of children in 'parent'
 *  - If {numNodes} == 1: Only the node at {index} will be rebuilt
 *  - If {numNodes} > 1: The node at {index} and the next {numNodes-1} nodes will be rebuilt
 * @param {number} offset Linear model offset to rebuild from
 * @param {number} newLength Length of data in linear model to rebuild or insert nodes for
 * @returns {ve.dm.Node[]} Array containing the rebuilt/inserted nodes
 */
ve.dm.Document.prototype.rebuildNodes = function ( parent, index, numNodes, offset, newLength ) {
	var // Get a slice of the document where it's been changed
		data = this.data.slice( offset, offset + newLength ),
		// Build document fragment from data
		fragment = new ve.dm.Document( data, this ),
		// Get generated child nodes from the document fragment
		nodes = fragment.getDocumentNode().getChildren();
	// Replace nodes in the model tree
	ve.batchSplice( parent, index, numNodes, nodes );
	// Return inserted nodes
	return nodes;
};

/**
 * Get an offset at a distance to an offset that passes a validity test.
 *
 * - If {offset} is not already valid, one step will be used to move it to an valid one.
 * - If {offset} is already valid and cannot be moved in the direction of {distance} and still be
 *   valid, it will be left where it is
 * - If {distance} is zero the result will either be {offset} if it's already valid or the
 *   nearest valid offset to the right if possible and to the left otherwise.
 * - If {offset} is after the last valid offset and {distance} is >= 1, or if {offset} if
 *   before the first valid offset and {distance} <= 1 than the result will be the nearest
 *   valid offset in the opposite direction.
 * - If the document does not contain a single valid offset the result will be -1
 *
 * @method
 * @param {number} offset Offset to start from
 * @param {number} distance Number of valid offsets to move
 * @param {Function} callback Function to call to check if an offset is valid which will be
 * given two intital arguments of data and offset
 * @param {Mixed...} [args] Additional arguments to pass to the callback
 * @returns {number} Relative valid offset or -1 if there are no valid offsets in document
 */
ve.dm.Document.prototype.getRelativeOffset = function ( offset, distance, callback ) {
	var i, direction,
		args = Array.prototype.slice.call( arguments, 3 ),
		start = offset,
		steps = 0,
		turnedAround = false;
	// If offset is already a structural offset and distance is zero than no further work is needed,
	// otherwise distance should be 1 so that we can get out of the invalid starting offset
	if ( distance === 0 ) {
		if ( callback.apply( window, [this.data, offset].concat( args ) ) ) {
			return offset;
		} else {
			distance = 1;
		}
	}
	// Initial values
	direction = (
		offset <= 0 ? 1 : (
			offset >= this.data.length ? -1 : (
				distance > 0 ? 1 : -1
			)
		)
	);
	distance = Math.abs( distance );
	i = start + direction;
	offset = -1;
	// Iteration
	while ( i >= 0 && i <= this.data.length ) {
		if ( callback.apply( window, [this.data, i].concat( args ) ) ) {
			steps++;
			offset = i;
			if ( distance === steps ) {
				return offset;
			}
		} else if (
			// Don't keep turning around over and over
			!turnedAround &&
			// Only turn around if not a single step could be taken
			steps === 0 &&
			// Only turn around if we're about to reach the edge
			( ( direction < 0 && i === 0 ) || ( direction > 0 && i === this.data.length ) )
		) {
			// Before we turn around, let's see if we are at a valid position
			if ( callback.apply( window, [this.data, start].concat( args ) ) ) {
				// Stay where we are
				return start;
			}
			// Start over going in the opposite direction
			direction *= -1;
			i = start;
			distance = 1;
			turnedAround = true;
		}
		i += direction;
	}
	return offset;
};

/**
 * Get a content offset at a distance from an offset.
 *
 * This method is a wrapper around {getRelativeOffset}, using {ve.dm.Document.isContentOffset} as
 * the offset validation callback.
 *
 * @method
 * @param {number} offset Offset to start from
 * @param {number} distance Number of content offsets to move
 * @returns {number} Relative content offset or -1 if there are no valid offsets in document
 */
ve.dm.Document.prototype.getRelativeContentOffset = function ( offset, distance ) {
	return this.getRelativeOffset( offset, distance, ve.dm.Document.isContentOffset );
};

/**
 * Get the nearest content offset to an offset.
 *
 * If the offset is already a valid offset, it will be returned unchanged. This method differs from
 * calling {getRelativeContentOffset} with a zero length differece because the direction can be
 * controlled without nessecarily moving the offset if it's already valid. Also, if the direction
 * is 0 or undefined than nearest offsets will be found to the left and right and the one with the
 * shortest distance will be used.
 *
 * This method is a wrapper around {getRelativeOffset}, using {ve.dm.Document.isContentOffset} as
 * the offset validation callback.
 *
 * @method
 * @param {number} offset Offset to start from
 * @param {number} [direction] Direction to prefer matching offset in, -1 for left and 1 for right
 * @returns {number} Nearest content offset or -1 if there are no valid offsets in document
 */
ve.dm.Document.prototype.getNearestContentOffset = function ( offset, direction ) {
	if ( ve.dm.Document.isContentOffset( this.data, offset ) ) {
		return offset;
	}
	if ( direction === undefined ) {
		var left = this.getRelativeOffset( offset, -1, ve.dm.Document.isContentOffset ),
			right = this.getRelativeOffset( offset, 1, ve.dm.Document.isContentOffset );
		return offset - left < right - offset ? left : right;
	} else {
		return this.getRelativeOffset(
			offset, direction > 0 ? 1 : -1, ve.dm.Document.isContentOffset
		);
	}
};

/**
 * Get a structural offset at a distance from an offset.
 *
 * This method is a wrapper around {getRelativeOffset}, using {ve.dm.Document.isStructuralOffset} as
 * the offset validation callback.
 *
 * @method
 * @param {number} offset Offset to start from
 * @param {number} distance Number of structural offsets to move
 * @param {boolean} [unrestricted] Only return true if any kind of element can be inserted at offset
 * @returns {number} Relative structural offset
 */
ve.dm.Document.prototype.getRelativeStructuralOffset = function ( offset, distance, unrestricted ) {
	// Optimization: start and end are always unrestricted structural offsets
	if ( distance === 0 && ( offset === 0 || offset === this.data.length ) ) {
		return offset;
	}
	return this.getRelativeOffset(
		offset, distance, ve.dm.Document.isStructuralOffset, unrestricted
	);
};

/**
 * Get the nearest structural offset to an offset.
 *
 * If the offset is already a valid offset, it will be returned unchanged. This method differs from
 * calling {getRelativeStructuralOffset} with a zero length differece because the direction can be
 * controlled without nessecarily moving the offset if it's already valid. Also, if the direction
 * is 0 or undefined than nearest offsets will be found to the left and right and the one with the
 * shortest distance will be used.
 *
 * This method is a wrapper around {getRelativeOffset}, using {ve.dm.Document.isStructuralOffset} as
 * the offset validation callback.
 *
 * @method
 * @param {number} offset Offset to start from
 * @param {number} [direction] Direction to prefer matching offset in, -1 for left and 1 for right
 * @param {boolean} [unrestricted] Only return true if any kind of element can be inserted at offset
 * @returns {number} Nearest structural offset
 */
ve.dm.Document.prototype.getNearestStructuralOffset = function ( offset, direction, unrestricted ) {
	if ( ve.dm.Document.isStructuralOffset( this.data, offset, unrestricted ) ) {
		return offset;
	}
	if ( !direction ) {
		var left = this.getRelativeOffset(
				offset, -1, ve.dm.Document.isStructuralOffset, unrestricted
			),
			right = this.getRelativeOffset(
				offset, 1, ve.dm.Document.isStructuralOffset, unrestricted
			);
		return offset - left < right - offset ? left : right;
	} else {
		return this.getRelativeOffset(
			offset, direction > 0 ? 1 : -1, ve.dm.Document.isStructuralOffset, unrestricted
		);
	}
};

/**
 * Get the nearest word boundary.
 *
 * The offset will first be moved to the nearest content offset if it's not at one already. If a
 * direction was given, the boundary will be found in that direction, otherwise both directions will
 * be calculated and the one with the lowest distance from offset will be returned. Elements are
 * always word boundaries. For more information about what is considered to be a word character,
 * see {ve.dm.SurfaceFragment.wordPattern}.
 *
 * @method
 * @param {number} offset Offset to start from
 * @param {number} [direction] Direction to prefer matching offset in, -1 for left and 1 for right
 * @returns {number} Nearest word boundary
 */
ve.dm.Document.prototype.getNearestWordBoundary = function ( offset, direction ) {
	var left, right, i, inc,
		pattern = ve.dm.SurfaceFragment.wordBoundaryPattern,
		data = this.data;
	offset = this.getNearestContentOffset( offset );
	if ( !direction ) {
		left = this.getNearestWordBoundary( offset, -1 );
		right = this.getNearestWordBoundary( offset, +1 );
		return offset - left < right - offset ? left : right;
	} else {
		inc = direction > 0 ? 1 : -1;
		i = offset + ( inc > 0 ? 0 : -1 );
		do {
			if ( data[i].type === undefined ) {
				// Plain text extraction
				if ( pattern.test( typeof data[i] === 'string' ? data[i] : data[i][0] ) ) {
					break;
				}
			} else {
				break;
			}
		} while ( data[i += inc] );
		return i + ( inc > 0 ? 0 : 1 );
	}
};

/**
 * Fix up data so it can safely be inserted into the document data at an offset.
 *
 * TODO: this function needs more work but it seems to work, mostly
 *
 * @method
 * @param {Array} data Snippet of linear model data to insert
 * @param {number} offset Offset in the linear model where the caller wants to insert data
 * @returns {Array} A (possibly modified) copy of data
 */
ve.dm.Document.prototype.fixupInsertion = function ( data, offset ) {
	var
		// Array where we build the return value
		newData = [],

		// *** Stacks ***
		// Array of element openings (object). Openings in data are pushed onto this stack
		// when they are encountered and popped off when they are closed
		openingStack = [],
		// Array of node objects. Closings in data that close nodes that were
		// not opened in data (i.e. were already in the document) are pushed onto this stack
		// and popped off when balanced out by an opening in data
		closingStack = [],
		// Array of objects describing wrappers that need to be fixed up when a given
		// element is closed.
		//     'expectedType': closing type that triggers this fixup. Includes initial '/'
		//     'openings': array of opening elements that should be closed (in reverse order)
		//     'reopenElements': array of opening elements to insert (in reverse order)
		fixupStack = [],

		// *** State persisting across iterations of the outer loop ***
		// The node (from the document) we're currently in. When in a node that was opened
		// in data, this is set to its first ancestor that is already in the document
		parentNode,
		// The type of the node we're currently in, even if that node was opened within data
		parentType,
		// Whether we are currently in a text node
		inTextNode,

		// *** Temporary variables that do not persist across iterations ***
		// The type of the node we're currently inserting. When the to-be-inserted node
		// is wrapped, this is set to the type of the outer wrapper.
		childType,
		// Stores the return value of getParentNodeTypes( childType )
		allowedParents,
		// Stores the return value of getChildNodeTypes( parentType )
		allowedChildren,
		// Whether parentType matches allowedParents
		parentsOK,
		// Whether childType matches allowedChildren
		childrenOK,
		// Array of opening elements to insert (for wrapping the to-be-inserted element)
		openings,
		// Array of closing elements to insert (for splitting nodes)
		closings,
		// Array of opening elements matching the elements in closings (in the same order)
		reopenElements,

		// *** Other variables ***
		// Used to store values popped from various stacks
		popped,
		// Loop variables
		i, j;

	/**
	 * Append a linear model element to newData and update the state.
	 *
	 * This function updates parentNode, parentType, openingStack and closingStack.
	 *
	 * @private
	 * @method
	 * @param {Object|Array|string} element Linear model element
	 * @param {number} index Index in data that the element came from (for error reporting only)
	 */
	function writeElement( element, index ) {
		var expectedType;

		if ( element.type !== undefined ) {
			// Content, do nothing
			if ( element.type.charAt( 0 ) !== '/' ) {
				// Opening
				// Check if this opening balances an earlier closing of a node that was already in
				// the document. This is only the case if openingStack is empty (otherwise we still
				// have unclosed nodes from within data) and if this opening matches the top of
				// closingStack
				if ( openingStack.length === 0 && closingStack.length > 0 &&
					closingStack[closingStack.length - 1].getType() === element.type
				) {
					// The top of closingStack is now balanced out, so remove it
					// Also restore parentNode from closingStack. While this is technically not
					// entirely accurate (the current node is a new node that's a sibling of this
					// node), it's good enough for the purposes of this algorithm
					parentNode = closingStack.pop();
				} else {
					// This opens something new, put it on openingStack
					openingStack.push( element );
				}
				parentType = element.type;
			} else {
				// Closing
				// Make sure that this closing matches the currently opened node
				if ( openingStack.length > 0 ) {
					// The opening was on openingStack, so we're closing a node that was opened
					// within data. Don't track that on closingStack
					expectedType = openingStack.pop().type;
				} else {
					// openingStack is empty, so we're closing a node that was already in the
					// document. This means we have to reopen it later, so track this on
					// closingStack
					expectedType = parentNode.getType();
					closingStack.push( parentNode );
					parentNode = parentNode.getParent();
					if ( !parentNode ) {
						throw new Error( 'Inserted data is trying to close the root node ' +
							'(at index ' + index + ')' );
					}
					parentType = expectedType;

					// Validate
					// FIXME this breaks certain input, should fix it up, not scream and die
					// For now we fall back to inserting balanced data, but then we miss out on
					// a lot of the nice content adoption abilities of just fixing up the data in
					// the context of the insertion point - an example of how this will fail is if
					// you try to insert "b</p></li></ul><p>c" into "<p>a[cursor]d</p>"
					if (
						element.type !== '/' + expectedType &&
						(
							// Only throw an error if the content can't be adopted from one content
							// branch to another
							!ve.dm.nodeFactory.canNodeContainContent( element.type.substr( 1 ) ) ||
							!ve.dm.nodeFactory.canNodeContainContent( expectedType )
						)
					) {
						throw new Error( 'Cannot adopt content from ' + element.type +
							' nodes into ' + expectedType + ' nodes (at index ' + index + ')' );
					}
				}
			}
		}
		newData.push( element );
	}

	parentNode = this.getNodeFromOffset( offset );
	parentType = parentNode.getType();
	inTextNode = false;
	for ( i = 0; i < data.length; i++ ) {
		if ( inTextNode && data[i].type !== undefined ) {
			// We're leaving a text node, process fixupStack if needed
			// TODO duplicated code
			if (
				fixupStack.length > 0 &&
				fixupStack[fixupStack.length - 1].expectedType === '/text'
			) {
				popped = fixupStack.pop();
				// Go through these in reverse!
				for ( j = popped.openings.length - 1; j >= 0; j-- ) {
					writeElement( { 'type': '/' + popped.openings[j].type }, i );
				}
				for ( j = popped.reopenElements.length - 1; j >= 0; j-- ) {
					writeElement( popped.reopenElements[j], i );
				}
			}
			parentType = openingStack.length > 0 ?
				openingStack[openingStack.length - 1].type : parentNode.getType();
		}
		if ( data[i].type === undefined || data[i].type.charAt( 0 ) !== '/' ) {
			childType = data[i].type || 'text';
			openings = [];
			closings = [];
			reopenElements = [];
			// Opening or content
			// Make sure that opening this element here does not violate the parent/children/content
			// rules. If it does, insert stuff to fix it

			// If this node is content, check that the containing node can contain content. If not,
			// wrap in a paragraph
			if ( ve.dm.nodeFactory.isNodeContent( childType ) &&
				!ve.dm.nodeFactory.canNodeContainContent( parentType )
			) {
				childType = 'paragraph';
				openings.unshift( ve.dm.nodeFactory.getDataElement( childType ) );
			}

			// Check that this node is allowed to have the containing node as its parent. If not,
			// wrap it until it's fixed
			do {
				allowedParents = ve.dm.nodeFactory.getParentNodeTypes( childType );
				parentsOK = allowedParents === null ||
					ve.indexOf( parentType, allowedParents ) !== -1;
				if ( !parentsOK ) {
					// We can't have this as the parent
					if ( allowedParents.length === 0 ) {
						throw new Error( 'Cannot insert ' + childType + ' because it ' +
							' cannot have a parent (at index ' + i + ')' );
					}
					// Open an allowed node around this node
					childType = allowedParents[0];
					openings.unshift( ve.dm.nodeFactory.getDataElement( childType ) );
				}
			} while ( !parentsOK );

			// Check that the containing node can have this node as its child. If not, close nodes
			// until it's fixed
			do {
				allowedChildren = ve.dm.nodeFactory.getChildNodeTypes( parentType );
				childrenOK = allowedChildren === null ||
					ve.indexOf( childType, allowedChildren ) !== -1;
				// Also check if we're trying to insert structure into a node that has to contain
				// content
				childrenOK = childrenOK && !(
					!ve.dm.nodeFactory.isNodeContent( childType ) &&
					ve.dm.nodeFactory.canNodeContainContent( parentType )
				);
				if ( !childrenOK ) {
					// We can't insert this into this parent
					// Close the parent and try one level up
					closings.push( { 'type': '/' + parentType } );
					if ( openingStack.length > 0 ) {
						popped = openingStack.pop();
						parentType = popped.type;
						reopenElements.push( ve.copyObject( popped ) );
						// The opening was on openingStack, so we're closing a node that was opened
						// within data. Don't track that on closingStack
					} else {
						// openingStack is empty, so we're closing a node that was already in the
						// document. This means we have to reopen it later, so track this on
						// closingStack
						closingStack.push( parentNode );
						reopenElements.push( parentNode.getClonedElement() );
						parentNode = parentNode.getParent();
						if ( !parentNode ) {
							throw new Error( 'Cannot insert ' + childType + ' even ' +
								' after closing all containing nodes ' +
								'(at index ' + i + ')' );
						}
						parentType = parentNode.getType();
					}
				}
			} while ( !childrenOK );

			for ( j = 0; j < closings.length; j++ ) {
				// writeElement() would update openingStack/closingStack, but we've already done
				// that for closings
				newData.push( closings[j] );
			}
			for ( j = 0; j < openings.length; j++ ) {
				writeElement( openings[j], i );
			}
			writeElement( data[i], i );
			if ( data[i].type === undefined ) {
				// Special treatment for text nodes
				inTextNode = true;
				if ( openings.length > 0 ) {
					// We wrapped the text node, update parentType
					parentType = childType;
					fixupStack.push( {
						'expectedType': '/text',
						'openings': openings,
						'reopenElements': reopenElements
					} );
				}
				// If we didn't wrap the text node, then the node we're inserting into can have
				// content, so we couldn't have closed anything
			} else {
				fixupStack.push( {
					'expectedType': '/' + data[i].type,
					'openings': openings,
					'reopenElements': reopenElements
				} );
				parentType = data[i].type;
			}
		} else {
			// Closing
			writeElement( data[i], i );
			// TODO don't close fixup stuff if the next thing immediately needs to be fixed up as
			// well; instead, merge the two wrappers
			if (
				fixupStack.length > 0 &&
				fixupStack[fixupStack.length - 1].expectedType === data[i].type
			) {
				popped = fixupStack.pop();
				// Go through these in reverse!
				for ( j = popped.openings.length - 1; j >= 0; j-- ) {
					writeElement( { 'type': '/' + popped.openings[j].type }, i );
				}
				for ( j = popped.reopenElements.length - 1; j >= 0; j-- ) {
					writeElement( popped.reopenElements[j], i );
				}
			}
			parentType = openingStack.length > 0 ?
				openingStack[openingStack.length - 1].type : parentNode.getType();
		}
	}

	if ( inTextNode ) {
		// We're leaving a text node, process fixupStack if needed
		// TODO duplicated code
		if (
			fixupStack.length > 0 &&
			fixupStack[fixupStack.length - 1].expectedType === '/text'
		) {
			popped = fixupStack.pop();
			// Go through these in reverse!
			for ( j = popped.openings.length - 1; j >= 0; j-- ) {
				writeElement( { 'type': '/' + popped.openings[j].type }, i );
			}
			for ( j = popped.reopenElements.length - 1; j >= 0; j-- ) {
				writeElement( popped.reopenElements[j], i );
			}
		}
		parentType = openingStack.length > 0 ?
			openingStack[openingStack.length - 1].type : parentNode.getType();
	}

	// Close unclosed openings
	while ( openingStack.length > 0 ) {
		popped = openingStack[openingStack.length - 1];
		// writeElement() will perform the actual pop() that removes
		// popped from openingStack
		writeElement( { 'type': '/' + popped.type }, i );
	}
	// Re-open closed nodes
	while ( closingStack.length > 0 ) {
		popped = closingStack[closingStack.length - 1];
		// writeElement() will perform the actual pop() that removes
		// popped from closingStack
		writeElement( popped.getClonedElement(), i );
	}

	return newData;
};

/**
 * Get the document data for a range.
 *
 * Data will be fixed up so that unopened closings and unclosed openings in the document data slice
 * are balanced.
 *
 * @returns {ve.dm.DocumentSlice} Balanced slice of linear model data
 */
ve.dm.Document.prototype.getSlice = function ( range ) {
	var first, last, firstNode, lastNode,
		node = this.getNodeFromOffset( range.start ),
		selection = this.selectNodes( range, 'siblings' ),
		addOpenings = [],
		addClosings = [];
	if ( selection.length === 0 ) {
		return new ve.dm.DocumentSlice( [] );
	}
	if ( selection.length === 1 && selection[0].range.equals( range ) ) {
		// Nothing to fix up
		return new ve.dm.DocumentSlice( this.data.slice( range.start, range.end ) );
	}

	first = selection[0];
	last = selection[selection.length - 1];
	firstNode = first.node;
	lastNode = last.node;
	while ( !firstNode.isWrapped() ) {
		firstNode = firstNode.getParent();
	}
	while ( !lastNode.isWrapped() ) {
		lastNode = lastNode.getParent();
	}

	if ( first.range ) {
		while ( true ) {
			while ( !node.isWrapped() ) {
				node = node.getParent();
			}
			addOpenings.push( node.getClonedElement() );
			if ( node === firstNode ) {
				break;
			}
			node = node.getParent();
		}
	}

	node = this.getNodeFromOffset( range.end );
	if ( last !== first && last.range ) {
		while ( true ) {
			while ( !node.isWrapped() ) {
				node = node.getParent();
			}
			addClosings.push( { 'type': '/' + node.getType() } );
			if ( node === lastNode ) {
				break;
			}
			node = node.getParent();
		}
	}

	return new ve.dm.DocumentSlice(
		addOpenings.reverse()
			.concat( this.data.slice( range.start, range.end ) )
			.concat( addClosings ),
		new ve.Range( addOpenings.length, addOpenings.length + range.getLength() )
	);
};
