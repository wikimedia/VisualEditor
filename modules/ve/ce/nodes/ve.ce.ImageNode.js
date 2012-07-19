/**
 * VisualEditor content editable ImageNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable node for an image.
 *
 * @class
 * @constructor
 * @extends {ve.ce.LeafNode}
 * @param model {ve.dm.ImageNode} Model to observe
 */
ve.ce.ImageNode = function( model ) {
	// Inheritance
	ve.ce.LeafNode.call( this, 'image', model, $( '<img>' ) );

	// DOM Changes
	this.$.addClass( 've-ce-imageNode' );

	// Properties
	this.currentSource = null;

	// Events
	this.model.addListenerMethod( this, 'update', 'onUpdate' );
	/*
	this.$.on('mousedown', function() {
		return false;
	});
	*/

	// Intialization
	this.onUpdate();
};

/* Static Members */

/**
 * Node rules.
 *
 * @see ve.ce.NodeFactory
 * @static
 * @member
 */
ve.ce.ImageNode.rules = {
	'canBeSplit': false
};

/* Methods */

/**
 * Responds to model update events.
 *
 * If the source changed since last update the image's src attribute will be updated accordingly.
 *
 * @method
 */
ve.ce.ImageNode.prototype.onUpdate = function() {
	// TODO needs to support height/width
	var source = this.model.getAttribute( 'html/src' );
	if ( source !== this.currentSource ) {
		this.currentSource = source;
		this.$.attr( 'src', source );
	}
};

/* Registration */

ve.ce.nodeFactory.register( 'image', ve.ce.ImageNode );

/* Inheritance */

ve.extendClass( ve.ce.ImageNode, ve.ce.LeafNode );
