/**
 * VisualEditor content editable AlienInlineNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable node for an alien inline node.
 *
 * @class
 * @constructor
 * @extends {ve.ce.LeafNode}
 * @param {ve.dm.AlienInlineNode} model Model to observe.
 */
ve.ce.AlienInlineNode = function VeCeAlienInlineNode( model ) {
	// Parent constructor
	ve.ce.LeafNode.call( this, 'alienInline', model );

	// DOM Changes
	this.$.addClass( 've-ce-alienInlineNode' );
	this.$.attr( 'contenteditable', false );

	// Events
	this.model.addListenerMethod( this, 'update', 'onUpdate' );
	this.$.on( 'mouseenter', ve.bind( this.onMouseEnter, this ) );

	// Initialization
	this.onUpdate();
};

/* Inheritance */

ve.inheritClass( ve.ce.AlienInlineNode, ve.ce.LeafNode );

/* Static Members */

/**
 * Node rules.
 *
 * @see ve.ce.NodeFactory
 * @static
 * @member
 */
ve.ce.AlienInlineNode.rules = {
	'canBeSplit': false
};

/* Methods */

ve.ce.AlienInlineNode.prototype.onUpdate = function () {
	this.$.html( this.model.getAttribute( 'html' ) );
};

ve.ce.AlienInlineNode.prototype.onMouseEnter = function () {
	var	$phantom = ve.ce.Surface.static.$phantomTemplate.clone(),
		offset = this.$.offset();
	$phantom.css( {
		'top': offset.top,
		'left': offset.left,
		'height': this.$.height(),
		'width': this.$.width()
	} );
	this.root.getSurface().$phantoms.empty().append( $phantom );
};

/* Registration */

ve.ce.nodeFactory.register( 'alienInline', ve.ce.AlienInlineNode );
