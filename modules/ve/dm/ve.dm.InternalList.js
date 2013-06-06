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
	this.itemHtmlQueue = [];
	this.listNode = null;
	this.nodes = {};
	this.groupsChanged = [];

	// Event handlers
	this.getDocument().connect( this, { 'transact': 'onTransact' } );
};

/* Inheritance */

ve.mixinClass( ve.dm.InternalList, ve.EventEmitter );

/* Events */

/**
 * @event update
 * @param {string[]} groupsChanged List of groups changed since the last transaction
 */

/* Methods */

/**
 * Queues up an item's html for parsing later.
 *
 * If an item with the specified group and key already exists it will be ignored, unless
 * the data already stored is an empty string.
 *
 * @method
 * @param {string} groupName Item group
 * @param {string} key Item key
 * @param {string} html Item contents
 * @returns {Object} Object containing index of the item in the index-value store
 * (and also its index in the internal list node), and a flag indicating if it is a new item.
 */
ve.dm.InternalList.prototype.queueItemHtml = function ( groupName, key, html ) {
	var isNew = false, index = this.getStore().indexOfHash( groupName + '/' + key );
	if ( index === null ) {
		index = this.getStore().index( html, groupName + '/' + key );
		this.itemHtmlQueue.push( index );
		isNew = true;
	} else if ( this.getStore().value( index ) === '' ) {
		// Previous value with this key was empty, overwrite value in store
		this.getStore().index( html, groupName + '/' + key, true );
		isNew = true;
	}
	return {
		'index': index,
		'isNew': isNew
	};
};

/**
 * Gets all the item's HTML strings
 * @method
 * @returns {Object} Name-indexed object containing HTMLElements
 */
ve.dm.InternalList.prototype.getItemHtmlQueue = function () {
	return this.getStore().values( this.itemHtmlQueue );
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
 * Gets the internal list's index value store
 * @method
 * @returns {ve.dm.IndexValueStore} Index value store
 */
ve.dm.InternalList.prototype.getStore = function () {
	return this.store;
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
 * Get the node group object for a specified group name.
 * @param {string} groupName Name of the group
 * @returns {Object} Node group object, containing nodes and key order array
 */
ve.dm.InternalList.prototype.getNodeGroup = function ( groupName ) {
	return this.nodes[groupName];
};

/**
 * Converts stored item HTML into linear data.
 *
 * Each item is an InternalItem, and they are wrapped in an InternalList.
 * If there are no items an empty array is returned.
 *
 * Stored HTML is deleted after conversion.
 *
 * @method
 * @param {ve.dm.Converter} converter Converter object
 * @returns {Array} Linear model data
 */
ve.dm.InternalList.prototype.convertToData = function ( converter ) {
	var i, length, itemData,
		itemHtmlQueue = this.getItemHtmlQueue(), list = [];

	if ( itemHtmlQueue.length ) {
		list.push( { 'type': 'internalList' } );
		for ( i = 0, length = itemHtmlQueue.length; i < length; i++ ) {
			itemData = converter.getDataFromDomRecursion( $( '<div>' ).html( itemHtmlQueue[i] )[0] );
			list = list.concat(
				[{ 'type': 'internalItem' }],
				itemData,
				[{ 'type': '/internalItem' }]
			);
		}
		list.push( { 'type': '/internalList' } );
	}
	// After conversion we no longer need the HTML
	this.itemHtmlQueue = [];
	return list;
};

/**
 * Get position of a key within a group
 * @param {string} groupName Name of the group
 * @param {string} key Name of the key
 * @returns {number} Position within the key ordering for that group
 */
ve.dm.InternalList.prototype.getKeyPosition = function ( groupName, key ) {
	return ve.indexOf( key, this.nodes[groupName].keyOrder );
};

/**
 * Add a node.
 * @method
 * @param {string} groupName Item group
 * @param {string} key Item name
 * @param {ve.dm.Node} node Item node
 */
ve.dm.InternalList.prototype.addNode = function ( groupName, key, node ) {
	var i, len, start, keyNodes, group = this.nodes[groupName];
	// The group may not exist yet
	if ( group === undefined ) {
		group = this.nodes[groupName] = {
			'keyNodes': {},
			'keyOrder': []
		};
	}
	keyNodes = group.keyNodes[key];
	// The key may not exist yet
	if ( keyNodes === undefined ) {
		keyNodes = group.keyNodes[key] = [];
	}

	if ( ve.indexOf( key, group.keyOrder ) === -1 ) {
		group.keyOrder.push( key );
	}
	if ( node.getDocument().buildingNodeTree ) {
		// If the document is building the original node tree
		// then every item is being added in order, so we don't
		// need to worry about sorting.
		keyNodes.push( node );
	} else {
		// TODO: We could use binary search insertion sort
		start = node.getRange().start;
		for ( i = 0, len = keyNodes.length; i < len; i++ ) {
			if ( start < keyNodes[i].getRange().start ) {
				break;
			}
		}
		// 'i' is now the insertion point, so add the node here
		keyNodes.splice( i, 0, node );
	}
	this.markGroupAsChanged( groupName );
};

/**
 * Mark a node group as having been changed since the last transaction.
 * @param {string} groupName Name of group which has changed
 */
ve.dm.InternalList.prototype.markGroupAsChanged = function ( groupName ) {
	if ( ve.indexOf( groupName, this.groupsChanged ) === -1 ) {
		this.groupsChanged.push( groupName );
	}
};

/**
 * Handle document transaction events
 * @emits update
 */
ve.dm.InternalList.prototype.onTransact = function () {
	var i;
	if ( this.groupsChanged.length > 0 ) {
		// length will almost always be 1, so probably better to not cache it
		for ( i = 0; i < this.groupsChanged.length; i++ ) {
			this.sortGroupKeys( this.nodes[this.groupsChanged[i]] );
		}
		this.emit( 'update', this.groupsChanged );
		this.groupsChanged = [];
	}
};

/**
 * Remove a node.
 * @method
 * @param {string} groupName Item group
 * @param {string} key Item name
 * @param {ve.dm.Node} node Item node
 */
ve.dm.InternalList.prototype.removeNode = function ( groupName, key, node ) {
	var i, len, j,
		group = this.nodes[groupName],
		keyNodes = group.keyNodes[key];
	for ( i = 0, len = keyNodes.length; i < len; i++ ) {
		if ( keyNodes[i] === node ) {
			keyNodes.splice( i, 1 );
			if ( keyNodes.length === 0 ) {
				delete group.keyNodes[key];
				j = ve.indexOf( key, group.keyOrder );
				group.keyOrder.splice( j, 1 );
			}
			break;
		}
	}
	this.markGroupAsChanged( groupName );
};

/**
 * Sort the keyOrder array within a group object.
 * @param {Object} group Group object
 */
ve.dm.InternalList.prototype.sortGroupKeys = function ( group ) {
	// Sort keyOrder
	group.keyOrder.sort( function ( key1, key2 ) {
		return group.keyNodes[key1][0].getRange().start - group.keyNodes[key2][0].getRange().start;
	} );
};

/**
 * Clone this internal list.
 *
 * @param {ve.dm.Document} [doc] The new list's document. Defaults to this list's document.
 * @returns {ve.dm.InternalList} Clone of this internal
 */
ve.dm.InternalList.prototype.clone = function ( doc ) {
	var clone = new this.constructor( doc || this.getDocument() );
	clone.store = this.getStore().clone();
	return clone;
};

/**
 * Merge another document's internal list into this one.
 *
 * Objects that are in other but not in this are added to this, possibly with a different index.
 *
 * @param {ve.dm.InternalList} other List to merge into this one
 * @returns {Object} Object in which the keys are indexes in other and the values are the corresponding keys in this
 */
ve.dm.InternalList.prototype.merge = function ( other ) {
	var i, len, index, storeMapping = this.getStore().merge( other.getStore() ), mapping = {};
	for ( i = 0, len = other.itemHtmlQueue.length; i < len; i++ ) {
		other.itemHtmlQueue[i] = storeMapping[other.itemHtmlQueue[i]];
		index = ve.indexOf( other.itemHtmlQueue[i], this.itemHtmlQueue );
		if ( index === -1 ) {
			index = this.itemHtmlQueue.push( other.itemHtmlQueue[i] ) - 1;
		}
		mapping[i] = index;
	}
	return mapping;
};
