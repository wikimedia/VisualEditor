/*!
 * VisualEditor ContentEditable MWTemplate class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable MediaWiki template node.
 *
 * @class
 * @abstract
 * @extends ve.ce.GeneratedContentNode
 * @constructor
 * @param {ve.dm.MWTemplateNode} model Model to observe
 */
ve.ce.MWTemplateNode = function VeCeMWTemplateNode( model ) {
	// Parent constructor
	ve.ce.GeneratedContentNode.call( this, model );

	// DOM Changes
	this.$.addClass( 've-ce-MWTemplateNode' );
};

/* Inheritance */

ve.inheritClass( ve.ce.MWTemplateNode, ve.ce.GeneratedContentNode );

/* Static Properties */

ve.ce.MWTemplateNode.static.name = 'MWtemplate';

/* Methods */

ve.ce.MWTemplateNode.prototype.generateContents = function () {
	// TODO: return $.ajax( api call to get new contents )
	return new $.Deferred();
};

/* Registration */

ve.ce.nodeFactory.register( ve.ce.MWTemplateNode );
