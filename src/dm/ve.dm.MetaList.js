/*!
 * VisualEditor DataModel MetaList class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * DataModel meta list.
 *
 * @class
 * @mixes OO.EventEmitter
 *
 * @constructor
 * @param {ve.dm.Document} doc Document model
 */
ve.dm.MetaList = function VeDmMetaList( doc ) {
	// Mixin constructors
	OO.EventEmitter.call( this );

	this.doc = doc;

	// Sorted array of attached ve.dm.MetaItem nodes in document order
	this.items = [];

	// The meta list is constructed before the model tree is built, so
	// we don't need to initialise this item list, just listen to changes
	this.doc.connect( this, {
		nodeAttached: 'onNodeAttached',
		nodeDetached: 'onNodeDetached'
	} );
};

/* Inheritance */

OO.mixinClass( ve.dm.MetaList, OO.EventEmitter );

/* Events */

/**
 * @event ve.dm.MetaList#insert
 * @param {ve.dm.MetaItem} item Item that was inserted
 */

/**
 * @event ve.dm.MetaList#remove
 * @param {ve.dm.MetaItem} item Item that was removed
 */

/* Methods */

/**
 * If a ve.dm.MetaItem was attached, insert it into items in document order
 *
 * @param {ve.dm.Node} node The node that was attached
 */
ve.dm.MetaList.prototype.onNodeAttached = function ( node ) {
	const offsetPath = node.getOffsetPath();
	if ( node instanceof ve.dm.MetaItem ) {
		const i = OO.binarySearch( this.items, ( other ) => ve.compareTuples( offsetPath, other.getOffsetPath() ), true );
		this.items.splice( i, 0, node );
		this.emit( 'insert', node );
	}
};

/**
 * If a ve.dm.MetaItem was detached, remove it from items
 *
 * @param {ve.dm.Node} node The node that was detached
 */
ve.dm.MetaList.prototype.onNodeDetached = function ( node ) {
	if ( node instanceof ve.dm.MetaItem ) {
		const i = this.items.indexOf( node );
		if ( i !== -1 ) {
			this.items.splice( i, 1 );
			this.emit( 'remove', node );
		}
	}
};

ve.dm.MetaList.prototype.indexOf = function ( item, group ) {
	const items = group ? this.getItemsInGroup( group ) : this.items;
	return items.indexOf( item );
};

/**
 * Get all items in a group.
 *
 * This function returns a shallow copy, so the array isn't returned by reference but the items
 * themselves are.
 *
 * @param {string} group
 * @return {ve.dm.MetaItem[]} Array of items in the group (shallow copy)
 */
ve.dm.MetaList.prototype.getItemsInGroup = function ( group ) {
	return this.items.filter( ( item ) => item.getGroup() === group );
};

/**
 * Get all items in the list.
 *
 * This function returns a shallow copy, so the array isn't returned by reference but the items
 * themselves are.
 *
 * @return {ve.dm.MetaItem[]} Array of items in the list
 */
ve.dm.MetaList.prototype.getItems = function () {
	return this.items.slice();
};
