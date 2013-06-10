/*!
 * VisualEditor ContentEditable MWEntityNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable MediaWiki image node.
 *
 * @class
 * @extends ve.ce.LeafNode
 *
 * @constructor
 * @param {ve.dm.MWInlineImageNode} model Model to observe
 * @param {Object} [config] Config options
 */
ve.ce.MWInlineImageNode = function VeCeMWInlineImageNode( model, config ) {
	var valign;

	// Parent constructor
	ve.ce.LeafNode.call( this, model, config );

	if ( this.model.getAttribute( 'isLinked' ) ) {
		this.$ = this.$$( '<a>' ).addClass( 'image' );
		this.$image = this.$$( '<img>' ).appendTo( this.$ );
	} else {
		this.$ = this.$$( '<img>' );
		this.$image = this.$;
	}

	// Mixin constructors
	ve.ce.ProtectedNode.call( this );
	ve.ce.FocusableNode.call( this );

	this.$image
		.attr( 'src', this.model.getAttribute( 'src' ) )
		.attr( 'width', this.model.getAttribute( 'width' ) )
		.attr( 'height', this.model.getAttribute( 'height' ) );

	if ( this.model.getAttribute( 'border' ) ) {
		this.$image.addClass( 'thumbborder' );
	}

	valign = this.model.getAttribute( 'valign' );
	if ( valign !== 'default' ) {
		this.$image.css( 'vertical-align', valign );
	}

	// DOM changes
	this.$.addClass( 've-ce-mwInlineImageNode' );
};

/* Inheritance */

ve.inheritClass( ve.ce.MWInlineImageNode, ve.ce.LeafNode );

ve.mixinClass( ve.ce.MWInlineImageNode, ve.ce.ProtectedNode );

ve.mixinClass( ve.ce.MWInlineImageNode, ve.ce.FocusableNode );

/* Static Properties */

ve.ce.MWInlineImageNode.static.name = 'mwInlineImage';

ve.ce.MWInlineImageNode.static.tagName = 'img';

/* Registration */

ve.ce.nodeFactory.register( ve.ce.MWInlineImageNode );
