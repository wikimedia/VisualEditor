/*!
 * VisualEditor DataModel AlienNode, AlienBlockNode and AlienInlineNode classes.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel alien node.
 *
 * @class
 * @abstract
 * @extends ve.dm.GeneratedContentNode
 * @constructor
 * @param {number} [length] Length of content data in document; ignored and overridden to 0
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.AlienNode = function VeDmAlienNode( length, element ) {
	// Parent constructor
	ve.dm.GeneratedContentNode.call( this, 0, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.AlienNode, ve.dm.GeneratedContentNode );

/* Static members */

ve.dm.AlienNode.static.name = 'alien';

ve.dm.AlienNode.static.storeHtmlAttributes = false;

ve.dm.AlienNode.static.toDataElement = function ( domElements, converter ) {
	var isInline = this.isHybridInline( domElements, converter ),
		type = isInline ? 'alienInline' : 'alienBlock',
		html = $( '<div>', domElements[0].ownerDocument ).append( $( domElements ).clone() ).html();

	return {
		'type': type,
		'attributes': {
			'html': html
		}
	};
};

ve.dm.AlienNode.static.toDomElements = function ( dataElement, doc ) {
	var wrapper = doc.createElement( 'div' );
	$( wrapper ).html( dataElement.attributes.html );
	// Convert wrapper.children to an array
	return Array.prototype.slice.call( wrapper.childNodes, 0 );
};

/* Concrete subclasses */

/**
 * DataModel alienBlock node.
 *
 * @class
 * @extends ve.dm.AlienNode
 * @constructor
 * @param {number} [length] Length of content data in document; ignored and overridden to 0
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.AlienBlockNode = function VeDmAlienBlockNode( length, element ) {
	// Parent constructor
	ve.dm.AlienNode.call( this, length, element );
};

ve.inheritClass( ve.dm.AlienBlockNode, ve.dm.AlienNode );

ve.dm.AlienBlockNode.static.name = 'alienBlock';

/**
 * DataModel alienInline node.
 *
 * @class
 * @extends ve.dm.AlienNode
 * @constructor
 * @param {number} [length] Length of content data in document; ignored and overridden to 0
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.AlienInlineNode = function VeDmAlienInlineNode( length, element ) {
	// Parent constructor
	ve.dm.AlienNode.call( this, length, element );
};

ve.inheritClass( ve.dm.AlienInlineNode, ve.dm.AlienNode );

ve.dm.AlienInlineNode.static.name = 'alienInline';

ve.dm.AlienInlineNode.static.isContent = true;

/* Registration */

ve.dm.modelRegistry.register( ve.dm.AlienNode );
ve.dm.modelRegistry.register( ve.dm.AlienBlockNode );
ve.dm.modelRegistry.register( ve.dm.AlienInlineNode );
