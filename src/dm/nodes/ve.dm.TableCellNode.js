/*!
 * VisualEditor DataModel TableCellNode class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * DataModel table cell node.
 *
 * @class
 * @extends ve.dm.BranchNode
 * @mixes ve.dm.TableCellableNode
 *
 * @constructor
 * @param {Object} [element] Reference to element in linear model
 * @param {ve.dm.Node[]} [children]
 */
ve.dm.TableCellNode = function VeDmTableCellNode() {
	// Parent constructor
	ve.dm.TableCellNode.super.apply( this, arguments );

	// Mixin constructor
	ve.dm.TableCellableNode.call( this );
};

/* Inheritance */

OO.inheritClass( ve.dm.TableCellNode, ve.dm.BranchNode );

OO.mixinClass( ve.dm.TableCellNode, ve.dm.TableCellableNode );

/* Static Properties */

ve.dm.TableCellNode.static.name = 'tableCell';

ve.dm.TableCellNode.static.isUnwrappable = false;

ve.dm.TableCellNode.static.parentNodeTypes = [ 'tableRow' ];

ve.dm.TableCellNode.static.defaultAttributes = { style: 'data' };

ve.dm.TableCellNode.static.matchTagNames = [ 'td', 'th' ];

ve.dm.TableCellNode.static.isCellEditable = true;

// Exclude 'colspan' and 'rowspan' as they are managed explicitly
ve.dm.TableCellNode.static.preserveHtmlAttributes = function ( attribute ) {
	return attribute !== 'colspan' && attribute !== 'rowspan';
};

/* Static Methods */

ve.dm.TableCellNode.static.toDataElement = function ( domElements ) {
	const attributes = {};

	ve.dm.TableCellableNode.static.setAttributes( attributes, domElements );
	ve.dm.TableCellNode.static.setAlignmentAttributes( attributes, domElements );

	return {
		type: this.name,
		attributes: attributes
	};
};

ve.dm.TableCellNode.static.toDomElements = function ( dataElement, doc ) {
	const tag = dataElement.attributes && dataElement.attributes.style === 'header' ? 'th' : 'td',
		domElement = doc.createElement( tag ),
		attributes = dataElement.attributes;

	ve.dm.TableCellableNode.static.applyAttributes( attributes, domElement );
	ve.dm.TableCellNode.static.applyAlignmentAttributes( attributes, domElement );

	return [ domElement ];
};

/**
 * Sets align and textAlign from the DOM element onto model data (via toDataElement).
 *
 * @param {ve.dm.TableCellableNode.TableAttributes} attributes Attributes of model data
 * @param {HTMLElement[]} domElements DOM elements
 */
ve.dm.TableCellNode.static.setAlignmentAttributes = function ( attributes, domElements ) {
	const align = domElements[ 0 ].getAttribute( 'align' );
	const valign = domElements[ 0 ].getAttribute( 'valign' );
	const textAlign = domElements[ 0 ].style.textAlign;
	const verticalAlign = domElements[ 0 ].style.verticalAlign;
	if ( align ) {
		attributes.align = align;
	}
	if ( valign ) {
		attributes.valign = valign;
	}
	if ( textAlign ) {
		attributes.textAlign = attributes.originalTextAlign = textAlign;
	}
	if ( verticalAlign ) {
		attributes.verticalAlign = attributes.originalVerticalAlign = verticalAlign;
	}
};

/**
 * Apply alignment attributes from model data onto the DOM element (via toDomElements).
 *
 * @param {ve.dm.TableCellableNode.TableAttributes} attributes Attributes of model data
 * @param {HTMLElement} domElement DOM element
 */
ve.dm.TableCellNode.static.applyAlignmentAttributes = function ( attributes, domElement ) {
	if ( attributes.align ) {
		domElement.setAttribute( 'align', attributes.align );
	}
	if ( attributes.valign ) {
		domElement.setAttribute( 'valign', attributes.valign );
	}
	if ( attributes.textAlign !== attributes.originalTextAlign ) {
		domElement.style.textAlign = attributes.textAlign;
	}
	if ( attributes.verticalAlign !== attributes.originalVerticalAlign ) {
		domElement.style.verticalAlign = attributes.verticalAlign;
	}
};

/**
 * Copies align and textAlign from one model data onto another model data (via createData).
 *
 * @param {ve.dm.TableCellNode|ve.dm.TableRowNode} clonedCell Copy certain attributes from this cell
 * @param {ve.dm.TableCellableNode.TableAttributes} attributes Attributes of model data
 */
ve.dm.TableCellNode.static.copyAlignmentData = function ( clonedCell, attributes ) {
	const align = clonedCell.getAttribute( 'align' );
	const valign = clonedCell.getAttribute( 'valign' );
	const textAlign = clonedCell.getAttribute( 'textAlign' );
	const verticalAlign = clonedCell.getAttribute( 'verticalAlign' );
	if ( align ) {
		attributes.align = align;
	}
	if ( valign ) {
		attributes.valign = valign;
	}
	if ( textAlign ) {
		attributes.textAlign = textAlign;
	}
	if ( verticalAlign ) {
		attributes.verticalAlign = verticalAlign;
	}
};

/**
 * Creates data that can be inserted into the model to create a new table cell.
 *
 * @param {Object} [options]
 * @param {string} [options.style='data'] Either 'header' or 'data'
 * @param {number} [options.rowspan=1] Number of rows the cell spans
 * @param {number} [options.colspan=1] Number of columns the cell spans
 * @param {ve.dm.TableCellNode} [options.clonedCell] Copy certain attributes from this cell
 * @param {Array} [options.content] Linear model data, defaults to empty wrapper paragraph
 * @return {Array} Model data for a new table cell
 */
ve.dm.TableCellNode.static.createData = function ( options ) {
	options = options || {};
	const opening = {
		type: 'tableCell',
		attributes: {
			style: options.style || 'data',
			rowspan: options.rowspan || 1,
			colspan: options.colspan || 1
		}
	};
	if ( options.clonedCell ) {
		this.copyAlignmentData( options.clonedCell, opening.attributes );
	}
	const content = options.content || [
		{ type: 'paragraph', internal: { generated: 'wrapper' } },
		{ type: '/paragraph' }
	];
	return [ opening ].concat( content, { type: '/tableCell' } );
};

ve.dm.TableCellNode.static.describeChange = function ( key, change ) {
	if ( key === 'style' ) {
		return ve.htmlMsg( 'visualeditor-changedesc-no-key',
			// The following messages are used here:
			// * visualeditor-table-format-data
			// * visualeditor-table-format-header
			this.wrapText( 'del', ve.msg( 'visualeditor-table-format-' + change.from ) ),
			this.wrapText( 'ins', ve.msg( 'visualeditor-table-format-' + change.to ) )
		);
	} else if ( key === 'colspan' || key === 'rowspan' ) {
		// colspan/rowspan of '1' is the same as not setting it
		if ( change.from === 1 ) {
			change.from = undefined;
		}
		if ( change.to === 1 ) {
			change.to = undefined;
		}
		// These might be the same now
		if ( change.from === change.to ) {
			return null;
		}
	} else if ( key === 'originalColspan' || key === 'originalRowspan' ) {
		return null;
	}

	// Parent method
	return ve.dm.TableCellNode.super.static.describeChange.call( this, key, change );
};

/* Registration */

ve.dm.modelRegistry.register( ve.dm.TableCellNode );
