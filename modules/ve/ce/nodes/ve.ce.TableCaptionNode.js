/*!
 * VisualEditor ContentEditable TableCaptionNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable table caption node.
 *
 * @class
 * @extends ve.ce.BranchNode
 * @constructor
 * @param {ve.dm.TableCaptionNode} model Model to observe
 */
ve.ce.TableCaptionNode = function VeCeTableCaptionNode( model ) {
	// Parent constructor
	ve.ce.BranchNode.call( this, model, $( '<caption>' ) );
};

/* Inheritance */

ve.inheritClass( ve.ce.TableCaptionNode, ve.ce.BranchNode );

/* Static Properties */

ve.ce.TableCaptionNode.static.name = 'tableCaption';

/* Registration */

ve.ce.nodeFactory.register( ve.ce.TableCaptionNode );
