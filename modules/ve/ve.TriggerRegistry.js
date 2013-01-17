/*!
 * VisualEditor TriggerRegistry class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
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
 * @method
 * @param {string|string[]} config.name Symbolic name or list of symbolic names
 * @param {object} config.trigger Command string of keys that should trigger the command
 * @param {string|string[]} config.trigger Command string of keys that should trigger the command
 */
ve.TriggerRegistry.prototype.register = function ( config ) {
	var platform = ve.init.platform.getSystemPlatform(),
		key = platform === 'mac' ? 'mac' : 'pc';

	if ( typeof config.name !== 'string' && !ve.isArray( config.name ) ) {
		throw new Error( 'name must be a string or array, cannot be a ' + typeof config.name );
	}
	if ( typeof config.trigger !== 'string' && !ve.isPlainObject( config.trigger ) ) {
		throw new Error( 'trigger must be a string or an object, cannot be a ' + typeof config.trigger );
	}
	if ( typeof config.labelMessage !== 'string' && !ve.isPlainObject( config.labelMessage ) ) {
		throw new Error( 'label must be a string or an object, cannot be a ' + typeof config.labelMessage );
	}
	ve.Registry.prototype.register.call(
		this, config.name,
		{
			'trigger': ve.isPlainObject( config.trigger ) ? config.trigger[key] : config.trigger,
			'labelMessage': ve.isPlainObject( config.labelMessage ) ? config.labelMessage[key] : config.labelMessage
		}
	);
};

/* Initialization */

ve.triggerRegistry = new ve.TriggerRegistry();
