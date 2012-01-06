/**
 * Template and template argument handling.
 *
 * @author Gabriel Wicke <gwicke@wikimedia.org>
 */

function TemplateHandler () {
	this.reset();
}

TemplateHandler.prototype.reset = function () {
	this.outstanding = 0;
};

// constants
TemplateHandler.prototype.rank = 1.1;

TemplateHandler.prototype.register = function ( dispatcher ) {
	this.dispatcher = dispatcher;
	// Register for template and templatearg tag tokens
	dispatcher.addTransform( this.onTemplate.bind(this), 
			this.rank, 'tag', 'template' );
	dispatcher.addTransform( this.onTemplateArg.bind(this), 
			this.rank, 'tag', 'templatearg' );

	// Reset internal state when the parser pipeline is done
	dispatcher.addTransform( this.reset.bind(this), 
			this.rank, 'end' );
};


/** 
 * Main template token handler
 *
 * Expands target and arguments (both keys and values) and either directly
 * calls or sets up the callback to _expandTemplate, which then fetches and
 * processes the template.
 */
TemplateHandler.prototype.onTemplate = function ( token, cb, frame ) {
	// check for 'subst:'
	// check for variable magic names
	// check for msg, msgnw, raw magics
	// check for parser functions

	// create a new frame
	var newFrame = {
			args: {},
			env: frame.env,
			target: token.attribs[0][1], // XXX: use data-target key instead!
										// Also handle templates and args in
										// target!
			outstanding: 0,
			cb: cb
		},
		argcb,
		i = 0,
		kvs = [],
		res,
		kv;
	// XXX: transform the target
	
	
	// transform each argument (key and value), and handle asynchronous returns
	for ( var key in token.args ) {
		if ( token.hasOwnProperty( key ) ) {
			kv = { key: [], value: [] };
			// transform the value
			argCB = this._returnArgValue.bind( this, { index: i, frame: newFrame } );
			res = frame.transformPhase( frame, args[key], argCB );
			if ( res.async ) {
				newFrame.outstanding++;
			}
			kv.value = res.tokens;

			// XXX: transform key too, and store it in the token's value for
			// the original key
			// For now, we assume the key to be a string.
			kv.key = key;

			// finally, append to kvs
			kvs.push( kv );
			i++;
		}
	}
	
	if ( newFrame.outstanding === 0 ) {
		return this._expandTemplate ( newFrame );
	} else {
		return { async: true };
	}
};

/**
 * Callback for async argument value expansions
 */
TemplateHandler.prototype._returnArgValue = function ( ref, tokens, notYetDone ) {
	var frame = ref.frame,
		res;
	frame.args[ref.index].push( tokens );
	if ( ! notYetDone ) {
		frame.outstanding--;
		if ( frame.outstanding === 0 ) {
			// this calls back to frame.cb, so no return here.
			this._expandTemplate( frame );
		}
	}
};

/**
 * Fetch, tokenize and token-transform a template after all arguments and the
 * target were expanded in frame.
 */
TemplateHandler.prototype._expandTemplate = function ( frame ) {
	// Set up a pipeline:
	// fetch template source -> tokenizer 
	// -> TokenTransformDispatcher (phase 1/2 only, with frame passed in)
	// -> frame.cb( tokens )
	

	// XXX: notes from brion's mediawiki.parser.environment
	// resolve template name
	// load template w/ canonical name
	// load template w/ variant names
	// recursion depth check
	// fetch from DB or interwiki
	// infinte loop check
	//
	// TODO: template fetching is already implemented there, copy this over!
};


TemplateHandler.prototype.onTemplateArg = function ( token, cb, frame ) {
	var argName = token.attribs[0][1]; // XXX: do this properly!
	if ( argName in frame.args ) {
		// return tokens for argument
		return { tokens: frame.args[argName] };
	} else {
		// FIXME: support default value!
		return { token: { type: 'TEXT', value: '' } };
	}
};


if (typeof module == "object") {
	module.exports.TemplateHandler = TemplateHandler;
}
