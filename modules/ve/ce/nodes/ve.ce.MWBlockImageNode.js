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
 * @mixins ve.ce.ProtectedNode
 *
 * @constructor
 * @param {ve.dm.MWBlockImageNode} model Model to observe
 * @param {Object} [config] Config options
 */
ve.ce.MWBlockImageNode = function VeCeMWBlockImageNode( model, config ) {
	var captionModel, captionView;

	// Parent constructor
	ve.ce.BranchNode.call( this, model, config );

	// Mixin constructors
	ve.ce.ProtectedNode.call( this );
	ve.ce.FocusableNode.call( this );
	ve.ce.ResizableNode.call( this );

	if ( this.model.getAttribute( 'align' ) === 'center' ) {
		this.$.addClass( 'center' );
		this.$thumb = this.$$( '<div>' ).appendTo( this.$ );
	} else {
		this.$thumb = this.$;
	}

	this.$thumb
		.addClass( 'thumb' )
		.addClass(
			ve.ce.MWBlockImageNode.static.alignToCssClass[ this.model.getAttribute( 'align' ) ]
		);

	this.$thumbInner = this.$$( '<div>' )
		.addClass( 'thumbinner' )
		.css( 'width', parseInt( this.model.getAttribute( 'width' ), 10 ) + 2 )
		.appendTo( this.$thumb );

	this.$a = this.$$( '<a>' )
		.addClass( 'image' )
		.attr( 'src', this.model.getAttribute( 'href' ) )
		.appendTo( this.$thumbInner );

	this.$image = this.$$( '<img>' )
		.addClass( 'thumbimage' )
		.attr( 'src', this.model.getAttribute( 'src' ) )
		.attr( 'width', this.model.getAttribute( 'width' ) )
		.attr( 'height', this.model.getAttribute( 'height' ) )
		.appendTo( this.$a );

	this.$resizable = this.$image;

	// I smell a caption!
	if ( this.model.children.length === 1 ) {
		captionModel = this.model.children[0];
		captionView = ve.ce.nodeFactory.create( captionModel.getType(), captionModel );
		captionModel.connect( this, { 'update': 'onModelUpdate' } );
		this.children.push( captionView );
		captionView.attach( this );
		captionView.$.appendTo( this.$thumbInner );
		if ( this.live !== captionView.isLive() ) {
			captionView.setLive( this.live );
		}
	}
};

/* Inheritance */

ve.inheritClass( ve.ce.MWBlockImageNode, ve.ce.BranchNode );

ve.mixinClass( ve.ce.MWBlockImageNode, ve.ce.ProtectedNode );

ve.mixinClass( ve.ce.MWBlockImageNode, ve.ce.FocusableNode );

ve.mixinClass( ve.ce.MWBlockImageNode, ve.ce.ResizableNode );

/* Static Properties */

ve.ce.MWBlockImageNode.static.name = 'mwBlockImage';

ve.ce.MWBlockImageNode.static.tagName = 'div';

ve.ce.MWBlockImageNode.static.renderHtmlAttributes = false;

ve.ce.MWBlockImageNode.static.transition = false;

ve.ce.MWBlockImageNode.static.alignToCssClass = {
	'left': 'tleft',
	'right': 'tright',
	'center' : 'tnone',
	'none' : 'tnone',
	'default': 'tright'
};

/* Methods */

ve.ce.MWBlockImageNode.prototype.onAttributeChange = function ( key, from, to ) {
	var $element;
	if ( from !== to ) {
		switch ( key ) {
			case 'align':
				if ( to === 'center' || from === 'center' ) {
					this.emit( 'teardown' );
					if ( to === 'center' ) {
						$element = this.$$( '<div>' ).addClass( 'center' );
						this.$thumb = this.$;
						this.$.replaceWith( $element );
						this.$ = $element;
						this.$.append( this.$thumb );
					} else {
						this.$.replaceWith( this.$thumb );
						this.$ = this.$thumb;
					}
					this.emit( 'setup' );
				}
				this.$thumb.removeClass( ve.ce.MWBlockImageNode.static.alignToCssClass[ from ] );
				this.$thumb.addClass( ve.ce.MWBlockImageNode.static.alignToCssClass[ to ] );
				break;
			case 'src':
				this.$image.attr( 'src', to );
				break;
			case 'width':
				this.$image.css( 'width', to );
				this.$thumbInner.css( 'width', to + 2 );
				break;
			case 'height':
				this.$image.css( 'height', to );
				break;
		}
	}
};

ve.ce.MWBlockImageNode.prototype.setupSlugs = function () {
	// Intentionally empty
};

ve.ce.MWBlockImageNode.prototype.onSplice = function () {
	// Intentionally empty
};

/* Registration */

ve.ce.nodeFactory.register( ve.ce.MWBlockImageNode );
