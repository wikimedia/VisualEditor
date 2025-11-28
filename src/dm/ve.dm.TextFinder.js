/**
 * Finder of text content within lines of text
 *
 * @constructor
 * @param {Object} [options] Search options
 * @param {boolean} [options.wholeWord] Only match whole-word occurrences
 */
ve.dm.TextFinder = function VeDmTextFinder( options ) {
	this.options = options;
};

OO.initClass( ve.dm.TextFinder );

/**
 * @param {string} line The line of text to match
 * @return {Array[]} Match ranges [ [ start1, end1 ], ... ]
 */
ve.dm.TextFinder.prototype.find = function ( line ) {
	let ranges = this.findRanges( line );
	if ( this.options.wholeWord ) {
		const dataString = new ve.dm.DataString( [ ...line ] );
		ranges = ranges.filter( ( range ) => unicodeJS.wordbreak.isBreak( dataString, range[ 0 ] ) &&
			unicodeJS.wordbreak.isBreak( dataString, range[ 1 ] ) );
	}
	return ranges;
};

/**
 * Find the matching ranges, without checking for word boundaries
 *
 * @param {string} line The line of text to match
 * @return {Array[]} Match ranges [ [ start1, end1 ], ... ]
 */
ve.dm.TextFinder.prototype.findRanges = null;

/**
 * @constructor
 * @param {string} query Text to find
 * @param {Object} [options] Search options
 * @param {boolean} [options.lang='unk'] Language for Intl.Collator#compare
 * @param {boolean} [options.caseSensitiveString] Case sensitive search for a string query
 * @param {boolean} [options.diacriticInsensitiveString] Diacritic insensitive search for a string query
 *  Only works in browsers which support the Internationalization API
 * @param {boolean} [options.noOverlaps] Avoid overlapping matches
 * @return {ve.Range[]} List of ranges where the string was found
 */
ve.dm.StringTextFinder = function VeDmStringTextFinder( query, options ) {
	ve.dm.StringTextFinder.super.call( this );
	this.query = query;
	this.options = options;
	const lang = options.lang || 'unk';

	let sensitivity;
	if ( this.options.diacriticInsensitiveString ) {
		sensitivity = this.options.caseSensitiveString ? 'case' : 'base';
	} else {
		sensitivity = this.options.caseSensitiveString ? 'variant' : 'accent';
	}
	// Intl is only used browser clients
	this.compare = new Intl.Collator( lang, { sensitivity } ).compare;
};

OO.inheritClass( ve.dm.StringTextFinder, ve.dm.TextFinder );

/**
 * @inheritdoc
 */
ve.dm.StringTextFinder.prototype.findRanges = function ( line ) {
	// FIXME: For case-insensitive search, character-wise comparison is not i18n-safe. and
	// it cannot be assumed that the match will have the same string length as the search
	// query. E.g. the following compares equal:
	// collator = new Intl.Collator( 'en', { sensitivity: 'base' } );
	// collator.compare( '\u0130', '\u0069\u0307' );
	const qLen = this.query.length;
	const ranges = [];
	// Iterate up to (and including) offset textLength - queryLength. Beyond that point
	// there is not enough room for the query to exist
	for ( let offset = 0, l = line.length - qLen; offset <= l; offset++ ) {
		let j = 0;
		while ( this.compare( line[ offset + j ], this.query[ j ] ) === 0 ) {
			j++;
			if ( j === qLen ) {
				ranges.push( [ offset, offset + qLen ] );
				offset += this.options.noOverlaps ? qLen - 1 : 0;
				break;
			}
		}
	}
	return ranges;
};

/**
 * @constructor
 * @param {Set} query The set of words to match
 * @param {Object} [options] Search options
 * @param {boolean} [options.caseSensitiveString] Should the search be case sensitive.
 * @param {boolean} [options.lang] Language for case folding. Required if !caseSensitiveString.
 * @param {boolean} [options.noOverlaps] Avoid overlapping matches
 */
ve.dm.SetTextFinder = function VeDmSetTextFinder( query, options = {} ) {
	ve.dm.SetTextFinder.super.call( this );

	this.options = options;
	this.lang = options.lang;
	if ( options.caseSensitiveString ) {
		this.normalizedQuery = query;
	} else {
		this.normalizedQuery = new Set( Array.from( query ).map( ( s ) => s.toLocaleLowerCase( this.lang ) ) );
	}
	this.minLen = Infinity;
	this.maxLen = 0;
	this.normalizedQuery.forEach( ( s ) => {
		this.minLen = Math.min( this.minLen, s.length );
		this.maxLen = Math.max( this.maxLen, s.length );
	} );
};

OO.inheritClass( ve.dm.SetTextFinder, ve.dm.TextFinder );

/**
 * Map from offset in case-folded string to offset in original string
 * In some cases, case-folding can change string length
 * For example, if s = '\u0130', then s.length === 1 but s.toLocaleLowerCase( 'en' ).length === 2
 *
 * @param {string} s
 * @param {number} offsetLower in lowercased string
 * @return {number} corresponding offset in original string
 */
ve.dm.SetTextFinder.static.fixOffset = function ( s, offsetLower ) {
	// Start by guessing that lowercasing didn't change the offset,
	// except when the offset is out of bounds in the original string
	let guess = Math.min( offsetLower, s.length );

	let diff = s.slice( 0, guess ).toLocaleLowerCase( this.lang ).length - offsetLower;
	if ( diff === 0 ) {
		// Optimization note: this will almost always be true
		// Only rare characters change length of substr when case folding
		return guess;
	}

	while ( diff > 0 ) {
		// The lowercase substr is longer than original
		guess--;
		diff = s.slice( 0, guess ).toLocaleLowerCase( this.lang ).length - offsetLower;
	}

	while ( diff < 0 ) {
		// The lowercase substr is shorter than original
		guess++;
		diff = s.slice( 0, guess ).toLocaleLowerCase( this.lang ).length - offsetLower;
	}
	// In some rare situations the diff might be positive now
	// (which would correspond to no offset in the original string mapping to the desired offset)
	return guess;
};

/**
 * @inheritdoc
 */
ve.dm.SetTextFinder.prototype.findRanges = function ( line ) {
	if ( this.normalizedQuery.size === 0 ) {
		return [];
	}

	let normalizedLine = line;
	if ( !this.options.caseSensitiveString ) {
		normalizedLine = line.toLocaleLowerCase( this.lang );
	}

	const ranges = [];
	// For each possible length, do a sliding window search on the normalized line
	for ( let len = this.minLen; len <= this.maxLen; len++ ) {
		for ( let i = 0; i <= normalizedLine.length - len; i++ ) {
			const substr = normalizedLine.slice( i, i + len );
			if ( this.normalizedQuery.has( substr ) ) {
				let start = i;
				let end = i + len;
				if ( !this.options.caseSensitiveString ) {
					start = this.constructor.static.fixOffset( line, start );
					end = this.constructor.static.fixOffset( line, end );
				}
				ranges.push( [ start, end ] );
				if ( this.options.noOverlaps ) {
					i += len - 1;
				}
			}
		}
	}
	return ranges;
};

/**
 * @constructor
 * @param {RegExp} query RegExp object with the /g flag
 * @param {Object} [options] Search options
 * @param {boolean} [options.noOverlaps] Avoid overlapping matches
 */
ve.dm.RegExpTextFinder = function VeDmRegExpTextFinder( query, options = {} ) {
	ve.dm.RegExpTextFinder.super.call( this );
	if ( !query.global ) {
		throw new Error( 'The /g flag must be set on the query RegExp' );
	}
	this.query = query;
	this.options = options;
};

OO.inheritClass( ve.dm.RegExpTextFinder, ve.dm.TextFinder );

/**
 * @inheritdoc
 */
ve.dm.RegExpTextFinder.prototype.findRanges = function ( line ) {
	this.query.lastIndex = 0;
	let match;
	const ranges = [];
	while ( ( match = this.query.exec( line ) ) !== null ) {
		const matchText = match[ 0 ];

		// Skip empty string matches (e.g. with .*)
		if ( matchText.length === 0 ) {
			// Set lastIndex to the next character to avoid an infinite
			// loop. Browsers differ in whether they do this for you
			// for empty matches; see
			// http://blog.stevenlevithan.com/archives/exec-bugs
			this.query.lastIndex = match.index + 1;
			continue;
		}

		ranges.push( [ match.index, match.index + matchText.length ] );
		if ( !this.options.noOverlaps || matchText[ 0 ] === '\uFFFC' ) {
			// We want overlaps, or the match starts with OBJECT REPLACEMENT CHARACTER,
			// so jump back to the next character after the start of the match
			this.query.lastIndex = match.index + 1;
		}
	}
	return ranges;
};

/**
 * Wrap a finder in a memoizing layer
 *
 * @constructor
 * @param {ve.dm.TextFinder} finder The finder to wrap
 * @param {number} [capacity=1000] Max number of results to remember
 */
ve.dm.MemoizedTextFinder = function VeDmMemoizedTextFinder( finder, capacity = 1000 ) {
	this.finder = finder;
	this.memory = new Map();
	this.capacity = capacity;
};

OO.inheritClass( ve.dm.MemoizedTextFinder, ve.dm.TextFinder );

/**
 * @inheritdoc
 */
ve.dm.MemoizedTextFinder.prototype.find = function ( line ) {
	let result = this.memory.get( line );
	if ( result === undefined ) {
		result = this.finder.find( line );
	} else {
		// We'll refresh the key for LRU purposes
		this.memory.delete( result );
	}
	this.memory.set( line, result );
	if ( this.memory.size > this.capacity ) {
		// Purge stalest key
		this.memory.delete( this.memory.keys().next().value );
	}
	return result;
};
