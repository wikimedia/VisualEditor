/*!
 * VisualEditor DataModel MetaList class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel meta item.
 *
 * @class
 * @extends ve.EventEmitter
 * @constructor
 * @param {ve.dm.Document} doc Document
 */
ve.dm.MetaList = function VeDmMetaList( doc ) {
	var i, j, jlen, metadata, item, group;
	// Parent constructor
	ve.EventEmitter.call( this );

	// Properties
	this.document = doc;
	this.groups = {};
	this.items = [];

	// Event handlers
	this.document.on( 'transact', ve.bind( this.onTransact, this ) );

	// Populate from document
	metadata = this.document.getMetadata();
	for ( i in metadata ) {
		if ( metadata.hasOwnProperty( i ) && ve.isArray( metadata[i] ) ) {
			for ( j = 0, jlen = metadata[i].length; j < jlen; j++ ) {
				item = ve.dm.metaItemFactory.createFromElement( metadata[i][j] );
				group = this.groups[item.getGroup()];
				if ( !group ) {
					group = this.groups[item.getGroup()] = [];
				}
				item.attach( this, Number( i ), j );
				group.push( item );
				this.items.push( item );
			}
		}
	}
};

/* Inheritance */

ve.inheritClass( ve.dm.MetaList, ve.EventEmitter );

/* Methods */

/**
 * Event handler for transactions on the document.
 *
 * When a transaction occurs, update this list to account for it:
 * - insert items for new metadata that was inserted
 * - remove items for metadata that was removed
 * - translate offsets and recompute indices for metadata that has shifted
 * @param {ve.dm.Transaction} tx Transaction that was applied to the document
 * @param {boolean} reversed Whether the transaction was applied in reverse
 */
ve.dm.MetaList.prototype.onTransact = function ( tx, reversed ) {
	var i, j, ilen, jlen, ins, rm, item, offset = 0, index = 0, ops = tx.getOperations();
	// Look for replaceMetadata operations in the transaction and insert/remove items as appropriate
	// This requires we also inspect retain, replace and replaceMetadata operations in order to
	// track the offset and index. We track the pre-transaction offset, we need to do that in
	// order to remove items correctly. This also means inserted items are initially at the wrong
	// offset, but we translate it later.
	for ( i = 0, ilen = ops.length; i < ilen; i++ ) {
		switch ( ops[i].type ) {
			case 'retain':
				offset += ops[i].length;
				index = 0;
				break;
			case 'replace':
				offset += reversed ? ops[i].insert.length : ops[i].remove.length;
				index = 0;
				break;
			case 'retainMetadata':
				index += ops[i].length;
				break;
			case 'replaceMetadata':
				ins = reversed ? ops[i].remove : ops[i].insert;
				rm = reversed ? ops[i].insert : ops[i].remove;
				for ( j = 0, jlen = rm.length; j < jlen; j++ ) {
					this.removeItem( offset, index + j );
				}
				for ( j = 0, jlen = ins.length; j < jlen; j++ ) {
					item = ve.dm.metaItemFactory.createFromElement( ins[j] );
					// offset and index are pre-transaction, but we'll fix them later
					this.insertItem( offset, index + j, item );
				}
				index += rm.length;
				break;
		}
	}

	// Translate the offsets of all items, and reindex them too
	// Reindexing is simple because the above ensures the items are already in the right order
	offset = -1;
	index = 0;
	for ( i = 0, ilen = this.items.length; i < ilen; i++ ) {
		this.items[i].setOffset( tx.translateOffset( this.items[i].getOffset(), reversed ) );
		if ( this.items[i].getOffset() === offset ) {
			index++;
		} else {
			index = 0;
		}
		this.items[i].setIndex( index );
		offset = this.items[i].getOffset();
	}
};

/**
 * Find an item by its offset, index and group.
 *
 * This function is mostly for internal usage.
 *
 * @param {number} offset Offset in the linear model
 * @param {number} index Index in the metadata array associated with that offset
 * @param {string} [group] Group to search in. If not set, search in all groups.
 * @param {boolean} [forInsertion] If the item is not found, return the index where it should have been rather than null
 * @returns {number|null} Index into this.items or this.groups[group] where the item was found, or null if not found
 */
ve.dm.MetaList.prototype.findItem = function ( offset, index, group, forInsertion ) {
	// Binary search for the item
	var mid, items = typeof group === 'string' ? ( this.groups[group] || [] ) : this.items,
		left = 0, right = items.length;
	while ( left < right ) {
		// Equivalent to Math.floor( ( left + right ) / 2 ) but much faster in V8
		/*jshint bitwise:false */
		mid = ( left + right ) >> 1;
		if ( items[mid].getOffset() === offset && items[mid].getIndex() === index ) {
			return mid;
		}
		if ( items[mid].getOffset() < offset || (
			items[mid].getOffset() === offset && items[mid].getIndex() < index
		) ) {
			left = mid + 1;
		} else {
			right = mid;
		}
	}
	return forInsertion ? left : null;
};

/**
 * Get the item at a given offset and index, if there is one.
 * @param {number} offset Offset in the linear model
 * @param {number} index Index in the metadata array
 * @returns {ve.dm.MetaItem|null} The item at (offset,index), or null if not found
 */
ve.dm.MetaList.prototype.getItemAt = function ( offset, index ) {
	var at = this.findItem( offset, index );
	return at === null ? null : this.items[at];
};

/**
 * Get all items in a group.
 *
 * This function returns a shallow copy, so the array isn't returned by reference but the items
 * themselves are.
 *
 * @param {string} group Group
 * @returns {ve.dm.MetaItem[]} Array of items in the group (shallow copy)
 */
ve.dm.MetaList.prototype.getItemsInGroup = function ( group ) {
	return ( this.groups[group] || [] ).slice( 0 );
};

/**
 * Get all items in the list.
 *
 * This function returns a shallow copy, so the array isn't returned by reference but the items
 * themselves are.
 *
 * @returns {ve.dm.MetaItem[]} Array of items in the list
 */
ve.dm.MetaList.prototype.getAllItems = function () {
	return this.items.slice( 0 );
};

/**
 * Insert an item at a given offset and index in response to a transaction.
 *
 * This function is for internal usage by onTransact(). To actually insert an item, you need to
 * process a transaction against the document that inserts metadata, then the MetaList will
 * automatically update itself and add the item.
 *
 * @param {number} offset Offset in the linear model of the new item
 * @param {number} index  Index of the new item in the metadata array at offset
 * @param {ve.dm.MetaItem} item Item object
 */
ve.dm.MetaList.prototype.insertItem = function ( offset, index, item ) {
	var group = item.getGroup(), at = this.findItem( offset, index, null, true );
	this.items.splice( at, 0, item );
	if ( this.groups[group] ) {
		at = this.findItem( offset, index, group, true );
		this.groups[group].splice( at, 0, item );
	} else {
		this.groups[group] = [ item ];
	}
	item.attach( this, offset, index );
};

/**
 * Remove an item in response to a transaction.
 *
 * This function is for internal usage by onTransact(). To actually remove an item, you need to
 * process a transaction against the document that removes the associated metadata, then the
 * MetaList will automatically update itself and remove the item.
 *
 * @param {number} offset Offset in the linear model of the item
 * @param {number} index Index of the item in the metadata array at offset
 */
ve.dm.MetaList.prototype.removeItem = function ( offset, index ) {
	var item, group, at = this.findItem( offset, index );
	if ( at === null ) {
		return;
	}
	item = this.items[at];
	group = item.getGroup();
	this.items.splice( at, 1 );
	at = this.findItem( offset, index, group );
	if ( at !== null ) {
		this.groups[group].splice( at, 1 );
	}
	item.detach( this );
};

