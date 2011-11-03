/**
 * Creates an es.ListModel object.
 * 
 * @class
 * @constructor
 * @extends {es.DocumentModelBranchNode}
 * @param {Object} element Document data element of this node
 * @param {es.ListItemModel[]} contents List of child nodes to initially add
 */
es.ListModel = function( element, contents ) {
	// Inheritance
	es.DocumentModelBranchNode.call( this, 'list', element, contents );
};

/* Methods */

/**
 * Creates a list view for this model.
 * 
 * @method
 * @returns {es.ListView}
 */
es.ListModel.prototype.createView = function() {
	return new es.ListView( this );
};

/* Registration */

es.DocumentModel.nodeModels.list = es.ListModel;

es.DocumentModel.nodeRules.list = {
	'parents': null,
	'children': ['listItem']
};

/* Inheritance */

es.extendClass( es.ListModel, es.DocumentModelBranchNode );
