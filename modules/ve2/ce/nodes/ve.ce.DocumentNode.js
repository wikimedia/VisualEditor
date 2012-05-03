/**
 * ContentEditable node for a document.
 * 
 * @class
 * @constructor
 * @extends {ve.ce.BranchNode}
 * @param model {ve.dm.DocumentNode} Model to observe
 */
ve.ce.DocumentNode = function( model ) {
	// Inheritance
	ve.ce.BranchNode.call( this, model );

	// DOM Changes
	this.$.addClass( 've-ce-documentNode' );
	this.$.attr('contentEditable', 'true');
	this.$.attr('spellcheck', 'true');
};

/* Static Members */

/**
 * Node rules.
 * 
 * @see ve.ce.NodeFactory
 * @static
 * @member
 */
ve.ce.DocumentNode.rules = {
	'canHaveChildren': true,
	'canHaveGrandchildren': true,
	'canBeSplit': false
};

/* Methods */

/**
 * Gets the outer length, which for a document node is the same as the inner length.
 * 
 * @method
 * @returns {Integer} Length of the entire node
 */
ve.ce.DocumentNode.prototype.getOuterLength = function() {
	return this.length;
};

/* Registration */

ve.ce.factory.register( 'document', ve.ce.DocumentNode );

/* Inheritance */

ve.extendClass( ve.ce.DocumentNode, ve.ce.BranchNode );
