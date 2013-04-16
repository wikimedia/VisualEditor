/*!
 * VisualEditor ContentEditable Document class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable document.
 *
 * @class
 * @extends ve.Document
 * @constructor
 * @param {ve.dm.Document} model Model to observe
 */
ve.ce.Document = function VeCeDocument( model, surface ) {
	// Parent constructor
	ve.Document.call( this, new ve.ce.DocumentNode( model.getDocumentNode(), surface ) );

	// Properties
	this.model = model;
};

/* Inheritance */

ve.inheritClass( ve.ce.Document, ve.Document );

/* Methods */

/**
 * Get a node a an offset.
 *
 * @method
 * @param {number} offset Offset to get node at
 * @returns {ve.ce.Node} Node at offset
 */
ve.ce.Document.prototype.getNodeFromOffset = function ( offset ) {
	var node = this.documentNode.getNodeFromOffset( offset );
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
 * @returns {jQuery} Slug at offset
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
 * This method is in CE instead of DM because it uses information about slugs about which model
 * does not know at all.
 *
 * @method
 * @param {number} offset Offset to start from
 * @param {number} [direction] Direction to prefer matching offset in, -1 for left and 1 for right
 * @param {string} [unit] Unit [word|character]
 * @returns {number} Relative offset
 */
ve.ce.Document.prototype.getRelativeOffset = function ( offset, direction, unit ) {
	var bias, relativeContentOffset, relativeStructuralOffset, newOffset;
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
		bias = direction > 0 ? 1 : -1;
		relativeContentOffset = this.model.data.getRelativeContentOffset( offset, direction );
		relativeStructuralOffset = this.model.data.getRelativeStructuralOffset( offset + bias, direction, true );
		// Check if we've moved into a slug
		if ( !!this.getSlugAtOffset( relativeStructuralOffset ) ) {
			// Check if the relative content offset is in the opposite direction we are trying to go
			if (
				relativeContentOffset === offset ||
				( relativeContentOffset - offset < 0 ? -1 : 1 ) !== bias
			) {
				// There's nothing past the slug we are already in, stay in it
				return relativeStructuralOffset;
			}
			// There's a slug neaby, go into it if it's closer
			return direction > 0 ?
				Math.min( relativeContentOffset, relativeStructuralOffset ) :
				Math.max( relativeContentOffset, relativeStructuralOffset );
		} else {
			return relativeContentOffset;
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
 * offset is the position within the element
 * @throws {Error} Offset could not be translated to a DOM element and offset
 */
ve.ce.Document.prototype.getNodeAndOffset = function ( offset ) {
	var node, startOffset, current, stack, item, $item, length,
		$slug = this.getSlugAtOffset( offset );
	if ( $slug ) {
		return { node: $slug[0].childNodes[0], offset: 0 };
	}
	node = this.getNodeFromOffset( offset );
	startOffset = this.getDocumentNode().getOffsetFromNode( node ) + ( ( node.isWrapped() ) ? 1 : 0 );
	current = [node.$.contents(), 0];
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
			if ( $item.hasClass('ve-ce-slug') ) {
				if ( offset === startOffset ) {
					return {
						node: $item[0],
						offset: 1
					};
				}
			} else if ( $item.is( '.ve-ce-branchNode, .ve-ce-leafNode' ) ) {
				length = $item.data( 'view' ).model.getOuterLength();
				if ( offset >= startOffset && offset < startOffset + length ) {
					stack.push( [$item.contents(), 0] );
					current[1]++;
					current = stack[stack.length-1];
					continue;
				} else {
					startOffset += length;
				}
			} else {
				stack.push( [$item.contents(), 0] );
				current[1]++;
				current = stack[stack.length-1];
				continue;
			}
		}
		current[1]++;
	}
	throw new Error( 'Offset could not be translated to a DOM element and offset: ' + offset );
};
