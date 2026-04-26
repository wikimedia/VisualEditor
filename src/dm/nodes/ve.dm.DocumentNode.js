/*!
 * VisualEditor DataModel DocumentNode class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * DataModel document node.
 *
 * @class
 * @extends ve.dm.BranchNode
 *
 * @constructor
 * @param {ve.dm.BranchNode[]} [children] Child nodes to attach
 */
ve.dm.DocumentNode = function VeDmDocumentNode( children ) {
	// Parent constructor
	ve.dm.DocumentNode.super.call( this, null, children );

	// Properties
	this.root = this;
};

/* Inheritance */

OO.inheritClass( ve.dm.DocumentNode, ve.dm.BranchNode );

/* Static Properties */

ve.dm.DocumentNode.static.name = 'document';

ve.dm.DocumentNode.static.isWrapped = false;

ve.dm.DocumentNode.static.parentNodeTypes = [];

ve.dm.DocumentNode.static.matchTagNames = [];

/* Methods */

ve.dm.DocumentNode.prototype.getElement =
ve.dm.DocumentNode.prototype.getAttribute =
ve.dm.DocumentNode.prototype.getAttributes =
ve.dm.DocumentNode.prototype.getOriginalDomElements =
ve.dm.DocumentNode.prototype.getClonedElement =
ve.dm.DocumentNode.prototype.getHashObject = function () {
	throw new Error( 'DocumentNodes do not exist in the linear model' );
};

/**
 * Calculates and returns the offsets of every subroot
 *
 * This is designed to be used with caching. It is much faster to calculate the offset of all
 * subroots simultaneously than to calculate each individually.
 *
 * @see ve.dm.Node#getOffset
 * @return {Map} Numerical offset for each subroot node
 */
ve.dm.DocumentNode.prototype.getSubrootOffsets = function () {
	let offset = 0;
	const subrootOffsets = new Map();
	this.children.forEach( ( child ) => {
		subrootOffsets.set( child, offset );
		offset += child.getOuterLength();
	} );
	return subrootOffsets;
};

/* Registration */

ve.dm.modelRegistry.register( ve.dm.DocumentNode );
