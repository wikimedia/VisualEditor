/*!
 * VisualEditor DataModel TableRowNode class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * DataModel table row node.
 *
 * @class
 * @extends ve.dm.BranchNode
 *
 * @constructor
 * @param {Object} [element] Reference to element in linear model
 * @param {ve.dm.Node[]} [children]
 */
ve.dm.TableRowNode = function VeDmTableRowNode() {
	// Parent constructor
	ve.dm.TableRowNode.super.apply( this, arguments );

	// Events
	this.connect( this, { splice: 'onSplice' } );
};

/* Inheritance */

OO.inheritClass( ve.dm.TableRowNode, ve.dm.BranchNode );

/* Static Properties */

ve.dm.TableRowNode.static.name = 'tableRow';

ve.dm.TableRowNode.static.childNodeTypes = [ 'tableCell', 'alienTableCell' ];

ve.dm.TableRowNode.static.parentNodeTypes = [ 'tableSection' ];

ve.dm.TableRowNode.static.matchTagNames = [ 'tr' ];

/* Static Methods */

ve.dm.TableRowNode.static.toDataElement = function ( domElements ) {
	const attributes = {};
	ve.dm.TableCellNode.static.setAlignmentAttributes( attributes, domElements );
	const dataElement = { type: this.name };
	if ( !ve.isEmptyObject( attributes ) ) {
		dataElement.attributes = attributes;
	}
	return dataElement;
};

ve.dm.TableRowNode.static.toDomElements = function ( dataElement, doc ) {
	const attributes = dataElement.attributes || {};
	const domElement = doc.createElement( 'tr' );
	ve.dm.TableCellNode.static.applyAlignmentAttributes( attributes, domElement );
	return [ domElement ];
};

/**
 * Creates data that can be inserted into the model to create a new table row.
 *
 * @param {Object} [options] Creation options
 * @param {string|string[]} [options.style='data'] Cell style; 'data' or 'header', or array of styles
 * @param {number} [options.cellCount=1] Number of cells to create
 * @param {ve.dm.TableRowNode} [options.clonedRow] Copy certain attributes from this row
 * @param {ve.dm.TableCellNode[]} [options.clonedCells] Copy certain attributes from these cells (the array needs to be of size cellCount)
 * @return {Array} Model data for a new table row
 */
ve.dm.TableRowNode.static.createData = function ( options ) {
	options = options || {};

	const cellCount = options.cellCount || 1;

	const opening = { type: 'tableRow' };
	if ( options.clonedRow ) {
		const attributes = {};
		ve.dm.TableCellNode.static.copyAlignmentData( options.clonedRow, attributes );
		if ( !ve.isEmptyObject( attributes ) ) {
			opening.attributes = attributes;
		}
	}

	const data = [ opening ];
	for ( let i = 0; i < cellCount; i++ ) {
		ve.batchPush( data, ve.dm.TableCellNode.static.createData( {
			clonedCell: Array.isArray( options.clonedCells ) ? options.clonedCells[ i ] : undefined,
			style: Array.isArray( options.style ) ? options.style[ i ] : options.style
		} ) );
	}
	data.push( { type: '/tableRow' } );
	return data;
};

/* Methods */

/**
 * Handle splicing of child nodes
 */
ve.dm.TableRowNode.prototype.onSplice = function () {
	if ( this.getRoot() ) {
		this.getParent().getParent().getMatrix().invalidate();
	}
	const nodes = Array.prototype.slice.call( arguments, 2 );
	for ( let i = 0; i < nodes.length; i++ ) {
		nodes[ i ].connect( this, {
			attributeChange: [ 'onCellAttributeChange', nodes[ i ] ]
		} );
	}
};

/**
 * Handle cell attribute changes
 *
 * @param {ve.dm.TableCellableNode} cell
 * @fires ve.dm.TableNode#cellAttributeChange
 */
ve.dm.TableRowNode.prototype.onCellAttributeChange = function ( cell ) {
	this.emit( 'cellAttributeChange', cell );
};

/* Registration */

ve.dm.modelRegistry.register( ve.dm.TableRowNode );
