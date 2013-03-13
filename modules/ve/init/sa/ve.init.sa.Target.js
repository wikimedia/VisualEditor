/*!
 * VisualEditor Standalone Initialization Target class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Initialization Standalone target.
 *
 * @class
 * @extends ve.init.Target
 *
 * @constructor
 * @param {jQuery} $container Container to render target into
 */
ve.init.sa.Target = function VeInitSaTarget( $container ) {
	// Parent constructor
	ve.init.Target.call( this, $container );
};

/* Inheritance */

ve.inheritClass( ve.init.sa.Target, ve.init.Target );
