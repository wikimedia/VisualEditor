ve.init.createListStorage = function ( storage ) {
	/**
	 * Efficient append-only list storage extending a ve.init.SafeStorage instance
	 *
	 * This would be namespaced ve.init.ListStorage, but as a generated class
	 * it is never exported.
	 *
	 * @class ve.init.ListStorage
	 * @extends ve.init.SafeStorage
	 *
	 * @constructor
	 * @param {Storage|undefined} store The Storage instance to wrap around
	 */
	function ListStorage() {
		// Parent constructor
		ListStorage.super.apply( this, arguments );
	}

	/* Inheritance */

	// Dynamically extend the class of the storage object, in case
	// it is a sub-class of SafeStorage.
	var ParentStorage = storage.constructor;
	OO.inheritClass( ListStorage, ParentStorage );

	function getLengthKey( key ) {
		return key + '__length';
	}

	function getIndexKey( key, i ) {
		return key + '__' + i;
	}

	/* Methods */

	/**
	 * Append a value to a list stored in storage
	 *
	 * @param {string} key Key of list to set value for
	 * @param {string} value Value to set
	 * @return {boolean} The value was set
	 */
	ListStorage.prototype.appendToList = function ( key, value ) {
		var length = this.getListLength( key );

		if ( this.set( getIndexKey( key, length ), value ) ) {
			length++;
			return this.set( getLengthKey( key ), length.toString() );
		}
		return false;
	};

	/**
	 * Get the length of a list in storage
	 *
	 * @param {string} key Key of list
	 * @return {number} List length, 0 if the list doesn't exist
	 */
	ListStorage.prototype.getListLength = function ( key ) {
		return +this.get( getLengthKey( key ) ) || 0;
	};

	/**
	 * Get a list stored in storage
	 *
	 * Internally this will use items with the keys:
	 *  - key__length
	 *  - key__0 … key__N
	 *
	 * @param {string} key Key of list
	 * @return {string[]} List
	 */
	ListStorage.prototype.getList = function ( key ) {
		var list = [],
			length = this.getListLength( key );

		for ( var i = 0; i < length; i++ ) {
			list.push( this.get( getIndexKey( key, i ) ) );
		}
		return list;
	};

	/**
	 * Remove a list stored in storage
	 *
	 * @param {string} key Key of list
	 */
	ListStorage.prototype.removeList = function ( key ) {
		var length = this.getListLength( key );

		for ( var i = 0; i < length; i++ ) {
			this.remove( getIndexKey( key, i ) );
		}
		this.remove( getLengthKey( key ) );
	};

	return new ListStorage( storage.store );
};
