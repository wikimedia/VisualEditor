/*!
 * VisualEditor DataModel MWBlockImageNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel MediaWiki image node.
 *
 * @class
 * @extends ve.dm.BranchNode
 * @constructor
 * @param {number} [length] Length of content data in document
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.MWBlockImageNode = function VeDmMWBlockImageNode( length, element ) {
	ve.dm.BranchNode.call( this, 0, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.MWBlockImageNode, ve.dm.BranchNode );

/* Static Properties */

ve.dm.MWBlockImageNode.static.name = 'mwBlockImage';

ve.dm.MWBlockImageNode.static.storeHtmlAttributes = [ 'data-parsoid' ];

ve.dm.MWBlockImageNode.static.handlesOwnChildren = true;

ve.dm.MWBlockImageNode.static.childNodeTypes = [ 'mwImageCaption' ];

// Match typeof="mw:Image/Thumb" and typeof="mw:Image/Frame"
ve.dm.MWBlockImageNode.static.matchRdfaTypes = [ /mw:Image\/(Thumb|Frame)/ ];

ve.dm.MWBlockImageNode.static.toDataElement = function ( domElements, converter ) {
	var $figure = $( domElements[0] ),
		$a = $figure.children( 'a' ).eq( 0 ),
		$img = $a.children( 'img' ).eq( 0 ),
		$caption = $figure.children( 'figcaption' ).eq( 0 ),
		typeofAttr = $figure.attr( 'typeof' ),
		classes = $figure.attr( 'class' ),
		attributes = {
			href: $a.attr( 'href' ),
			src: $img.attr( 'src' ),
			width: $img.attr( 'width' ),
			height: $img.attr( 'height' ),
			resource: $img.attr( 'resource' )
		};

	// Extract individual classes
	classes = typeof classes === 'string' ?
		classes.replace( /\s{2,}/g, ' ' ).split( ' ' ) : [];

	// Type
	switch ( typeofAttr ) {
		case 'mw:Image/Thumb':
			attributes.type = 'thumb';
			break;
		case 'mw:Image/Frame':
			attributes.type = 'frame';
			break;
	}

	// Horizontal alignment
	if ( classes.indexOf( 'mw-halign-left' ) !== -1 ) {
		attributes.align = 'left';
	} else if ( classes.indexOf( 'mw-halign-right' ) !== -1 ) {
		attributes.align = 'right';
	} else if ( classes.indexOf( 'mw-halign-center' ) !== -1 ) {
		attributes.align = 'center';
	} else if ( classes.indexOf( 'mw-halign-none' ) !== -1 ) {
		attributes.align = 'none';
	} else {
		attributes.align = 'right';
	}

	// Default-size
	if ( $figure.hasClass( 'mw-default-size' ) ) {
		attributes.defaultSize = true;
	}

	if ( $caption.length === 0 ) {
		return [
			{ 'type': 'mwBlockImage', 'attributes': attributes },
			{ 'type': 'mwImageCaption' },
			{ 'type': '/mwImageCaption' },
			{ 'type': '/mwBlockImage' }
		];
	} else {
		return [ { 'type': 'mwBlockImage', 'attributes': attributes } ].
			concat( converter.getDataFromDomRecursionClean( $caption[0], { 'type': 'mwImageCaption' } ) ).
			concat( [ { 'type': '/mwBlockImage' } ] );
	}
};

ve.dm.MWBlockImageNode.static.toDomElements = function ( data, doc, converter ) {
	var dataElement = data[0],
		figure = doc.createElement( 'figure' ),
		a = doc.createElement( 'a' ),
		img = doc.createElement( 'img' ),
		wrapper = doc.createElement( 'div' );
	figure.setAttribute( 'typeof', 'mw:Image/Thumb' );
	a.setAttribute( 'rel', 'mw:thumb' );
	a.setAttribute( 'href', dataElement.attributes.href );
	img.setAttribute( 'src', dataElement.attributes.src );
	img.setAttribute( 'width', dataElement.attributes.width );
	img.setAttribute( 'height', dataElement.attributes.height );
	img.setAttribute( 'resource', dataElement.attributes.resource );
	figure.appendChild( a );
	a.appendChild( img );

	converter.getDomSubtreeFromData( converter.getStore(), data.slice( 1, -1 ), wrapper );
	while ( wrapper.firstChild ) {
		figure.appendChild( wrapper.firstChild );
	}
	return [ figure ];
};

/* Registration */

ve.dm.modelRegistry.register( ve.dm.MWBlockImageNode );