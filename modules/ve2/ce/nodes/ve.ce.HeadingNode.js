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
	ve.ce.BranchNode.call( this, model, ve.ce.HeadingNode.getDomElement( model ) );

	// Properties
	this.currentLevel = model.getAttribute( 'level' );

	// Events
	this.model.addListenerMethod( 'update', this, 'onUpdate' );
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

/* Static Methods */

/**
 * Gets an appropriate DOM wrapper for the model.
 * 
 * This method is static because it is used before the node is fully constructed. Before all parent
 * constructors are called this.model may not be ready to be used.
 * 
 * @static
 * @method
 * @param {ve.dm.HeadingNode} model Model to create DOM wrapper for
 * @returns {jQuery} Selection containing DOM wrapper
 */
ve.ce.HeadingNode.getDomWrapper = function( model ) {
	var level = model.getAttribute( 'level' ),
		type = ve.ce.HeadingNode.domWrapperElementTypes[level];
	if ( type === undefined ) {
		throw 'Invalid level attribute in heading node model: ' + level;
	}
	return $( '<' + type + '></' + type + '>' );
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
	var level = this.model.getAttribute( 'level' );
	if ( level !== this.currentLevel ) {
		this.currentLevel = level;
		this.replaceDomWrapper( ve.ce.HeadingNode.getDomWrapper( this.model ) );
	}
};

/* Registration */

ve.ce.factory.register( 'heading', ve.ce.HeadingNode );

/* Inheritance */

ve.extendClass( ve.ce.HeadingNode, ve.ce.BranchNode );
