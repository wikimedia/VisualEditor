/*!
 * VisualEditor ContentEditable TableCellNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable table cell node.
 *
 * @class
 * @extends ve.ce.BranchNode
 * @constructor
 * @param {ve.dm.TableCellNode} model Model to observe
 */
ve.ce.TableCellNode = function VeCeTableCellNode( model ) {
	// Parent constructor
	ve.ce.BranchNode.call(
		this, model, ve.ce.BranchNode.getDomWrapper( model, 'style' )
	);

	// Events
	this.model.connect( this, { 'update': 'onUpdate' } );
};

/* Inheritance */

ve.inheritClass( ve.ce.TableCellNode, ve.ce.BranchNode );

/* Static Properties */

ve.ce.TableCellNode.static.name = 'tableCell';

/**
 * Mapping of list item style values and DOM wrapper element types.
 *
 * @static
 * @property
 */
ve.ce.TableCellNode.domWrapperElementTypes = {
	'data': 'td',
	'header': 'th'
};

/* Methods */

/**
 * Handle model update events.
 *
 * If the style changed since last update the DOM wrapper will be replaced with an appropriate one.
 *
 * @method
 */
ve.ce.TableCellNode.prototype.onUpdate = function () {
	this.updateDomWrapper( 'style' );
};

/* Registration */

ve.ce.nodeFactory.register( ve.ce.TableCellNode );
