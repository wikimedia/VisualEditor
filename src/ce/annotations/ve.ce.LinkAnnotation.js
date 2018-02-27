/*!
 * VisualEditor ContentEditable LinkAnnotation class.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * ContentEditable link annotation.
 *
 * @class
 * @extends ve.ce.Annotation
 * @constructor
 * @param {ve.dm.LinkAnnotation} model Model to observe
 * @param {ve.ce.ContentBranchNode} [parentNode] Node rendering this annotation
 * @param {Object} [config] Configuration options
 */
ve.ce.LinkAnnotation = function VeCeLinkAnnotation() {
	// Parent constructor
	ve.ce.LinkAnnotation.super.apply( this, arguments );

	// Initialization
	this.contentFragment = document.createDocumentFragment();

	this.$anchor = $( '<a>' )
		.addClass( 've-ce-linkAnnotation' )
		.prop( {
			href: ve.resolveUrl( this.model.getHref(), this.getModelHtmlDocument() ),
			title: this.constructor.static.getDescription( this.model )
		} )
		.data( 'view', this );
};

/* Inheritance */

OO.inheritClass( ve.ce.LinkAnnotation, ve.ce.Annotation );

/* Static Properties */

ve.ce.LinkAnnotation.static.name = 'link';

ve.ce.LinkAnnotation.static.tagName = 'span';

/* Static Methods */

/**
 * @inheritdoc
 */
ve.ce.LinkAnnotation.static.getDescription = function ( model ) {
	return model.getHref();
};

/**
 * Create a nail (a zero-width image) to add extra cursor positions around links
 *
 * @param {string} type Nail type, one of 'pre-open', 'pre-close', 'post-open' and 'post-close'
 * @return {HTMLElement} The new nail
 */
ve.ce.LinkAnnotation.static.makeNail = function ( type ) {
	var nail = document.createElement( 'img' );
	// Support: Firefox
	// Firefox <=37 misbehaves if we don't set an src: https://bugzilla.mozilla.org/show_bug.cgi?id=989012
	// Firefox misbehaves if we don't set an src and there is no sizing at node creation time: https://bugzilla.mozilla.org/show_bug.cgi?id=1267906
	// Setting an src in Chrome is slow, so only set it in affected versions of Firefox
	if ( $.client.profile().layout === 'gecko' ) {
		nail.src = ve.inputDebug ? ve.ce.nailImgDataUri : ve.ce.minImgDataUri;
	}
	// The following classes can be used here:
	// * ve-ce-nail-pre-open
	// * ve-ce-nail-pre-close
	// * ve-ce-nail-post-open
	// * ve-ce-nail-post-close
	nail.className = 've-ce-nail ve-ce-nail-' + type + ( ve.inputDebug ? ' ve-ce-nail-debug' : '' );
	return nail;
};

/* Methods */

/**
 * @inheritdoc
 */
ve.ce.LinkAnnotation.prototype.getContentContainer = function () {
	return this.contentFragment;
};

/**
 * @inheritdoc
 */
ve.ce.LinkAnnotation.prototype.attachContents = function () {
	var anchor = this.$anchor[ 0 ];
	// Insert post-open nail, annotation contents, and pre-close nail into the anchor
	anchor.appendChild( this.constructor.static.makeNail( 'post-open' ) );
	anchor.appendChild( this.contentFragment );
	anchor.appendChild( this.constructor.static.makeNail( 'pre-close' ) );
};

/**
 * @inheritdoc
 */
ve.ce.LinkAnnotation.prototype.appendTo = function ( node ) {
	// Insert pre-open nail, anchor, and post-close nail into a parent node
	node.appendChild( this.constructor.static.makeNail( 'pre-open' ) );
	node.appendChild( this.$anchor[ 0 ] );
	node.appendChild( this.constructor.static.makeNail( 'post-close' ) );
};

/* Registration */

ve.ce.annotationFactory.register( ve.ce.LinkAnnotation );
