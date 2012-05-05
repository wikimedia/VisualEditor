/**
 * ContentEditable node for a heading.
 * 
 * @class
 * @constructor
 * @extends {ve.ce.BranchNode}
 * @param model {ve.dm.HeadingNode} Model to observe
 */
ve.ce.HeadingNode = function( model ) {
	// Inheritance
	ve.ce.BranchNode.call(
		this, 'heading', model, ve.ce.BranchNode.getDomWrapper( model, 'level' )
	);

	// Events
	this.model.addListenerMethod( this, 'update', 'onUpdate' );
};

/* Static Members */

/**
 * Node rules.
 * 
 * @see ve.ce.NodeFactory
 * @static
 * @member
 */
ve.ce.HeadingNode.rules = {
	'canHaveChildren': true,
	'canHaveGrandchildren': false,
	'canBeSplit': true
};

/**
 * Mapping of heading level values and DOM wrapper element types.
 * 
 * @static
 * @member
 */
ve.ce.HeadingNode.domWrapperElementTypes = {
	'1': 'h1',
	'2': 'h2',
	'3': 'h3',
	'4': 'h4',
	'5': 'h5',
	'6': 'h6'
};

/* Methods */

/**
 * Responds to model update events.
 * 
 * If the level changed since last update the DOM wrapper will be replaced with an appropriate one.
 * 
 * @method
 */
ve.ce.HeadingNode.prototype.onUpdate = function() {
	this.updateDomWrapper( 'level' );
};

/* Registration */

ve.ce.factory.register( 'heading', ve.ce.HeadingNode );

/* Inheritance */

ve.extendClass( ve.ce.HeadingNode, ve.ce.BranchNode );
