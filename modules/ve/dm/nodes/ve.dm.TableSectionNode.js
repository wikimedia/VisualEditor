/*!
 * VisualEditor DataModel TableSelectionNode class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel table section node.
 *
 * @class
 * @extends ve.dm.BranchNode
 * @constructor
 * @param {ve.dm.BranchNode[]} [children] Child nodes to attach
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.TableSectionNode = function VeDmTableSectionNode( children, element ) {
	// Parent constructor
	ve.dm.BranchNode.call( this, 'tableSection', children, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.TableSectionNode, ve.dm.BranchNode );

/* Static Properties */

ve.dm.TableSectionNode.static.name = 'tableSection';

ve.dm.TableSectionNode.static.childNodeTypes = [ 'tableRow' ];

ve.dm.TableSectionNode.static.parentNodeTypes = [ 'table' ];

ve.dm.TableSectionNode.static.defaultAttributes = {
	'style': 'body'
};

ve.dm.TableSectionNode.static.matchTagNames = [ 'thead', 'tbody', 'tfoot' ];

ve.dm.TableSectionNode.static.toDataElement = function ( domElement ) {
	var styles = {
			'thead': 'header',
			'tbody': 'body',
			'tfoot': 'footer'
		},
		style = styles[domElement.nodeName.toLowerCase()] || 'body';
	return { 'type': 'tableSection', 'attributes': { 'style': style } };
};

ve.dm.TableSectionNode.static.toDomElement = function ( dataElement ) {
	var tags = {
			'header': 'thead',
			'body': 'tbody',
			'footer': 'tfoot'
		},
		tag = tags[dataElement.attributes && dataElement.attributes.style || 'body'];
	return document.createElement( tag );
};
/* Registration */

ve.dm.modelRegistry.register( 'tableSection', ve.dm.TableSectionNode );
