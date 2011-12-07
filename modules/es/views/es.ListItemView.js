/**
 * Creates an es.ListItemView object.
 * 
 * @class
 * @constructor
 * @extends {es.DocumentViewLeafNode}
 * @param {es.ListItemModel} model List item model to view
 */
es.ListItemView = function( model ) {
	// Inheritance
	es.DocumentViewBranchNode.call( this, model );

	// Properties
	this.$icon = $( '<div class="es-listItemView-icon"></div>' ).prependTo( this.$ );
	this.currentStylesHash = null;
	
	// DOM Changes
	this.$.addClass( 'es-listItemView' );

	// Events
	this.on( 'update', this.setClasses );

	// Initialization
	this.setClasses();
};

/* Methods */

es.ListItemView.prototype.setClasses = function() {
	var styles = this.model.getElementAttribute( 'styles' ),
		stylesHash = styles.join( '|' );
	if ( this.currentStylesHash !== stylesHash ) {
		this.currentStylesHash = stylesHash;
		var classes = this.$.attr( 'class' );
		this.$
			// Remove any existing level classes
			.attr(
				'class',
				classes
					.replace( / ?es-listItemView-level[0-9]+/, '' )
					.replace( / ?es-listItemView-(bullet|number)/, '' )
			)
			// Set the list style class from the style on top of the stack
			.addClass( 'es-listItemView-' + styles[styles.length - 1] )
			// Set the list level class from the length of the stack
			.addClass( 'es-listItemView-level' + ( styles.length - 1 ) );
	}
};

/* Registration */

es.DocumentView.splitRules.listItem = {
	'self': true,
	'children': false
};

/* Inheritance */

es.extendClass( es.ListItemView, es.DocumentViewBranchNode );
