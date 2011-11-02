/**
 * Creates an es.ParagraphModel object.
 * 
 * @class
 * @constructor
 * @extends {es.DocumentModelNode}
 * @param {Object} element Document data element of this node
 * @param {Integer} length Length of document data element
 */
es.ParagraphModel = function( element, length ) {
	// Inheritance
	es.DocumentModelNode.call( this, element, length );
};

/* Methods */

/**
 * Creates a paragraph view for this model.
 * 
 * @method
 * @returns {es.ParagraphView}
 */
es.ParagraphModel.prototype.createView = function() {
	return new es.ParagraphView( this );
};

/* Registration */

es.DocumentModel.nodeModels.paragraph = es.ParagraphModel;

es.DocumentModel.nodeRules.paragraph = {
	'parents': null,
	'children': []
};

/* Inheritance */

es.extendClass( es.ParagraphModel, es.DocumentModelNode );
