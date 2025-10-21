/*!
 * VisualEditor DataModel InternalList class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * DataModel meta item.
 *
 * @class
 * @mixes OO.EventEmitter
 *
 * @constructor
 * @param {ve.dm.Document} doc Document model
 */
ve.dm.InternalList = function VeDmInternalList( doc ) {
	// Mixin constructors
	OO.EventEmitter.call( this );

	// Properties
	/**
	 * @private Please use {@link #getDocument} instead
	 * @property {ve.dm.Document} document The document this internal list is in a 1:1 relationship
	 * with
	 */
	this.document = doc;

	/**
	 * @private See {@link #queueItemHtml}
	 * @property {string[]} itemHtmlQueue Array of HTML strings. Emptied after {@link #convertToData}
	 * is called.
	 */
	this.itemHtmlQueue = [];

	/**
	 * @private See {@link #getListNode}
	 * @property {ve.dm.InternalListNode|null} listNode The corresponding data model node this meta
	 * item belongs to. Lazy-initialized via {@link #getListNode}.
	 */
	this.listNode = null;

	/**
	 * @private Please use {@link #getNodeGroups} instead
	 * @property {Object.<string,ve.dm.InternalListNodeGroup>} nodes Keyed by group name
	 */
	this.nodes = {};

	/**
	 * @private See {@link #markGroupAsChanged}
	 * @property {string[]} groupsChanged Array of group names; array index is meaningless
	 */
	this.groupsChanged = [];

	/**
	 * @private Please use {@link #getKeyIndex} instead
	 * @property {Object.<string,number>} keyIndexes Internal item index, keyed by "groupName/key"
	 */
	this.keyIndexes = {};

	/**
	 * @property {string[]} keys Array index is meaningful and identical to the numbers in the
	 * `firstNodes` and `indexOrder` properties of {@link nodes} elements.
	 */
	this.keys = [];

	// Event handlers
	doc.connect( this, { transact: 'onTransact' } );
};

/* Inheritance */

OO.mixinClass( ve.dm.InternalList, OO.EventEmitter );

/* Events */

/**
 * @event ve.dm.InternalList#update
 * @param {string[]} groupsChanged List of groups changed since the last transaction
 */

/* Methods */

/**
 * Queues up an item's html for parsing later.
 *
 * If an item with the specified group and key already exists it will be ignored, unless
 * the data already stored is an empty string.
 *
 * @param {string} groupName Item group
 * @param {string} key Item key
 * @param {string} html Item contents
 * @return {{index: number, isNew: boolean}} Object containing index of the item in the index-value store
 * (and also its index in the internal list node), and a flag indicating if it is a new item.
 */
ve.dm.InternalList.prototype.queueItemHtml = function ( groupName, key, html ) {
	let isNew = false,
		index = this.getKeyIndex( groupName, key );

	if ( index === undefined ) {
		index = this.itemHtmlQueue.length;
		this.keyIndexes[ groupName + '/' + key ] = index;
		this.itemHtmlQueue.push( html );
		isNew = true;
	} else if ( this.itemHtmlQueue[ index ] === '' ) {
		// Previous value with this key was empty, overwrite value in queue
		this.itemHtmlQueue[ index ] = html;
		isNew = true;
	}
	return {
		index: index,
		isNew: isNew
	};
};

/**
 * Gets the internal list's document model
 *
 * @return {ve.dm.Document} Document model
 */
ve.dm.InternalList.prototype.getDocument = function () {
	return this.document;
};

/**
 * Get the list node
 *
 * @return {ve.dm.InternalListNode} List node
 */
ve.dm.InternalList.prototype.getListNode = function () {
	// Find listNode if not set, or unattached
	if ( !this.listNode || !this.listNode.doc ) {
		const nodes = this.getDocument().getDocumentNode().children;
		for ( let i = nodes.length; i >= 0; i-- ) {
			if ( nodes[ i ] instanceof ve.dm.InternalListNode ) {
				this.listNode = nodes[ i ];
				break;
			}
		}
	}
	return this.listNode;
};

/**
 * Get the number it internal items in the internal list.
 *
 * @return {number}
 */
ve.dm.InternalList.prototype.getItemNodeCount = function () {
	return this.getListNode().children.length;
};

/**
 * Get the item node from a specific index.
 *
 * @param {number} index Item index, use {@link getKeyIndex} to map group and key to an index
 * @return {ve.dm.InternalItemNode|undefined}
 */
ve.dm.InternalList.prototype.getItemNode = function ( index ) {
	return this.getListNode().children[ index ];
};

/**
 * Get all node groups.
 *
 * @return {Object.<string,ve.dm.InternalListNodeGroup>} Node groups, keyed by group name
 */
ve.dm.InternalList.prototype.getNodeGroups = function () {
	return this.nodes;
};

/**
 * Get the node group object for a specified group name.
 *
 * @param {string} groupName Name of the group
 * @return {ve.dm.InternalListNodeGroup|undefined} Node group object, containing nodes and key order array
 */
ve.dm.InternalList.prototype.getNodeGroup = function ( groupName ) {
	return this.nodes[ groupName ];
};

/**
 * @deprecated please use `.getNodeGroup( … ).getUniqueListKey( … )` instead
 */
ve.dm.InternalList.prototype.getUniqueListKey = function ( groupName, oldListKey, prefix ) {
	return this.getNodeGroup( groupName ).getUniqueListKey( oldListKey, prefix );
};

/**
 * Get the next number in a monotonically increasing series.
 *
 * @return {number} One higher than the return value of the previous call, or 0 on the first call
 */
ve.dm.InternalList.prototype.getNextUniqueNumber = function () {
	const doc = this.getDocument();
	const number = ( doc.getStorage( 'internallist-counter' ) || 0 );
	doc.setStorage( 'internallist-counter', number + 1 );
	return number;
};

/**
 * Converts stored item HTML into linear data.
 *
 * Each item is an InternalItem, and they are wrapped in an InternalList.
 * If there are no items an empty array is returned.
 *
 * Stored HTML is deleted after conversion.
 *
 * @param {ve.dm.ModelFromDomConverter} converter
 * @param {HTMLDocument} doc Document to create nodes in
 * @return {ve.dm.LinearData.Item[]} Linear model data
 */
ve.dm.InternalList.prototype.convertToData = function ( converter, doc ) {
	const itemHtmlQueue = this.itemHtmlQueue;

	const list = [];
	list.push( { type: 'internalList' } );
	for ( let i = 0, length = itemHtmlQueue.length; i < length; i++ ) {
		if ( itemHtmlQueue[ i ] !== '' ) {
			const div = doc.createElement( 'div' );
			div.innerHTML = itemHtmlQueue[ i ];
			const itemData = [
				{ type: 'internalItem' },
				...converter.getDataFromDomSubtree( div ),
				{ type: '/internalItem' }
			];
			if ( !converter.isFromClipboard() ) {
				itemData[ 0 ].attributes = { originalHtml: itemHtmlQueue[ i ] };
			}
			ve.batchPush( list, itemData );
		} else {
			list.push( { type: 'internalItem' }, { type: '/internalItem' } );
		}
	}
	list.push( { type: '/internalList' } );
	// After conversion we no longer need the HTML
	this.itemHtmlQueue = [];
	return list;
};

/**
 * Generate a transaction for inserting a new internal item node
 *
 * @param {string} groupName Item group
 * @param {string} key Item key
 * @param {ve.dm.LinearData.Item[]} data Linear model data
 * @return {{transaction: ve.dm.Transaction|null, index: number}} Object containing the transaction
 *  (or null if none required) and the new item's index within the list
 */
ve.dm.InternalList.prototype.getItemInsertion = function ( groupName, key, data ) {
	let index = this.getKeyIndex( groupName, key );
	if ( index !== undefined ) {
		return {
			transaction: null,
			index
		};
	}

	index = this.getItemNodeCount();
	this.keyIndexes[ groupName + '/' + key ] = index;
	return {
		transaction: ve.dm.TransactionBuilder.static.newFromInsertion(
			this.getDocument(),
			this.getListNode().getRange().end,
			[ { type: 'internalItem' }, ...data, { type: '/internalItem' } ]
		),
		index
	};
};

/**
 * Get the internal item index of a group key if it already exists
 *
 * @private
 * @param {string} groupName Item group
 * @param {string} key Item name
 * @return {number|undefined} The index of the group key, or undefined if it doesn't exist yet
 */
ve.dm.InternalList.prototype.getKeyIndex = function ( groupName, key ) {
	return this.keyIndexes[ groupName + '/' + key ];
};

/**
 * Add a node.
 *
 * @param {string} groupName Item group
 * @param {string} key Item name
 * @param {number} index New item index, or an existing one to replace an item
 * @param {ve.dm.Node} node Reference node to add
 */
ve.dm.InternalList.prototype.addNode = function ( groupName, key, index, node ) {
	let group = this.nodes[ groupName ];
	// The group may not exist yet
	if ( !group ) {
		group = this.nodes[ groupName ] = new ve.dm.InternalListNodeGroup();
	}

	this.keys[ index ] = key;
	if ( node.getDocument().buildingNodeTree ) {
		// If the document is building the original node tree
		// then every item is being added in order, so we don't
		// need to worry about sorting.
		group.appendNodeWithKnownIndex( key, node, index );
	} else {
		group.insertNodeInDocumentOrder( key, node, index );
	}
	this.markGroupAsChanged( groupName );
};

/**
 * Mark a node group as having been changed since the last transaction.
 *
 * @private
 * @param {string} groupName Name of group which has changed
 */
ve.dm.InternalList.prototype.markGroupAsChanged = function ( groupName ) {
	if ( !this.groupsChanged.includes( groupName ) ) {
		this.groupsChanged.push( groupName );
	}
};

/**
 * Handle document transaction events
 *
 * @private
 * @fires ve.dm.InternalList#update
 */
ve.dm.InternalList.prototype.onTransact = function () {
	if ( !this.groupsChanged.length ) {
		return;
	}

	this.groupsChanged
		.map( ( groupName ) => this.getNodeGroup( groupName ) )
		.forEach( ( nodeGroup ) => nodeGroup.sortGroupIndexes() );
	this.emit( 'update', this.groupsChanged );
	this.groupsChanged = [];
};

/**
 * Remove a node.
 *
 * @param {string} groupName Item group
 * @param {string} key Item name
 * @param {number} index Item index
 * @param {ve.dm.Node} node Reference node to remove
 */
ve.dm.InternalList.prototype.removeNode = function ( groupName, key, index, node ) {
	this.getNodeGroup( groupName ).unsetNode( key, node );
	this.markGroupAsChanged( groupName );
};

/**
 * Clone this internal list.
 *
 * @param {ve.dm.Document} [doc] The new list's document. Defaults to this list's document.
 * @return {ve.dm.InternalList}
 */
ve.dm.InternalList.prototype.clone = function ( doc ) {
	const clone = new this.constructor( doc || this.getDocument() );
	// Most properties don't need to be copied, because addNode() will be invoked when the new
	// document tree is built. But some do need copying:
	clone.itemHtmlQueue = ve.copy( this.itemHtmlQueue );
	return clone;
};

/**
 * Merge another internal list into this one.
 *
 * This function updates the state of this list, and returns a mapping from indexes in list to
 * indexes in this, as well as a set of ranges that should be copied from list's linear model
 * into this list's linear model by the caller.
 *
 * @param {ve.dm.InternalList} list Internal list to merge into this list
 * @param {number} commonLength The number of elements, counted from the beginning, that the lists have in common
 * @return {{mapping: Object.<number,number>, newItemRanges: ve.Range[]}} mapping is an object
 *  mapping indexes in list to indexes in this; newItemRanges is an array of ranges of internal
 *  nodes in list's document that should be copied into our document
 */
ve.dm.InternalList.prototype.merge = function ( list, commonLength ) {
	const listLen = list.getItemNodeCount(),
		newItemRanges = [],
		mapping = {};
	let nextIndex = this.getItemNodeCount();

	for ( let i = 0; i < commonLength; i++ ) {
		mapping[ i ] = i;
	}
	for ( let i = commonLength; i < listLen; i++ ) {
		// Try to find i in list.keyIndexes
		let key = null;
		for ( const k in list.keyIndexes ) {
			if ( list.keyIndexes[ k ] === i ) {
				key = k;
				break;
			}
		}

		if ( this.keyIndexes[ key ] !== undefined ) {
			// We already have this key in this internal list. Ignore the duplicate that the other
			// list is trying to merge in.
			// NOTE: This case cannot occur in VE currently, but may be possible in the future with
			// collaborative editing, which is why this code needs to be rewritten before we do
			// collaborative editing.
			mapping[ i ] = this.keyIndexes[ key ];
		} else {
			mapping[ i ] = nextIndex;
			if ( key !== null ) {
				this.keyIndexes[ key ] = nextIndex;
			}
			nextIndex++;
			newItemRanges.push( list.getItemNode( i ).getOuterRange() );
		}
	}
	return {
		mapping: mapping,
		newItemRanges: newItemRanges
	};
};
