/*!
 * VisualEditor ContentEditable MWMathNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable MediaWiki math node.
 *
 * @class
 * @extends ve.ce.LeafNode
 * @mixins ve.ce.FocusableNode
 * @mixins ve.ce.ProtectedNode
 *
 * @constructor
 * @param {ve.dm.MWMathNode} model Model to observe
 * @param {Object} [config] Config options
 */
ve.ce.MWMathNode = function VeCeMWMathNode( model, config ) {
	// Parent constructor
	ve.ce.LeafNode.call( this, model, config );

	// Mixin constructors
	ve.ce.FocusableNode.call( this );
	ve.ce.ProtectedNode.call( this );

	// Events
	this.model.connect( this, { 'update': 'onUpdate' } );
	this.$.on( 'click', ve.bind( this.onClick, this ) );

	// DOM Changes
	this.$.addClass( 've-ce-mwMathNode' );
	this.$.attr( 'src', model.getAttribute( 'src' ) );
};

/* Inheritance */

ve.inheritClass( ve.ce.MWMathNode, ve.ce.LeafNode );

ve.mixinClass( ve.ce.MWMathNode, ve.ce.FocusableNode );
ve.mixinClass( ve.ce.MWMathNode, ve.ce.ProtectedNode );

/* Static Properties */

ve.ce.MWMathNode.static.name = 'mwMath';

ve.ce.MWMathNode.static.tagName = 'img';

/* Methods */

/**
 * Handle attribute change events.
 *
 * Whitelisted attributes will be added or removed in sync with the DOM. They are initially set in
 * the constructor.
 *
 * @method
 * @param {string} key Attribute key
 * @param {string} from Old value
 * @param {string} to New value
 */
ve.ce.MWMathNode.prototype.onAttributeChange = function ( key, from, to ) {
	if ( from !== to ) {
		if ( key === 'src' ) {
			this.$image.attr( 'src', to );
		}
	}
};

/**
 * Update method
 *
 * @method
 */
ve.ce.MWMathNode.prototype.onUpdate = function () {
};

/**
 * Handle the mouse click.
 *
 * @method
 * @param {jQuery.Event} e Click event
 */
ve.ce.MWMathNode.prototype.onClick = function ( e ) {
	var surfaceModel = this.getRoot().getSurface().getModel(),
		selectionRange = surfaceModel.getSelection(),
		nodeRange = this.model.getOuterRange();

	surfaceModel.getFragment(
		e.shiftKey ?
			ve.Range.newCoveringRange(
				[ selectionRange, nodeRange ], selectionRange.from > nodeRange.from
			) :
			nodeRange
	).select();
};

/* Registration */

ve.ce.nodeFactory.register( ve.ce.MWMathNode );
