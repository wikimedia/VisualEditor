/*!
 * VisualEditor ContentEditable AlignableNode class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * ContentEditable Alignable node.
 *
 * @class
 * @abstract
 * @extends ve.ce.ClassAttributeNode
 *
 * @constructor
 */
ve.ce.AlignableNode = function VeCeAlignableNode() {
	// Parent constructor
	ve.ce.AlignableNode.super.apply( this, arguments );

	this.align = null;
};

/* Inheritance */

OO.inheritClass( ve.ce.AlignableNode, ve.ce.ClassAttributeNode );

/* Events */

/**
 * @event ve.ce.AlignableNode#align
 * @param {string} align New alignment
 */

/**
 * @inheritdoc
 * @fires ve.ce.AlignableNode#align
 */
ve.ce.AlignableNode.prototype.updateAttributeClasses = function () {
	// Parent method
	ve.ce.AlignableNode.super.prototype.updateAttributeClasses.apply( this, arguments );

	const align = this.model.getAttribute( 'align' );
	if ( align && align !== this.align ) {
		this.emit( 'align', align );
		this.align = align;
	}
};
