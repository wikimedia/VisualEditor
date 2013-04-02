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
 * @extends ve.dm.LeafNode
 * @constructor
 * @param {number} [length] Length of content data in document; ignored and overridden to 0
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.AlienNode = function VeDmAlienNode( length, element ) {
	// Parent constructor
	ve.dm.LeafNode.call( this, 0, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.AlienNode, ve.dm.LeafNode );

/* Static members */

ve.dm.AlienNode.static.name = 'alien';

ve.dm.AlienNode.static.matchTagNames = [];

ve.dm.AlienNode.static.enableAboutGrouping = true;

ve.dm.AlienNode.static.storeHtmlAttributes = false;

ve.dm.AlienNode.static.toDataElement = function ( domElements, context ) {
	var i, isInline, allTagsInline, type, html;
	// Check whether all elements are inline elements
	allTagsInline = true;
	for ( i = 0; i < domElements.length; i++ ) {
		if ( ve.isBlockElement( domElements[i] ) ) {
			allTagsInline = false;
			break;
		}
	}

	// We generate alienBlock elements for block tags and alienInline elements for
	// inline tags; unless we're in a content location, in which case we have no choice
	// but to generate an alienInline element.
	isInline =
		// Force inline in content locations (but not wrappers)
		( context.expectingContent && !context.inWrapper ) ||
		// Also force inline in wrappers that we can't close
		( context.inWrapper && !context.canCloseWrapper ) ||
		// Look at the tag names otherwise
		allTagsInline;
	type = isInline ? 'alienInline' : 'alienBlock';
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
	wrapper.innerHTML = dataElement.attributes.html;
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
