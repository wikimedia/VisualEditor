/**
 * Creates an es.ListView object.
 * 
 * @class
 * @constructor
 * @extends {es.DocumentViewBranchNode}
 * @param {es.ListModel} model List model to view
 */
es.ListView = function( model ) {
	// Inheritance
	es.DocumentViewBranchNode.call( this, model );

	// DOM Changes
	this.$.addClass( 'es-listView' );

	// Events
	this.on( 'update', this.enumerate );

	// Initialization
	this.enumerate();
};

/* Methods */

/**
 * Set the number labels of all ordered list items.
 * 
 * @method
 */
es.ListView.prototype.enumerate = function() {
	var styles,
		levels = [];
	for ( var i = 0; i < this.children.length; i++ ) {
		styles = this.children[i].model.getElementAttribute( 'styles' );
		levels = levels.slice( 0, styles.length );
		if ( styles[styles.length - 1] === 'number' ) {
			if ( !levels[styles.length - 1] ) {
				levels[styles.length - 1] = 0;
			}
			this.children[i].$icon.text( number + '.' );
		} else {
			this.children[i].$icon.text( '' );
		}
	}
};

/* Registration */

es.DocumentView.splitRules.list = {
	'self': false,
	'children': true
};

/* Inheritance */

es.extendClass( es.ListView, es.DocumentViewBranchNode );
