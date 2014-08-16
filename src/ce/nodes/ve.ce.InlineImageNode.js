/*!
 * VisualEditor ContentEditable InlineImageNode class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable inline image node.
 *
 * @class
 * @extends ve.ce.LeafNode
 * @mixins ve.ce.FocusableNode
 * @mixins ve.ce.ResizableNode
 *
 * @constructor
 * @param {ve.dm.InlineImageNode} model Model to observe
 * @param {Object} [config] Configuration options
 */
ve.ce.InlineImageNode = function VeCeInlineImageNode( model, config ) {
	config = ve.extendObject( {
		minDimensions: { width: 1, height: 1 }
	}, config );

	// Parent constructor
	ve.ce.LeafNode.call( this, model, config );

	// Mixin constructors
	ve.ce.FocusableNode.call( this );
	ve.ce.ResizableNode.call( this, this.$element, config );

	// Events
	this.$element.on( 'load', ve.bind( this.onLoad, this ) );
	this.model.connect( this, { attributeChange: 'onAttributeChange' } );

	// Initialization
	this.$element
		.addClass( 've-ce-imageNode' )
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

OO.inheritClass( ve.ce.InlineImageNode, ve.ce.LeafNode );

OO.mixinClass( ve.ce.InlineImageNode, ve.ce.FocusableNode );
OO.mixinClass( ve.ce.InlineImageNode, ve.ce.ResizableNode );

/* Static Properties */

ve.ce.InlineImageNode.static.name = 'inlineImage';

ve.ce.InlineImageNode.static.tagName = 'img';

/* Methods */

/**
 * Update the rendering of the 'src', 'width' and 'height' attributes when they change in the model.
 *
 * @method
 * @param {string} key Attribute key
 * @param {string} from Old value
 * @param {string} to New value
 */
ve.ce.InlineImageNode.prototype.onAttributeChange = function ( key, from, to ) {
	if ( key === 'src' ) {
		this.$element.attr( 'src', this.getResolvedAttribute( 'src' ) );
	}
	if ( key === 'width' || key === 'height' ) {
		this.$element.css( key, to !== null ? to : '' );
	}
};

/**
 * Handle the image load
 *
 * @method
 * @param {jQuery.Event} e Load event
 */
ve.ce.InlineImageNode.prototype.onLoad = function () {
	this.setOriginalDimensions( {
		width: this.$element.prop( 'naturalWidth' ),
		height: this.$element.prop( 'naturalHeight' )
	} );
};

/* Registration */

ve.ce.nodeFactory.register( ve.ce.InlineImageNode );
