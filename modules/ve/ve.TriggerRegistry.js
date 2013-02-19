/*!
 * VisualEditor TriggerRegistry class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Trigger registry.
 *
 * @class
 * @extends ve.Registry
 * @constructor
 */
ve.TriggerRegistry = function VeTriggerRegistry() {
	// Parent constructor
	ve.Registry.call( this );
};

/* Inheritance */

ve.inheritClass( ve.TriggerRegistry, ve.Registry );

/* Methods */

/**
 * Register a constructor with the factory.
 *
 * The only supported platforms are 'mac' and 'pc'. All platforms not identified as 'mac' will be
 * considered to be 'pc', including 'win', 'linux', 'solaris', etc.
 *
 * @method
 * @param {string|string[]} name Symbolic name or list of symbolic names
 * @param {ve.Trigger|Object} trigger Trigger object, or map of trigger objects keyed by
 * platform name e.g. 'mac' or 'pc'
 */
ve.TriggerRegistry.prototype.register = function ( name, trigger ) {
	var platform = ve.init.platform.getSystemPlatform(),
		platformKey = platform === 'mac' ? 'mac' : 'pc';

	// Validate arguments
	if ( typeof name !== 'string' && !ve.isArray( name ) ) {
		throw new Error( 'name must be a string or array, cannot be a ' + typeof name );
	}
	if  ( !( trigger instanceof ve.Trigger ) && !ve.isPlainObject( trigger ) ) {
		throw new Error(
			'trigger must be an instance of ve.Trigger or an object containing instances of ' +
				've.Trigger, cannot be a ' + typeof trigger
		);
	}

	// Check for platform-specific trigger
	if ( ve.isPlainObject( trigger ) ) {
		// Only register if the current platform is supported
		if ( platformKey in trigger ) {
			ve.Registry.prototype.register.call( this, name, trigger[platformKey] );
		}
	} else {
		ve.Registry.prototype.register.call( this, name, trigger );
	}
};

/* Initialization */

ve.triggerRegistry = new ve.TriggerRegistry();
