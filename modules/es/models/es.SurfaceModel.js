/**
 * Creates an es.SurfaceModel object.
 * 
 * @class
 * @constructor
 * @param {es.DocumentModel} doc Document model to create surface for
 */
es.SurfaceModel = function( doc ) {
	this.doc = doc;
};

/* Methods */

es.SurfaceModel.prototype.getDocument = function() {
	return this.doc;
};
