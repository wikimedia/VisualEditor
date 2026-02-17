/*!
 * VisualEditor ContentEditable UnrenderedNode class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * ContentEditable unrendered node
 *
 * Used for nodes which aren't children of attachedRoot
 *
 * Can be linked to any type of model node.
 *
 * @extends ve.ce.LeafNode
 *
 * @constructor
 * @param {ve.dm.Node} model
 * @param {Object} [config]
 */
ve.ce.UnrenderedNode = function VeCeUnrenderedNode() {
	// Parent constructor
	ve.ce.UnrenderedNode.super.apply( this, arguments );

	// Release unused DOM node
	this.$element = $( [] );
};

/* Inheritance */

OO.inheritClass( ve.ce.UnrenderedNode, ve.ce.LeafNode );

/* Methods */

/**
 * @inheritdoc
 * @localdoc While the model node may be focusable in general,
 *  unrendered nodes are not focusable.
 */
ve.ce.UnrenderedNode.prototype.isFocusable = function () {
	return false;
};

/* Static Properties */

ve.ce.UnrenderedNode.static.name = 'unrendered';
