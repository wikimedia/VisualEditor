/*!
 * VisualEditor DataModel ReferenceNode class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * DataModel reference node.
 *
 * TODO: pull in enough code from ve.dm.MWReferenceNode for a basic standalone implementation
 *
 * @class
 *
 * @constructor
 */
ve.dm.ReferenceNode = function VeDmReferenceNode() {
	// Parent constructor
	ve.dm.ReferenceNode.super.apply( this, arguments );

	// Mixin constructors
	ve.dm.FocusableNode.call( this );
};

/* Inheritance */

OO.inheritClass( ve.dm.ReferenceNode, ve.dm.LeafNode );

OO.mixinClass( ve.dm.ReferenceNode, ve.dm.FocusableNode );

/* Static members */

ve.dm.ReferenceNode.static.name = 'reference';

ve.dm.ReferenceNode.static.matchTagNames = null;

ve.dm.ReferenceNode.static.isContent = true;

ve.dm.ReferenceNode.static.handlesOwnChildren = true;
