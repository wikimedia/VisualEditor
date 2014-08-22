/*!
 * VisualEditor ContentEditable block image node class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable block image node.
 *
 * @class
 * @extends ve.ce.BranchNode
 * @mixins ve.ce.FocusableNode
 * @mixins ve.ce.ResizableNode
 *
 * @constructor
 * @param {ve.dm.BlockImageNode} model Model to observe
 * @param {Object} [config] Configuration options
 */
ve.ce.BlockImageNode = function VeCeBlockImageNode( model, config ) {
	config = ve.extendObject( {
		minDimensions: { width: 1, height: 1 }
	}, config );

	// Parent constructor
	ve.ce.BranchNode.call( this, model, config );

	// Build DOM
	this.$image = this.$( '<img>' )
		.attr( 'src', this.getResolvedAttribute( 'src' ) )
		.prependTo( this.$element );

	// Mixin constructors
	ve.ce.FocusableNode.call( this );
	ve.ce.ResizableNode.call( this, this.$image, config );

	// Events
	this.$image.on( 'load', ve.bind( this.onLoad, this ) );
	this.model.connect( this, { attributeChange: 'onAttributeChange' } );

	// Initialization
	this.$element.addClass( 've-ce-imageNode' );
	this.$image
		.attr( {
			alt: this.model.getAttribute( 'alt' ),
			src: this.getResolvedAttribute( 'src' )
		} )
		.css( {
			width: this.model.getAttribute( 'width' ),
			height: this.model.getAttribute( 'height' )
		} );
};

/* Inheritance */

OO.inheritClass( ve.ce.BlockImageNode, ve.ce.BranchNode );

OO.mixinClass( ve.ce.BlockImageNode, ve.ce.FocusableNode );
OO.mixinClass( ve.ce.BlockImageNode, ve.ce.ResizableNode );

/* Static Properties */

ve.ce.BlockImageNode.static.name = 'blockImage';

ve.ce.BlockImageNode.static.tagName = 'figure';

/* Methods */

/**
 * Update the rendering of the 'src', 'width' and 'height' attributes when they change in the model.
 *
 * @method
 * @param {string} key Attribute key
 * @param {string} from Old value
 * @param {string} to New value
 */
ve.ce.BlockImageNode.prototype.onAttributeChange = function ( key, from, to ) {
	if ( key === 'src' ) {
		this.$image.attr( 'src', this.getResolvedAttribute( 'src' ) );
	}
	if ( key === 'width' || key === 'height' ) {
		this.$image.css( key, to !== null ? to : '' );
	}
};

/**
 * Handle the image load
 *
 * @method
 * @param {jQuery.Event} e Load event
 */
ve.ce.BlockImageNode.prototype.onLoad = function () {
	this.setOriginalDimensions( {
		width: this.$image.prop( 'naturalWidth' ),
		height: this.$image.prop( 'naturalHeight' )
	} );
};

/* Registration */

ve.ce.nodeFactory.register( ve.ce.BlockImageNode );
