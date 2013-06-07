/*!
 * VisualEditor DataModel MWEntityNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel MediaWiki image node.
 *
 * @class
 * @extends ve.dm.LeafNode
 * @constructor
 * @param {number} [length] Length of content data in document
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.MWInlineImageNode = function VeDmMWInlineImageNode( length, element ) {
	ve.dm.LeafNode.call( this, 0, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.MWInlineImageNode, ve.dm.LeafNode );

/* Static Properties */

ve.dm.MWInlineImageNode.static.isContent = true;

ve.dm.MWInlineImageNode.static.name = 'mwInlineImage';

ve.dm.MWInlineImageNode.static.storeHtmlAttributes = {
	'blacklist': [ 'typeof', 'class', 'src', 'resource', 'width', 'height', 'href' ]
};

ve.dm.MWInlineImageNode.static.matchTagNames = null;

ve.dm.MWInlineImageNode.static.matchRdfaTypes = [
	'mw:Image',
	'mw:Image/Frameless'
];

ve.dm.MWInlineImageNode.static.toDataElement = function ( domElements ) {
	var $span = $( domElements[0] ),
		$firstChild = $span.children().first(), // could be <span> or <a>
		$img = $firstChild.children().first(),
		typeofAttr = $span.attr( 'typeof' ),
		classes = $span.attr( 'class' ),
		attributes = {
			src: $img.attr( 'src' ),
			resource: $img.attr( 'resource' )
		},
		width = $img.attr( 'width' ),
		height = $img.attr( 'height' );

	attributes.width = width !== undefined && width !== '' ? Number( width ) : null;
	attributes.height = height !== undefined && height !== '' ? Number( height ) : null;

	attributes.isLinked = $firstChild.is( 'a' );
	if ( attributes.isLinked ) {
		attributes.href = $firstChild.attr( 'href' );
	}

	// Extract individual classes
	classes = typeof classes === 'string' ?
		classes.replace( /\s{2,}/g, ' ' ).split( ' ' ) : [];

	// Type
	switch ( typeofAttr ) {
		case 'mw:Image':
			attributes.type = 'inline';
			break;
		case 'mw:Image/Frameless':
			attributes.type = 'frameless';
			break;
	}

	// Vertical alignment
	if ( classes.indexOf( 'mw-valign-middle' ) !== -1 ) {
		attributes.valign = 'middle';
	} else if ( classes.indexOf( 'mw-valign-baseline' ) !== -1 ) {
		attributes.valign = 'baseline';
	} else if ( classes.indexOf( 'mw-valign-sub' ) !== -1 ) {
		attributes.valign = 'sub';
	} else if ( classes.indexOf( 'mw-valign-super' ) !== -1 ) {
		attributes.valign = 'super';
	} else if ( classes.indexOf( 'mw-valign-top' ) !== -1 ) {
		attributes.valign = 'top';
	} else if ( classes.indexOf( 'mw-valign-text-top' ) !== -1 ) {
		attributes.valign = 'text-top';
	} else if ( classes.indexOf( 'mw-valign-bottom' ) !== -1 ) {
		attributes.valign = 'bottom';
	} else if ( classes.indexOf( 'mw-valign-text-bottom' ) !== -1 ) {
		attributes.valign = 'text-bottom';
	} else {
		attributes.valign = 'default';
	}

	// Border
	if ( classes.indexOf( 'mw-image-border' ) !== -1 ) {
		attributes.border = true;
	}

	// Default-size
	if ( classes.indexOf( 'mw-default-size' ) !== -1 ) {
		attributes.defaultSize = true;
	}
	return { 'type': 'mwInlineImage', 'attributes': attributes };
};

ve.dm.MWInlineImageNode.static.toDomElements = function ( data, doc ) {
	var span = doc.createElement( 'span' ),
		img = doc.createElement( 'img' ),
		firstChild;

	ve.setDomAttributes( img, data.attributes, [ 'src', 'width', 'height', 'resource' ] );

	switch ( data.attributes.type  ) {
		case 'inline':
			span.setAttribute( 'typeof', 'mw:Image' );
			break;
		case 'frameless':
			span.setAttribute( 'typeof', 'mw:Image/Frameless' );
			break;
	}

	if ( data.attributes.defaultSize ) {
		span.className += ' mw-default-size';
	}

	if ( data.attributes.border ) {
		span.className += ' mw-image-border';
	}

	if ( data.attributes.valign && data.attributes.valign !== 'default' ) {
		span.className += ' mw-image-' + data.attributes.valign;
	}

	if ( data.attributes.isLinked ) {
		firstChild = doc.createElement( 'a' );
		firstChild.setAttribute( 'href', data.attributes.href );
	} else {
		firstChild = doc.createElement( 'span' );
	}

	span.appendChild( firstChild );
	firstChild.appendChild( img );

	return [ span ];
};

/* Registration */

ve.dm.modelRegistry.register( ve.dm.MWInlineImageNode );
