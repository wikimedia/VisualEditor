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
};

/* Static Members */

/**
 * @see ve.ce.NodeFactory
 */
ve.ce.HeadingNode.rules = {
	'canHaveChildren': true,
	'canHaveGrandchildren': false,
	'canBeSplit': true
};

ve.ce.HeadingNode.domNodeTypes = {
	'1': 'h1',
	'2': 'h2',
	'3': 'h3',
	'4': 'h4',
	'5': 'h5',
	'6': 'h6'
};

/* Static Methods */

ve.ce.HeadingNode.getDomElement = function( model ) {
	var level = model.getElementAttribute( 'level' ),
		type = ve.ce.HeadingNode.domNodeTypes[level];
	if ( type === undefined ) {
		throw 'Invalid level attribute in heading node model: ' + level;
	}
	return $( '<' + type + '></' + type + '>' );
};

/* Registration */

ve.ce.factory.register( 'heading', ve.ce.HeadingNode );

/* Inheritance */

ve.extendClass( ve.ce.HeadingNode, ve.ce.BranchNode );
