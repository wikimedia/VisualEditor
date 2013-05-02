/*!
 * VisualEditor DataModel InternalList class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel meta item.
 *
 * @class
 * @mixins ve.EventEmitter
 *
 * @constructor
 * @param {ve.dm.Document} doc Document model
 */
ve.dm.InternalList = function VeDmInternalList( doc ) {
	// Mixin constructors
	ve.EventEmitter.call( this );

	// Properties
	this.document = doc;
	this.store = new ve.dm.IndexValueStore();
	this.itemsHtml = [];
	this.listNode = null;

	// Event handlers
	//this.document.connect( this, { 'transact', 'onTransact' } );
};

/* Inheritance */

ve.mixinClass( ve.dm.InternalList, ve.EventEmitter );

/* Methods */

/**
 * Add an item to the list.
 *
 * If an item with this key already exists it will be ignored.
 *
 * @method
 * @param {string} key Item key
 * @param {string} body Item contents
 * @returns {number} Index of the item in the index-value store, and also the list
 */
ve.dm.InternalList.prototype.addItem = function ( key, body ) {
	var index = this.store.indexOfHash( key );
	if ( index === null ) {
		index = this.store.index( body, key );
		this.itemsHtml.push( index );
	}
	return index;
};

/**
 * Gets all the item's HTML strings
 * @method
 * @returns {Object} Name-indexed object containing HTMLElements
 */
ve.dm.InternalList.prototype.getItemsHtml = function () {
	return this.store.values( this.itemsHtml );
};

/**
 * Gets the internal list's document model
 * @method
 * @returns {ve.dm.Document} Document model
 */
ve.dm.InternalList.prototype.getDocument = function () {
	return this.document;
};

/**
 * Get the list node
 * @method
 * @returns {ve.dm.InternalListNode} List node
 */
ve.dm.InternalList.prototype.getListNode = function () {
	var i, nodes;
	// find listNode if not set, or unattached
	if ( !this.listNode || !this.listNode.doc ) {
		nodes = this.getDocument().documentNode.children;
		for ( i = nodes.length; i >= 0; i-- ) {
			if ( nodes[i] instanceof ve.dm.InternalListNode ) {
				this.listNode = nodes[i];
				break;
			}
		}
	}
	return this.listNode;
};

/**
 * Get the item node from a specific index
 * @method
 * @param {number} index Item's index
 * @returns {ve.dm.InternalItemNode} Item node
 */
ve.dm.InternalList.prototype.getItemNode = function ( index ) {
	return this.getListNode().children[index];
};

/**
 * Gets linear model data for all the stored item's HTML.
 *
 * Each item is an InternalItem, and they are wrapped in an InternalList.
 * If there are no items an empty array is returned.
 *
 * @method
 * @param {ve.dm.Converter} converter Converter object
 * @returns {Array} Linear model data
 */
ve.dm.InternalList.prototype.getDataFromDom = function ( converter ) {
	var i, length, itemData,
		itemsHtml = this.getItemsHtml(), list = [];

	if ( itemsHtml.length ) {
		list.push( { 'type': 'internalList' } );
		for ( i = 0, length = itemsHtml.length; i < length; i++ ) {
			itemData = converter.getDataFromDomRecursion( $( itemsHtml[i] )[0] );
			list = list.concat(
				[{ 'type': 'internalItem' }],
				itemData,
				[{ 'type': '/internalItem' }]
			);
		}
		list.push( { 'type': '/internalList' } );
	}
	return list;
};