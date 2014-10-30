/*!
 * VisualEditor DataModel TableNode class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * DataModel table node.
 *
 * @class
 * @extends ve.dm.BranchNode
 *
 * @constructor
 * @param {ve.dm.Node[]} [children]
 */
ve.dm.TableNode = function VeDmTableNode() {
	// A dense representation of the sparse model to make manipulations
	// in presence of spanning cells feasible.
	this.matrix = new ve.dm.TableMatrix( this );

	// Parent constructor
	ve.dm.BranchNode.apply( this, arguments );

	// Events
	this.connect( this, { splice: 'onSplice' } );
};

/* Inheritance */

OO.inheritClass( ve.dm.TableNode, ve.dm.BranchNode );

/* Static Properties */

ve.dm.TableNode.static.name = 'table';

ve.dm.TableNode.static.childNodeTypes = [ 'tableSection', 'tableCaption' ];

ve.dm.TableNode.static.matchTagNames = [ 'table' ];

/* Methods */

/**
 * Handle splicing of child nodes
 */
ve.dm.TableNode.prototype.onSplice = function () {
	this.getMatrix().invalidate();
};

/**
 * Get table matrix for this table node
 *
 * @return {ve.dm.TableMatrix} Table matrix
 */
ve.dm.TableNode.prototype.getMatrix = function () {
	return this.matrix;
};

/**
 * Get the table's caption node, if it exists
 *
 * @return {ve.dm.TableCaptionNode|null} The table's caption node, or null if not found
 */
ve.dm.TableNode.prototype.getCaptionNode = function () {
	var i, l;
	for ( i = 0, l = this.children.length; i < l; i++ ) {
		if ( this.children[i] instanceof ve.dm.TableCaptionNode ) {
			return this.children[i];
		}
	}
	return null;
};

/**
 * Provides a cell iterator that allows convenient traversal regardless of
 * the structure with respect to sections.
 *
 * @return {ve.dm.TableNodeCellIterator}
 */
ve.dm.TableNode.prototype.getIterator = function () {
	return new ve.dm.TableNodeCellIterator( this );
};

/* Registration */

ve.dm.modelRegistry.register( ve.dm.TableNode );

/**
 * A helper class to iterate over the cells of a table node.
 *
 * It provides a unified interface to iterate cells in presence of table sections,
 * e.g., providing consecutive row indexes.
 *
 * @class
 * @mixins OO.EventEmitter
 *
 * @constructor
 * @param {ve.dm.TableNode} tableNode Table node to iterate through
 */
ve.dm.TableNodeCellIterator = function VeCeTableNodeCellIterator( tableNode ) {
	// Mixin constructors
	OO.EventEmitter.call( this );

	this.table = tableNode;
	this.sectionIndex = -1;
	this.rowIndex = -1;
	this.rowNode = null;
	this.cellIndex = -1;
	this.cellNode = null;
	this.sectionNode = null;
	this.finished = false;
};

/* Inheritance */

OO.mixinClass( ve.dm.TableNodeCellIterator, OO.EventEmitter );

/* Events */

/**
 * @event newSection
 * @param {ve.dm.TableSectionNode} node Table section node
 */

/**
 * @event newRow
 * @param {ve.dm.TableRowNode} node Table row node
 */

/* Methods */

/**
 * Get the next cell node
 *
 * @return {ve.dm.TableCellNode|null} Next cell node, or null if at the end
 */
ve.dm.TableNodeCellIterator.prototype.next = function () {
	if ( this.finished ) {
		throw new Error( 'TableNodeCellIterator has no more cells left.' );
	}
	this.nextCell( this );
	if ( this.finished ) {
		return null;
	} else {
		return this.cellNode;
	}
};

/**
 * Move to the next table section
 *
 * @fires newSection
 */
ve.dm.TableNodeCellIterator.prototype.nextSection = function () {
	this.sectionIndex++;
	this.sectionNode = this.table.children[this.sectionIndex];
	if ( !this.sectionNode ) {
		this.finished = true;
	} else if ( this.sectionNode instanceof ve.dm.TableSectionNode ) {
		this.rowIndex = 0;
		this.rowNode = this.sectionNode.children[0];
		this.emit( 'newSection', this.sectionNode );
	}
};

/**
 * Move to the next table row
 *
 * @fires newRow
 */
ve.dm.TableNodeCellIterator.prototype.nextRow = function () {
	this.rowIndex++;
	if ( this.sectionNode ) {
		this.rowNode = this.sectionNode.children[this.rowIndex];
	}
	while ( !this.rowNode && !this.finished ) {
		this.nextSection();
	}
	if ( this.rowNode ) {
		this.cellIndex = 0;
		this.cellNode = this.rowNode.children[0];
		this.emit( 'newRow', this.rowNode );
	}
};

/**
 * Move to the next table cell
 */
ve.dm.TableNodeCellIterator.prototype.nextCell = function () {
	if ( this.cellNode ) {
		this.cellIndex++;
		this.cellNode = this.rowNode.children[this.cellIndex];
	}
	// Step into the next row if there is no next cell or if the column is
	// beyond the rectangle boundaries
	while ( !this.cellNode && !this.finished ) {
		this.nextRow();
	}
};
