var MWParserEnvironment = function(opts) {
	var options = {
		tagHooks: {},
		parserFunctions: {},
		pageCache: {}, // @fixme use something with managed space
		domCache: {}
	};
	$.extend(options, opts);
	this.debug = false;
	this.tagHooks = options.tagHooks;
	this.parserFunctions = options.parserFunctions;
	this.pageCache = options.pageCache;
	this.domCache = options.domCache;
};

MWParserEnvironment.prototype.lookupKV = function ( kvs, key ) {
	var kv;
	for ( var i = 0, l = kvs.length; i < l; i++ ) {
		kv = kvs[i];
		if ( kv[0] === key ) {
			// found, return it.
			return kv[1];
		}
	}
	// nothing found!
	return null;
};


// Does this need separate UI/content inputs?
MWParserEnvironment.prototype.formatNum = function( num ) {
	return num + '';
};

MWParserEnvironment.prototype.getVariable = function( varname, options ) {
		//
};

/**
 * @return MWParserFunction
 */
MWParserEnvironment.prototype.getParserFunction = function( name ) {
	if (name in this.parserFunctions) {
		return new this.parserFunctions[name]( this );
	} else {
		return null;
	}
};

/**
 * @return MWParserTagHook
 */
MWParserEnvironment.prototype.getTagHook = function( name ) {
	if (name in this.tagHooks) {
		return new this.tagHooks[name](this);
	} else {
		return null;
	}
};

/**
 * @fixme do this for real eh
 */
MWParserEnvironment.prototype.resolveTitle = function( name, namespace ) {
	// hack!
	if (name.indexOf(':') == -1 && typeof namespace ) {
		// hack hack hack
		name = namespace + ':' + name;
	}
	return name;
};


if (typeof module == "object") {
	module.exports.MWParserEnvironment = MWParserEnvironment;
}
