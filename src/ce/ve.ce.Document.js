/*!
 * VisualEditor ContentEditable Document class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
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
	ve.Document.call( this, new ve.ce.DocumentNode(
		model.getDocumentNode(), surface, { $: surface.$ }
	) );

	this.getDocumentNode().$element.attr( {
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
 * Get a node a an offset.
 *
 * @method
 * @param {number} offset Offset to get node at
 * @returns {ve.ce.Node} Node at offset
 */
ve.ce.Document.prototype.getNodeFromOffset = function ( offset ) {
	var node = this.getDocumentNode().getNodeFromOffset( offset );
	if ( node && !node.canHaveChildren() ) {
		node = node.getParent();
	}
	return node;
};

/**
 * Get a slug a an offset.
 *
 * @method
 * @param {number} offset Offset to get slug at
 * @returns {HTMLElement} Slug at offset
 */
ve.ce.Document.prototype.getSlugAtOffset = function ( offset ) {
	var node = this.getNodeFromOffset( offset );
	return node ? node.getSlugAtOffset( offset ) : null;
};

/**
 * Get the nearest word boundary.
 * This method is in CE instead of DM because its behaviour depends on the browser (IE/non-IE) and
 * that information is closer to view layer. (CE)
 *
 * @method
 * @param {number} offset Offset to start from
 * @param {number} [direction] Direction to prefer matching offset in, -1 for left and 1 for right
 * @returns {number} Nearest word boundary
 */
ve.ce.Document.prototype.getSiblingWordBoundary = function ( offset, direction ) {
	var dataString = new ve.dm.DataString( this.model.getData() );
	return unicodeJS.wordbreak.moveBreakOffset( direction, dataString, offset, true );
};

/**
 * Get the relative word or character boundary.
 *
 * This method is in CE instead of DM because it uses information about slugs about which model
 * does not know at all.
 *
 * @method
 * @param {number} offset Offset to start from
 * @param {number} direction Direction to prefer matching offset in, -1 for left and 1 for right
 * @param {string} [unit] Unit [word|character]
 * @returns {number} Relative offset
 */
ve.ce.Document.prototype.getRelativeOffset = function ( offset, direction, unit ) {
	var relativeContentOffset, relativeStructuralOffset, newOffset, adjacentDataOffset, isFocusable,
		data = this.model.data;
	if ( unit === 'word' ) { // word
		// Method getSiblingWordBoundary does not "move/jump" over element data. If passed offset is
		// an element data offset then the same offset is returned - and in such case this method
		// fallback to the other path (character) which does "move/jump" over element data.
		newOffset = this.getSiblingWordBoundary( offset, direction );
		if ( offset === newOffset ) {
			newOffset = this.getRelativeOffset( offset, direction, 'character' );
		}
		return newOffset;
	} else { // character
		// Check if we are adjacent to a focusable node
		adjacentDataOffset = offset + ( direction > 0 ? 0 : -1 );
		if (
			data.isElementData( adjacentDataOffset ) &&
			ve.ce.nodeFactory.isNodeFocusable( data.getType( adjacentDataOffset ) )
		) {
			// We are adjacent to a focusableNode, move inside it
			return offset + direction;
		}
		relativeContentOffset = data.getRelativeContentOffset( offset, direction );
		relativeStructuralOffset = data.getRelativeStructuralOffset( offset, direction, true );
		// Check the structural offset is not in the wrong direction
		if ( ( relativeStructuralOffset - offset < 0 ? -1 : 1 ) !== direction ) {
			relativeStructuralOffset = offset;
		} else {
			isFocusable = ( relativeStructuralOffset - offset < 0 ? -1 : 1 ) === direction &&
				data.isElementData( relativeStructuralOffset + direction ) &&
				ve.ce.nodeFactory.isNodeFocusable( data.getType( relativeStructuralOffset + direction ) );
		}
		// Check if we've moved into a slug or a focusableNode
		if ( isFocusable || this.getSlugAtOffset( relativeStructuralOffset ) ) {
			if ( isFocusable ) {
				relativeStructuralOffset += direction;
			}
			// Check if the relative content offset is in the opposite direction we are trying to go
			if (
				relativeContentOffset === offset ||
				( relativeContentOffset - offset < 0 ? -1 : 1 ) !== direction
			) {
				return relativeStructuralOffset;
			}
			// There's a slug neaby, go into it if it's closer
			return direction > 0 ?
				Math.min( relativeContentOffset, relativeStructuralOffset ) :
				Math.max( relativeContentOffset, relativeStructuralOffset );
		} else {
			// Don't allow the offset to move in the wrong direction
			return direction > 0 ?
				Math.max( relativeContentOffset, offset ) :
				Math.min( relativeContentOffset, offset );
		}
	}
};

/**
 * Get a DOM node and DOM element offset for a document offset.
 *
 * The results of this function are meant to be used with rangy.
 *
 * @method
 * @param {number} offset Linear model offset
 * @returns {Object} Object containing a node and offset property where node is an HTML element and
 * offset is the byte position within the element
 * @throws {Error} Offset could not be translated to a DOM element and offset
 */
ve.ce.Document.prototype.getNodeAndOffset = function ( offset ) {
	var node, startOffset, current, stack, item, $item, length, model,
		countedNodes = [],
		slug = this.getSlugAtOffset( offset );
	if ( slug ) {
		return { node: slug, offset: 0 };
	}
	node = this.getNodeFromOffset( offset );
	startOffset = node.getOffset() + ( ( node.isWrapped() ) ? 1 : 0 );
	current = [node.$element.contents(), 0];
	stack = [current];
	while ( stack.length > 0 ) {
		if ( current[1] >= current[0].length ) {
			stack.pop();
			current = stack[ stack.length - 1 ];
			continue;
		}
		item = current[0][current[1]];
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
			$item = current[0].eq( current[1] );
			if ( $item.hasClass( 've-ce-branchNode-slug' ) ) {
				if ( offset === startOffset ) {
					return {
						node: $item[0],
						offset: 1
					};
				}
			} else if ( $item.is( '.ve-ce-branchNode, .ve-ce-leafNode' ) ) {
				model = $item.data( 'view' ).model;
				// DM nodes can render as multiple elements in the view, so check
				// we haven't already counted it.
				if ( ve.indexOf( model, countedNodes ) === -1 ) {
					length = model.getOuterLength();
					countedNodes.push( model );
					if ( offset >= startOffset && offset < startOffset + length ) {
						stack.push( [$item.contents(), 0] );
						current[1]++;
						current = stack[stack.length - 1];
						continue;
					} else {
						startOffset += length;
					}
				}
			} else {
				stack.push( [$item.contents(), 0] );
				current[1]++;
				current = stack[stack.length - 1];
				continue;
			}
		}
		current[1]++;
	}
	throw new Error( 'Offset could not be translated to a DOM element and offset: ' + offset );
};

/**
 * Get the nearest focusable node.
 *
 * @method
 * @param {number} offset Offset to start looking at
 * @param {number} direction Direction to look in, +1 or -1
 * @param {number} limit Stop looking after reaching certain offset
 */
ve.ce.Document.prototype.getNearestFocusableNode = function ( offset, direction, limit ) {
	// It is never an offset of the node, but just an offset for which getNodeFromOffset should
	// return that node. Usually it would be node offset + 1 or offset of node closing tag.
	var coveredOffset;
	this.model.data.getRelativeOffset(
		offset,
		direction === 1 ? 0 : -1,
		function ( index, limit ) {
			// Our result must be between offset and limit
			if ( index >= Math.max( offset, limit ) || index < Math.min( offset, limit ) ) {
				return true;
			}
			if (
				this.isOpenElementData( index ) &&
				ve.ce.nodeFactory.isNodeFocusable( this.getType( index ) )
			) {
				coveredOffset = index + 1;
				return true;
			}
			if (
				this.isCloseElementData( index ) &&
				ve.ce.nodeFactory.isNodeFocusable( this.getType( index ) )
			) {
				coveredOffset = index;
				return true;
			}
		},
		limit
	);
	if ( coveredOffset ) {
		return this.getDocumentNode().getNodeFromOffset( coveredOffset );
	} else {
		return null;
	}
};

/**
 * Get the relative range.
 *
 * @method
 * @param {ve.Range} range Input range
 * @param {number} direction Direction to look in, +1 or -1
 * @param {string} unit Unit [word|character]
 * @param {boolean} expand Expanding range
 * @returns {ve.Range} Relative range
 */
ve.ce.Document.prototype.getRelativeRange = function ( range, direction, unit, expand ) {
	var contentOrSlugOffset,
		focusableNode,
		newOffset,
		newRange,
		to = range.to;

	// If you have a non-collapsed range and you move, collapse to the end
	// in the direction you moved, provided you end up at a content or slug offset
	if ( !range.isCollapsed() && !expand ) {
		newOffset = direction > 0 ? range.end : range.start;
		if ( this.model.data.isContentOffset( newOffset ) || this.getSlugAtOffset( newOffset ) ) {
			return new ve.Range( newOffset );
		} else {
			to = newOffset;
		}
	}

	contentOrSlugOffset = this.getRelativeOffset( to, direction, unit );

	focusableNode = this.getNearestFocusableNode( to, direction, contentOrSlugOffset );
	if ( focusableNode ) {
		newRange = focusableNode.getOuterRange( direction === -1 );
	} else {
		newRange = new ve.Range( contentOrSlugOffset );
	}
	if ( expand ) {
		return new ve.Range( range.from, newRange.to );
	} else {
		return newRange;
	}
};

/**
 * Get the directionality of some range.
 *
 * @method
 * @param {ve.Range} range Selection range
 * @returns {string} 'rtl' or 'ltr' as response
 */
ve.ce.Document.prototype.getDirectionFromRange = function ( range ) {
	var effectiveNode,
		selectedNodes = this.selectNodes( range, 'covered' );

	if ( selectedNodes.length > 1 ) {
		// Selection of multiple nodes
		// Get the common parent node
		effectiveNode = this.selectNodes( range, 'siblings' )[0].node.getParent();
	} else {
		// selection of a single node
		effectiveNode = selectedNodes[0].node;

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
