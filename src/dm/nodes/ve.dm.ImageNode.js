/*!
 * VisualEditor DataModel ImageNode class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel image node.
 *
 * @class
 * @abstract
 * @mixins ve.dm.ResizableNode
 *
 * @constructor
 */
ve.dm.ImageNode = function VeDmImageNode() {
	// Mixin constructor
	ve.dm.ResizableNode.call( this );
};

/* Inheritance */

OO.mixinClass( ve.dm.ImageNode, ve.dm.ResizableNode );

/* Methods */

/**
 * @inheritdoc
 */
ve.dm.ImageNode.prototype.createScalable = function () {
	return new ve.dm.Scalable( {
		currentDimensions: {
			width: this.getAttribute( 'width' ),
			height: this.getAttribute( 'height' )
		},
		minDimensions: {
			width: 1,
			height: 1
		}
	} );
};
