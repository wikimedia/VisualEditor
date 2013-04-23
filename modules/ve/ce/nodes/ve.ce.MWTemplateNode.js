/*!
 * VisualEditor ContentEditable MWTemplateNode class.
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
	this.$.addClass( 've-ce-MWtemplateNode' );
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

/* Concrete subclasses */

/**
 * ContentEditable MediaWiki template block node.
 *
 * @class
 * @extends ve.ce.MWTemplateNode
 * @constructor
 * @param {ve.dm.MWTemplateBlockNode} model Model to observe
 */
ve.ce.MWTemplateBlockNode = function VeCeMWTemplateBlockNode( model ) {
	// Parent constructor
	ve.ce.MWTemplateNode.call( this, model );

	// DOM Changes
	this.$.addClass( 've-ce-MWtemplateBlockNode' );
};

/* Inheritance */

ve.inheritClass( ve.ce.MWTemplateBlockNode, ve.ce.MWTemplateNode );

/* Static Properties */

ve.ce.MWTemplateBlockNode.static.name = 'MWtemplateBlock';

/**
 * ContentEditable MediaWiki template inline node.
 *
 * @class
 * @extends ve.ce.MWTemplateNode
 * @constructor
 * @param {ve.dm.MWTemplateInlineNode} model Model to observe
 */
ve.ce.MWTemplateInlineNode = function VeCeMWTemplateInlineNode( model ) {
	// Parent constructor
	ve.ce.MWTemplateNode.call( this, model );

	// DOM Changes
	this.$.addClass( 've-ce-MWtemplateInlineNode' );
};

/* Inheritance */

ve.inheritClass( ve.ce.MWTemplateInlineNode, ve.ce.MWTemplateNode );

/* Static Properties */

ve.ce.MWTemplateInlineNode.static.name = 'MWtemplateInline';

/* Registration */

ve.ce.nodeFactory.register( ve.ce.MWTemplateNode );
ve.ce.nodeFactory.register( ve.ce.MWTemplateBlockNode );
ve.ce.nodeFactory.register( ve.ce.MWTemplateInlineNode );
