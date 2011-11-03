/**
 * Creates an es.TableModel object.
 * 
 * @class
 * @constructor
 * @extends {es.DocumentModelBranchNode}
 * @param {Object} element Document data element of this node
 * @param {es.TableCellModel[]} contents List of child nodes to initially add
 */
es.TableModel = function( element, contents ) {
	// Inheritance
	es.DocumentModelBranchNode.call( this, 'table', element, contents );
};

/* Methods */

/**
 * Creates a table view for this model.
 * 
 * @method
 * @returns {es.TableView}
 */
es.TableModel.prototype.createView = function() {
	return new es.TableView( this );
};

/* Registration */

es.DocumentModel.nodeModels.table = es.TableModel;

es.DocumentModel.nodeRules.table = {
	'parents': null,
	'children': ['tableRow']
};

/* Inheritance */

es.extendClass( es.TableModel, es.DocumentModelBranchNode );
