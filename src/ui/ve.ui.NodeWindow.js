/*!
 * VisualEditor user interface NodeWindow class.
 *
 * @copyright 2011-2016 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Mixin for window for working with a node.
 *
 * @class
 * @abstract
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
ve.ui.NodeWindow = function VeUiNodeWindow() {
	// Properties
	this.selectedNode = null;
};

/* Inheritance */

OO.initClass( ve.ui.NodeWindow );

/* Static Properties */

/**
 * Node classes compatible with this dialog.
 *
 * @static
 * @property {Function}
 * @inheritable
 */
ve.ui.NodeWindow.static.modelClasses = [];

/* Methods */

/**
 * Get the selected node.
 *
 * Should only be called after setup and before teardown.
 * If no node is selected or the selected node is incompatible, null will be returned.
 *
 * @param {Object} [data] Window opening data
 * @return {ve.dm.Node|null} Selected node
 */
ve.ui.NodeWindow.prototype.getSelectedNode = function () {
	var i, len,
		modelClasses = this.constructor.static.modelClasses,
		selectedNode = this.getFragment().getSelectedNode();

	for ( i = 0, len = modelClasses.length; i < len; i++ ) {
		if ( selectedNode instanceof modelClasses[ i ] ) {
			return selectedNode;
		}
	}
	return null;
};

/**
 * @inheritdoc OO.ui.Window
 */
ve.ui.NodeWindow.prototype.getSetupProcess = function ( data, process ) {
	return process.next( function () {
		this.selectedNode = this.getSelectedNode( data );
	}, this );
};

/**
 * @inheritdoc OO.ui.Window
 */
ve.ui.NodeWindow.prototype.getTeardownProcess = function ( data, process ) {
	return process.first( function () {
		this.selectedNode = null;
	}, this );
};
