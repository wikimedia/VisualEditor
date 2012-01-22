/**
 * Some parser functions, and quite a bunch of stubs of parser functions.
 * Instantiated and called by the TemplateHandler extension.
 *
 * @author Gabriel Wicke <gwicke@wikimedia.org>
 */

function ParserFunctions ( manager ) {
	this.manager = manager;
}

ParserFunctions.prototype.fun = {};

ParserFunctions.prototype['pf_#if'] = function ( target, argList, argDict ) {
	if ( target.trim() !== '' ) {
		this.manager.env.dp('#if, first branch', argDict[1] );
		return argDict[1] || [];
	} else {
		this.manager.env.dp('#if, second branch', argDict[2] );
		return argDict[2] || [];
	}
};

ParserFunctions.prototype['pf_#switch'] = function ( target, argList, argDict ) {
	this.manager.env.dp( 'switch enter: ' + target.trim() +
			' looking in ', argDict );
	if ( target.trim() in argDict ) {
		this.manager.env.dp( 'switch found: ' + target.trim() +
				' res=', argDict[target.trim()] );
		return argDict[target.trim()];
	} else if ( '#default' in argDict ) {
		return argDict['#default'];
	} else { 
		var lastKV = argList[argList.length - 1];
		if ( lastKV && ! lastKV[0].length ) {
			return lastKV[1];
		} else {
			return [];
		}
	}
};

// #ifeq
ParserFunctions.prototype['pf_#ifeq'] = function ( target, argList, argDict ) {
	if ( ! argList.length ) {
		return [];
	} else {
		if ( target.trim() === this.manager.env.tokensToString( argList[0][1] ).trim() ) {
			return ( argList[1] && argList[1][1]) || [];
		} else {
			return ( argList[1] && argList[1][1]) || [];
		}
	}
};

ParserFunctions.prototype['pf_lc'] = function ( target, argList, argDict ) {
	return [{type: 'TEXT', value: target.toLowerCase()}];
};

ParserFunctions.prototype['pf_uc'] = function ( target, argList, argDict ) {
	return [{type: 'TEXT', value: target.toUpperCase()}];
};

ParserFunctions.prototype['pf_ucfirst'] = function ( target, argList, argDict ) {
	if ( target ) {
		return [{
			type: 'TEXT', 
			value: target[0].toUpperCase() + target.substr(1)
		}];
	} else {
		return [];
	}
};

ParserFunctions.prototype['pf_lcfirst'] = function ( target, argList, argDict ) {
	if ( target ) {
		return [{
			type: 'TEXT', 
			value: target[0].toLowerCase() + target.substr(1)
		}];
	} else {
		return [];
	}
};

ParserFunctions.prototype['pf_#tag'] = function ( target, argList, argDict ) {
	return [{type: 'TAG', name: target, attribs: argList}];
};


/**
 * Stub section: Pick any of these and actually implement them!
 */

// FIXME
ParserFunctions.prototype['pf_#ifexpr'] = function ( target, argList, argDict ) {
	return [];
};
ParserFunctions.prototype['pf_#iferror'] = function ( target, argList, argDict ) {
	return [];
};
ParserFunctions.prototype['pf_#expr'] = function ( target, argList, argDict ) {
	return [];
};
ParserFunctions.prototype['pf_#ifexist'] = function ( target, argList, argDict ) {
	return [];
};
ParserFunctions.prototype['pf_formatnum'] = function ( target, argList, argDict ) {
	return [{type: 'TEXT', value: target}];
};
ParserFunctions.prototype['pf_currentpage'] = function ( target, argList, argDict ) {
	return [{type: 'TEXT', value: target}];
};
ParserFunctions.prototype['pf_pagename'] = function ( target, argList, argDict ) {
	return [{type: 'TEXT', value: target}];
};
ParserFunctions.prototype['pf_pagename'] = function ( target, argList, argDict ) {
	return [{type: 'TEXT', value: target}];
};
ParserFunctions.prototype['pf_fullpagename'] = function ( target, argList, argDict ) {
	return [{type: 'TEXT', value: target}];
};
ParserFunctions.prototype['pf_fullpagenamee'] = function ( target, argList, argDict ) {
	return [{type: 'TEXT', value: target}];
};
ParserFunctions.prototype['pf_fullurl'] = function ( target, argList, argDict ) {
	return [{type: 'TEXT', value: target}];
};
ParserFunctions.prototype['pf_urlencode'] = function ( target, argList, argDict ) {
	return [{type: 'TEXT', value: target}];
};
ParserFunctions.prototype['pf_namespace'] = function ( target, argList, argDict ) {
	return [{type: 'TEXT', value: 'Main'}];
};

ParserFunctions.prototype['pf_#time'] = function ( target, argList, argDict ) {
	return [{type: 'TEXT', value: new Date().toString()}];
};


if (typeof module == "object") {
	module.exports.ParserFunctions = ParserFunctions;
}
