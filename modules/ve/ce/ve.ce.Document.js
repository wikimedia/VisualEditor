/*!
 * VisualEditor ContentEditable Document class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable document.
 *
 * @class
 * @extends ve.Document
 * @constructor
 * @param {ve.dm.Document} model Model to observe
 */
ve.ce.Document = function VeCeDocument( model, surface ) {
	// Parent constructor
	ve.Document.call( this, new ve.ce.DocumentNode( model.getDocumentNode(), surface ) );

	// Properties
	this.model = model;
};

/* Inheritance */

ve.inheritClass( ve.ce.Document, ve.Document );

/* Methods */

/**
 * Get a node a an offset.
 *
 * @method
 * @param {number} offset Offset to get node at
 * @returns {ve.ce.Node} Node at offset
 */
ve.ce.Document.prototype.getNodeFromOffset = function ( offset ) {
	var node = this.documentNode.getNodeFromOffset( offset );
	if ( node && !node.canHaveChildren() ) {
		node = node.getParent();
	}
	return node;
};

/**
 * Get a slug a an offset.
 *
 * @method
 * @param {number} offset Offset to get slug at
 * @returns {jQuery} Slug at offset
 */
ve.ce.Document.prototype.getSlugAtOffset = function ( offset ) {
	var node = this.getNodeFromOffset( offset );
	return node ? node.getSlugAtOffset( offset ) : null;
};

/**
 * Configuration for getSiblingWordBoundary method.
 */
ve.ce.Document.static.siblingWordBoundaryConfig = {
	'default' : {
		'left' : {
			'boundary' : { 'text' : true, 'space' : true },
			'space' : { 'text' : true, 'boundary' : true }
		},
		'right' : {
			'boundary' : { 'text' : true, 'space' : true },
			'space' : { 'text' : true, 'boundary' : true }
		}
	},
	'ie' : {
		'left' : {
			'space' : { 'text' : true, 'boundary' : true }
		},
		'right' : {
			'text' : { 'space' : true },
			'boundary' : { 'space' : true }
		}
	}
};

/**
 * Get the nearest word boundary.
 *
 * @method
 * @param {number} offset Offset to start from
 * @param {number} [direction] Direction to prefer matching offset in, -1 for left and 1 for right
 * @returns {number} Nearest word boundary
 */
ve.ce.Document.prototype.getSiblingWordBoundary = function ( offset, direction ) {
	var config = ve.ce.Document.static.siblingWordBoundaryConfig,
		pattern = ve.dm.SurfaceFragment.static.wordBoundaryPattern,
		data = this.model.data,
		i = direction > 0 ? offset : offset - 1,
		inc = direction > 0 ? 1 : -1,
		prevChar, nextChar, prevType, nextType;

	config = $.browser.msie ? config.ie : config.default;
	config = direction > 0 ? config.right : config.left;

	if ( !data[i] || data[i].type !== undefined ) {
		return -1;
	} else {
		prevChar = typeof data[i] === 'string' ? data[i] : data[i][0];
		if ( !pattern.test( prevChar ) ) {
			prevType = 'text';
		} else if ( prevChar !== ' ' ) {
			prevType = 'boundary';
		} else {
			prevType = 'space';
		}
		i = i + inc;
		do {
			if ( data[i].type !== undefined ) {
				break;
			} else {
				nextChar = typeof data[i] === 'string' ? data[i] : data[i][0];
				if ( !pattern.test( nextChar ) ) {
					nextType = 'text';
				} else if ( nextChar !== ' ' ) {
					nextType = 'boundary';
				} else {
					nextType = 'space';
				}
				if ( prevType !== nextType ) {
					if ( config[prevType] && nextType in config[prevType] ) {
						prevType = nextType;
						continue;
					} else {
						break;
					}
				}
			}
		} while ( data[i += inc] );
		return i + ( inc > 0 ? 0 : 1 );
	}
};