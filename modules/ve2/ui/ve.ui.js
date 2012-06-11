/**
 * VisualEditor User Interface namespace.
 *
 * All classes and functions will be attached to this object to keep the global namespace clean.
 */
ve.ui = {
	
};

/*
 * @method static
 * Returns UI stylesheet path
 */
ve.ui.getStylesheetPath = function() {
	// gets the path to a UI
	// TODO: look for mw.util and rewrite
	return mw.config.get( 'wgExtensionAssetsPath' ) + '/VisualEditor/modules/ve2/ui/styles/';
};
