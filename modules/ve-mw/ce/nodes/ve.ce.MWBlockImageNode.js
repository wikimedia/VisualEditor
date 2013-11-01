/*!
 * VisualEditor ContentEditable MWBlockImageNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable MediaWiki image node.
 *
 * @class
 * @extends ve.ce.BranchNode
 * @mixins ve.ce.MWImageNode
 *
 * @constructor
 * @param {ve.dm.MWBlockImageNode} model Model to observe
 * @param {Object} [config] Configuration options
 */
ve.ce.MWBlockImageNode = function VeCeMWBlockImageNode( model, config ) {

	// Parent constructor
	ve.ce.BranchNode.call( this, model, config );

	this.$element.addClass( 've-ce-mwBlockImageNode ' );

	// Properties
	this.type = this.model.getAttribute( 'type' );
	this.alignment = this.model.getAttribute( 'align' );
	this.size = {
		'width': this.model.getAttribute( 'width' ),
		'height': this.model.getAttribute( 'height' )
	};

	this.typeToRdfa = this.getTypeToRdfa();

	// DOM Hierarchy for BlockImageNode:
	// <div> this.$element
	// - <figure> this.$figure ( ve-ce-mwBlockImageNode-type (thumb) (tright/tleft/etc) )
	// 	- <a> this.$a
	// 		- <img> this.$image (thumbimage)
	//  - <figcaption> this.$figcaption ( thumbcaption )

	// Build DOM:
	this.$a = this.$( '<a>' )
		.addClass( 'image' )
		.attr( 'href', this.getResolvedAttribute( 'href' ) );

	this.$image = this.$( '<img>' )
		.attr( 'src', this.getResolvedAttribute( 'src' ) )
		.attr( 'width', this.size.width )
		.attr( 'height', this.size.height )
		.appendTo( this.$a );

	this.$figure = this.$( '<figure>' )
		.appendTo( this.$element )
		.append( this.$a )
		.addClass( 've-ce-mwBlockImageNode-type-' + this.type )
		// 'typeof' should appear with the proper Parsoid-generated
		// type. The model deals with converting it
		.attr( 'typeof', this.typeToRdfa[ this.type ] );

	this.$element
		.addClass( 've-ce-mwBlockImageNode-align-' + this.alignment );

	// Update size:
	this.updateSize( this.size.height, this.size.width );

	// Mixin constructors
	ve.ce.MWImageNode.call( this, this.$figure, this.$image );

	// I smell a caption!
	this.$figcaption = this.$( '<figcaption> ');

	// attach the figcaption always (to prepare for option of adding one):
	this.$figcaption.appendTo( this.$figure );

	this.caption = {};
	if ( this.type !== 'none' && this.type !== 'frameless' && this.model.children.length === 1 ) {
		this.setCaptionVisible( true );
	} else {
		this.setCaptionVisible( false );
	}

	// Events
	this.model.connect( this, { 'attributeChange': 'onAttributeChange' } );

};


/* Inheritance */

OO.inheritClass( ve.ce.MWBlockImageNode, ve.ce.BranchNode );

// Need to mixin base class as well
OO.mixinClass( ve.ce.MWBlockImageNode, ve.ce.GeneratedContentNode );

OO.mixinClass( ve.ce.MWBlockImageNode, ve.ce.MWImageNode );

/* Static Properties */

ve.ce.MWBlockImageNode.static.name = 'mwBlockImage';

ve.ce.MWBlockImageNode.static.tagName = 'div';

ve.ce.MWBlockImageNode.static.renderHtmlAttributes = false;

ve.ce.MWBlockImageNode.static.transition = false;

ve.ce.MWBlockImageNode.static.cssClasses = {
	'default': {
		'left': 'mw-halign-left',
		'right': 'mw-halign-right',
		'center': 'mw-halign-center',
		'none': 'mw-halign-none'
	},
	'none': {
		'left': 'mw-halign-left',
		'right': 'mw-halign-right',
		'center': 'mw-halign-center',
		'none': 'mw-halign-none'
	}
};

/* Methods */

/**
 * Set up an object that converts from the type to rdfa, based
 *  on the rdfaToType object in the model.
 * @returns {Object.<string,string>} A type to Rdfa conversion object
 */
ve.ce.MWBlockImageNode.prototype.getTypeToRdfa = function() {
	var rdfa, obj = {};

	for ( rdfa in this.model.constructor.static.rdfaToType ) {
		obj[ this.model.constructor.static.rdfaToType[rdfa] ] = rdfa;
	}
	return obj;
};

/**
 * Setup a caption node according to the model
 */
ve.ce.MWBlockImageNode.prototype.setupCaption = function () {
	// only create a new caption if we need it:
	if ( !this.caption.view ) {
		this.caption.model = this.model.children[0];
		this.caption.view = ve.ce.nodeFactory.create( this.caption.model.getType(), this.caption.model );
		this.caption.model.connect( this, { 'update': 'onModelUpdate' } );
		this.children.push( this.caption.view );
		this.caption.view.attach( this );
		if ( this.live !== this.caption.view.isLive() ) {
			this.caption.view.setLive( this.live );
		}
		// Make it a 'figcaption'
		this.caption.view.$element.appendTo( this.$figcaption );
	}
};

/**
 * Set caption either visible or invisible
 *
 * @param {boolean} isVisible declares whether caption will be visible
 */
ve.ce.MWBlockImageNode.prototype.setCaptionVisible = function ( isVisible ) {
	if ( isVisible ) {
		// update the caption:
		this.setupCaption();
		this.$figcaption.show();
	} else {
		// hide the caption:
		this.$figcaption.hide();
	}
	// update caption visibility state:
	this.caption.visible = isVisible;
};

/**
 * Update image alignment, including any style changes that occur
 *
 * @param {string} from The old alignment
 * @param {string} to The new alignment
 * @param {string} type The type of the image to which to align
 */
ve.ce.MWBlockImageNode.prototype.updateAlignment = function( from, to, type ) {
	if ( from !== to ) {
		// remove previous alignment:
		this.$figure
			.removeClass(
				this.getCssClass( 'none', from )
			)
			.removeClass(
				this.getCssClass( 'default', from )
			)
			.removeClass( 've-ce-mwBlockImageNode-align-' + from )
			// add new alignment:
			.addClass( 've-ce-mwBlockImageNode-align-' + to );
	}

	if ( type !== 'none' && type !== 'frameless' ) {
		this.$image
			.addClass( 've-ce-mwBlockImageNode-thumbimage' );

		this.$figure
			.addClass(
				this.getCssClass( 'default', to )
			)
			.addClass( 've-ce-mwBlockImageNode-borderwrap' );
	} else {
		this.$image
			.removeClass( 've-ce-mwBlockImageNode-thumbimage' );
		this.$figure
			.addClass(
				this.getCssClass( 'none', to )
			)
			.removeClass( 've-ce-mwBlockImageNode-borderwrap' );
	}
	this.alignment = to;
	// update dimensions if alignment involved 'center'
	if ( to === 'center' || from === 'center' ) {
		this.updateSize( this.size.height, this.size.width );
	}
};

/**
 * Resize the image and its wrappers
 *
 * @param {Number} height Height of the image
 * @param {Number} width Width of the image
 */
ve.ce.MWBlockImageNode.prototype.updateSize = function ( height, width ) {
	this.$image
		.attr( 'height', height )
		.attr( 'width', width );

	this.$figure
		.css( {
			'width': width + 5
		} );

	// A image that is centered must have dimensions
	// to its node div wrapper
	if ( this.alignment === 'center' ) {
		this.$element
			.css( {
				'width': width
			} );
	} else {
		this.$element.css( { 'width': 'auto' } );
	}


	// update:
	this.size = {
		height: height,
		width: width
	};
};
/**
 * Get the right CSS class to use for alignment
 *
 * @param {string} type 'none' or 'default'
 * @param {string} alignment 'left', 'right', 'center', 'none' or 'default'
 */
ve.ce.MWBlockImageNode.prototype.getCssClass = function ( type, alignment ) {
	// TODO use this.model.getAttribute( 'type' ) etc., see bug 52065
	// Default is different between RTL and LTR wikis:
	if ( type === 'default' && alignment === 'default' ) {
		if ( this.$element.css( 'direction' ) === 'rtl' ) {
			return 'tleft';
		} else {
			return 'tright';
		}
	} else {
		return this.constructor.static.cssClasses[type][alignment];
	}
};

/**
 * Override the default onSetup to add direction-dependent
 * classes to the image thumbnail.
 *
 * @method
 */
ve.ce.MWBlockImageNode.prototype.onSetup = function () {
	var type = this.model.getAttribute( 'type' );

	ve.ce.BranchNode.prototype.onSetup.call( this );

	this.updateAlignment( this.alignment, this.alignment, type );
	if ( type !== 'none' && type !=='frameless' ) {
		this.$element.addClass( this.getCssClass( 'default', this.model.getAttribute( 'align' ) ) );
	}

};

/**
 * Update the rendering of the 'align', src', 'width' and 'height' attributes
 * when they change in the model.
 *
 * @method
 * @param {string} key Attribute key
 * @param {string} from Old value
 * @param {string} to New value
 * @fires setup
 */
ve.ce.MWBlockImageNode.prototype.onAttributeChange = function ( key, from, to ) {
	if ( key === 'height' || key === 'width' ) {
		to = parseInt( to, 10 );
	}

	if ( from !== to ) {
		switch ( key ) {
			case 'align':
				this.updateAlignment( from, to, this.type );
				break;
			case 'src':
				this.$image.attr( 'src', this.getResolvedAttribute( 'src' ) );
				break;
			case 'width':
				this.size.width = to;
				this.updateSize( this.size.height, this.size.width );
				break;
			case 'height':
				this.size.height = to;
				this.updateSize( this.size.height, this.size.width );
				break;
			case 'type':
				this.$element.removeClass( 've-ce-mwBlockImageNode-type-' + from );
				this.$element.addClass( 've-ce-mwBlockImageNode-type-' + to );

				// Update 'typeof' property
				this.$figure.attr( 'typeof', this.typeToRdfa[ this.type ] );

				// marking update with same 'to/from' alignment will only update
				// the alignment based on the new type
				this.updateAlignment( this.align, this.align, to );
				// hide/show caption:
				if ( to !== 'none' && to !== 'frameless' && this.model.children.length === 1 ) {
					this.setCaptionVisible( true );
				} else {
					this.setCaptionVisible( false );
				}
				break;
			// Other image attributes if they exist:
			case 'alt':
				this.$image.attr( key, to );
				break;
		}
	}
};

/** */
ve.ce.MWBlockImageNode.prototype.onResizableResizing = function ( dimensions ) {
	if ( !this.outline ) {
		ve.ce.ResizableNode.prototype.onResizableResizing.call( this, dimensions );

		this.updateSize( dimensions.height, dimensions.width );
	}
};

/** */
ve.ce.MWBlockImageNode.prototype.setupSlugs = function () {
	// Intentionally empty
};

/** */
ve.ce.MWBlockImageNode.prototype.onSplice = function () {
	// Intentionally empty
};

/* Registration */

ve.ce.nodeFactory.register( ve.ce.MWBlockImageNode );
