/*!
 * VisualEditor plugin for QUnit.
 *
 * @copyright See AUTHORS.txt
 */

( function ( QUnit ) {
	/**
	 * Plugin for QUnit.
	 *
	 * @class ve.QUnit
	 * @extends QUnit
	 */

	/**
	 * Builds a summary of a node tree.
	 *
	 * Generated summaries contain node types, lengths, outer lengths, attributes and summaries for
	 * each child recursively. It's simple and fast to use deepEqual on this.
	 *
	 * @private
	 * @param {ve.Node} node Node tree to summarize
	 * @param {boolean} [shallow] Do not summarize each child recursively
	 * @return {Object} Summary of node tree
	 */
	function getNodeTreeSummary( node, shallow ) {
		const summary = {
			getType: node.getType(),
			getLength: node.getLength(),
			getOuterLength: node.getOuterLength(),
			element: node.element
		};

		if ( node.children !== undefined ) {
			const numChildren = node.children.length;
			if ( !shallow ) {
				summary.children = [];
				for ( let i = 0; i < numChildren; i++ ) {
					summary.children.push( getNodeTreeSummary( node.children[ i ] ) );
				}
			}
		}
		return summary;
	}

	/**
	 * Builds a summary of a node selection.
	 *
	 * Generated summaries contain length of results as well as node summaries, ranges, indexes, indexes
	 * within parent and node ranges for each result. It's simple and fast to use deepEqual on this.
	 *
	 * @private
	 * @param {Object[]} selection Selection to summarize
	 * @return {Object} Summary of selection
	 */
	function getNodeSelectionSummary( selection ) {
		const summary = {
			length: selection.length
		};

		if ( selection.length ) {
			summary.results = [];
			for ( let i = 0; i < selection.length; i++ ) {
				summary.results.push( {
					node: getNodeTreeSummary( selection[ i ].node, true ),
					range: selection[ i ].range,
					index: selection[ i ].index,
					indexInNode: selection[ i ].indexInNode,
					nodeRange: selection[ i ].nodeRange,
					nodeOuterRange: selection[ i ].nodeOuterRange,
					parentOuterRange: selection[ i ].parentOuterRange
				} );
			}
		}
		return summary;
	}

	/**
	 * Callback for ve#copy to convert nodes to a comparable summary.
	 *
	 * @private
	 * @param {ve.dm.Node|Object} value Value in the object/array
	 * @return {Object} Node summary if value is a node, otherwise just the value
	 */
	function convertNodes( value ) {
		return value instanceof ve.dm.Node || value instanceof ve.ce.Node ?
			getNodeTreeSummary( value ) :
			value;
	}

	/**
	 * Assertion helpers for VisualEditor test suite.
	 *
	 * @class ve.QUnit.assert
	 */

	/**
	 * Assert that summaries of two node trees are equal.
	 *
	 * @static
	 * @param {ve.Node} actual
	 * @param {ve.Node} expected
	 * @param {boolean} shallow
	 * @param {string} message
	 */
	QUnit.assert.equalNodeTree = function ( actual, expected, shallow, message ) {
		if ( typeof shallow === 'string' && arguments.length === 3 ) {
			message = shallow;
			shallow = undefined;
		}
		const actualSummary = getNodeTreeSummary( actual, shallow );
		const expectedSummary = getNodeTreeSummary( expected, shallow );
		this.pushResult( {
			result: QUnit.equiv( actualSummary, expectedSummary ),
			actual: actualSummary,
			expected: expectedSummary,
			message
		} );
	};

	/**
	 * @static
	 * @param {Object[]} actual
	 * @param {Object[]} expected
	 * @param {string} message
	 */
	QUnit.assert.equalNodeSelection = function ( actual, expected, message ) {
		const actualSummary = getNodeSelectionSummary( actual ),
			expectedSummary = getNodeSelectionSummary( expected );

		for ( let i = 0; i < actual.length; i++ ) {
			if ( expected[ i ] && expected[ i ].node !== actual[ i ].node ) {
				this.pushResult( {
					result: false,
					actual: actualSummary,
					expected: expectedSummary,
					message: message + ' (reference equality for selection[' + i + '].node)'
				} );
				return;
			}
		}
		this.pushResult( {
			result: QUnit.equiv( actualSummary, expectedSummary ),
			actual: actualSummary,
			expected: expectedSummary,
			message
		} );
	};

	/**
	 * @static
	 * @param {HTMLElement} actual
	 * @param {HTMLElement} expected
	 * @param {string} message
	 */
	QUnit.assert.equalDomElement = function ( actual, expected, message ) {
		const actualSummary = ve.getDomElementSummary( actual ),
			expectedSummary = ve.getDomElementSummary( expected ),
			actualSummaryHtml = ve.getDomElementSummary( actual, true ),
			expectedSummaryHtml = ve.getDomElementSummary( expected, true );

		this.pushResult( {
			result: QUnit.equiv( actualSummary, expectedSummary ),
			actual: actualSummaryHtml,
			expected: expectedSummaryHtml,
			message
		} );
	};

	/**
	 * @static
	 * @param {HTMLElement} actual
	 * @param {HTMLElement} expected
	 * @param {string} message
	 */
	QUnit.assert.notEqualDomElement = function ( actual, expected, message ) {
		const actualSummary = ve.getDomElementSummary( actual ),
			expectedSummary = ve.getDomElementSummary( expected ),
			actualSummaryHtml = ve.getDomElementSummary( actual, true ),
			expectedSummaryHtml = ve.getDomElementSummary( expected, true );

		this.pushResult( {
			result: !QUnit.equiv( actualSummary, expectedSummary ),
			actual: actualSummaryHtml,
			expected: 'Not: ' + expectedSummaryHtml,
			message
		} );
	};

	function removeInternalState( val ) {
		ve.deleteProp( val, 'internal', 'changesSinceLoad' );
		ve.deleteProp( val, 'internal', 'metaItems' );
	}

	QUnit.assert.equalLinearData = function ( actual, expected, message ) {
		function removeOriginalDomElements( val ) {
			if ( val && val.type ) {
				ve.deleteProp( val, 'originalDomElementsHash' );
				ve.deleteProp( val, 'originalDomElements' );
				removeInternalState( val );
			}
			if ( val && val.origTitle ) {
				// HACK: This property is no longer used, ignore it for
				// compatibility with existing tests in other extensions
				delete val.origTitle;
			}
		}

		actual = ve.copy( actual );
		expected = ve.copy( expected );
		actual = ve.copy( actual, null, removeOriginalDomElements );
		expected = ve.copy( expected, null, removeOriginalDomElements );

		this.pushResult( {
			result: QUnit.equiv( actual, expected ),
			actual,
			expected,
			message
		} );
	};

	QUnit.assert.equalLinearDataWithDom = function ( store, actual, expected, message ) {
		function addOriginalDomElements( val ) {
			if ( val && val.originalDomElementsHash !== undefined ) {
				val.originalDomElements = store.value( val.originalDomElementsHash );
				delete val.originalDomElementsHash;
				removeInternalState( val );
			}
		}

		actual = ve.copy( actual );
		expected = ve.copy( expected );
		actual = ve.copy( actual, ve.convertDomElements, addOriginalDomElements );
		expected = ve.copy( expected, ve.convertDomElements, addOriginalDomElements );

		this.pushResult( {
			result: QUnit.equiv( actual, expected ),
			actual,
			expected,
			message
		} );
	};

	/**
	 * Assert that two objects which may contain DOM elements are equal.
	 *
	 * @static
	 * @param {Object} actual
	 * @param {Object} expected
	 * @param {string} message
	 */
	QUnit.assert.deepEqualWithDomElements = function ( actual, expected, message ) {
		// Recursively copy objects or arrays, converting any dom elements found to comparable summaries
		actual = ve.copy( actual, ve.convertDomElements );
		expected = ve.copy( expected, ve.convertDomElements );

		this.pushResult( {
			result: QUnit.equiv( actual, expected ),
			actual,
			expected,
			message
		} );
	};

	/**
	 * Assert that two objects which may contain node trees are equal.
	 *
	 * @static
	 * @param {Object} actual
	 * @param {Object} expected
	 * @param {string} message
	 */
	QUnit.assert.deepEqualWithNodeTree = function ( actual, expected, message ) {
		// Recursively copy objects or arrays, converting any dom elements found to comparable summaries
		actual = ve.copy( actual, convertNodes );
		expected = ve.copy( expected, convertNodes );

		this.pushResult( {
			result: QUnit.equiv( actual, expected ),
			actual,
			expected,
			message
		} );
	};

	/**
	 * Assert that two ranges are equal.
	 *
	 * A range can be a ve.Range object or null.
	 *
	 * @param {ve.Range|null} actual
	 * @param {ve.Range|null} expected
	 * @param {string} message
	 */
	QUnit.assert.equalRange = function ( actual, expected, message ) {
		actual = actual && {
			from: actual.from,
			to: actual.to
		};
		expected = expected && {
			from: expected.from,
			to: expected.to
		};
		this.pushResult( {
			result: QUnit.equiv( actual, expected ),
			actual,
			expected,
			message
		} );
	};

	QUnit.assert.equalHash = function ( actual, expected, message ) {
		actual = JSON.parse( JSON.stringify( actual ) );
		expected = JSON.parse( JSON.stringify( expected ) );
		this.pushResult( {
			result: QUnit.equiv( actual, expected ),
			actual,
			expected,
			message
		} );
	};

	/**
	 * Assert that all linear data items are frozen.
	 *
	 * If not, array indexes of non-frozen items are reported.
	 *
	 * @static
	 * @param {ve.dm.LinearData} linearData
	 * @param {string} message
	 */
	QUnit.assert.isLinearDataFrozen = function ( linearData, message ) {
		const notFrozen = [];
		linearData.data.forEach( ( item, i ) => {
			if ( !Object.isFrozen( item ) ) {
				notFrozen.push( i );
			}
		} );
		this.pushResult( {
			result: notFrozen.length === 0,
			actual: notFrozen,
			expected: [],
			message
		} );
	};

	/* eslint-disable mediawiki/no-storage */
	let sideBySide = true;
	try {
		sideBySide = localStorage.getItem( 've-qunit-diff-sideBySide' ) !== '0';
	} catch ( e ) {}

	function getToggleLabel() {
		return sideBySide ? 'Inline' : 'Side by side';
	}

	$( document ).on( 'click', '.ve-qunit-diff-toggle', ( e ) => {
		const $doc = $( e.delegateTarget );
		sideBySide = !sideBySide;
		try {
			localStorage.setItem( 've-qunit-diff-sideBySide', sideBySide ? '1' : '0' );
		} catch ( err ) {}
		$doc.find( '.ve-qunit-diff-toggle' ).text( getToggleLabel() );
		$doc.find( '.ve-qunit-diff-inline' ).prop( 'hidden', sideBySide );
		$doc.find( '.ve-qunit-diff-split' ).prop( 'hidden', !sideBySide );
	} );
	/* eslint-enable mediawiki/no-storage */

	function splitLines( text ) {
		return text.match( /[^\n]*\n|[^\n]+$/g ) || [];
	}

	/**
	 * Render a line-level diff as both inline and side-by-side HTML
	 *
	 * @ignore
	 * @param {Array} diffs Line-level diff-match-patch diffs
	 * @param {number} context Unchanged lines to show around each change
	 * @return {string} HTML
	 */
	function renderLineDiff( diffs, context ) {
		let inline = '',
			rows = '',
			oLine = 0,
			nLine = 0;

		function cells( num, line, tag ) {
			if ( line === undefined ) {
				return '<td class="ve-qunit-diff-num"></td><td class="ve-qunit-diff-empty"></td>';
			}
			const html = ve.escapeHtml( line.replace( /\n$/, '' ) );
			return '<td class="ve-qunit-diff-num">' + num + '</td>' +
				'<td>' + ( tag ? '<' + tag + '>' + html + '</' + tag + '>' : html ) + '</td>';
		}

		for ( let i = 0; i < diffs.length; i++ ) {
			const [ op, text ] = diffs[ i ];
			const lines = splitLines( text );
			if ( op === 0 ) {
				// Collapse unchanged lines outside the context window
				const head = i > 0 ? context : 0,
					tail = i < diffs.length - 1 ? context : 0,
					skipped = lines.length - head - tail,
					shown = skipped > 1 ?
						[ ...lines.slice( 0, head ), null, ...lines.slice( lines.length - tail ) ] :
						lines;
				for ( const line of shown ) {
					if ( line === null ) {
						const marker = '⋮ ' + skipped + ' unchanged lines';
						oLine += skipped;
						nLine += skipped;
						inline += marker + '\n';
						rows += '<tr><td class="ve-qunit-diff-skip" colspan="4">' + marker + '</td></tr>';
					} else {
						inline += ve.escapeHtml( line );
						rows += '<tr>' + cells( ++oLine, line ) + cells( ++nLine, line ) + '</tr>';
					}
				}
				continue;
			}
			let oLines = [],
				nLines = [];
			if ( op === -1 ) {
				oLines = lines;
				// A delete followed by an insert is a replacement, so pair up their lines
				if ( i + 1 < diffs.length && diffs[ i + 1 ][ 0 ] === 1 ) {
					nLines = splitLines( diffs[ ++i ][ 1 ] );
				}
			} else {
				nLines = lines;
			}
			if ( oLines.length ) {
				inline += '<del>' + ve.escapeHtml( oLines.join( '' ) ) + '</del>';
			}
			if ( nLines.length ) {
				inline += '<ins>' + ve.escapeHtml( nLines.join( '' ) ) + '</ins>';
			}
			for ( let j = 0; j < Math.max( oLines.length, nLines.length ); j++ ) {
				rows += '<tr>' +
					cells( j < oLines.length ? ++oLine : null, oLines[ j ], 'del' ) +
					cells( j < nLines.length ? ++nLine : null, nLines[ j ], 'ins' ) +
					'</tr>';
			}
		}

		return '<button type="button" class="ve-qunit-diff-toggle">' + getToggleLabel() + '</button>' +
			'<div class="ve-qunit-diff-inline"' + ( sideBySide ? ' hidden' : '' ) + '>' + inline + '</div>' +
			'<table class="ve-qunit-diff-split"' + ( sideBySide ? '' : ' hidden' ) + '>' +
			'<colgroup><col class="ve-qunit-diff-numcol"><col><col class="ve-qunit-diff-numcol"><col></colgroup>' +
			'<tr><th colspan="2">Expected</th><th colspan="2">Result</th></tr>' +
			rows +
			'</table>';
	}

	QUnit.diff = function ( o, n ) {
		const DiffMatchPatch = ve.DiffMatchPatch.super,
			dmp = new DiffMatchPatch();

		if ( o.includes( '\n' ) || n.includes( '\n' ) ) {
			/* eslint-disable no-underscore-dangle */
			const encoded = dmp.diff_linesToChars_( o, n );
			const diffs = dmp.diff_main( encoded.chars1, encoded.chars2, false );
			dmp.diff_charsToLines_( diffs, encoded.lineArray );
			/* eslint-enable no-underscore-dangle */
			return renderLineDiff( diffs, 10 );
		}

		const diffs = dmp.diff_main( o, n );
		dmp.diff_cleanupSemantic( diffs );
		return diffs.map( ( [ op, text ] ) => {
			const html = ve.escapeHtml( text );
			return op === 1 ? '<ins>' + html + '</ins>' :
				op === -1 ? '<del>' + html + '</del>' :
					html;
		} ).join( '' );
	};
}( QUnit ) );
