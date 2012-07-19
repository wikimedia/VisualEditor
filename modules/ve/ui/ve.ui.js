/*global mw */

/**
 * VisualEditor user interface namespace.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Namespace for all VisualEditor user interface classes, static methods and static properties.
 */
ve.ui = {
	// Path to UI assets for direct loading
	'stylesheetPath': 'extensions/VisualEditor/modules/ve/ui/styles/'
};

/*
 * @method static
 * Returns UI stylesheet path
 */
ve.ui.getStylesheetPath = function() {
	if ( 'mw' in window ) {
		return mw.config.get( 'wgExtensionAssetsPath' ) + '/VisualEditor/modules/ve/ui/styles/';
	} else {
		return ve.ui.stylesheetPath;
	}
};
