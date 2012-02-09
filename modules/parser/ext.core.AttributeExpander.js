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
	this.reset();
	this.register( manager );
}

AttributeExpander.prototype.reset = function ( token ) {
	return {token: token};
};

// constants
AttributeExpander.prototype.rank = 1.11;

AttributeExpander.prototype.register = function ( manager ) {
	this.manager = manager;
	// Register for template and templatearg tag tokens
	manager.addTransform( this.onToken.bind(this), 
			this.rank, 'any' );

};


/** 
 * Token handler
 *
 * Expands target and arguments (both keys and values) and either directly
 * calls or sets up the callback to _expandTemplate, which then fetches and
 * processes the template.
 */
AttributeExpander.prototype.onToken = function ( token, frame, cb ) {
	if ( token.constructor === TagTk && token.attribs && token.attribs.length ) {
		var expandData = {
			token: token,
			cb: cb
		};
		var atm = new AttributeTransformManager( 
					this.manager, 
					this._returnAttributes.bind( this, expandData ) 
				);
		if( atm.process( token.attribs ) ) {
			// Attributes were transformed synchronously
			this.manager.env.dp ( 
					'sync attribs for ' + JSON.stringify( token )
			);
			// All attributes are fully expanded synchronously (no IO was needed)
			return { token: token };
		} else {
			// Async attribute expansion is going on
			this.manager.env.dp( 'async return for ' + JSON.stringify( token ));
			expandData.async = true;
			return { async: true };
		}
	} else {
		return { token: token };
	}
};


/**
 * Callback for argument (including target) expansion in AttributeTransformManager
 */
AttributeExpander.prototype._returnAttributes = function ( expandData, 
															attributes ) 
{
	this.manager.env.dp( 'AttributeExpander._returnAttributes: ' + 
			JSON.stringify(attributes) );
	// Remove the target from the attributes
	expandData.token.attribs = attributes;
	if ( expandData.async ) {
		expandData.cb( [expandData.token], false );
	}
};

if (typeof module == "object") {
	module.exports.AttributeExpander = AttributeExpander;
}
