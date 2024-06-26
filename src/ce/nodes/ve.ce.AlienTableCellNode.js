/*!
 * VisualEditor ContentEditable AlienTableCellNode class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * ContentEditable alien table cell node.
 *
 * @class
 * @extends ve.ce.AlienNode
 *
 * @constructor
 * @param {ve.dm.AlienTableCellNode} model
 * @param {Object} [config]
 */
ve.ce.AlienTableCellNode = function VeCeAlienTableCellNode() {
	// Parent constructor
	ve.ce.AlienTableCellNode.super.apply( this, arguments );

	// Mixin constructors
	ve.ce.TableCellableNode.call( this );
};

/* Inheritance */

OO.inheritClass( ve.ce.AlienTableCellNode, ve.ce.AlienNode );

OO.mixinClass( ve.ce.AlienTableCellNode, ve.ce.TableCellableNode );

/* Static Properties */

ve.ce.AlienTableCellNode.static.name = 'alienTableCell';

/* Methods */

ve.ce.AlienTableCellNode.prototype.getTagName = function () {
	// alienTableCells have no style attribute. Give them a table
	// cell to start with, although it will get overwritten with
	// originalDomElements.
	return 'td';
};

/* Registration */

ve.ce.nodeFactory.register( ve.ce.AlienTableCellNode );
