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
 * WARNING: JavaScript does not allow using new and .apply together, so we just pass through 3
 * arguments here since we know we only need that many at this time. If we need more in the future
 * we should change this to suit that use case. Because of undefined pass through, there's no harm
 * in adding more.
 *
 * @method
 * @param {String} type Object type
 * @param {Mixed} [...] Up to 3 additional arguments to pass through to the constructor
 * @returns {Object} The new object
 * @throws 'Unknown object type'
 */
ve.Factory.prototype.create = function ( type, a, b, c ) {
	if ( type in this.registry ) {
		return new this.registry[type]( a, b, c );
	}
	throw new Error( 'Unknown object type: ' + type );
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
