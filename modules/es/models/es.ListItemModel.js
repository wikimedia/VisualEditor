/**
 * Creates an es.ListItemModel object.
 * 
 * @class
 * @constructor
 * @extends {es.DocumentModelNode}
 * @param {Object} element Document data element of this node
 * @param {Integer} length Length of document data element
 */
es.ListItemModel = function( element, length ) {
	// Inheritance
	es.DocumentModelNode.call( this, element, length );
};

/* Methods */

/**
 * Creates a list item view for this model.
 * 
 * @method
 * @returns {es.ListItemView}
 */
es.ListItemModel.prototype.createView = function() {
	return new es.ListItemView( this );
};

/* Registration */

es.DocumentModel.nodeModels.listItem = es.ListItemModel;

es.DocumentModel.nodeRules.listItem = {
	'parents': ['list'],
	'children': []
};

/* Inheritance */

es.extendClass( es.ListItemModel, es.DocumentModelNode );
