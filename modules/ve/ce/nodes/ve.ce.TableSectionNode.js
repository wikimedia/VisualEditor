/*!
 * VisualEditor ContentEditable TableSectionNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable table section node.
 *
 * @class
 * @extends ve.ce.BranchNode
 * @constructor
 * @param {ve.dm.TableSectionNode} model Model to observe
 */
ve.ce.TableSectionNode = function VeCeTableSectionNode( model ) {
	// Parent constructor
	ve.ce.BranchNode.call(
		this, model, ve.ce.BranchNode.getDomWrapper( model, 'style' )
	);

	// Events
	this.model.connect( this, { 'update': 'onUpdate' } );
};

/* Inheritance */

ve.inheritClass( ve.ce.TableSectionNode, ve.ce.BranchNode );

/* Static Properties */

ve.ce.TableSectionNode.static.name = 'tableSection';

/**
 * Mapping of list item style values and DOM wrapper element types.
 *
 * @static
 * @property
 */
ve.ce.TableSectionNode.domWrapperElementTypes = {
	'header': 'thead',
	'body': 'tbody',
	'footer': 'tfoot'
};

/* Methods */

/**
 * Handle model update events.
 *
 * If the style changed since last update the DOM wrapper will be replaced with an appropriate one.
 *
 * @method
 */
ve.ce.TableSectionNode.prototype.onUpdate = function () {
	this.updateDomWrapper( 'style' );
};

/* Registration */

ve.ce.nodeFactory.register( ve.ce.TableSectionNode );
