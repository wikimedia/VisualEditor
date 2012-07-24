/**
 * Generic attribute expansion handler.
 *
 * @author Gabriel Wicke <gwicke@wikimedia.org>
 */
var $ = require('jquery'),
	request = require('request'),
	events = require('events'),
	qs = require('querystring'),
	ParserFunctions = require('./ext.core.ParserFunctions.js').ParserFunctions,
	AttributeTransformManager = require('./mediawiki.TokenTransformManager.js')
									.AttributeTransformManager,
	defines = require('./mediawiki.parser.defines.js');


function AttributeExpander ( manager ) {
	this.manager = manager;
	// XXX: only register for tag tokens?
	manager.addTransform( this.onToken.bind(this), "AttributeExpander:onToken",
			this.rank, 'any' );
}

// constants
AttributeExpander.prototype.rank = 1.11;

/** 
 * Token handler
 *
 * Expands target and arguments (both keys and values) and either directly
 * calls or sets up the callback to _expandTemplate, which then fetches and
 * processes the template.
 */
AttributeExpander.prototype.onToken = function ( token, frame, cb ) {
	//console.warn( 'AttributeExpander.onToken', JSON.stringify( token ) );
	if ( (token.constructor === TagTk || 
			token.constructor === SelfclosingTagTk) && 
				token.attribs && 
				token.attribs.length ) {
		// clone the token
		token = $.extend( {}, token );
		token.attribs = token.attribs.slice();
		var atm = new AttributeTransformManager( 
					this.manager, 
					this._returnAttributes.bind( this, token, cb ) 
				);
		cb( { async: true } );
		atm.process( token.attribs );
	} else {
		cb ( { tokens: [token] } );
	}
};


/**
 * Callback for attribute expansion in AttributeTransformManager
 */
AttributeExpander.prototype._returnAttributes = function ( token, cb, 
															attributes ) 
{
	this.manager.env.dp( 'AttributeExpander._returnAttributes: ',attributes );
	token.attribs = attributes;
	cb( { tokens: [token] } );
};

if (typeof module == "object") {
	module.exports.AttributeExpander = AttributeExpander;
}
