/**
 * Some parser functions, and quite a bunch of stubs of parser functions.
 * There are still quite a few missing, see
 * http://www.mediawiki.org/wiki/Help:Magic_words and
 * http://www.mediawiki.org/wiki/Help:Extension:ParserFunctions.
 * Instantiated and called by the TemplateHandler extension. Any pf_<prefix>
 * matching a lower-cased template name prefix up to the first colon will
 * override that template.
 *
 * TODO: Implement these more thoroughly, and test against
 * extensions/ParserFunction/
 *     convertTests.txt
 *     exprTests.txt
 *     funcsParserTests.txt
 *     stringFunctionTests.txt
 *
 * @author Gabriel Wicke <gwicke@wikimedia.org>
 */

var async = require('async');

function ParserFunctions ( manager ) {
	this.manager = manager;
	this.env = manager.env;
}

// Temporary helper.
ParserFunctions.prototype._rejoinKV = function ( k, v ) {
	if ( k.length ) {
		return k.concat( ['='], v );
	} else {
		return v;
	}
};

// XXX: move to frame?
ParserFunctions.prototype.expandKV = function ( kv, cb, defaultValue, type ) {
	if ( type === undefined ) {
		type = 'tokens/x-mediawiki/expanded';
	}
	if ( kv === undefined ) {
		cb( { tokens: [ defaultValue || '' ] } );
	} else if ( kv.constructor === String ) {
		return cb( kv );
	} else if ( kv.k.constructor === String && kv.v.constructor === String ) {
		if ( kv.k ) {
			cb( { tokens: [kv.k + '=' + kv.v] } );
		} else {
			cb( { tokens: [kv.v] } );
		}
	} else {
		var self = this,
			getCB = function ( v ) {
				cb ( { tokens: 
					self._rejoinKV( kv.k, v ) } );
			};
		kv.v.get({ 
			type: type, 
			cb: getCB,
			asyncCB: cb
		});
	}
};


ParserFunctions.prototype['pf_#if'] = function ( token, frame, cb, args ) {
	var target = args[0].k;
	if ( target.trim() !== '' ) {
		//this.env.dp('#if, first branch', target.trim(), argDict[1] );
		this.expandKV( args[1], cb );
	} else {
		//this.env.dp('#if, second branch', target.trim(), argDict[2] );
		this.expandKV( args[2], cb );
	}
};

ParserFunctions.prototype._switchLookupFallback = function ( frame, kvs, key, dict, cb, v ) {
	var kv,
		l = kvs.length;
	this.manager.env.tp('swl');
	//console.trace();
	this.manager.env.dp('_switchLookupFallback', kvs.length, key, v );
	var _cb = function( res ) { cb ( { tokens: res } ); };
	if ( v && v.constructor !== String ) {
		v = '';
		console.warn(JSON.stringify(v));
	}
	if ( v && key === v.trim() ) {
		// found. now look for the next entry with a non-empty key.
		this.manager.env.dp( 'switch found' );
		for ( var j = 0; j < l; j++) {
			kv = kvs[j];
			// XXX: make sure the key is always one of these!
			if ( kv.k.length ) {
				return kv.v.get({ 
					type: 'tokens/x-mediawiki/expanded', 
					cb: _cb,
					asyncCB: _cb
				});
			}
		}
		// No value found, return empty string? XXX: check this
		return cb( {} );
	} else if ( kvs.length ) {
		// search for value-only entry which matches
		var i = 0;
		if ( v ) {
			i = 1;
		}
		for ( ; i < l; i++ ) {
			kv = kvs[i];
			if ( kv.k.length || !kv.v.length ) {
				// skip entries with keys or empty values
				continue;
			} else {
				if ( ! kv.v.get  ) {
					this.manager.env.ap( kv.v );
					console.trace();
				}
				var self = this;
				//cb({ async: true });
				//console.warn( 'swtch value: ' + kv.v );
				return kv.v.get({ 
					cb: function( val ) {
						process.nextTick( 
							self._switchLookupFallback.bind( self, frame, 
								kvs.slice(i+1), key, dict, cb, val ) 
						);
					},
					asyncCB: cb
				});
			}
		}
		// value not found!
		if ( '#default' in dict ) {
			return dict['#default'].get({
				type: 'tokens/x-mediawiki/expanded', 
				cb: _cb,
				asyncCB: cb
			});
		} else if ( kvs.length ) { 
			var lastKV = kvs[kvs.length - 1];
			if ( lastKV && ! lastKV.k.length ) {
				return lastKV.v.get( {
					cb: _cb,
					asyncCB: cb } );
				//cb ( { tokens: lastKV.v } );
			} else {
				cb ( {} );
			}
		} else {
			// nothing found at all.
			return cb ( {} );
		}
	} else if ( v ) {
		cb( { tokens: v } );
	} else {
		// nothing found at all.
		cb( {} );
	}
};

// TODO: Implement 
// http://www.mediawiki.org/wiki/Help:Extension:ParserFunctions#Grouping_results
ParserFunctions.prototype['pf_#switch'] = function ( token, frame, cb, args ) {
	target = args[0].k.trim();
	this.env.dp( 'switch enter', target, token );
	// create a dict from the remaining args
	args.shift();
	var dict = args.dict();
	if ( target && dict[target] !== undefined ) {
		this.env.dp( 'switch found: ', target, dict, ' res=', dict[target] );
		dict[target].get({
			type: 'tokens/x-mediawiki/expanded', 
			cb: function( res ) { cb ( { tokens: res } ); },
			asyncCB: cb
		});
	} else {
		this._switchLookupFallback( frame, args, target, dict, cb );
	}
};

// #ifeq
ParserFunctions.prototype['pf_#ifeq'] = function ( token, frame, cb, args ) {
	if ( args.length < 3 ) {
		cb( {} );
	} else {
		var b = args[1].v;
		b.get( { cb: this._ifeq_worker.bind( this, cb, args ), asyncCB: cb } );
	}
};

ParserFunctions.prototype._ifeq_worker = function ( cb, args, b ) {
	if ( args[0].k.trim() === b.trim() ) {
		this.expandKV( args[2], cb );
	} else {
		this.expandKV( args[3], cb );
	}
};


ParserFunctions.prototype['pf_#expr'] = function ( token, frame, cb, args ) {
	var res,
		target = args[0].k;
	if ( target ) {
		try {
			// FIXME: make this safe and implement MW expressions!
			var f = new Function ( 'return (' + target + ')' );
			res = f();
		} catch ( e ) {
			return cb( { tokens: [ 'class="error" in expression ' + target ] } );
		}
	} else { 
		res = '';
	}
	cb( { tokens: [ res.toString() ] } );
};

ParserFunctions.prototype['pf_#ifexpr'] = function ( token, frame, cb, args ) {
	this.env.dp( '#ifexp: ', args );
	var res = null,
		target = args[0].k;
	if ( target ) {
		try {
			// FIXME: make this safe, and fully implement MW expressions!
			var f = new Function ( 'return (' + target + ')' );
			res = f();
		} catch ( e ) {
			cb( { tokens: [ 'class="error" in expression ' + target ] } );
		}
	}

	if ( res ) {
		this.expandKV( args[1], cb );
	} else {
		this.expandKV( args[2], cb );
	}
};

ParserFunctions.prototype['pf_#iferror'] = function ( token, frame, cb, args ) {
	var target = args[0].k;
	if ( target.indexOf( 'class="error"' ) >= 0 ) {
		this.expandKV( args[1], cb );
	} else {
		this.expandKV( args[1], cb, target );
	}
};


ParserFunctions.prototype.pf_lc = function ( token, frame, cb, args ) {
	cb( { tokens: [ args[0].k.toLowerCase() ] } );
};

ParserFunctions.prototype.pf_uc = function ( token, frame, cb, args ) {
	cb( { tokens: [ args[0].k.toUpperCase() ] } );
};

ParserFunctions.prototype.pf_ucfirst = function ( token, frame, cb, args ) {
	var target = args[0].k;
	if ( target ) {
		cb( { tokens: [ target[0].toUpperCase() + target.substr(1) ] } );
	} else {
		cb( {} );
	}
};

ParserFunctions.prototype.pf_lcfirst = function ( token, frame, cb, args ) {
	var target = args[0].k;
	if ( target ) {
		cb( { tokens: [ target[0].toLowerCase() + target.substr(1) ] } );
	} else {
		cb( {} );
	}
};
ParserFunctions.prototype.pf_padleft = function ( token, frame, cb, params ) {
	var target = params[0].k,
		env = this.env;
	if ( ! params[1] ) {
		return cb( {} );
	}
	// expand parameters 1 and 2
	params.getSlice( { 
		type: 'text/x-mediawiki/expanded',
		cb: function ( args ) {
				if ( args[0].v > 0) {
					var pad = '0';
					if ( args[1] && args[1].v !== '' ) {
						pad = args[1].v;
					}
					var n = args[0].v,
						padLength = pad.length;
					while ( (target.length + padLength) < n ) {
						target += pad;
					}
					if ( target.length < n ) {
						target = pad.substr( 0, n - target.length ) + target;
					}
					cb( { tokens: [target] } );
				} else {
					env.dp( 'padleft no pad width', args );
					cb( {} );
				}
			}
	},
	1, 3);
};

ParserFunctions.prototype.pf_padright = function ( token, frame, cb, params ) {
	var target = params[0].k,
		env = this.env;
	if ( ! params[1] ) {
		return cb( {} );
	}
	// expand parameters 1 and 2
	params.getSlice( { 
		type: 'text/x-mediawiki/expanded',
		cb: function ( args ) {
				if ( args[0].v > 0) {
					if ( args[1] && args[1].v !== '' ) {
						pad = args[1].v;
					} else {
						pad = '0';
					}
					var n = args[0].v,
						padLength = pad.length;
					while ( target.length + padLength < n ) {
						target += pad;
					}
					if ( target.length < n ) {
						target += pad.substr( 0, n - target.length );
					}
					cb( { tokens: [target] } );
				} else {
					env.dp( 'padright no pad width', args );
					cb( {} );
				}
			}
	},
	1, 3 );
};

ParserFunctions.prototype['pf_#tag'] = function ( token, frame, cb, args ) {
	// TODO: handle things like {{#tag:nowiki|{{{input1|[[shouldnotbelink]]}}}}}
	// https://www.mediawiki.org/wiki/Future/Parser_development#Token_stream_transforms
	var target = args[0].k;
	args[1].v.get({
		type: 'tokens/x-mediawiki/expanded',
		cb: this.tag_worker.bind( this, target, cb ),
		asyncCB: cb
	});
};

ParserFunctions.prototype.tag_worker = function( target, cb, content ) {
	cb({ 
		tokens: [ new TagTk( target ) ] 
			.concat( content, 
				[ new EndTagTk( target ) ] ) 
	});
};


// TODO: These are just quick wrappers for now, optimize!
ParserFunctions.prototype.pf_currentyear = function ( token, frame, cb, args ) {
	cb( this._pf_time_tokens( 'Y', [], {} ) );
};
ParserFunctions.prototype.pf_currentmonth = function ( token, frame, cb, args ) {
	cb( this._pf_time_tokens( 'm', [], {} ) );
};
ParserFunctions.prototype.pf_currentmonthname = function ( token, frame, cb, args ) {
	cb( this._pf_time_tokens( 'F', [], {} ) );
};
// XXX Actually use genitive form!
ParserFunctions.prototype.pf_currentmonthnamegen = function ( token, frame, cb, args ) {
	cb( this._pf_time_tokens( 'F', [], {} ) );
};
ParserFunctions.prototype.pf_currentmonthabbrev = function ( token, frame, cb, args ) {
	cb( this._pf_time_tokens( 'M', [], {} ) );
};
ParserFunctions.prototype.pf_currentweek = function ( token, frame, cb, args ) {
	cb( this._pf_time_tokens( 'W', [], {} ) );
};
ParserFunctions.prototype.pf_currentdow = function ( token, frame, cb, args ) {
	cb( this._pf_time_tokens( 'w', [], {} ) );
};
ParserFunctions.prototype.pf_currentday = function ( token, frame, cb, args ) {
	cb( this._pf_time_tokens( 'j', [], {} ) );
};
ParserFunctions.prototype.pf_currentday2 = function ( token, frame, cb, args ) {
	cb( this._pf_time_tokens( 'd', [], {} ) );
};
ParserFunctions.prototype.pf_currentdayname = function ( token, frame, cb, args ) {
	cb( this._pf_time_tokens( 'l', [], {} ) );
};
ParserFunctions.prototype.pf_currenttime = function ( token, frame, cb, args ) {
	cb( this._pf_time_tokens( 'H:i', [], {} ) );
};

// A first approximation of time stuff.
// TODO: Implement time spec (+ 1 day etc), check if formats are complete etc.
// See http://www.mediawiki.org/wiki/Help:Extension:ParserFunctions#.23time
// for the full list of requirements!
//
// First (very rough) approximation below based on
// http://jacwright.com/projects/javascript/date_format/, MIT licensed.
ParserFunctions.prototype['pf_#time'] = function ( token, frame, cb, args ) {
	cb ( { tokens: this._pf_time( args[0].k, args.slice(1) ) } );
};

ParserFunctions.prototype._pf_time_tokens = function ( target, args ) {
	return { tokens: this._pf_time( target, args ) };
};

ParserFunctions.prototype._pf_time = function ( target, args ) {
	var res,
		tpl = target.trim();
	//try {
	//	var date = new Date( this.env.tokensToString( args[1].v ) );
	//	res = [ date.format( target ) ];
	//} catch ( e ) {
	//	this.env.dp( 'ERROR: #time ' + e );
	
		try {
			res = [ new Date().format ( tpl ) ];
		} catch ( e2 ) {
			this.env.dp( 'ERROR: #time ' + e2 );
			res = [ new Date().toString() ];
		}
		return res;
};

// Simulates PHP's date function
// FIXME: don't patch Date.prototype!
Date.prototype.format = function(format) {
    var returnStr = '';
    var replace = Date.replaceChars;
    for (var i = 0; i < format.length; i++) {       
		var curChar = format.charAt(i);         
		if (i - 1 >= 0 && format.charAt(i - 1) == "\\") {
            returnStr += curChar;
        }
        else if (replace[curChar]) {
            returnStr += replace[curChar].call(this);
        } else if (curChar != "\\"){
            returnStr += curChar;
        }
    }
    return returnStr;
};

// XXX: support localization
Date.replaceChars = {
    shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug',
					'Sep', 'Oct', 'Nov', 'Dec'],
    longMonths: ['January', 'February', 'March', 'April', 'May', 'June', 
				'July', 'August', 'September', 'October', 'November', 'December'],
    shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    longDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
				'Friday', 'Saturday'],

    // Day
    d: function() { return (this.getDate() < 10 ? '0' : '') + this.getDate(); },
    D: function() { return Date.replaceChars.shortDays[this.getDay()]; },
    j: function() { return this.getDate(); },
    l: function() { return Date.replaceChars.longDays[this.getDay()]; },
    N: function() { return this.getDay() + 1; },
    S: function() { 
		return (this.getDate() % 10 == 1 && 
			this.getDate() != 11 ? 'st' : (this.getDate() % 10 == 2 && 
				this.getDate() != 12 ? 'nd' : (this.getDate() % 10 == 3 && 
					this.getDate() != 13 ? 'rd' : 'th'))); 
	},
    w: function() { return this.getDay(); },
    z: function() { 
		var d = new Date(this.getFullYear(),0,1); 
		return Math.ceil((this - d) / 86400000); 
	},
    // Week
    W: function() { 
		var d = new Date(this.getFullYear(), 0, 1); 
		return Math.ceil((((this - d) / 86400000) + d.getDay() + 1) / 7); 
	},
    // Month
    F: function() { return Date.replaceChars.longMonths[this.getMonth()]; },
    m: function() { return (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1); },
    M: function() { return Date.replaceChars.shortMonths[this.getMonth()]; },
    n: function() { return this.getMonth() + 1; },
    t: function() { 
		var d = new Date(); 
		return new Date(d.getFullYear(), d.getMonth(), 0).getDate(); 
	},
    // Year
    L: function() { 
		var year = this.getFullYear(); 
		return (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)); 
	},
    o: function() { 
		var d  = new Date(this.valueOf());  
		d.setDate(d.getDate() - ((this.getDay() + 6) % 7) + 3); 
		return d.getFullYear();
	},
    Y: function() { return this.getFullYear(); },
    y: function() { return ('' + this.getFullYear()).substr(2); },
    // Time
    a: function() { return this.getHours() < 12 ? 'am' : 'pm'; },
    A: function() { return this.getHours() < 12 ? 'AM' : 'PM'; },
    B: function() { 
		return Math.floor((((this.getUTCHours() + 1) % 24) + 
					this.getUTCMinutes() / 60 + 
					this.getUTCSeconds() / 3600) * 1000 / 24); 
	},
    g: function() { return this.getHours() % 12 || 12; },
    G: function() { return this.getHours(); },
    h: function() { 
		return ((this.getHours() % 12 || 12) < 10 ? '0' : '') + 
			(this.getHours() % 12 || 12); 
	},
    H: function() { return (this.getHours() < 10 ? '0' : '') + this.getHours(); },
    i: function() { return (this.getMinutes() < 10 ? '0' : '') + this.getMinutes(); },
    s: function() { return (this.getSeconds() < 10 ? '0' : '') + this.getSeconds(); },
    u: function() { 
		var m = this.getMilliseconds(); 
		return (m < 10 ? '00' : (m < 100 ? '0' : '')) + m; 
	},
    // Timezone
    e: function() { return "Not Yet Supported"; },
    I: function() { return "Not Yet Supported"; },
    O: function() { 
		return (-this.getTimezoneOffset() < 0 ? '-' : '+') + 
			(Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + 
			(Math.abs(this.getTimezoneOffset() / 60)) + '00'; 
	},
    P: function() { 
		return (-this.getTimezoneOffset() < 0 ? '-' : '+') + 
			(Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + 
			(Math.abs(this.getTimezoneOffset() / 60)) + ':00'; 
	},
    T: function() { 
		var m = this.getMonth(); 
		this.setMonth(0); 
		var result = this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/, '$1'); 
		this.setMonth(m); 
		return result;
	},
    Z: function() { return -this.getTimezoneOffset() * 60; },
    // Full Date/Time
    c: function() { return this.format("Y-m-d\\TH:i:sP"); },
    r: function() { return this.toString(); },
    U: function() { return this.getTime() / 1000; }
};

ParserFunctions.prototype.pf_localurl = function ( token, frame, cb, args ) {
	var target = args[0].k,
		env = this.env,
		self = this;
	args = args.slice(1);
	async.map(
			args,
			function ( item, cb ) { 
				self.expandKV( item, function ( res ) { cb( null, res.tokens ); }, '', 'text/x-mediawiki/expanded' );
			}, 
			function ( err, expandedArgs ) {
				if ( err ) {
					console.trace();
					throw( err );
				}
				cb({ tokens: [ '/' +
					// FIXME! Figure out correct prefix to use
					//this.env.wgScriptPath + 
					'index' +
					env.wgScriptExtension + '?title=' +
					env.normalizeTitle( target ) + '&' +
					expandedArgs.join('&') ]
				});
			}
	);
};


/**
 * Stub section: Pick any of these and actually implement them!
 */

// The page name and similar information should be carried around in
// this.env
ParserFunctions.prototype.pf_formatnum = function ( token, frame, cb, args ) {
	var target = args[0].k;
	cb( { tokens: [ target ] } );
};
ParserFunctions.prototype.pf_currentpage = function ( token, frame, cb, args ) {
	var target = args[0].k;
	cb( { tokens: [ target ] } );
};
ParserFunctions.prototype.pf_pagenamee = function ( token, frame, cb, args ) {
	var target = args[0].k;
	cb( { tokens: [ target.split(':', 2)[1] || '' ] } );
};
ParserFunctions.prototype.pf_fullpagename = function ( token, frame, cb, args ) {
	var target = args[0].k;
	cb( { tokens: [target || this.env.pageName ] } );
};
ParserFunctions.prototype.pf_fullpagenamee = function ( token, frame, cb, args ) {
	var target = args[0].k;
	cb( { tokens: [ target || this.env.pageName ] } );
};
// This should be doable with the information in the envirionment
// (this.env) already.
ParserFunctions.prototype.pf_fullurl = function ( token, frame, cb, args ) {
	var target = args[0].k;
	cb( { tokens: [ target || this.env.wgScriptPath + this.env.pageName || "http://example.com/fixme/" ] } );
};
ParserFunctions.prototype.pf_urlencode = function ( token, frame, cb, args ) {
	var target = args[0].k;
	this.env.tp( 'urlencode: ' + target  );
	cb( { tokens: [encodeURIComponent(target.trim())] } );
};

// The following items all depends on information from the Wiki, so are hard
// to implement independently. Some might require using action=parse in the
// API to get the value. See
// http://www.mediawiki.org/wiki/Parsoid#Token_stream_transforms,
// http://etherpad.wikimedia.org/ParserNotesExtensions and
// http://www.mediawiki.org/wiki/Wikitext_parser/Environment.
// There might be better solutions for some of these.
ParserFunctions.prototype['pf_#ifexist'] = function ( token, frame, cb, args ) {
	this.expandKV( args[1], cb );
};
ParserFunctions.prototype.pf_pagesize = function ( token, frame, cb, args ) {
	cb( { tokens: [ '100' ] } );
};
ParserFunctions.prototype.pf_sitename = function ( token, frame, cb, args ) {
	cb( { tokens: [ "MediaWiki" ] } );
};
ParserFunctions.prototype.pf_anchorencode = function ( token, frame, cb, args ) {
	var target = args[0].k;
	cb( { tokens: [ target.trim() ] } );
};
ParserFunctions.prototype.pf_protectionlevel = function ( token, frame, cb, args ) {
	cb( { tokens: [''] } );
};
ParserFunctions.prototype.pf_ns = function ( token, frame, cb, args ) {
	var target = args[0].k;
	cb( { tokens: [target] } );
};
ParserFunctions.prototype.pf_subjectspace = function ( token, frame, cb, args ) {
	cb( { tokens: ['Main'] } );
};
ParserFunctions.prototype.pf_talkspace = function ( token, frame, cb, args ) {
	cb( { tokens: ['Talk'] } );
};
ParserFunctions.prototype.pf_numberofarticles = function ( token, frame, cb, args ) {
	cb( { tokens: ["1"] } );
};
ParserFunctions.prototype['pf_#language'] = function ( token, frame, cb, args ) {
	var target = args[0].k;
	cb( { tokens: [target] } );
};
ParserFunctions.prototype.pf_contentlang = function ( token, frame, cb, args ) {
	cb( { tokens: ['en'] } );
};
ParserFunctions.prototype.pf_numberoffiles = function ( token, frame, cb, args ) {
	cb( { tokens: ['2'] } );
};
ParserFunctions.prototype.pf_namespace = function ( token, frame, cb, args ) {
	var target = args[0].k;
	cb( { tokens: [target.split(':').pop() || 'Main'] } );
};
ParserFunctions.prototype.pf_namespacee = function ( token, frame, cb, args ) {
	var target = args[0].k;
	cb( { tokens: [target.split(':').pop() || 'Main'] } );
};
ParserFunctions.prototype.pf_pagename = function ( token, frame, cb, args ) {
	cb( { tokens: [this.env.pageName || ''] } );
};
ParserFunctions.prototype.pf_pagenamebase = function ( token, frame, cb, args ) {
	cb( { tokens: [this.env.pageName || ''] } );
};
ParserFunctions.prototype.pf_scriptpath = function ( token, frame, cb, args ) {
	cb( { tokens: [this.env.wgScriptPath] } );
};
ParserFunctions.prototype.pf_talkpagename = function ( token, frame, cb, args ) {
	cb( { tokens: [this.env.pageName.replace(/^[^:]:/, 'Talk:' ) || ''] } );
};

// TODO: #titleparts, SUBJECTPAGENAME, BASEPAGENAME. SUBPAGENAME, DEFAULTSORT

if (typeof module == "object") {
	module.exports.ParserFunctions = ParserFunctions;
}
