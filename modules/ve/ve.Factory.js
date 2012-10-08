/**
 * VisualEditor Factory class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Generic object factory.
 *
 * @class
 * @abstract
 * @constructor
 * @extends {ve.EventEmitter}
 */
ve.Factory = function VeFactory() {
	// Parent constructor
	ve.EventEmitter.call( this );

	// Properties
	this.registry = [];
};

/* Inheritance */

ve.inheritClass( ve.Factory, ve.EventEmitter );

/* Methods */

/**
 * Register a constructor with the factory.
 *
 * Arguments will be passed through directly to the constructor.
 * @see {ve.Factory.prototype.create}
 *
 * @method
 * @param {String} type Object type
 * @param {Function} constructor Constructor to use when creating object
 * @throws 'Constructor must be a function, cannot be a string'
 */
ve.Factory.prototype.register = function ( type, constructor ) {
	if ( typeof constructor !== 'function' ) {
		throw new Error( 'Constructor must be a function, cannot be a ' + typeof constructor );
	}
	this.registry[type] = constructor;
	this.emit( 'register', type, constructor );
};

/**
 * Create an object based on a type.
 *
 * Type is used to look up the constructor to use, while all additional arguments are passed to the
 * constructor directly, so leaving one out will pass an undefined to the constructor.
 *
 * @method
 * @param {string} type Object type.
 * @param {mixed} [...] Arguments to pass to the constructor.
 * @returns {Object} The new object.
 * @throws 'Unknown object type'
 */
ve.Factory.prototype.create = function ( type ) {
	var args, obj,
		constructor = this.registry[type];

	if ( constructor === undefined ) {
		throw new Error( 'Unknown object type: ' + type );
	}

	// Convert arguments to array and shift the first argument (type) off
	args = Array.prototype.slice.call( arguments, 1 );

	// We can't use the "new" operator with .apply directly because apply needs a
	// context. So instead just do what "new" does: Create an object that inherits from
	// the constructor's prototype (which also makes it an "instanceof" the constructor),
	// then invoke the constructor with the object as context, and return it (ignoring
	// the constructor's return value).
	obj = ve.createObject( constructor.prototype );
	constructor.apply( obj, args );
	return obj;
};

/**
 * Gets a constructor for a given type.
 *
 * @method
 * @param {String} type Object type
 * @returns {Function|undefined} Constructor for type
 */
ve.Factory.prototype.lookup = function ( type ) {
	return this.registry[type];
};
