/*!
 * RangeFix v0.3.1
 * https://github.com/edg2s/rangefix
 *
 * Copyright 2014-22 Ed Sanders.
 * Released under the MIT license
 */

( function ( root, factory ) {
	if ( typeof define === 'function' && define.amd ) {
		// AMD. Register as an anonymous module.
		define( factory );
	} else if ( typeof exports === 'object' && typeof exports.nodeName !== 'string' ) {
		// CommonJS
		module.exports = factory();
	} else {
		// Browser globals
		root.RangeFix = factory();
	}
}( this, () => {

	let broken;
	const rangeFix = {};

	function rectExceedsBoundingRect( range, rectOffset, edge ) {
		const rects = range.getClientRects();
		if ( rects.length === 2 ) {
			const rect = range.getBoundingClientRect();
			// Second line rect exceeds the boundary of the bounding rect
			return rects[ rectOffset ][ edge ] < rect[ edge ];
		}
		return false;
	}

	/**
	 * Check if bugs are present in the native functions
	 *
	 * For getClientRects, constructs two lines of text and
	 * creates a range between them. Broken browsers will
	 * return three rectangles instead of two.
	 *
	 * For getBoundingClientRect, create a collapsed range
	 * and check if the resulting rect has non-zero offsets.
	 *
	 * getBoundingClientRect is also considered broken if
	 * getClientRects is broken.
	 *
	 * @private
	 * @return {Object} Object containing boolean properties 'getClientRects' and
	 *                  'getBoundingClientRect' indicating bugs are present
	 *                  in these functions/browsers.
	 */
	rangeFix.isBroken = function () {
		if ( broken === undefined ) {
			const p1 = document.createElement( 'p' );
			const span = document.createElement( 'span' );
			const t1 = document.createTextNode( 'aa' );
			const t2 = document.createTextNode( 'aa' );
			const img = document.createElement( 'img' );
			img.setAttribute( 'src', 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=' );
			const range = document.createRange();

			broken = {};

			p1.appendChild( t1 );
			p1.appendChild( span );
			span.appendChild( img );
			span.appendChild( t2 );

			document.body.appendChild( p1 );

			range.setStart( t1, 1 );
			range.setEnd( span, 0 );

			// A selection ending just inside another element shouldn't select that whole element
			// Broken in Chrome <= 55 and Firefox
			broken.getClientRects = broken.getBoundingClientRect = range.getClientRects().length > 1;

			if ( !broken.getClientRects ) {
				// Regression in Chrome 55:
				// A selection across a wrapped image should give a rect for that image.
				// In Chrome we get two rectangles, one for each text node. In working browsers
				// we get three or more, or in Edge we get one surrounding the text and the image.
				range.setEnd( t2, 1 );
				broken.getClientRects = broken.getBoundingClientRect = range.getClientRects().length === 2;
			}

			if ( !broken.getBoundingClientRect ) {
				// Safari doesn't return a valid bounding rect for collapsed ranges
				// Equivalent to range.collapse( true ) which isn't well supported
				range.setEnd( range.startContainer, range.startOffset );
				const boundingRect = range.getBoundingClientRect();
				broken.getBoundingClientRect = boundingRect.top === 0 && boundingRect.left === 0;
			}

			document.body.removeChild( p1 );

			if ( !broken.getBoundingClientRect ) {
				const p2 = document.createElement( 'p' );
				p2.style.width = '0px';
				p2.style.fontSize = '20px';
				p2.style.whiteSpace = 'normal';
				p2.style.wordBreak = 'normal';
				const t3 = document.createTextNode( 'm mm' );
				p2.appendChild( t3 );

				document.body.appendChild( p2 );

				range.setStart( t3, 1 );
				range.setEnd( t3, 2 );

				// Check for Chrome bug (#24)
				// Bounding box doesn't include rect[1]
				if ( rectExceedsBoundingRect( range, 1, 'left' ) ) {
					broken.getBoundingClientRect = true;
				} else {
					// Check for Firefox bug (#24)
					// Bounding box doesn't include rect[0]
					range.setStart( t3, 1 );
					range.setEnd( t3, 3 );

					if ( rectExceedsBoundingRect( range, 0, 'top' ) ) {
						broken.getBoundingClientRect = true;
					}
				}

				document.body.removeChild( p2 );
			}
		}
		return broken;
	};

	/**
	 * Push one array-like object onto another.
	 *
	 * @param {Object} arr Array or array-like object. Will be modified
	 * @param {Object} data Array-like object of items to insert.
	 * @return {number} length of the new array
	 */
	function batchPush( arr, data ) {
		// We need to push insertion in batches, because of parameter list length limits which vary
		// cross-browser - 1024 seems to be a safe batch size on all browsers
		let index = 0;
		const batchSize = 1024;
		if ( batchSize >= data.length ) {
			// Avoid slicing for small lists
			return arr.push( ...data );
		}
		let length;
		while ( index < data.length ) {
			// Call arr.push( i0, i1, i2, …, i1023 );
			length = arr.push( ...data.slice( index, index + batchSize ) );
			index += batchSize;
		}
		return length;
	}

	/**
	 * Get client rectangles from a range
	 *
	 * @param {Range} range Range
	 * @return {DOMRectList|DOMRect[]} DOMRectList or list of DOMRect objects describing range
	 */
	rangeFix.getClientRects = function ( range ) {
		if ( !this.isBroken().getClientRects ) {
			return range.getClientRects();
		}

		// Chrome gets the end container rects wrong when spanning
		// nodes so we need to traverse up the tree from the endContainer until
		// we reach the common ancestor, then we can add on from start to where
		// we got up to
		// https://code.google.com/p/chromium/issues/detail?id=324437
		const rects = [];
		const endContainerRects = [];
		let endContainer = range.endContainer;
		let endOffset = range.endOffset;
		let partialRange = document.createRange();

		function indexOf( child ) {
			let i = 0;
			while ( ( child = child.previousSibling ) ) {
				i++;
			}
			return i;
		}

		while ( endContainer !== range.commonAncestorContainer ) {
			partialRange.setStart( endContainer, 0 );
			partialRange.setEnd( endContainer, endOffset );

			batchPush( endContainerRects, partialRange.getClientRects() );

			endOffset = indexOf( endContainer );
			endContainer = endContainer.parentNode;
		}

		// Once we've reached the common ancestor, add on the range from the
		// original start position to where we ended up.
		partialRange = range.cloneRange();
		partialRange.setEnd( endContainer, endOffset );
		batchPush( rects, partialRange.getClientRects() );
		batchPush( rects, endContainerRects );
		return rects;
	};

	/**
	 * Get bounding rectangle from a range
	 *
	 * @param {Range} range Range
	 * @return {DOMRect|Object|null} DOMRect or DOMRect-like object describing
	 *                                  bounding rectangle, or null if not computable
	 */
	rangeFix.getBoundingClientRect = function ( range ) {
		const rects = this.getClientRects( range );

		// If there are no rects return null, otherwise we'll fall through to
		// getBoundingClientRect, which in Chrome and Firefox becomes [0,0,0,0].
		if ( rects.length === 0 ) {
			return null;
		}

		const nativeBoundingRect = range.getBoundingClientRect();

		if ( !this.isBroken().getBoundingClientRect ) {
			return nativeBoundingRect;
		}

		// When nativeRange is a collapsed cursor at the end of a line or
		// the start of a line, the bounding rect is [0,0,0,0] in Chrome.
		// getClientRects returns two rects, one correct, and one at the
		// end of the next line / start of the previous line. We can't tell
		// here which one to use so just pick the first. This matches
		// Firefox's behaviour, which tells you the cursor is at the end
		// of the previous line when it is at the start of the line.
		// See https://code.google.com/p/chromium/issues/detail?id=426017
		if ( nativeBoundingRect.width === 0 && nativeBoundingRect.height === 0 ) {
			return rects[ 0 ];
		}

		let boundingRect;
		Array.prototype.forEach.call( rects, ( rect ) => {
			if ( !boundingRect ) {
				boundingRect = {
					left: rect.left,
					top: rect.top,
					right: rect.right,
					bottom: rect.bottom
				};
			} else {
				boundingRect.left = Math.min( boundingRect.left, rect.left );
				boundingRect.top = Math.min( boundingRect.top, rect.top );
				boundingRect.right = Math.max( boundingRect.right, rect.right );
				boundingRect.bottom = Math.max( boundingRect.bottom, rect.bottom );
			}
		} );
		if ( boundingRect ) {
			boundingRect.width = boundingRect.right - boundingRect.left;
			boundingRect.height = boundingRect.bottom - boundingRect.top;
		}
		return boundingRect;
	};

	return rangeFix;
} ) );
