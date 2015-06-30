/*!
 * VisualEditor ContentEditable LinkAnnotation class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
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
		} );
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

ve.ce.LinkAnnotation.static.makeNail = function ( type ) {
	return $( '<img>' )
		.prop( 'src', ve.inputDebug ? ve.ce.nailImgDataUri : ve.ce.minImgDataUri )
		.addClass( 've-ce-nail' )
		.addClass( 've-ce-nail-' + type )
		.css( { width: ve.inputDebug ? '' : '0', height: ve.inputDebug ? '' : '0' } )
		.get( 0 );
};

/* Methods */

ve.ce.LinkAnnotation.prototype.getContentContainer = function () {
	return this.contentFragment;
};

/**
 * Attach contents to the annotation as descendent nodes, if not already attached
 */
ve.ce.LinkAnnotation.prototype.attachContents = function () {
	this.$anchor
		.append( this.constructor.static.makeNail( 'post-open' ) )
		.append( this.contentFragment )
		.append( this.constructor.static.makeNail( 'pre-close' ) );
};

/**
 * @param {Node} node Parent node
 */
ve.ce.LinkAnnotation.prototype.appendTo = function ( node ) {
	node.appendChild( this.constructor.static.makeNail( 'pre-open' ) );
	node.appendChild( this.$anchor[ 0 ] );
	node.appendChild( this.constructor.static.makeNail( 'post-close' ) );
};

/* Registration */

ve.ce.annotationFactory.register( ve.ce.LinkAnnotation );
