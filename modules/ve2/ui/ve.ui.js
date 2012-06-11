/**
 * VisualEditor User Interface namespace.
 *
 * All classes and functions will be attached to this object to keep the global namespace clean.
 */
ve.ui = {
	// Path to UI assets for direct loading
	'stylesheetPath': 'extensions/VisualEditor/modules/ve2/ui/styles/'
};

/*
 * @method static
 * Returns UI stylesheet path
 */
ve.ui.getStylesheetPath = function() {
	if ( 'mw' in window ) {
		return mw.config.get( 'wgExtensionAssetsPath' ) + '/VisualEditor/modules/ve2/ui/styles/';
	} else {
		return ve.ui.stylesheetPath;
	}
};
