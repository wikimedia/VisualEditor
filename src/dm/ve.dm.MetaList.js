/*!
 * VisualEditor DataModel MetaList class.
 *
 * @copyright 2011-2017 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * DataModel meta item.
 *
 * @class
 * @mixins OO.EventEmitter
 *
 * @constructor
 * @param {ve.dm.Surface} surface Surface model
 */
ve.dm.MetaList = function VeDmMetaList( surface ) {
	var i, metadata, item;

	// Mixin constructors
	OO.EventEmitter.call( this );

	// Properties
	this.surface = surface;
	this.document = surface.getDocument();
	// A sparse array of meta items in document order
	this.items = [];

	// Event handlers
	this.document.connect( this, { transact: 'onTransact' } );

	// Populate from document
	metadata = this.document.getMetadata();
	for ( i in metadata ) {
		if ( Object.prototype.hasOwnProperty.call( metadata, i ) ) {
			item = metadata[ i ];
			this.items[ i ] = item;
		}
	}
};

/* Inheritance */

OO.mixinClass( ve.dm.MetaList, OO.EventEmitter );

/* Events */

/**
 * @event insert
 * @param {ve.dm.MetaItem} item Item that was inserted
 */

/**
 * @event remove
 * @param {ve.dm.MetaItem} item Item that was removed
 * @param {number} offset Linear model offset that the item was at
 */

/* Methods */

/**
 * Event handler for transactions on the document.
 *
 * When a transaction occurs, update this list to account for it:
 * - insert items for new metadata that was inserted
 * - remove items for metadata that was removed
 * - translate offsets and recompute indices for metadata that has shifted
 *
 * @param {ve.dm.Transaction} tx Transaction that was applied to the document
 * @fires insert
 * @fires remove
 */
ve.dm.MetaList.prototype.onTransact = function ( tx ) {
	var i, len, op,
		newPosition = 0;
	for ( i = 0, len = tx.operations.length; i < len; i++ ) {
		op = tx.operations[ i ];
		if ( op.type === 'retain' ) {
			newPosition += op.length;
		} else if ( op.type === 'replace' ) {
			ve.sparseSplice(
				this.items,
				newPosition,
				op.remove.length,
				this.document.getMetadata( new ve.Range(
					newPosition,
					newPosition + op.insert.length
				) )
			);
			newPosition += op.insert.length;
		} else if ( op.type !== 'annotate' && op.type !== 'attribute' ) {
			throw new Error( 'Unknown operation type: ' + op.type );
		}
	}
};

/**
 * Get the item at a given offset, if there is one.
 *
 * @param {number} offset Offset in the linear model
 * @return {ve.dm.MetaItem|null} The item at offset, or null if not found
 */
ve.dm.MetaList.prototype.getItemAt = function ( offset ) {
	return this.items[ offset ] || null;
};

/**
 * Get all items in a group.
 *
 * This function returns a shallow copy, so the array isn't returned by reference but the items
 * themselves are.
 *
 * @param {string} group Group
 * @return {ve.dm.MetaItem[]} Array of items in the group (shallow copy)
 */
ve.dm.MetaList.prototype.getItemsInGroup = function ( group ) {
	return this.items.filter( function ( item ) { return item.getGroup() === group; } );
};

/**
 * Get all items in the list.
 *
 * This function returns a shallow copy, so the array isn't returned by reference but the items
 * themselves are.
 *
 * @return {ve.dm.MetaItem[]} Array of items in the list
 */
ve.dm.MetaList.prototype.getAllItems = function () {
	return this.items.filter( function () { return true; } );
};

/**
 * Insert new metadata into the document. This builds and processes a transaction that inserts
 * metadata into the document.
 *
 * Pass a plain object rather than a MetaItem into this function unless you know what you're doing.
 *
 * @param {Object|ve.dm.MetaItem} meta Metadata element (or MetaItem) to insert
 * @param {number} [offset] Offset to insert the new metadata, or undefined to add to the end
 */
ve.dm.MetaList.prototype.insertMeta = function ( meta, offset ) {
	var tx, closeMeta;
	if ( meta instanceof ve.dm.MetaItem ) {
		meta = meta.getElement();
	}
	closeMeta = { type: '/' + meta.type };
	if ( offset === undefined ) {
		offset = this.document.getInternalList().getListNode().getOuterRange().start;
	}
	tx = ve.dm.TransactionBuilder.static.newFromInsertion( this.document, offset, [ meta, closeMeta ] );
	this.surface.change( tx );
};
