/*!
 * VisualEditor UserInterface MWMediaSelectItemWidget class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/*global mw */

/**
 * Creates an ve.ui.MWMediaSelectItemWidget object.
 *
 * @class
 * @extends ve.ui.OptionWidget
 *
 * @constructor
 * @param {Mixed} data Item data
 * @param {Object} [config] Config options
 * @cfg {number} [size] Media thumbnail size
 */
ve.ui.MWMediaSelectItemWidget = function VeUiMWMediaSelectItemWidget( data, config ) {
	// Configuration intialization
	config = config || {};

	// Parent constructor
	ve.ui.OptionWidget.call( this, data, config );

	// Properties
	this.size = config.size || 150;
	this.$thumb = this.buildThumbnail();
	this.$overlay = this.$$( '<div>' );

	// Initialization
	this.setLabel( new mw.Title( this.data.title ).getNameText() );
	this.$overlay.addClass( 've-ui-mwMediaSelectItemWidget-overlay' );
	this.$
		.addClass( 've-ui-mwMediaSelectItemWidget ve-ui-texture-pending' )
		.css( { 'width': this.size, 'height': this.size } )
		.prepend( this.$thumb, this.$overlay );
};

/* Inheritance */

ve.inheritClass( ve.ui.MWMediaSelectItemWidget, ve.ui.OptionWidget );

/* Static Properties */

ve.ui.MWMediaSelectItemWidget.static.highlightable = false;

/* Methods */

ve.ui.MWMediaSelectItemWidget.prototype.onThumbnailLoad = function () {
	this.$thumb.first().addClass( 've-ui-texture-transparency' );
	this.$
		.addClass( 've-ui-mwMediaSelectItemWidget-done' )
		.removeClass( 've-ui-texture-pending' );
};

ve.ui.MWMediaSelectItemWidget.prototype.onThumbnailError = function () {
	this.$thumb.last()
		.css( 'background-image', '' )
		.addClass( 've-ui-texture-alert' );
	this.$
		.addClass( 've-ui-mwMediaSelectItemWidget-error' )
		.removeClass( 've-ui-texture-pending' );
};

/**
 * Build a thumbnail.
 *
 * @method
 * @returns {jQuery} Thumbnail element
 */
ve.ui.MWMediaSelectItemWidget.prototype.buildThumbnail = function () {
	var info = this.data.imageinfo[0],
		image = new Image(),
		$image = this.$$( image ),
		$back = this.$$( '<div>' ),
		$front = this.$$( '<div>' ),
		$thumb = $back.add( $front );

	// Preload image
	$image
		.load( ve.bind( this.onThumbnailLoad, this ) )
		.error( ve.bind( this.onThumbnailError, this ) );
	image.src = info.thumburl;

	$thumb.addClass( 've-ui-mwMediaSelectItemWidget-thumbnail' );
	$thumb.last().css( 'background-image', 'url(' + info.thumburl + ')' );
	if ( info.width >= this.size && info.height >= this.size ) {
		$front.addClass( 've-ui-mwMediaSelectItemWidget-crop' );
		$thumb.css( { 'width': '100%', 'height': '100%' } );
	} else {
		$thumb.css( {
			'width': info.thumbwidth,
			'height': info.thumbheight,
			'left': '50%',
			'top': '50%',
			'margin-left': Math.round( -info.thumbwidth / 2 ),
			'margin-top': Math.round( -info.thumbheight / 2 )
		} );
	}

	return $thumb;
};
