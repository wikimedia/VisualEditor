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

ve.dm.MWBlockImageNode.static.name = 'MWblockimage';

ve.dm.MWBlockImageNode.static.handlesOwnChildren = true;

ve.dm.MWBlockImageNode.static.childNodeTypes = [ 'MWimagecaption' ];

ve.dm.MWBlockImageNode.static.matchRdfaTypes = [ 'mw:Image/Thumb' ];

ve.dm.MWBlockImageNode.static.toDataElement = function ( domElements, converter ) {
	var $figure = $( domElements[0] ),
		$a = $figure.children( 'a' ).eq( 0 ),
		$img = $a.children( 'img' ).eq( 0 ),
		$caption = $figure.children( 'figcaption' ).eq( 0 ),
		href = $a.attr( 'href' ),
		src = $img.attr( 'src' ),
		width = $img.attr( 'width' ),
		height = $img.attr( 'height' ),
		resource = $img.attr( 'resource' ),
		captionData = converter.getDataFromDomRecursion( $caption[0], { 'type': 'MWimagecaption' } );
	return [
		{
			'type': 'MWblockimage',
			'attributes': {
				'href': href,
				'src': src,
				'width': width,
				'height': height,
				'resource': resource
			}
		}
	].concat( captionData ).concat( [ { 'type': '/MWblockimage' } ] );
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