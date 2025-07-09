/*!
 * VisualEditor DiffMatchPatch implementation for linear model
 *
 * @copyright See AUTHORS.txt
 */

/* global diff_match_patch */

/**
 * DiffMatchPatch implementation
 *
 * @class
 * @extends diff_match_patch
 * @constructor
 * @param {ve.dm.HashValueStore} oldStore
 * @param {ve.dm.HashValueStore} newStore
 */
ve.DiffMatchPatch = function VeDiffMatchPatch( oldStore, newStore ) {
	// Parent constructor
	ve.DiffMatchPatch.super.call( this );

	this.store = oldStore.slice();
	this.store.merge( newStore );
};

/* Inheritance */

OO.inheritClass( ve.DiffMatchPatch, diff_match_patch );

/* Static properties */

ve.DiffMatchPatch.static.DIFF_DELETE = -1;
ve.DiffMatchPatch.static.DIFF_INSERT = 1;
ve.DiffMatchPatch.static.DIFF_EQUAL = 0;
ve.DiffMatchPatch.static.DIFF_CHANGE_DELETE = -2;
ve.DiffMatchPatch.static.DIFF_CHANGE_INSERT = 2;

/* Methods */

ve.DiffMatchPatch.prototype.isEqualChar = function ( a, b ) {
	return a === b || ve.dm.ElementLinearData.static.compareElements( a, b, this.store, this.store );
};

ve.DiffMatchPatch.prototype.isEqualString = function ( a, b ) {
	if ( a === b ) {
		return true;
	}
	if ( a === null || b === null ) {
		return false;
	}
	if ( a.length !== b.length ) {
		return false;
	}

	for ( let i = 0, l = a.length; i < l; i++ ) {
		if ( !this.isEqualChar( a[ i ], b[ i ] ) ) {
			return false;
		}
	}
	return true;
};

ve.DiffMatchPatch.prototype.charsToString = function ( chars ) {
	return chars.slice();
};

ve.DiffMatchPatch.prototype.getEmptyString = function () {
	return [];
};

ve.DiffMatchPatch.prototype.indexOf = function indexOf( text, searchValue, fromIndex ) {
	// fromIndex defaults to 0 and is bounded by 0 and text.length
	// Note that indexOf( 'foo', '', 99 ) is supposed to return 3 (text.length), which is why we allow
	// starting the search beyond the end of the string
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/indexOf
	for (
		let i = fromIndex === undefined ? 0 : Math.min( Math.max( fromIndex, 0 ), text.length );
		i <= text.length - searchValue.length;
		i++
	) {
		let found = true;
		for ( let j = 0; j < searchValue.length; j++ ) {
			if ( !this.isEqualChar( text[ i + j ], searchValue[ j ] ) ) {
				found = false;
				break;
			}
		}
		if ( found ) {
			return i;
		}
	}
	return -1;
};

ve.DiffMatchPatch.prototype.lastIndexOf = function lastIndexOf( text, searchValue, fromIndex ) {
	const iLen = text.length - searchValue.length;
	// fromIndex defaults to the end, and must be greater than 0
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/lastIndexOf
	for (
		let i = fromIndex === undefined ? iLen : Math.min( Math.max( fromIndex, 0 ), iLen );
		i >= 0;
		i--
	) {
		let found = true;
		for ( let j = 0; j < searchValue.length; j++ ) {
			if ( !this.isEqualChar( text[ i + j ], searchValue[ j ] ) ) {
				found = false;
				break;
			}
		}
		if ( found ) {
			return i;
		}
	}
	return -1;
};

ve.DiffMatchPatch.prototype.getCleanDiff = function ( oldData, newData, options ) {
	const store = this.store,
		DIFF_DELETE = this.constructor.static.DIFF_DELETE,
		DIFF_INSERT = this.constructor.static.DIFF_INSERT,
		DIFF_EQUAL = this.constructor.static.DIFF_EQUAL,
		DIFF_CHANGE_DELETE = this.constructor.static.DIFF_CHANGE_DELETE,
		DIFF_CHANGE_INSERT = this.constructor.static.DIFF_CHANGE_INSERT;

	/**
	 * Remove the close elements from the linear data, to force a balanced diff.
	 *
	 * Otherwise, for example, removing the second of two consecutive comment
	 * nodes could result in a diff where [{type: '/comment'}, {type: 'comment'}]
	 * is removed, which is unbalanced.
	 *
	 * Warning: this step assumes that, within a content branch node, an element
	 * is always immediately followed by its close element.
	 *
	 * @param {ve.dm.LinearData.Item[]} data Linear data
	 * @return {ve.dm.LinearData.Item[]} Linear data without close elements
	 */
	function removeCloseElements( data ) {
		for ( let i = 0, ilen = data.length; i < ilen; i++ ) {
			if ( data[ i ].type && data[ i ].type[ 0 ] === '/' ) {
				data.splice( i, 1 );
				ilen--;
				i--;
			}
		}
		return data;
	}

	/**
	 * Get the index of the first or last wordbreak in a data array
	 *
	 * @param {ve.dm.LinearData.Item[]} data Linear data
	 * @param {boolean} reversed Get the index of the last wordbreak
	 * @return {number|null} Index of the first or last wordbreak, or null if no
	 *  wordbreak was found
	 */
	function findWordbreaks( data, reversed ) {
		const dataString = new ve.dm.DataString( data );

		const offset = unicodeJS.wordbreak.moveBreakOffset(
			reversed ? -1 : 1,
			dataString,
			reversed ? data.length : 0
		);

		if ( ( reversed && offset === 0 ) || ( !reversed && offset === data.length ) ) {
			return null;
		} else {
			return offset;
		}
	}

	/**
	 * Determine whether there is a wordbreak at an offset
	 *
	 * @param {ve.dm.LinearData.Item[]} data Linear data
	 * @param {number} offset
	 * @return {boolean} There is a wordbreak at the offset
	 */
	function isBreak( data, offset ) {
		return !!( unicodeJS.wordbreak.isBreak( new ve.dm.DataString( data ), offset ) );
	}

	/**
	 * The perfect diff is not always human-friendly, so clean it up.
	 * Make sure retained content spans whole words (no wordbreaks),
	 * and "de-stripe" any sequences of alternating removes and inserts
	 * (with no retains) to look like one continuous removal and one continuous
	 * insert.
	 *
	 * Additionally clean up mistakes made by the linear differ, such as removing
	 * and inserting identical content (insetead of retaining it) and removing,
	 * inserting or retaining an empty content array.
	 *
	 * @param {Array} diff Linear diff, as arrays of inserted, removed and retained
	 * content
	 * @return {Array} A human-friendlier linear diff
	 */
	function getCleanDiff( diff ) {
		let previousData = null,
			previousAction = null,
			remove = [],
			insert = [];
		const cleanDiff = [];

		function equalUnannotated( other, element, index ) {
			return ve.dm.ElementLinearData.static.compareElementsUnannotated( element, other[ index ] );
		}

		function equalElements( other, element, index ) {
			// Non-elements can't be equal to other elements
			if ( !element.type || !other[ index ].type ) {
				return false;
			}
			if ( ve.dm.LinearData.static.isOpenElementData( element ) ) {
				return ve.dm.modelRegistry.lookup( element.type ).static.isDiffComparable( element, other[ index ], store, store );
			} else {
				// Ignore close elements
				return true;
			}
		}

		function isWhitespace( element ) {
			const value = Array.isArray( element ) ? element[ 0 ] : element;
			return typeof value === 'string' && /^\s+$/.test( value );
		}

		// Where the same data is removed and inserted, replace it with a retain
		for ( let i = 0; i < diff.length; i++ ) {
			const action = diff[ i ][ 0 ];
			const data = diff[ i ][ 1 ];
			// Should improve on JSON.stringify
			if ( ( action > 0 || previousAction > 0 ) && action + previousAction === 0 && JSON.stringify( data ) === JSON.stringify( previousData ) ) {
				diff.splice( i - 1, 2, [ DIFF_EQUAL, data ] );
				i++;
			}
			previousAction = action;
			previousData = data;
		}
		previousData = null;
		previousAction = null;

		// Join any consecutive actions that are the same
		for ( let i = 0; i < diff.length; i++ ) {
			const action = diff[ i ][ 0 ];
			if ( action === previousAction ) {
				ve.batchPush( diff[ i - 1 ][ 1 ], diff[ i ][ 1 ] );
				diff.splice( i, 1 );
				i--;
			} else if ( diff[ i ][ 1 ].length === 0 ) {
				diff.splice( i, 1 );
				i--;
				continue;
			}
			previousAction = action;
		}

		// Convert any retains that do not end and start with spaces into remove-
		// inserts
		for ( let i = 0; i < diff.length; i++ ) {
			const action = diff[ i ][ 0 ];
			const data = diff[ i ][ 1 ];
			if ( action === DIFF_EQUAL ) {
				let start = [];
				let end = [];
				const firstWordbreak = findWordbreaks( data, false );
				const lastWordbreak = firstWordbreak === null ? null : findWordbreaks( data, true );
				const notNextStartsWithWordbreak = i !== diff.length - 1 && !isBreak( data.concat( diff[ i + 1 ][ 1 ] ), data.length );
				const notPreviousEndsWithWordBreak = i !== 0 && !isBreak( previousData.concat( data ), previousData.length );

				if ( firstWordbreak === null && ( notNextStartsWithWordbreak || notPreviousEndsWithWordBreak ) ) {
					// If there was no wordbreak, and there are no wordbreaks either side,
					// the retain should be replaced with a remove-insert
					diff.splice( i, 1, [ DIFF_DELETE, data ], [ DIFF_INSERT, data ] );
					i++;
				} else {
					if ( notNextStartsWithWordbreak ) {
						// Unless the next item starts with a wordbreak, replace the portion
						// after the last wordbreak.
						end = data.splice( lastWordbreak );
					}
					if ( notPreviousEndsWithWordBreak ) {
						// Unless the previous item ends with a word break,replace the portion
						// before the first wordbreak.
						start = data.splice( 0, firstWordbreak );
					} else {
						// Skip over close tags to ensure a balanced remove/insert
						// Word break logic should ensure that there aren't unbalanced
						// tags on the left of the remove/insert
						let j = 0;
						while ( ve.dm.LinearData.static.isCloseElementData( data[ j ] ) ) {
							j++;
						}
						start = data.splice( 0, j );
					}

					// At this point the only portion we want to retain is what's left of
					// data (if anything; if firstWordbreak === lastWordbreak !== null, then
					// data has been spliced away completely).
					if ( start.length > 0 ) {
						diff.splice( i, 0, [ DIFF_DELETE, start ], [ DIFF_INSERT, start ] );
						i += 2;
					}
					if ( end.length > 0 ) {
						diff.splice( i + 1, 0, [ DIFF_DELETE, end ], [ DIFF_INSERT, end ] );
						i += 2;
					}
				}
			}
			previousData = data;
		}

		// In a sequence of -remove-insert-remove-insert- make the removes into a
		// single action and the inserts into a single action
		for ( let i = 0, ilen = diff.length; i < ilen; i++ ) {
			const action = diff[ i ][ 0 ];
			const data = diff[ i ][ 1 ];
			if ( action === DIFF_DELETE ) {
				ve.batchPush( remove, data );
			} else if ( action === DIFF_INSERT ) {
				ve.batchPush( insert, data );
			} else if ( action === DIFF_EQUAL && data.length > 0 ) {
				if ( data.every( isWhitespace ) ) {
					ve.batchPush( remove, data );
					ve.batchPush( insert, data );
				} else {
					if ( remove.length > 0 ) {
						cleanDiff.push( [ DIFF_DELETE, remove ] );
					}
					remove = [];
					if ( insert.length > 0 ) {
						cleanDiff.push( [ DIFF_INSERT, insert ] );
					}
					insert = [];
					cleanDiff.push( diff[ i ] );
				}
			}
		}

		if ( remove.length > 0 ) {
			cleanDiff.push( [ DIFF_DELETE, remove ] );
		}
		if ( insert.length > 0 ) {
			cleanDiff.push( [ DIFF_INSERT, insert ] );
		}

		// Now go over any consecutive remove-inserts (also insert-removes?) and
		// if they have the same character data, or are modified content nodes,
		// make them changes instead
		for ( let i = 0, ilen = cleanDiff.length - 1; i < ilen; i++ ) {
			const aItem = cleanDiff[ i ];
			const bItem = cleanDiff[ i + 1 ];
			const aData = aItem[ 1 ];
			const bData = bItem[ 1 ];
			const aAction = aItem[ 0 ];
			const bAction = bItem[ 0 ];
			// If they have the same length content and they are a consecutive
			// remove and insert, and they have the same content then mark the
			// old one as a change-remove (-2) and the new one as a change-insert
			// (2)
			if (
				aData.length === bData.length &&
				( ( aAction === DIFF_DELETE && bAction === DIFF_INSERT ) || ( aAction === DIFF_INSERT && bAction === DIFF_DELETE ) )
			) {
				if ( aData.every( equalUnannotated.bind( this, bData ) ) ) {
					const aAnnotations = new ve.dm.ElementLinearData( store, aData ).getAnnotationsFromRange( new ve.Range( 0, aData.length ), true );
					const bAnnotations = new ve.dm.ElementLinearData( store, bData ).getAnnotationsFromRange( new ve.Range( 0, bData.length ), true );

					const annotationChanges = [];
					bAnnotations.get().forEach( ( b ) => {
						const sameName = aAnnotations.getAnnotationsByName( b.name );
						if ( !aAnnotations.containsComparable( b ) ) {
							if ( sameName.getLength() ) {
								// Annotations which have the same type, but are non-comparable, e.g. link with a different href
								annotationChanges.push( { oldAnnotation: sameName.get( 0 ), newAnnotation: b } );
							} else {
								annotationChanges.push( { newAnnotation: b } );
							}
						}
					} );
					aAnnotations.get().forEach( ( a ) => {
						if ( !(
							// Check the old annotation hasn't already been described as a insertion...
							bAnnotations.containsComparable( a ) ||
							// ...or a change
							bAnnotations.getAnnotationsByName( a.name ).getLength()
						) ) {
							annotationChanges.push( { oldAnnotation: a } );
						}
					} );

					if ( annotationChanges.length ) {
						cleanDiff[ i + 1 ].annotationChanges = annotationChanges;
						cleanDiff[ i ][ 0 ] = aAction === DIFF_DELETE ? DIFF_CHANGE_DELETE : DIFF_CHANGE_INSERT;
						cleanDiff[ i + 1 ][ 0 ] = bAction === DIFF_DELETE ? DIFF_CHANGE_DELETE : DIFF_CHANGE_INSERT;
					}
				}
				if ( aData.every( equalElements.bind( this, bData ) ) ) {
					const attributeChanges = [];
					bData.forEach( ( element, n ) => {
						if ( ve.dm.LinearData.static.isOpenElementData( element ) ) {
							attributeChanges.push( { oldAttributes: aData[ n ].attributes, newAttributes: element.attributes, index: n } );
						}
					} );
					if ( attributeChanges.length ) {
						cleanDiff[ i + 1 ].attributeChanges = attributeChanges;
						cleanDiff[ i ][ 0 ] = aAction === DIFF_DELETE ? DIFF_CHANGE_DELETE : DIFF_CHANGE_INSERT;
						cleanDiff[ i + 1 ][ 0 ] = bAction === DIFF_DELETE ? DIFF_CHANGE_DELETE : DIFF_CHANGE_INSERT;
					}
				}

				// No need to check bItem against the following item
				i += 1;
			}
		}

		return cleanDiff;
	}

	// Remove the close elements
	oldData = removeCloseElements( oldData );
	newData = removeCloseElements( newData );

	// Get the diff
	const finalDiff = getCleanDiff( this.diff_main( oldData, newData, options ) );

	// Re-insert the close elements
	for ( let k = 0, klen = finalDiff.length; k < klen; k++ ) {
		for ( let m = 0; m < finalDiff[ k ][ 1 ].length; m++ ) {
			if ( finalDiff[ k ][ 1 ][ m ].type ) {
				finalDiff[ k ][ 1 ].splice( m + 1, 0, {
					type: '/' + finalDiff[ k ][ 1 ][ m ].type
				} );
				m++;
			}
		}
	}

	finalDiff.timedOut = this.lastDiffTimedOut;

	return finalDiff;
};
