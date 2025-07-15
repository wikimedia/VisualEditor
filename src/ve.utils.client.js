/*!
 * VisualEditor client (browser) specific utilities that interact with a rendered DOM.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * @method
 * @see OO.ui.Element#scrollIntoView
 */
ve.scrollIntoView = OO.ui.Element.static.scrollIntoView.bind( OO.ui.Element.static );

/**
 * Select the contents of an element
 *
 * @param {HTMLElement} element
 */
ve.selectElement = function ( element ) {
	const win = OO.ui.Element.static.getWindow( element ),
		nativeRange = win.document.createRange(),
		nativeSelection = win.getSelection();
	nativeRange.setStart( element, 0 );
	nativeRange.setEnd( element, element.childNodes.length );
	nativeSelection.removeAllRanges();
	nativeSelection.addRange( nativeRange );
};

/**
 * Feature detect if the browser supports extending selections
 *
 * Should work everywhere except IE
 *
 * @private
 * @property {boolean}
 */
ve.supportsSelectionExtend = !!window.getSelection().extend;

/**
 * Translate rect by some fixed vector and return a new offset object
 *
 * @param {DOMRect|Object} rect DOMRect or DOMRect-like object describing rectangle
 * @param {number} x Horizontal translation
 * @param {number} y Vertical translation
 * @return {Object} Translated rect
 */
ve.translateRect = function ( rect, x, y ) {
	const translatedRect = {};
	if ( rect.top !== undefined ) {
		translatedRect.top = rect.top + y;
	}
	if ( rect.bottom !== undefined ) {
		translatedRect.bottom = rect.bottom + y;
	}
	if ( rect.left !== undefined ) {
		translatedRect.left = rect.left + x;
	}
	if ( rect.right !== undefined ) {
		translatedRect.right = rect.right + x;
	}
	if ( rect.width !== undefined ) {
		translatedRect.width = rect.width;
	}
	if ( rect.height !== undefined ) {
		translatedRect.height = rect.height;
	}
	return translatedRect;
};

/**
 * Get the start and end rectangles (in a text flow sense) from a list of rectangles
 *
 * The top-most and bottom-most rectangles are the union of rectangles that have the
 * top-most and bottom-most coordinates, respectively.
 *
 * In the example below, the top-most rectangle is the union of A & C.
 *
 * The start and end rectangles are the unions of all rectangles that vertically overlap
 * the top-most and bottom-most rectangles, respectively. This accounts for things like
 * superscript and subscript text.
 *
 * In the example below, the start rectangle is the union of A, B, C & D.
 *
 *   AAAAA       CCCCC
 *   AAAAA BBBBB CCCCC DDDDD
 *         BBBBB       DDDDD
 *
 * @param {DOMRectList|DOMRect[]|Object[]|null} rects List of rectangles
 * @return {Object.<string,Object>|null} Object containing two rectangles: start and end, or null if there are no rectangles
 */
ve.getStartAndEndRects = function ( rects ) {
	if ( !rects || !rects.length ) {
		return null;
	}
	let topRect, bottomRect;
	for ( const rect of rects ) {
		if ( !topRect || rect.top < topRect.top ) {
			// Use ve.extendObject as ve.copy copies non-plain objects by reference
			topRect = ve.extendObject( {}, rect );
		} else if ( rect.top === topRect.top ) {
			// Merge rects with the same top coordinate
			topRect.left = Math.min( topRect.left, rect.left );
			topRect.right = Math.max( topRect.right, rect.right );
			topRect.bottom = Math.max( topRect.bottom, rect.bottom );
		}
		if ( !bottomRect || rect.bottom > bottomRect.bottom ) {
			// Use ve.extendObject as ve.copy copies non-plain objects by reference
			bottomRect = ve.extendObject( {}, rect );
		} else if ( rect.bottom === bottomRect.bottom ) {
			// Merge rects with the same bottom coordinate
			bottomRect.left = Math.min( bottomRect.left, rect.left );
			bottomRect.right = Math.max( bottomRect.right, rect.right );
			bottomRect.top = Math.min( bottomRect.top, rect.top );
		}
	}
	topRect.width = topRect.right - topRect.left;
	topRect.height = topRect.bottom - topRect.top;
	bottomRect.width = bottomRect.right - bottomRect.left;
	bottomRect.height = bottomRect.bottom - bottomRect.top;

	let start, end;
	for ( const rect of rects ) {
		if ( rect.top <= topRect.bottom ) {
			if ( !start ) {
				start = ve.extendObject( {}, rect );
			} else {
				// Merge all rects that overlap the topRect vertically into start
				start.left = Math.min( start.left, rect.left );
				start.right = Math.max( start.right, rect.right );
				start.top = Math.min( start.top, rect.top );
				start.bottom = Math.max( start.bottom, rect.bottom );
			}
		}
		if ( rect.bottom >= bottomRect.top ) {
			// Merge all rects that overlap the bottomRect vertically into end
			if ( !end ) {
				end = ve.extendObject( {}, rect );
			} else {
				end.left = Math.min( end.left, rect.left );
				end.right = Math.max( end.right, rect.right );
				end.top = Math.min( end.top, rect.top );
				end.bottom = Math.max( end.bottom, rect.bottom );
			}
		}
	}
	start.width = start.right - start.left;
	start.height = start.bottom - start.top;
	end.width = end.right - end.left;
	end.height = end.bottom - end.top;

	return { start, end };
};

/**
 * Minimize a set of rectangles by discarding ones which are contained by others
 *
 * @param {DOMRectList|DOMRect[]|Object[]|null} rects List of rectangles
 * @param {number} [allowedErrorOffset=3] Allowed error offset, the pixel error amount
 *  used in coordinate comparisons.
 * @return {Object[]} Minimized list of rectangles
 */
ve.minimizeRects = function ( rects, allowedErrorOffset = 3 ) {
	if ( !rects || !rects.length ) {
		return [];
	}

	// Check if rect1 contains rect2
	function contains( rect1, rect2 ) {
		return rect2.left >= rect1.left - allowedErrorOffset &&
			rect2.top >= rect1.top - allowedErrorOffset &&
			rect2.right <= rect1.right + allowedErrorOffset &&
			rect2.bottom <= rect1.bottom + allowedErrorOffset;
	}

	function merge( rect1, rect2 ) {
		const rect = {
			top: Math.min( rect1.top, rect2.top ),
			left: Math.min( rect1.left, rect2.left ),
			bottom: Math.max( rect1.bottom, rect2.bottom ),
			right: Math.max( rect1.right, rect2.right )
		};
		rect.width = rect.right - rect.left;
		rect.height = rect.bottom - rect.top;
		return rect;
	}

	function isApprox( a, b ) {
		return Math.abs( a - b ) < allowedErrorOffset;
	}

	const minimalRects = [];
	for ( const rect of rects ) {
		let keep = true;
		for ( let i = 0, il = minimalRects.length; i < il; i++ ) {
			// This rect is contained by an existing rect, discard
			if ( contains( minimalRects[ i ], rect ) ) {
				keep = false;
				break;
			}
			// An existing rect is contained by this rect, discard the existing rect
			if ( contains( rect, minimalRects[ i ] ) ) {
				minimalRects.splice( i, 1 );
				i--;
				il--;
				break;
			}
			// Rect is horizontally adjacent to an existing rect, merge
			if (
				isApprox( rect.top, minimalRects[ i ].top ) && isApprox( rect.bottom, minimalRects[ i ].bottom ) && (
					isApprox( rect.left, minimalRects[ i ].right ) || isApprox( rect.right, minimalRects[ i ].left )
				)
			) {
				keep = false;
				minimalRects[ i ] = merge( minimalRects[ i ], rect );
				break;
			}
			// Rect is vertically adjacent to an existing rect, merge
			if (
				isApprox( rect.left, minimalRects[ i ].left ) && isApprox( rect.right, minimalRects[ i ].right ) && (
					isApprox( rect.top, minimalRects[ i ].bottom ) || isApprox( rect.bottom, minimalRects[ i ].top )
				)
			) {
				keep = false;
				minimalRects[ i ] = merge( minimalRects[ i ], rect );
				break;
			}
			// TODO: Consider case where a rect bridges two existing minimalRects, and so requires two
			// merges in one step. As rects are usually returned in order, this is unlikely to happen.
		}
		if ( keep ) {
			minimalRects.push( rect );
		}
	}

	return minimalRects;
};

/**
 * Compute the bounding rectangle of a list of rectangles
 *
 * @param {DOMRectList|DOMRect[]|Object[]|null} rects List of rectangles
 * @return {Object|null} DOMRect-like object, or null if there are no rectangles
 */
ve.getBoundingRect = function ( rects ) {
	if ( !rects || !rects.length ) {
		return null;
	}

	let top = Infinity;
	let left = Infinity;
	let right = -Infinity;
	let bottom = -Infinity;

	for ( const rect of rects ) {
		if ( rect.top < top ) {
			top = rect.top;
		}
		if ( rect.left < left ) {
			left = rect.left;
		}
		if ( rect.right > right ) {
			right = rect.right;
		}
		if ( rect.bottom > bottom ) {
			bottom = rect.bottom;
		}
	}

	return {
		top,
		left,
		right,
		bottom,
		width: right - left,
		height: bottom - top
	};
};

/**
 * Get the client platform string from the browser.
 *
 * FIXME T126036: This is a wrapper for calling getSystemPlatform() on the current
 * platform except that if the platform hasn't been constructed yet, it falls back
 * to using the base class implementation in {ve.init.Platform}. A proper solution
 * would be not to need this information before the platform is constructed.
 *
 * @see ve.init.Platform#getSystemPlatform
 * @return {string} Client platform string
 */
ve.getSystemPlatform = function () {
	return ( ve.init.platform && ve.init.platform.constructor || ve.init.Platform ).static.getSystemPlatform();
};

/**
 * Check whether a jQuery event represents a plain left click, without any modifiers
 *
 * @param {jQuery.Event} e
 * @return {boolean} Whether it was an unmodified left click
 */
ve.isUnmodifiedLeftClick = function ( e ) {
	return e && e.which && e.which === OO.ui.MouseButtons.LEFT && !( e.shiftKey || e.altKey || e.ctrlKey || e.metaKey );
};

/**
 * Are multiple formats for clipboardData items supported?
 *
 * If you want to use unknown formats, an additional check for whether we're
 * on MS Edge needs to be made, as that only supports standard plain text / HTML.
 *
 * @param {jQuery.Event} e A jQuery event object for a copy/paste event
 * @param {boolean} [customTypes] Check whether non-standard formats are supported
 * @return {boolean} Whether multiple clipboardData item formats are supported
 */
ve.isClipboardDataFormatsSupported = function ( e, customTypes ) {
	const cacheKey = customTypes ? 'cachedCustom' : 'cached';

	if ( ve.isClipboardDataFormatsSupported[ cacheKey ] === undefined ) {
		const profile = $.client.profile();
		const clipboardData = e.originalEvent.clipboardData || e.originalEvent.dataTransfer;
		ve.isClipboardDataFormatsSupported[ cacheKey ] = !!(
			clipboardData &&
			( !customTypes || profile.name !== 'edge' ) && (
				// Support: Chrome
				clipboardData.items ||
				// Support: Firefox >= 48
				// (but not Firefox Android, which has name='android' and doesn't support this feature)
				( profile.name === 'firefox' && profile.versionNumber >= 48 )
			)
		);
	}

	return ve.isClipboardDataFormatsSupported[ cacheKey ];
};

/**
 * Workaround for catastrophic Firefox bug (T209646)
 *
 * Support: Firefox <= ~70
 * anchorNode and focusNode return unusable 'Restricted' object
 * when focus is in a number input:
 * https://bugzilla.mozilla.org/show_bug.cgi?id=1495482
 * This task was resolved around late 2019
 *
 * @param {Selection} selection Native selection
 */
ve.fixSelectionNodes = function ( selection ) {
	const profile = $.client.profile();

	if ( profile.layout !== 'gecko' ) {
		return;
	}

	function fixNodeProperty( prop ) {
		Object.defineProperty( selection, prop, {
			get: function () {
				const node = Object.getOwnPropertyDescriptor( Selection.prototype, prop ).get.call( this );
				try {
					// Try to read a property out of node if it not null
					// Throws an exception in FF
					// eslint-disable-next-line no-unused-expressions
					node && node.prop;
				} catch ( e ) {
					// When an input is focused, the selection becomes the input itself,
					// so the anchor/focusNode is the input's parent.
					// Fall back to null if that doesn't exist.
					ve.log( 'Worked around Firefox bug with getSelection().anchorNode/focusNode. See https://phabricator.wikimedia.org/T209646.' );
					return ( document.activeElement && document.activeElement.parentNode ) || null;
				}
				return node;
			}
		} );
	}

	if ( !Object.getOwnPropertyDescriptor( selection, 'anchorNode' ) ) {
		fixNodeProperty( 'anchorNode' );
		fixNodeProperty( 'focusNode' );
	}
};

/**
 * Safely decode HTML entities
 *
 * @param {string} html Text with HTML entities
 * @return {string} Text with HTML entities decoded
 */
ve.safeDecodeEntities = function ( html ) {
	// Decode HTML entities, safely (no elements permitted inside textarea)
	const textarea = document.createElement( 'textarea' );
	textarea.innerHTML = html;
	return textarea.textContent;
};
