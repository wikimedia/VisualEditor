/**
 * Creates an es.TableCellModel object.
 * 
 * @class
 * @constructor
 * @extends {es.DocumentModelBranchNode}
 * @param {Object} element Document data element of this node
 * @param {es.DocumentModelNode[]} contents List of child nodes to initially add
 */
es.TableCellModel = function( element, contents ) {
	// Inheritance
	es.DocumentModelBranchNode.call( this, 'tableCell', element, contents );
};

/* Methods */

/**
 * Creates a table cell view for this model.
 * 
 * @method
 * @returns {es.TableCellView}
 */
es.TableCellModel.prototype.createView = function() {
	return new es.TableCellView( this );
};

/* Registration */

es.DocumentModel.nodeModels.tableCell = es.TableCellModel;

es.DocumentModel.nodeRules.tableCell = {
	'parents': ['tableRow'],
	'children': null
};

/* Inheritance */

es.extendClass( es.TableCellModel, es.DocumentModelBranchNode );
