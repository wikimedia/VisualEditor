/*!
 * VisualEditor DataModel GeneratedContentNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel generated content node.
 *
 * @class
 * @abstract
 * @extends ve.dm.LeafNode
 * @constructor
 * @param {number} [length] Length of content data in document; ignored and overridden to 0
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.GeneratedContentNode = function VeDmGeneratedContentNode( length, element ) {
	// Parent constructor
	ve.dm.LeafNode.call( this, 0, element );
};

/* Inheritance */

ve.inheritClass( ve.dm.GeneratedContentNode, ve.dm.LeafNode );

/* Static members */

ve.dm.GeneratedContentNode.static.name = 'generatedContent';

ve.dm.GeneratedContentNode.static.matchTagNames = [];

ve.dm.GeneratedContentNode.static.enableAboutGrouping = true;

/**
 * Store HTML of DOM elements, hashed on data element
 * @param {Object} dataElement Data element
 * @param {HTMLElement[]} domElements DOM elements
 * @param {ve.dm.IndexValueStore} store Index-value store
 * @returns {number} Index of stored data
 */
ve.dm.GeneratedContentNode.static.storeDomElements = function( dataElement, domElements, store ) {
	var hash = ve.getHash( this.getHashObject( dataElement ) );
	return store.index( domElements, hash );
};

/* Registration */

ve.dm.modelRegistry.register( ve.dm.GeneratedContentNode );