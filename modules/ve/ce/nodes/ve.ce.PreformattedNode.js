/**
 * VisualEditor content editable PreformattedNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable node for preformatted content.
 *
 * @class
 * @constructor
 * @extends {ve.ce.BranchNode}
 * @param model {ve.dm.PreformattedNode} Model to observe
 */
ve.ce.PreformattedNode = function ( model ) {
	// Inheritance
	ve.ce.BranchNode.call( this, 'preformatted', model, $( '<pre>' ) );
};

/* Static Members */

/**
 * Node rules.
 *
 * @see ve.ce.NodeFactory
 * @static
 * @member
 */
ve.ce.PreformattedNode.rules = {
	'canBeSplit': true
};

/* Registration */

ve.ce.nodeFactory.register( 'preformatted', ve.ce.PreformattedNode );

/* Inheritance */

ve.extendClass( ve.ce.PreformattedNode, ve.ce.BranchNode );
