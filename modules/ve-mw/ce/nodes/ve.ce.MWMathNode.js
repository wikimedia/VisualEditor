/*!
 * VisualEditor ContentEditable MWMathNode class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/*global mw*/

/**
 * ContentEditable MediaWiki math node.
 *
 * @class
 * @extends ve.ce.LeafNode
 * @mixins ve.ce.FocusableNode
 * @mixins ve.ce.ProtectedNode
 *
 * @constructor
 * @param {ve.dm.MWMathNode} model Model to observe
 * @param {Object} [config] Config options
 */
ve.ce.MWMathNode = function VeCeMWMathNode( model, config ) {
	// Parent constructor
	ve.ce.LeafNode.call( this, model, config );

	// Mixin constructors
	ve.ce.FocusableNode.call( this );
	ve.ce.ProtectedNode.call( this );
	ve.ce.GeneratedContentNode.call( this );

	// Events
	this.model.connect( this, { 'update': 'onUpdate' } );
	this.$.on( 'click', ve.bind( this.onClick, this ) );

	// DOM Changes
	this.$.addClass( 've-ce-mwMathNode' );
	this.$.attr( 'src', model.getAttribute( 'src' ) );
	this.$.attr( 'alt', model.getAttribute( 'alt' ) );
};

/* Inheritance */

ve.inheritClass( ve.ce.MWMathNode, ve.ce.LeafNode );

ve.mixinClass( ve.ce.MWMathNode, ve.ce.FocusableNode );
ve.mixinClass( ve.ce.MWMathNode, ve.ce.ProtectedNode );
ve.mixinClass( ve.ce.MWMathNode, ve.ce.GeneratedContentNode );

/* Static Properties */

ve.ce.MWMathNode.static.name = 'mwMath';

ve.ce.MWMathNode.static.tagName = 'img';

/* Methods */

ve.ce.MWMathNode.prototype.generateContents = function () {
	var deferred = $.Deferred();
	$.ajax( {
		'url': mw.util.wikiScript( 'api' ),
		'data': {
			'action': 'visualeditor',
			'paction': 'parsefragment',
			'page': mw.config.get( 'wgRelevantPageName' ),
			'wikitext': '<math>' + this.model.getAttribute( 'extsrc' ) + '</math>',
			'token': mw.user.tokens.get( 'editToken' ),
			'format': 'json'
		},
		'dataType': 'json',
		'type': 'POST',
		// Wait up to 100 seconds before giving up
		'timeout': 100000,
		'cache': 'false',
		'success': ve.bind( this.onParseSuccess, this, deferred ),
		'error': ve.bind( this.onParseError, this, deferred )
	} );
	return deferred.promise();
};

/**
 * Handle a successful response from the parser for the wikitext fragment.
 *
 * @param {jQuery.Deferred} deferred The Deferred object created by generateContents
 * @param {Object} response Response data
 */
ve.ce.MWMathNode.prototype.onParseSuccess = function ( deferred, response ) {
	var data = response.visualeditor, contentNodes = $( data.content ).get();
	this.$.attr( 'alt', contentNodes[0].childNodes[0].getAttribute( 'alt' ) );
	this.$.attr( 'src', contentNodes[0].childNodes[0].getAttribute( 'src' ) );
	deferred.resolve( contentNodes );
};

/**
 * Handle an unsuccessful response from the parser for the wikitext fragment.
 *
 * @param {jQuery.Deferred} deferred The promise object created by generateContents
 * @param {Object} response Response data
 */
ve.ce.MWMathNode.prototype.onParseError = function ( deferred ) {
	deferred.reject();
};

/**
 * Handle the mouse click.
 *
 * @method
 * @param {jQuery.Event} e Click event
 */
ve.ce.MWMathNode.prototype.onClick = function ( e ) {
	var surfaceModel = this.getRoot().getSurface().getModel(),
		selectionRange = surfaceModel.getSelection(),
		nodeRange = this.model.getOuterRange();

	surfaceModel.getFragment(
		e.shiftKey ?
			ve.Range.newCoveringRange(
				[ selectionRange, nodeRange ], selectionRange.from > nodeRange.from
			) :
			nodeRange
	).select();
};

/* Registration */

ve.ce.nodeFactory.register( ve.ce.MWMathNode );
