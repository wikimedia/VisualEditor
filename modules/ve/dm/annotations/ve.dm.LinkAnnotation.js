/*!
 * VisualEditor DataModel LinkAnnotation class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel link annotation.
 *
 * Represents `<a>` tags that don't have a specific type.
 *
 * @class
 * @extends ve.dm.Annotation
 * @constructor
 * @param {Object} linmodAnnotation
 */
ve.dm.LinkAnnotation = function VeDmLinkAnnotation( linmodAnnotation ) {
	// Parent constructor
	ve.dm.Annotation.call( this, linmodAnnotation );
};

/* Inheritance */

ve.inheritClass( ve.dm.LinkAnnotation, ve.dm.Annotation );

/* Static Properties */

/**
 * @static
 * @property static.name
 * @inheritdoc
 */
ve.dm.LinkAnnotation.static.name = 'link';

/**
 * @static
 * @property static.matchTagNames
 * @inheritdoc
 */
ve.dm.LinkAnnotation.static.matchTagNames = ['a'];

ve.dm.LinkAnnotation.static.toDataElement = function ( domElements ) {
	return {
		'type': 'link',
		'attributes': {
			'href': domElements[0].getAttribute( 'href' )
		}
	};
};

ve.dm.LinkAnnotation.static.toDomElements = function ( dataElement ) {
	var domElement = document.createElement( 'a' );
	domElement.setAttribute( 'href', dataElement.attributes.href );
	return [ domElement ];
};

/* Registration */

ve.dm.modelRegistry.register( ve.dm.LinkAnnotation );
