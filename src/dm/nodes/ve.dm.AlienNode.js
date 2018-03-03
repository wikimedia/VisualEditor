/*!
 * VisualEditor DataModel AlienNode, AlienBlockNode and AlienInlineNode classes.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * DataModel alien node.
 *
 * @class
 * @abstract
 * @extends ve.dm.LeafNode
 * @mixins ve.dm.FocusableNode
 *
 * @constructor
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.AlienNode = function VeDmAlienNode() {
	// Parent constructor
	ve.dm.AlienNode.super.apply( this, arguments );

	// Mixin constructor
	ve.dm.FocusableNode.call( this );
};

/* Inheritance */

OO.inheritClass( ve.dm.AlienNode, ve.dm.LeafNode );

OO.mixinClass( ve.dm.AlienNode, ve.dm.FocusableNode );

/* Static members */

ve.dm.AlienNode.static.name = 'alien';

ve.dm.AlienNode.static.preserveHtmlAttributes = false;

ve.dm.AlienNode.static.enableAboutGrouping = true;

ve.dm.AlienNode.static.matchRdfaTypes = [ 've:Alien' ];

ve.dm.AlienNode.static.toDataElement = function ( domElements, converter ) {
	var element, attributes,
		isInline = this.isHybridInline( domElements, converter ),
		type = isInline ? 'alienInline' : 'alienBlock';

	if ( domElements.length === 1 && [ 'td', 'th' ].indexOf( domElements[ 0 ].nodeName.toLowerCase() ) !== -1 ) {
		attributes = {};
		ve.dm.TableCellableNode.static.setAttributes( attributes, domElements );
		element = {
			type: 'alienTableCell',
			attributes: attributes
		};
	} else {
		element = { type: type };
	}

	return element;
};

ve.dm.AlienNode.static.toDomElements = function ( dataElement, doc, converter ) {
	return ve.copyDomElements( converter.getStore().value( dataElement.originalDomElementsHash ) || [], doc );
};

/**
 * @inheritdoc
 */
ve.dm.AlienNode.static.isDiffComparable = function ( element, other ) {
	return element.type === other.type && element.originalDomElementsHash === other.originalDomElementsHash;
};

/**
 * @inheritdoc
 */
ve.dm.AlienNode.static.getHashObject = function ( dataElement ) {
	return {
		type: dataElement.type,
		// Some comparison methods ignore the originalDomElementsHash
		// property. Rename it so it doesn't get ignored for alien nodes.
		alienDomElementsHash: dataElement.originalDomElementsHash
	};
};

/* Concrete subclasses */

/**
 * DataModel alienBlock node.
 *
 * @class
 * @extends ve.dm.AlienNode
 *
 * @constructor
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.AlienBlockNode = function VeDmAlienBlockNode() {
	// Parent constructor
	ve.dm.AlienBlockNode.super.apply( this, arguments );
};

OO.inheritClass( ve.dm.AlienBlockNode, ve.dm.AlienNode );

ve.dm.AlienBlockNode.static.name = 'alienBlock';

/**
 * DataModel alienInline node.
 *
 * @class
 * @extends ve.dm.AlienNode
 *
 * @constructor
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.AlienInlineNode = function VeDmAlienInlineNode() {
	// Parent constructor
	ve.dm.AlienInlineNode.super.apply( this, arguments );
};

OO.inheritClass( ve.dm.AlienInlineNode, ve.dm.AlienNode );

ve.dm.AlienInlineNode.static.name = 'alienInline';

ve.dm.AlienInlineNode.static.isContent = true;

/**
 * DataModel alienTableCell node.
 *
 * @class
 * @extends ve.dm.AlienNode
 * @mixins ve.dm.TableCellableNode
 *
 * @constructor
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.AlienTableCellNode = function VeDmAlienTableCellNode() {
	// Parent constructor
	ve.dm.AlienTableCellNode.super.apply( this, arguments );

	// Mixin constructor
	ve.dm.TableCellableNode.call( this );
};

OO.inheritClass( ve.dm.AlienTableCellNode, ve.dm.AlienNode );

OO.mixinClass( ve.dm.AlienTableCellNode, ve.dm.TableCellableNode );

ve.dm.AlienTableCellNode.static.name = 'alienTableCell';

/* Registration */

ve.dm.modelRegistry.register( ve.dm.AlienBlockNode );
ve.dm.modelRegistry.register( ve.dm.AlienInlineNode );
ve.dm.modelRegistry.register( ve.dm.AlienTableCellNode );
