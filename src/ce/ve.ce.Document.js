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
 * Calculate the DOM position corresponding to a DM offset
 *
 * If there are multiple DOM locations, heuristically pick the best one for cursor placement
 *
 * @private
 * @param {number} offset Linear model offset
 * @return {Object} position
 * @return {Node} return.node position node
 * @return {number} return.offset position offset within the node
 * @throws {Error} Offset could not be translated to a DOM element and offset
 */
ve.ce.Document.prototype.getNodeAndOffset = function ( offset ) {
	var branchNode, position, count, step, node, model, steps,
		countedNodes = [],
		found = {};

	// 1. Step with ve.adjacentDomPosition( ..., { stop: function () { return true; } } )
	// until we hit a position at the correct offset (which is guaranteed to be the first
	// such position in document order).
	// 2. Use ve.adjacentDomPosition( ..., { stop: ... } ) once to return all
	// subsequent positions at the same offset.
	// 3. Look at the possible positions and pick as follows:
	//   - If there is a unicorn, return just inside it
	//   - Else if there is a nail, return just outside it
	//   - Else if there is a text node, return an offset in it
	//   - Else return the first matching offset
	//
	// Offsets of DOM nodes are counted to match their model equivalents.
	//
	// TODO: take the following into account:
	// Unfortunately, there is no way to avoid slugless block nodes with no DM length: an
	// IME can remove all the text from a node at a time when it is unsafe to fixup the node
	// contents. In this case, a maximally deep element gives better bounding rectangle
	// coordinates than any of its containers.

	branchNode = this.getBranchNodeFromOffset( offset );
	position = { node: branchNode.$element[ 0 ], offset: 0 };
	count = branchNode.getOffset() + ( ( branchNode.isWrapped() ) ? 1 : 0 );

	function noDescend() {
		return this.classList.contains( 've-ce-branchNode-blockSlug' ) ||
			ve.rejectsCursor( this );
	}

	while ( true ) {
		if ( count === offset ) {
			break;
		}
		position = ve.adjacentDomPosition(
			position,
			1,
			{
				noDescend: noDescend,
				stop: function () { return true; }
			}
		);
		step = position.steps[ 0 ];
		node = step.node;
		if ( node.nodeType === Node.TEXT_NODE ) {
			if ( step.type === 'leave' ) {
				// skip without incrementing
				continue;
			}
			// Else the code below always breaks or skips over the text node;
			// therefore it is guaranteed that step.type === 'enter' (we just
			// stepped in)
			// TODO: what about zero-length text nodes?
			if ( offset <= count + node.data.length ) {
				// match the appropriate offset in the text node
				position = { node: node, offset: offset - count };
				break;
			} else {
				// skip over the text node
				count += node.data.length;
				position = { node: node, offset: node.data.length };
				continue;
			}
		} // else is an element node (TODO: handle comment etc)

		if ( !(
			node.classList.contains( 've-ce-branchNode' ) ||
			node.classList.contains( 've-ce-leafNode' )
		) ) {
			// Nodes like b, inline slug, browser-generated br that doesn't have
			// class ve-ce-leafNode: continue walk without incrementing
			continue;
		}

		if ( step.type === 'leave' ) {
			// Below we'll guarantee that .ve-ce-branchNode/.ve-ce-leafNode elements
			// are only entered if their open/close tags take up a model offset, so
			// we can increment unconditionally here
			count++;
			continue;
		} // else step.type === 'enter' || step.type === 'cross'

		model = $.data( node, 'view' ).model;

		if ( countedNodes.indexOf( model ) !== -1 ) {
			// This DM node is rendered as multiple DOM elements, and we have already
			// counted it as part of an earlier element. Skip past without incrementing
			position = { node: node.parentNode, offset: ve.parentIndex( node ) + 1 };
			continue;
		}
		countedNodes.push( model );
		if ( offset >= count + model.getOuterLength() ) {
			// Offset doesn't lie inside the node. Skip past and count length
			// skip past the whole node
			position = { node: node.parentNode, offset: ve.parentIndex( node ) + 1 };
			count += model.getOuterLength();
		} else if ( step.type === 'cross' ) {
			if ( offset === count + 1 ) {
				// The offset lies inside the crossed node
				position = { node: node, offset: 0 };
				break;
			}
			count += 2;
		} else {
			count += 1;
		}
	}
	// Now "position" is the first DOM position (in document order) at the correct
	// model offset. Find all DOM positions at the same model offset
	found = {};
	function stop( step ) {
		var model;
		if ( step.node.nodeType === Node.TEXT_NODE ) {
			return step.type === 'internal';
		}

		if (
			step.node.classList.contains( 've-ce-branchNode' ) ||
			step.node.classList.contains( 've-ce-leafNode' )
		) {
			model = $.data( step.node, 'view' ).model;
			if ( countedNodes.indexOf( model ) !== -1 ) {
				return false;
			}
			countedNodes.push( model );
			return true;
		}
		return false;
	}
	steps = ve.adjacentDomPosition( position, 1, { stop: stop, noDescend: noDescend } ).steps;
	steps.slice( 0, -1 ).forEach( function ( step ) {
		// Step type cannot be "internal", else the offset would have incremented
		var hasClass = function ( className ) {
			return step.node.nodeType === Node.ELEMENT_NODE &&
				step.node.classList.contains( className );
		};
		found.preUnicorn = found.preUnicorn || ( hasClass( 've-ce-pre-unicorn' ) && step );
		found.postUnicorn = found.postUnicorn || ( hasClass( 've-ce-post-unicorn' ) && step );
		found.preOpenNail = found.preOpenNail || ( hasClass( 've-ce-nail-pre-open' ) && step );
		found.postOpenNail = found.postOpenNail || ( hasClass( 've-ce-nail-post-open' ) && step );
		found.preCloseNail = found.preCloseNail || ( hasClass( 've-ce-nail-pre-close' ) && step );
		found.postCloseNail = found.postCloseNail || ( hasClass( 've-ce-nail-post-close' ) && step );
		found.focusableNode = found.focusableNode || ( hasClass( 've-ce-focusableNode' ) && step );
		found.text = found.text || ( step.node.nodeType === Node.TEXT_NODE && step );
	} );

	// If there is a unicorn, it should be a unique pre/post-Unicorn pair containing text or
	// nothing return the position just inside.
	if ( found.preUnicorn ) {
		return ve.ce.nextCursorOffset( found.preUnicorn.node );
	}
	if ( found.postUnicorn ) {
		return ve.ce.previousCursorOffset( found.postUnicorn.node );
	}

	if ( found.preOpenNail ) {
		// This will also cover the case where there is a post-open nail, as there will
		// be no offset difference between them
		return ve.ce.previousCursorOffset( found.preOpenNail.node );
	}
	if ( found.postCloseNail ) {
		// This will also cover the case where there is a pre-close nail, as there will
		// be no offset difference between them
		return ve.ce.nextCursorOffset( found.postCloseNail.node );
	}
	if ( found.text ) {
		if ( position.node.nodeType === Node.TEXT_NODE ) {
			return position;
		}
		// We must either have entered or left the text node
		return { node: found.text.node, offset: 0 };
	}
	return position;
};

/**
 * Get the block directionality of some range
 *
 * Uses the computed CSS direction value of the current node
 *
 * @method
 * @param {ve.Range} range Range
 * @return {string} 'rtl', 'ltr'
 */
ve.ce.Document.prototype.getDirectionFromRange = function ( range ) {
	var effectiveNode,
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
