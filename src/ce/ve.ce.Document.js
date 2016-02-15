/*!
 * VisualEditor ContentEditable Document class.
 *
 * @copyright 2011-2016 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * ContentEditable document.
 *
 * @class
 * @extends ve.Document
 *
 * @constructor
 * @param {ve.dm.Document} model Model to observe
 * @param {ve.ce.Surface} surface Surface document is part of
 */
ve.ce.Document = function VeCeDocument( model, surface ) {
	// Parent constructor
	ve.Document.call( this, new ve.ce.DocumentNode( model.getDocumentNode(), surface ) );

	this.getDocumentNode().$element.prop( {
		lang: model.getLang(),
		dir: model.getDir()
	} );

	// Properties
	this.model = model;
};

/* Inheritance */

OO.inheritClass( ve.ce.Document, ve.Document );

/* Methods */

/**
 * Get a slug at an offset.
 *
 * @method
 * @param {number} offset Offset to get slug at
 * @return {HTMLElement} Slug at offset
 */
ve.ce.Document.prototype.getSlugAtOffset = function ( offset ) {
	var node = this.getBranchNodeFromOffset( offset );
	return node ? node.getSlugAtOffset( offset ) : null;
};

/**
 * Calculate the DOM location corresponding to a DM offset
 *
 * @param {number} offset Linear model offset
 * @param {boolean} outsideNail Whether to jump outside nails if directly next to them
 * @return {Object} DOM location
 * @return {Node} return.node location node
 * @return {number} return.offset location offset within the node
 * @throws {Error} Offset could not be translated to a DOM element and offset
 */
ve.ce.Document.prototype.getNodeAndOffset = function ( offset, outsideNail ) {
	var nao, currentNode, nextLeaf, previousLeaf;
	// Get the un-unicorn-adjusted result. If it is:
	// - just before pre unicorn (in same branch node), return cursor location just after it
	// - just after post unicorn (in same branch node), return cursor location just before it
	// - anywhere else, return the result unmodified

	/**
	 * Get the DOM leaf between current and adjacent cursor positions in a .ve-ce-branchNode
	 *
	 * @param {number} direction 1 for forwards, -1 for backwards
	 * @param {Node} node The position node
	 * @param {number} [offset] The position offset; defaults to leading edge inside node
	 * @return {Node|null} DOM leaf, if it exists
	 */
	function getAdjacentLeaf( direction, node, offset ) {
		var interior,
			isText = ( node.nodeType === Node.TEXT_NODE ),
			back = direction < 0;

		if ( offset === undefined ) {
			offset = back ? 0 : ( isText ? node.data : node.childNodes ).length;
		}
		if ( back ) {
			interior = offset > 0;
		} else {
			interior = offset < ( isText ? node.data : node.childNodes ).length;
		}

		if ( isText && interior ) {
			// There is only text adjacent to the position
			return null;
		}

		if ( interior ) {
			node = node.childNodes[ back ? offset - 1 : offset ];
		} else {
			// We're at the node boundary; step parent-wards until there is a
			// previous sibling, then step to that
			while ( ( back ? node.previousSibling : node.nextSibling ) === null ) {
				node = node.parentNode;
				if ( !node || node.classList.contains( 've-ce-branchNode' ) ) {
					return null;
				}
			}
			node = ( back ? node.previousSibling : node.nextSibling );
		}

		// step child-wards until we hit a leaf
		while ( node.firstChild ) {
			node = back ? node.lastChild : node.firstChild;
		}
		return node;
	}

	nao = this.getNodeAndOffsetUnadjustedForUnicorn( offset );
	currentNode = nao.node;
	previousLeaf = getAdjacentLeaf( -1, nao.node, nao.offset );
	nextLeaf = getAdjacentLeaf( 1, nao.node, nao.offset );

	// Adjust for unicorn or nails if necessary, then return
	if (
		nextLeaf &&
		nextLeaf.nodeType === Node.ELEMENT_NODE &&
		nextLeaf.classList.contains( 've-ce-pre-unicorn' )
	) {
		// At offset just before the pre unicorn; return the point just after it
		return ve.ce.nextCursorOffset( nextLeaf );
	}
	if (
		previousLeaf &&
		previousLeaf.nodeType === Node.ELEMENT_NODE &&
		previousLeaf.classList.contains( 've-ce-post-unicorn' )
	) {
		// At text offset or slug just after the post unicorn; return the point just before it
		return ve.ce.previousCursorOffset( previousLeaf );
	}

	if ( outsideNail ) {
		if (
			nao.offset === currentNode.length &&
			nextLeaf &&
			nextLeaf.nodeType === Node.ELEMENT_NODE &&
			nextLeaf.classList.contains( 've-ce-nail-pre-close' )
		) {
			// Being outside the nails requested and right next to the ending nail: jump outside
			return ve.ce.nextCursorOffset( getAdjacentLeaf( 1, nextLeaf ) );
		}
		if (
			nao.offset === 0 &&
			previousLeaf &&
			previousLeaf.nodeType === Node.ELEMENT_NODE &&
			previousLeaf.classList.contains( 've-ce-nail-post-open' )
		) {
			// Being outside the nails requested and right next to the starting nail: jump outside
			return ve.ce.previousCursorOffset( getAdjacentLeaf( -1, previousLeaf ) );
		}
	}

	return nao;
};

/**
 * Calculate the DOM location corresponding to a DM offset (without unicorn adjustments)
 *
 * @private
 * @param {number} offset Linear model offset
 * @return {Object} location
 * @return {Node} return.node location node
 * @return {number} return.offset location offset within the node
 */
ve.ce.Document.prototype.getNodeAndOffsetUnadjustedForUnicorn = function ( offset ) {
	var node, startOffset, current, stack, item, $item, length, model,
		countedNodes = [],
		slug = this.getSlugAtOffset( offset );

	// If we're a block slug, or an empty inline slug, return its location
	// Start at the current branch node; get its start offset
	// Walk the tree, summing offsets until the sum reaches the desired offset value.
	// If the desired offset:
	// - is after a ve-ce-branchNode/ve-ce-leafNode: skip the node
	// - is inside a ve-ce-branchNode/ve-ce-leafNode: descend into node
	// - is between an empty unicorn pair: return inter-unicorn location
	// At the desired offset:
	// - If is a text node: return that node and the correct remainder offset
	// - Else return the first maximally deep element at the offset
	// Otherwise, signal an error

	// Unfortunately, there is no way to avoid slugless block nodes with no DM length: an
	// IME can remove all the text from a node at a time when it is unsafe to fixup the node
	// contents. In this case, a maximally deep element gives better bounding rectangle
	// coordinates than any of its containers.

	// Check for a slug that is empty (apart from a chimera) or a block slug
	// TODO: remove this check: it can just be a case of non-branchNode/leafNode DOM element
	if ( slug && (
		!slug.firstChild ||
		$( slug ).hasClass( 've-ce-branchNode-blockSlug' ) ||
		$( slug.firstChild ).hasClass( 've-ce-chimera' )
	) ) {
		return { node: slug, offset: 0 };
	}
	node = this.getBranchNodeFromOffset( offset );
	startOffset = node.getOffset() + ( ( node.isWrapped() ) ? 1 : 0 );
	current = { $contents: node.$element.contents(), offset: 0 };
	stack = [ current ];
	while ( stack.length > 0 ) {
		if ( current.offset >= current.$contents.length ) {
			stack.pop();
			current = stack[ stack.length - 1 ];
			if ( current && startOffset === offset ) {
				// The current node has no DOM children and no DM length (e.g.
				// it is a browser-generated <br/> that doesn't have class
				// ve-ce-leafNode), but the node itself is at the required DM
				// offset. Return the first offset inside this node (even if
				// it's a node type that cannot contain content, like br).
				return { node: current.$contents[ current.offset - 1 ], offset: 0 };
			}
			continue;
		}
		item = current.$contents[ current.offset ];
		if ( item.nodeType === Node.TEXT_NODE ) {
			length = item.textContent.length;
			if ( offset >= startOffset && offset <= startOffset + length ) {
				return {
					node: item,
					offset: offset - startOffset
				};
			} else {
				startOffset += length;
			}
		} else if ( item.nodeType === Node.ELEMENT_NODE ) {
			$item = current.$contents.eq( current.offset );
			if ( $item.hasClass( 've-ce-unicorn' ) ) {
				if ( offset === startOffset ) {
					// Return if empty unicorn pair at the correct offset
					if ( $( $item[ 0 ].previousSibling ).hasClass( 've-ce-unicorn' ) ) {
						return {
							node: $item[ 0 ].parentNode,
							offset: current.offset - 1
						};
					} else if ( $( $item[ 0 ].nextSibling ).hasClass( 've-ce-unicorn' ) ) {
						return {
							node: $item[ 0 ].parentNode,
							offset: current.offset + 1
						};
					}
					// Else algorithm will/did descend into unicorned range
				}
				// Else algorithm will skip this unicorn
			} else if ( $item.is( '.ve-ce-branchNode, .ve-ce-leafNode' ) ) {
				model = $item.data( 'view' ).model;
				// DM nodes can render as multiple elements in the view, so check
				// we haven't already counted it.
				if ( countedNodes.indexOf( model ) === -1 ) {
					length = model.getOuterLength();
					countedNodes.push( model );
					if ( offset >= startOffset && offset < startOffset + length ) {
						stack.push( { $contents: $item.contents(), offset: 0 } );
						current.offset++;
						current = stack[ stack.length - 1 ];
						continue;
					} else {
						startOffset += length;
					}
				}
			} else if ( $item.hasClass( 've-ce-branchNode-blockSlug' ) ) {
				// This is unusual: generated wrappers usually mean that the return
				// value of getBranchNodeFromOffset will not have block slugs or
				// block slug ancestors before the offset position. However, there
				// are some counterexamples; e.g., if the DM offset is just before
				// the internalList then the start node will be the document node.
				//
				// Skip contents without incrementing offset.
				current.offset++;
				continue;
			} else if ( $item.hasClass( 've-ce-nail' ) ) {
				// Skip contents without incrementing offset.
				current.offset++;
				continue;
			} else {
				// Any other node type (e.g. b, inline slug, browser-generated br
				// that doesn't have class ve-ce-leafNode): descend
				stack.push( { $contents: $item.contents(), offset: 0 } );
				current.offset++;
				current = stack[ stack.length - 1 ];
				continue;
			}
		}
		current.offset++;
	}
	throw new Error( 'Offset could not be translated to a DOM element and offset: ' + offset );
};

/**
 * Get the directionality of some selection.
 *
 * Uses the computed CSS direction value of the current node, or the model's
 * directionality if the selection is null.
 *
 * @method
 * @param {ve.dm.Selection} selection Selection
 * @return {string} 'rtl', 'ltr'
 */
ve.ce.Document.prototype.getDirectionFromSelection = function ( selection ) {
	var effectiveNode, range, selectedNodes;

	if ( selection instanceof ve.dm.LinearSelection ) {
		range = selection.getRange();
	} else if ( selection instanceof ve.dm.TableSelection ) {
		range = selection.tableRange;
	} else {
		return this.model.getDir();
	}

	selectedNodes = this.selectNodes( range, 'covered' );

	if ( selectedNodes.length > 1 ) {
		// Selection of multiple nodes
		// Get the common parent node
		effectiveNode = this.selectNodes( range, 'siblings' )[ 0 ].node.getParent();
	} else {
		// selection of a single node
		effectiveNode = selectedNodes[ 0 ].node;

		while ( effectiveNode.isContent() ) {
			// This means that we're in a leaf node, like TextNode
			// those don't read the directionality properly, we will
			// have to climb up the parentage chain until we find a
			// wrapping node like paragraph or list item, etc.
			effectiveNode = effectiveNode.parent;
		}
	}

	return effectiveNode.$element.css( 'direction' );
};
