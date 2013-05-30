/*!
 * VisualEditor ContentEditable MWTemplateNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/*global mw */

/**
 * ContentEditable MediaWiki template node.
 *
 * @class
 * @abstract
 * @extends ve.ce.GeneratedContentNode
 * @mixins ve.ce.ProtectedNode
 * @mixins ve.ce.FocusableNode
 *
 * @constructor
 * @param {ve.dm.MWTemplateNode} model Model to observe
 * @param {Object} [config] Config options
 */
ve.ce.MWTemplateNode = function VeCeMWTemplateNode( model, config ) {
	// Parent constructor
	ve.ce.GeneratedContentNode.call( this, model, config );

	// Mixin constructors
	ve.ce.ProtectedNode.call( this );
	ve.ce.FocusableNode.call( this );

	// DOM Changes
	this.$.addClass( 've-ce-mwTemplateNode' );
};

/* Inheritance */

ve.inheritClass( ve.ce.MWTemplateNode, ve.ce.GeneratedContentNode );

ve.mixinClass( ve.ce.MWTemplateNode, ve.ce.ProtectedNode );

ve.mixinClass( ve.ce.MWTemplateNode, ve.ce.FocusableNode );

/* Static Properties */

ve.ce.MWTemplateNode.static.name = 'mwTemplate';

/* Methods */

ve.ce.MWTemplateNode.prototype.generateContents = function () {
	var promise = $.Deferred();
	$.ajax( {
		'url': mw.util.wikiScript( 'api' ),
		'data': {
			'action': 'visualeditor',
			'paction': 'parsefragment',
			'page': mw.config.get( 'wgRelevantPageName' ),
			'wikitext': this.model.getWikitext(),
			'token': mw.user.tokens.get( 'editToken' ),
			'format': 'json'
		},
		'dataType': 'json',
		'type': 'POST',
		// Wait up to 100 seconds before giving up
		'timeout': 100000,
		'cache': 'false',
		'success': ve.bind( this.onParseSuccess, this, promise ),
		'error': ve.bind( this.onParseError, this, promise )
	} );
	return promise;
};

/**
 * Handle a successful response from the parser for the wikitext fragment.
 *
 * @param {jQuery.Promise} promise The promise object created by generateContents
 * @param {Object} response Response data
 */
ve.ce.MWTemplateNode.prototype.onParseSuccess = function ( promise, response ) {
	var data = response.visualeditor, contentNodes = $( data.content ).get();
	// HACK: if $content consists of a single paragraph, unwrap it.
	// We have to do this because the PHP parser wraps everything in <p>s, and inline templates
	// will render strangely when wrapped in <p>s.
	if ( contentNodes.length === 1 && contentNodes[0].nodeName.toLowerCase() === 'p' ) {
		contentNodes = contentNodes[0].childNodes;
	}
	promise.resolve( contentNodes );
};

/**
 * Handle an unsuccessful response from the parser for the wikitext fragment.
 *
 * @param {jQuery.Promise} promise The promise object created by generateContents
 * @param {Object} response Response data
 */
ve.ce.MWTemplateNode.prototype.onParseError = function ( promise ) {
	promise.reject();
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
	this.$.addClass( 've-ce-mwTemplateBlockNode' );
};

/* Inheritance */

ve.inheritClass( ve.ce.MWTemplateBlockNode, ve.ce.MWTemplateNode );

/* Static Properties */

ve.ce.MWTemplateBlockNode.static.name = 'mwTemplateBlock';

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
	this.$.addClass( 've-ce-mwTemplateInlineNode' );
};

/* Inheritance */

ve.inheritClass( ve.ce.MWTemplateInlineNode, ve.ce.MWTemplateNode );

/* Static Properties */

ve.ce.MWTemplateInlineNode.static.name = 'mwTemplateInline';

/* Registration */

ve.ce.nodeFactory.register( ve.ce.MWTemplateNode );
ve.ce.nodeFactory.register( ve.ce.MWTemplateBlockNode );
ve.ce.nodeFactory.register( ve.ce.MWTemplateInlineNode );
