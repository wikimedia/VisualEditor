/**
 * Creates an es.PreModel object.
 * 
 * @class
 * @constructor
 * @extends {es.DocumentModelLeafNode}
 * @param {Object} element Document data element of this node
 * @param {Integer} length Length of document data element
 */
es.PreModel = function( element, length ) {
	// Inheritance
	es.DocumentModelLeafNode.call( this, 'pre', element, length );
};

/* Methods */

/**
 * Creates a pre view for this model.
 * 
 * @method
 * @returns {es.PreView}
 */
es.PreModel.prototype.createView = function() {
	return new es.PreView( this );
};

/* Registration */

es.DocumentModel.nodeModels.pre = es.PreModel;

es.DocumentModel.nodeRules.pre = {
	'parents': null,
	'children': []
};

/* Inheritance */

es.extendClass( es.PreModel, es.DocumentModelLeafNode );
