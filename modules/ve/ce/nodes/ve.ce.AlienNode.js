/*!
 * VisualEditor ContentEditable AlienNode, AlienBlockNode and AlienInlineNode classes.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable alien node.
 *
 * @class
 * @abstract
 * @extends ve.ce.GeneratedContentNode
 * @mixins ve.ce.ProtectedNode
 *
 * @constructor
 * @param {ve.dm.AlienNode} model Model to observe
 */
ve.ce.AlienNode = function VeCeAlienNode( model ) {
	// Parent constructor
	ve.ce.GeneratedContentNode.call( this, model );

	// Mixin constructors
	ve.ce.ProtectedNode.call( this );

	// Intitialization
	this.$.addClass( 've-ce-alienNode' );
};

/* Inheritance */

ve.inheritClass( ve.ce.AlienNode, ve.ce.GeneratedContentNode );

ve.mixinClass( ve.ce.AlienNode, ve.ce.ProtectedNode );

/* Static Properties */

ve.ce.AlienNode.static.name = 'alien';

ve.ce.AlienNode.static.$phantomTemplate = ve.ce.AlienNode.static.$phantomTemplate.clone()
	.addClass( 've-ce-alienNode-phantom' )
	.attr( 'title', ve.msg( 'visualeditor-aliennode-tooltip' ) );

/* Methods */

/**
 * Handle update events.
 *
 * @method
 */
ve.ce.AlienNode.prototype.onUpdate = function () {
	this.$.html( ve.copyArray( this.model.getAttribute( 'domElements' ) || [] ) );
};

/* Concrete subclasses */

/**
 * ContentEditable alien block node.
 *
 * @class
 * @extends ve.ce.AlienNode
 * @constructor
 * @param {ve.dm.AlienBlockNode} model Model to observe
 */
ve.ce.AlienBlockNode = function VeCeAlienBlockNode( model ) {
	// Parent constructor
	ve.ce.AlienNode.call( this, model );

	// DOM Changes
	this.$.addClass( 've-ce-alienBlockNode' );
};

/* Inheritance */

ve.inheritClass( ve.ce.AlienBlockNode, ve.ce.AlienNode );

/* Static Properties */

ve.ce.AlienBlockNode.static.name = 'alienBlock';

/**
 * ContentEditable alien inline node.
 *
 * @class
 * @extends ve.ce.AlienNode
 * @constructor
 * @param {ve.dm.AlienInlineNode} model Model to observe
 */
ve.ce.AlienInlineNode = function VeCeAlienInlineNode( model ) {
	// Parent constructor
	ve.ce.AlienNode.call( this, model );

	// DOM Changes
	this.$.addClass( 've-ce-alienInlineNode' );
};

/* Inheritance */

ve.inheritClass( ve.ce.AlienInlineNode, ve.ce.AlienNode );

/* Static Properties */

ve.ce.AlienInlineNode.static.name = 'alienInline';

/* Registration */

ve.ce.nodeFactory.register( ve.ce.AlienNode );
ve.ce.nodeFactory.register( ve.ce.AlienBlockNode );
ve.ce.nodeFactory.register( ve.ce.AlienInlineNode );
