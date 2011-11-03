/**
 * Creates an es.HeadingModel object.
 * 
 * @class
 * @constructor
 * @extends {es.DocumentModelLeafNode}
 * @param {Object} element Document data element of this node
 * @param {Integer} length Length of document data element
 */
es.HeadingModel = function( element, length ) {
	// Inheritance
	es.DocumentModelLeafNode.call( this, 'heading', element, length );
};

/* Methods */

/**
 * Creates a heading view for this model.
 * 
 * @method
 * @returns {es.ParagraphView}
 */
es.HeadingModel.prototype.createView = function() {
	return new es.HeadingView( this );
};

/* Registration */

es.DocumentModel.nodeModels.heading = es.HeadingModel;

es.DocumentModel.nodeRules.heading = {
	'parents': null,
	'children': []
};

/* Inheritance */

es.extendClass( es.HeadingModel, es.DocumentModelLeafNode );
