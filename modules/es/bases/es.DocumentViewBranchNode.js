/**
 * Creates an es.DocumentViewBranchNode object.
 * 
 * @class
 * @constructor
 * @extends {es.DocumentViewNode}
 * @param model {es.ModelNode} Model to observe
 * @param {jQuery} [$element] Element to use as a container
 */
es.DocumentViewBranchNode = function( model, $element, horizontal ) {
	// Inheritance
	es.DocumentViewNode.call( this, model, $element );

	// Properties
	this.horizontal = horizontal || false;
};

/* Methods */

/**
 * Render content.
 * 
 * @method
 */
es.DocumentViewBranchNode.prototype.renderContent = function() {
	for ( var i = 0; i < this.children.length; i++ ) {
		this.children[i].renderContent();
	}
};

/**
 * Draw selection around a given range.
 * 
 * @method
 * @param {es.Range} range Range of content to draw selection around
 */
es.DocumentViewBranchNode.prototype.drawSelection = function( range ) {
	var nodes = this.selectNodes( range, true );
	for ( var i = 0; i < this.children.length; i++ ) {
		if ( nodes.length && this.children[i] === nodes[0].node ) {
			for ( var j = 0; j < nodes.length; j++ ) {
				nodes[j].node.drawSelection( nodes[j].range );
				i++;
			}
		} else {
			this.children[i].clearSelection();
		}
	}
};

/**
 * Clear selection.
 * 
 * @method
 */
es.DocumentViewBranchNode.prototype.clearSelection = function() {
	for ( var i = 0; i < this.children.length; i++ ) {
		this.children[i].clearSelection();
	}
};

/**
 * Gets the nearest offset of a rendered position.
 * 
 * @method
 * @param {es.Position} position Position to get offset for
 * @returns {Integer} Offset of position
 */
es.DocumentViewBranchNode.prototype.getOffsetFromRenderedPosition = function( position ) {
	if ( this.children.length === 0 ) {
		return 0;
	}
	var node = this.children[0];
	for ( var i = 1; i < this.children.length; i++ ) {
		if ( this.horizontal && this.children[i].$.offset().left > position.left ) {
			break;
		} else if ( !this.horizontal && this.children[i].$.offset().top > position.top ) {
			break;			
		}
		node = this.children[i];
	}
	return node.getParent().getOffsetFromNode( node, true ) +
		node.getOffsetFromRenderedPosition( position ) + 1;
};

/**
 * Gets rendered position of offset within content.
 * 
 * @method
 * @param {Integer} offset Offset to get position for
 * @returns {es.Position} Position of offset
 */
es.DocumentViewBranchNode.prototype.getRenderedPositionFromOffset = function( offset, leftBias ) {
	var node = this.getNodeFromOffset( offset, true );
	if ( node !== null ) {
		return node.getRenderedPositionFromOffset(
			offset - this.getOffsetFromNode( node, true ) - 1,
			leftBias
		);
	}
	return null;
};

es.DocumentViewBranchNode.prototype.getRenderedLineRangeFromOffset = function( offset ) {
	var node = this.getNodeFromOffset( offset, true );
	if ( node !== null ) {
		var nodeOffset = this.getOffsetFromNode( node, true );
		return es.Range.newFromTranslatedRange(
			node.getRenderedLineRangeFromOffset( offset - nodeOffset - 1 ),
			nodeOffset + 1
		);
	}
	return null;
};

/* Inheritance */

es.extendClass( es.DocumentViewBranchNode, es.DocumentViewNode );
