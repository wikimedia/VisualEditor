/**
 * TinyVE CE Node - owner of ContentEditable DOM node
 *
 * This is a toy version of ve.ce.Node and subclasses, which illustrates the main concepts
 */

/**
 * A node in the CE tree.
 *
 * This is a tree of nodes that own ContentEditable DOM nodes. There is one CE node for each
 * DM node.
 *
 * In real VE, each node type has its own subclass of `ve.ce.Node`, and the subclasses are
 * instantiated through a node factory so extensions can at types.
 *
 * In real VE, some of the functionality in here is in a base class `ve.ce.View`.
 *
 * @class
 * @see {ve.ce.Node}
 * @see {ve.ce.NodeFactory}
 *
 * @constructor
 * @param {tinyve.dm.Node} model Model for which this object is a view
 * @param {tinyve.ce.Surface} surface Surface view to which this object belongs
 */
tinyve.ce.Node = function TinyVeCeNode( model, surface ) {
	/**
	 * @property {tinyve.dm.Node} model Model for which this object is a view
	 */
	this.model = model;

	this.surface = surface;

	// Parent constructor. Needs `.model` and `.surface` to be defined already
	tinyve.ce.Node.super.call( this );

	this.$element.addClass( 'tinyve-ce-Node' );
	// The following classes are used here:
	// * tinyve-ce-Node-document
	// * tinyve-ce-Node-ul
	// * tinyve-ce-Node-li
	// * tinyve-ce-Node-p
	// * tinyve-ce-Node-h1
	// * tinyve-ce-Node-h2
	// * tinyve-ce-Node-h3
	this.$element.addClass( 'tinyve-ce-Node-' + model.type );
	this.$element.data( 'view', this );
};

OO.inheritClass( tinyve.ce.Node, OO.ui.Element );

/**
 * This method is used by OO.ui.Element to initialize $element, which eventually gets attached
 * to the DOM as the representation of this node.
 *
 * In real VE, there is typically a class per node type. The string `.static.tagName` is used;
 *
 * @override
 * @return {string} The tag name for this Node's $element
 */
tinyve.ce.Node.prototype.getTagName = function () {
	if ( this.model.type === 'document' ) {
		return 'div';
	}
	return this.model.type;
};
