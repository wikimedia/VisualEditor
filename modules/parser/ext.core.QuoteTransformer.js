/*
 * Italic/Bold handling.
 *
 * - list of tokens
 *   - NEWLINE
 *   - ticks (2+) -> list with link in line token list?
 *   - process on newline
 *   - need access to text nodes before for conversion back to text
 */

function QuoteTransformer ( ) {
	this.italics = [];
	this.bolds = [];
	this.inserted = 0;
}

// Register this transformer with the TokenTransformer
QuoteTransformer.prototype.register = function ( tokenTransformer ) {
	// Register for NEWLINE and QUOTE tag tokens
	var self = this;
	tokenTransformer.appendListener( function (ctx) { 
		return self.onNewLine(ctx);
	}, 'newline' );
	tokenTransformer.appendListener( function (ctx) { 
		return self.onQuote(ctx);
	}, 'tag', 'QUOTE' );
};

// Make a copy of the token context
QuoteTransformer.prototype.ctx = function ( tokenCTX ) {
	return $.extend({}, tokenCTX);
};

// Handle QUOTE tags. These are collected in italic/bold lists depending on
// the length of quote string. Actual analysis and conversion to the
// appropriate tag tokens is deferred until the next NEWLINE token triggers
// onNewLine.
QuoteTransformer.prototype.onQuote = function ( tokenCTX ) {
	var token = tokenCTX.token,
		qlen = token.value.length,
		out = null,
		lastToken = tokenCTX.lastToken,
		ctx = this.ctx(tokenCTX),
		ctx2,
		accum = tokenCTX.accum;

	switch (qlen) {
		case 2: 
			// Start a new accumulator, so we can later go back using the
			// reference to this accumulator and append our tags at the end of
			// it.
			accum = tokenCTX.transformer.newAccumulator(accum);
			this.italics.push(ctx);
			break;
		case 3: 
			accum = tokenCTX.transformer.newAccumulator(accum);
			this.bolds.push(ctx);
			break;
		case 4: 
			if (lastToken && lastToken.type === 'TEXT') {
				lastToken.value += "'";
			} else {
				out = {type: 'TEXT', value: "'"};
			}
			accum = tokenCTX.transformer.newAccumulator(accum);
			this.bolds.push(ctx); 
			break;
		case 5:
			// The order of italic vs. bold does not matter. Those are
			// processed in a fixed order, and any nesting issues are fixed up
			// by the HTML 5 tree builder. This does not always result in the
			// prettiest result, but at least it is always correct and very
			// convenient.
			accum = tokenCTX.transformer.newAccumulator(accum, 2);
			this.italics.push(ctx); 
			ctx2 = this.ctx(tokenCTX);
			ctx2.token = {attribs: ctx.token.attribs};
			this.bolds.push(ctx2); 
			break;
		default: // longer than 5, only use the last 5 ticks
			var newvalue = token.value.substr(0, qlen - 5 );
			if (lastToken && lastToken.type === 'TEXT') {
				lastToken.value += newvalue;
			} else {
				out = {type: 'TEXT', value: newvalue};
			}
			accum = tokenCTX.transformer.newAccumulator(accum, 2);
			this.italics.push(ctx); 
			ctx2 = this.ctx(tokenCTX);
			ctx2.token = {attribs: ctx.token.attribs};
			this.bolds.push(ctx2); 
			break;
	}
	
	tokenCTX.token = out;
	tokenCTX.accum = accum;
	return tokenCTX;
};

// Handle NEWLINE tokens, which trigger the actual quote analysis on the
// collected quote tokens so far.
QuoteTransformer.prototype.onNewLine = function ( tokenCTX ) {
	if(!this.bolds && !this.italics) {
		// Nothing to do, quick abort.
		return tokenCTX;
	}
	//console.log("onNewLine: " + this.italics + this.bolds);
	// balance out tokens, convert placeholders into tags
	if (this.italics.length % 2 && this.bolds.length % 2) {
		var firstsingleletterword = -1,
			firstmultiletterword = -1,
			firstspace = -1;
		for (var j = 0; j < this.bolds.length; j++) {
			var ctx = this.bolds[j];
			//console.log("balancing!" + JSON.stringify(ctx.lastToken, null, 2));
			if (ctx.lastToken) {
				if (ctx.lastToken.type === 'TEXT') {
					var lastchar = ctx.lastToken.value[ctx.lastToken.value.length - 1],
						secondtolastchar = ctx.lastToken.value[ctx.lastToken.value.length - 2];
					if (lastchar === ' ' && firstspace === -1) {
						firstspace = j;
					} else if (lastchar !== ' ') {
						if ( secondtolastchar === ' ' && 
								firstsingleletterword === -1) 
						{
							firstsingleletterword = j;
						} else if ( firstmultiletterword == -1) {
							firstmultiletterword = j;
						}
					}
				} else if ( ( ctx.lastToken.type === 'NEWLINE' ||
								ctx.lastToken.type === 'TAG' ) &&
								firstmultiletterword == -1 ) {
					// This is an approximation, as the original doQuotes
					// operates on the source and just looks at space vs.
					// non-space. At least some tags are thus recognized as
					// words in the original implementation.
					firstmultiletterword = j;
				}
			}
		}


		// now see if we can convert a bold to an italic and
		// an apostrophe
		if (firstsingleletterword > -1) {
			this.convertBold(firstsingleletterword);
		} else if (firstmultiletterword > -1) {
			this.convertBold(firstmultiletterword);
		} else if (firstspace > -1) {
			this.convertBold(firstspace);
		}
	}

	this.quotesToTags(this.italics, 'i', tokenCTX.transformer);
	this.quotesToTags(this.bolds, 'b', tokenCTX.transformer);

	this.bolds = [];
	this.italics = [];

	// Pass through the NEWLINE token unchanged
	return tokenCTX;
};

// Convert a bold token to italic to balance an uneven number of both bold and
// italic tags. In the process, one quote needs to be converted back to text.
QuoteTransformer.prototype.convertBold = function ( i ) {
	var ctx = this.bolds[i];
	//console.log('convertbold!');
	if ( ctx.lastToken && ctx.lastToken.type === 'TEXT' ) {
		ctx.lastToken.value += "'";
	} else {
		// Add a text token!
		ctx.token = [{type: 'TEXT', value: "'"}, ctx.token];
	}

	this.bolds.splice(i, 1);

	this.italics.push(ctx);
	this.italics.sort(function(a,b) { return a.pos - b.pos; } );
	//console.log(this.italics.map(function(a) { return a.pos }));
	//console.log(this.bolds.map(function(a) { return a.pos }));
};

// Convert italics/bolds into tags
QuoteTransformer.prototype.quotesToTags = function ( contexts, name, transformer ) {
	var toggle = true,
		t,
		out = [];
	for (var j = 0; j < contexts.length; j++) {
		t = contexts[j].token;

		if ( $.isArray(t) ) {
			// Slip in a text token from bold to italic rebalancing. Don't
			// count this callback towards completion.
			var realToken = t.pop();
			transformer.transformTokens( t, contexts[j].accum, 0 );
			t = realToken;
		}

		if(toggle) {
			t.type = 'TAG';
		} else {
			t.type = 'ENDTAG';
		}
		t.name = name;
		delete t.value;
		toggle = !toggle;
		// Re-add and process the new token with the original accumulator, but
		// don't yet count this callback towards callback completion.
		transformer.transformTokens( [t], contexts[j].accum, 0 );
	}
	var l = contexts.length;
	if (!toggle) {
		// Add end tag, but don't count it towards completion.
		transformer.transformTokens( [{type: 'ENDTAG', name: name}], 
				contexts[contexts.length - 1].accum, 0 );
	}
	// Now finally count the number of contexts towards completion, which
	// causes the transformer to call its own callback if no more asynch
	// callbacks are outstanding.
	transformer.finish( contexts.length );
};

if (typeof module == "object") {
	module.exports.QuoteTransformer = QuoteTransformer;
}
