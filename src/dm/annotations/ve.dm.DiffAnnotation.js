/*!
 * VisualEditor DataModel DiffAnnotation class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * DataModel diff annotation.
 *
 * @class
 * @extends ve.dm.TextStyleAnnotation
 * @constructor
 * @param {Object} element
 */
ve.dm.DiffAnnotation = function VeDmDiffAnnotation() {
	// Parent constructor
	ve.dm.DiffAnnotation.super.apply( this, arguments );
};

/* Inheritance */

OO.inheritClass( ve.dm.DiffAnnotation, ve.dm.Annotation );

/* Static Properties */

ve.dm.DiffAnnotation.static.name = 'textStyle/diff';

ve.dm.DiffAnnotation.static.matchTagNames = [];

ve.dm.DiffAnnotation.static.trimWhitespace = false;

ve.dm.DiffAnnotation.static.toDomElements = function ( dataElement, doc ) {
	let actionAttribute, tagName;
	switch ( dataElement.attributes.action ) {
		case ve.DiffMatchPatch.static.DIFF_DELETE:
			actionAttribute = 'remove';
			tagName = 'del';
			break;
		case ve.DiffMatchPatch.static.DIFF_INSERT:
			actionAttribute = 'insert';
			tagName = 'ins';
			break;
		case ve.DiffMatchPatch.static.DIFF_CHANGE_DELETE:
			actionAttribute = 'change-remove';
			tagName = 'span';
			break;
		case ve.DiffMatchPatch.static.DIFF_CHANGE_INSERT:
			actionAttribute = 'change-insert';
			tagName = 'span';
			break;
	}
	const domElement = doc.createElement( tagName );
	domElement.setAttribute( 'data-diff-action', actionAttribute );
	if ( dataElement.attributes.id !== undefined ) {
		domElement.setAttribute( 'data-diff-id', dataElement.attributes.id );
	}
	return [ domElement ];
};

/* Registration */

ve.dm.modelRegistry.register( ve.dm.DiffAnnotation );
