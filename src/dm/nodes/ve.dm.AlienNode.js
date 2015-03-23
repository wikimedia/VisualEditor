/*!
 * VisualEditor DataModel AlienNode, AlienBlockNode and AlienInlineNode classes.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
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

	// Mixin constructors
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
	var isInline = this.isHybridInline( domElements, converter ),
		type = isInline ? 'alienInline' : 'alienBlock';

	return { type: type };
};

ve.dm.AlienNode.static.toDomElements = function ( dataElement, doc ) {
	return ve.copyDomElements( dataElement.originalDomElements, doc );
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

/* Registration */

ve.dm.modelRegistry.register( ve.dm.AlienBlockNode );
ve.dm.modelRegistry.register( ve.dm.AlienInlineNode );
