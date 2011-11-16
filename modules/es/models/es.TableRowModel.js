/**
 * Creates an es.TableRowModel object.
 * 
 * @class
 * @constructor
 * @extends {es.DocumentModelBranchNode}
 * @param {Object} element Document data element of this node
 * @param {es.DocumentModelNode[]} contents List of child nodes to initially add
 */
es.TableRowModel = function( element, contents ) {
	// Inheritance
	es.DocumentModelBranchNode.call( this, 'tableRow', element, contents );
};

/* Methods */

/**
 * Creates a table row view for this model.
 * 
 * @method
 * @returns {es.TableRowView}
 */
es.TableRowModel.prototype.createView = function() {
	return new es.TableRowView( this );
};

/* Registration */

es.DocumentModel.nodeModels.tableRow = es.TableRowModel;

es.DocumentModel.nodeRules.tableRow = {
	'parents': ['table'],
	'children': ['tableCell']
};

/* Inheritance */

es.extendClass( es.TableRowModel, es.DocumentModelBranchNode );
