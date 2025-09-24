/*!
 * VisualEditor DataModel TableSelectionNode class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * DataModel table section node.
 *
 * @class
 * @extends ve.dm.BranchNode
 *
 * @constructor
 * @param {Object} [element] Reference to element in linear model
 * @param {ve.dm.Node[]} [children]
 */
ve.dm.TableSectionNode = function VeDmTableSectionNode() {
	// Parent constructor
	ve.dm.TableSectionNode.super.apply( this, arguments );

	// Events
	this.connect( this, { splice: 'onSplice' } );
};

/* Inheritance */

OO.inheritClass( ve.dm.TableSectionNode, ve.dm.BranchNode );

/* Static Properties */

ve.dm.TableSectionNode.static.name = 'tableSection';

ve.dm.TableSectionNode.static.childNodeTypes = [ 'tableRow' ];

ve.dm.TableSectionNode.static.parentNodeTypes = [ 'table' ];

ve.dm.TableSectionNode.static.defaultAttributes = { style: 'body' };

ve.dm.TableSectionNode.static.matchTagNames = [ 'thead', 'tbody', 'tfoot' ];

/* Static Methods */

ve.dm.TableSectionNode.static.toDataElement = function ( domElements ) {
	const styles = {
			thead: 'header',
			tbody: 'body',
			tfoot: 'footer'
		},
		style = styles[ domElements[ 0 ].nodeName.toLowerCase() ] || 'body';
	return { type: this.name, attributes: { style: style } };
};

ve.dm.TableSectionNode.static.toDomElements = function ( dataElement, doc ) {
	const tags = {
			header: 'thead',
			body: 'tbody',
			footer: 'tfoot'
		},
		tag = tags[ dataElement.attributes && dataElement.attributes.style || 'body' ];
	return [ doc.createElement( tag ) ];
};

/* Methods */

/**
 * Handle splicing of child nodes
 *
 * @param {number} index
 * @param {number} deleteCount
 * @param {...ve.dm.Node} [nodes]
 */
ve.dm.TableSectionNode.prototype.onSplice = function ( index, deleteCount, ...nodes ) {
	if ( this.getRoot() ) {
		this.getParent().getMatrix().invalidate();
	}

	nodes.forEach( ( node ) => {
		node.connect( this, {
			cellAttributeChange: 'onCellAttributeChange'
		} );
	} );
};

/**
 * Handle cell attribute changes
 *
 * @param {ve.dm.TableCellableNode} cell
 * @fires ve.dm.TableNode#cellAttributeChange
 */
ve.dm.TableSectionNode.prototype.onCellAttributeChange = function ( cell ) {
	this.emit( 'cellAttributeChange', cell );
};

/* Registration */

ve.dm.modelRegistry.register( ve.dm.TableSectionNode );
