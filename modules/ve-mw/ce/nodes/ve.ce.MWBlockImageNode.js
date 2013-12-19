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
	var type, align;

	// Parent constructor
	ve.ce.BranchNode.call( this, model, config );

	type = this.model.getAttribute( 'type' );
	align = this.model.getAttribute( 'align' );

	// Properties
	this.captionVisible = false;
	this.typeToRdfa = this.getTypeToRdfa();

	// DOM Hierarchy for BlockImageNode:
	// <div> this.$element
	//   <figure> this.$figure (ve-ce-mwBlockImageNode-type (thumb) (tright/tleft/etc))
	//     <a> this.$a
	//       <img> this.$image (thumbimage)
	//     <figcaption> this.caption.view.$element (thumbcaption)

	// Build DOM:
	this.$a = this.$( '<a>' )
		.addClass( 'image' )
		.attr( 'href', this.getResolvedAttribute( 'href' ) );

	this.$image = this.$( '<img>' )
		.attr( 'src', this.getResolvedAttribute( 'src' ) )
		.appendTo( this.$a );

	this.$figure = this.$( '<figure>' )
		.appendTo( this.$element )
		.append( this.$a )
		.addClass( 've-ce-mwBlockImageNode-type-' + type )
		// 'typeof' should appear with the proper Parsoid-generated
		// type. The model deals with converting it
		.attr( 'typeof', this.typeToRdfa[ type ] );

	this.updateCaption();

	this.updateSize();

	// Mixin constructors
	ve.ce.MWImageNode.call( this, this.$figure, this.$image );

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
ve.ce.MWBlockImageNode.prototype.getTypeToRdfa = function () {
	var rdfa, obj = {};

	for ( rdfa in this.model.constructor.static.rdfaToType ) {
		obj[ this.model.constructor.static.rdfaToType[rdfa] ] = rdfa;
	}
	return obj;
};

/**
 * Update the caption based on the current model state
 */
ve.ce.MWBlockImageNode.prototype.updateCaption = function () {
	var model, view,
		type = this.model.getAttribute( 'type' );

	this.captionVisible = type !== 'none' && type !== 'frameless' && this.model.children.length === 1;

	if ( this.captionVisible ) {
		// Only create a caption if we need it
		if ( !this.$caption ) {
			model = this.model.children[0];
			view = ve.ce.nodeFactory.create( model.getType(), model );
			model.connect( this, { 'update': 'onModelUpdate' } );
			this.children.push( view );
			view.attach( this );
			if ( this.live !== view.isLive() ) {
				view.setLive( this.live );
			}
			this.$caption = view.$element;
			this.$figure.append( this.$caption );
		}
	}
	if ( this.$caption ) {
		this.$caption.toggle( this.captionVisible );
	}
};

/**
 * Update CSS classes based on alignment and type
 *
 * @param {string} [oldAlign] The old alignment, for removing classes
 */
ve.ce.MWBlockImageNode.prototype.updateClasses = function ( oldAlign ) {
	var align = this.model.getAttribute( 'align' ),
		type = this.model.getAttribute( 'type' );

	if ( oldAlign && oldAlign !== align ) {
		// Remove previous alignment
		this.$figure
			.removeClass( this.getCssClass( 'none', oldAlign ) )
			.removeClass( this.getCssClass( 'default', oldAlign ) );
	}

	if ( type !== 'none' && type !== 'frameless' ) {
		this.$image.addClass( 've-ce-mwBlockImageNode-thumbimage' );
		this.$figure
			.addClass( this.getCssClass( 'default', align ) )
			.addClass( 've-ce-mwBlockImageNode-borderwrap' );
	} else {
		this.$image.removeClass( 've-ce-mwBlockImageNode-thumbimage' );
		this.$figure
			.addClass( this.getCssClass( 'none', align ) )
			.removeClass( 've-ce-mwBlockImageNode-borderwrap' );
	}
};

/**
 * Redraw the image and its wrappers at the specified dimensions
 *
 * The current dimensions from the model are used if none are specified.
 *
 * @param {Object} [dimensions] Dimension object containing width & height
 */
ve.ce.MWBlockImageNode.prototype.updateSize = function ( dimensions ) {
	if ( !dimensions ) {
		dimensions = {
			'width': this.model.getAttribute( 'width' ),
			'height': this.model.getAttribute( 'height' )
		};
	}

	this.$image.attr( dimensions );

	this.$figure.css( {
		// If we have a border then the width is increased by 2
		'width': dimensions.width + ( this.captionVisible ? 2 : 0 ),
		'height': this.captionVisible ? 'auto' : dimensions.height
	} );
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
			return 'mw-halign-left';
		} else {
			return 'mw-halign-right';
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
	// Parent method
	ve.ce.BranchNode.prototype.onSetup.call( this );

	this.updateClasses();
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
				this.updateClasses( from );
				break;
			case 'src':
				this.$image.attr( 'src', this.getResolvedAttribute( 'src' ) );
				break;
			case 'width':
			case 'height':
				this.updateSize();
				break;
			case 'type':
				this.$figure
					.removeClass( 've-ce-mwBlockImageNode-type-' + from )
					.addClass( 've-ce-mwBlockImageNode-type-' + to )
					.attr( 'typeof', this.typeToRdfa[ to ] );

				this.updateClasses();
				this.updateCaption();
				break;
			// Other image attributes if they exist
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

		this.updateSize( dimensions );
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
