/**
 * VisualEditor content editable TableNode class.
 * 
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable node for a table.
 *
 * @class
 * @constructor
 * @extends {ve.ce.BranchNode}
 * @param model {ve.dm.TableNode} Model to observe
 */
ve.ce.TableNode = function( model ) {
	// Inheritance
	ve.ce.BranchNode.call( this, 'table', model, $( '<table border="1" cellpadding="5" cellspacing="5"></table>' ) );
};

/* Static Members */

/**
 * Node rules.
 *
 * @see ve.ce.NodeFactory
 * @static
 * @member
 */
ve.ce.TableNode.rules = {
	'canBeSplit': false
};

/* Registration */

ve.ce.nodeFactory.register( 'table', ve.ce.TableNode );

/* Inheritance */

ve.extendClass( ve.ce.TableNode, ve.ce.BranchNode );
