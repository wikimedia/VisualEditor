/*!
 * OOUI v0.51.4
 * https://www.mediawiki.org/wiki/OOUI
 *
 * Copyright 2011–2024 OOUI Team and other contributors.
 * Released under the MIT license
 * http://oojs.mit-license.org
 *
 * Date: 2024-12-05T17:34:41Z
 */
( function ( OO ) {

'use strict';

/**
 * Namespace for all classes, static methods and static properties.
 *
 * @namespace
 */
OO.ui = {};

OO.ui.bind = $.proxy;

/**
 * @property {Object}
 */
OO.ui.Keys = {
	UNDEFINED: 0,
	BACKSPACE: 8,
	DELETE: 46,
	LEFT: 37,
	RIGHT: 39,
	UP: 38,
	DOWN: 40,
	ENTER: 13,
	END: 35,
	HOME: 36,
	TAB: 9,
	PAGEUP: 33,
	PAGEDOWN: 34,
	ESCAPE: 27,
	SHIFT: 16,
	SPACE: 32
};

/**
 * Constants for MouseEvent.which
 *
 * @property {Object}
 */
OO.ui.MouseButtons = {
	LEFT: 1,
	MIDDLE: 2,
	RIGHT: 3
};

/**
 * @property {number}
 * @private
 */
OO.ui.elementId = 0;

/**
 * Generate a unique ID for element
 *
 * @return {string} ID
 */
OO.ui.generateElementId = function () {
	OO.ui.elementId++;
	return 'ooui-' + OO.ui.elementId;
};

/**
 * Check if an element is focusable.
 * Inspired by :focusable in jQueryUI v1.11.4 - 2015-04-14
 *
 * @param {jQuery} $element Element to test
 * @return {boolean} Element is focusable
 */
OO.ui.isFocusableElement = function ( $element ) {
	const element = $element[ 0 ];

	// Anything disabled is not focusable
	if ( element.disabled ) {
		return false;
	}

	// Check if the element is visible
	if ( !(
		// This is quicker than calling $element.is( ':visible' )
		$.expr.pseudos.visible( element ) &&
		// Check that all parents are visible
		!$element.parents().addBack().filter( function () {
			return $.css( this, 'visibility' ) === 'hidden';
		} ).length
	) ) {
		return false;
	}

	// Check if the element is ContentEditable, which is the string 'true'
	if ( element.contentEditable === 'true' ) {
		return true;
	}

	// Anything with a non-negative numeric tabIndex is focusable.
	// Use .prop to avoid browser bugs
	if ( $element.prop( 'tabIndex' ) >= 0 ) {
		return true;
	}

	// Some element types are naturally focusable
	// (indexOf is much faster than regex in Chrome and about the
	// same in FF: https://jsperf.com/regex-vs-indexof-array2)
	const nodeName = element.nodeName.toLowerCase();
	if ( [ 'input', 'select', 'textarea', 'button', 'object' ].indexOf( nodeName ) !== -1 ) {
		return true;
	}

	// Links and areas are focusable if they have an href
	if ( ( nodeName === 'a' || nodeName === 'area' ) && $element.attr( 'href' ) !== undefined ) {
		return true;
	}

	return false;
};

/**
 * Find a focusable child.
 *
 * @param {jQuery} $container Container to search in
 * @param {boolean} [backwards=false] Search backwards
 * @return {jQuery} Focusable child, or an empty jQuery object if none found
 */
OO.ui.findFocusable = function ( $container, backwards ) {
	let $focusable = $( [] ),
		// $focusableCandidates is a superset of things that
		// could get matched by isFocusableElement
		$focusableCandidates = $container
			.find( 'input, select, textarea, button, object, a, area, [contenteditable], [tabindex]' );

	if ( backwards ) {
		$focusableCandidates = Array.prototype.reverse.call( $focusableCandidates );
	}

	$focusableCandidates.each( ( i, el ) => {
		const $el = $( el );
		if ( OO.ui.isFocusableElement( $el ) ) {
			$focusable = $el;
			return false;
		}
	} );
	return $focusable;
};

/**
 * Get the user's language and any fallback languages.
 *
 * These language codes are used to localize user interface elements in the user's language.
 *
 * In environments that provide a localization system, this function should be overridden to
 * return the user's language(s). The default implementation returns English (en) only.
 *
 * @return {string[]} Language codes, in descending order of priority
 */
OO.ui.getUserLanguages = function () {
	return [ 'en' ];
};

/**
 * Get a value in an object keyed by language code.
 *
 * @param {Object.<string,any>} obj Object keyed by language code
 * @param {string|null} [lang] Language code, if omitted or null defaults to any user language
 * @param {string} [fallback] Fallback code, used if no matching language can be found
 * @return {any} Local value
 */
OO.ui.getLocalValue = function ( obj, lang, fallback ) {
	// Requested language
	if ( obj[ lang ] ) {
		return obj[ lang ];
	}
	// Known user language
	const langs = OO.ui.getUserLanguages();
	for ( let i = 0, len = langs.length; i < len; i++ ) {
		lang = langs[ i ];
		if ( obj[ lang ] ) {
			return obj[ lang ];
		}
	}
	// Fallback language
	if ( obj[ fallback ] ) {
		return obj[ fallback ];
	}
	// First existing language
	// eslint-disable-next-line no-unreachable-loop
	for ( lang in obj ) {
		return obj[ lang ];
	}

	return undefined;
};

/**
 * Check if a node is contained within another node.
 *
 * Similar to jQuery#contains except a list of containers can be supplied
 * and a boolean argument allows you to include the container in the match list
 *
 * @param {HTMLElement|HTMLElement[]} containers Container node(s) to search in
 * @param {HTMLElement} contained Node to find
 * @param {boolean} [matchContainers] Include the container(s) in the list of nodes to match,
 *  otherwise only match descendants
 * @return {boolean} The node is in the list of target nodes
 */
OO.ui.contains = function ( containers, contained, matchContainers ) {
	if ( !Array.isArray( containers ) ) {
		containers = [ containers ];
	}
	for ( let i = containers.length - 1; i >= 0; i-- ) {
		if (
			( matchContainers && contained === containers[ i ] ) ||
			$.contains( containers[ i ], contained )
		) {
			return true;
		}
	}
	return false;
};

/**
 * Return a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing.
 *
 * Ported from: http://underscorejs.org/underscore.js
 *
 * @param {Function} func Function to debounce
 * @param {number} [wait=0] Wait period in milliseconds
 * @param {boolean} [immediate] Trigger on leading edge
 * @return {Function} Debounced function
 */
OO.ui.debounce = function ( func, wait, immediate ) {
	let timeout;
	return function () {
		const context = this,
			args = arguments,
			later = function () {
				timeout = null;
				if ( !immediate ) {
					func.apply( context, args );
				}
			};
		if ( immediate && !timeout ) {
			func.apply( context, args );
		}
		if ( !timeout || wait ) {
			clearTimeout( timeout );
			timeout = setTimeout( later, wait );
		}
	};
};

/**
 * Puts a console warning with provided message.
 *
 * @param {string} message Message
 */
OO.ui.warnDeprecation = function ( message ) {
	if ( OO.getProp( window, 'console', 'warn' ) !== undefined ) {
		// eslint-disable-next-line no-console
		console.warn( message );
	}
};

/**
 * Returns a function, that, when invoked, will only be triggered at most once
 * during a given window of time. If called again during that window, it will
 * wait until the window ends and then trigger itself again.
 *
 * As it's not knowable to the caller whether the function will actually run
 * when the wrapper is called, return values from the function are entirely
 * discarded.
 *
 * @param {Function} func Function to throttle
 * @param {number} wait Throttle window length, in milliseconds
 * @return {Function} Throttled function
 */
OO.ui.throttle = function ( func, wait ) {
	let context, args, timeout,
		previous = Date.now() - wait;

	const run = function () {
		timeout = null;
		previous = Date.now();
		func.apply( context, args );
	};

	return function () {
		// Check how long it's been since the last time the function was
		// called, and whether it's more or less than the requested throttle
		// period. If it's less, run the function immediately. If it's more,
		// set a timeout for the remaining time -- but don't replace an
		// existing timeout, since that'd indefinitely prolong the wait.
		const remaining = Math.max( wait - ( Date.now() - previous ), 0 );
		context = this;
		args = arguments;
		if ( !timeout ) {
			// If time is up, do setTimeout( run, 0 ) so the function
			// always runs asynchronously, just like Promise#then .
			timeout = setTimeout( run, remaining );
		}
	};
};

/**
 * Reconstitute a JavaScript object corresponding to a widget created by
 * the PHP implementation.
 *
 * This is an alias for `OO.ui.Element.static.infuse()`.
 *
 * @param {string|HTMLElement|jQuery} node A single node for the widget to infuse.
 *   String must be a selector (deprecated).
 * @param {Object} [config] Configuration options
 * @return {OO.ui.Element}
 *   The `OO.ui.Element` corresponding to this (infusable) document node.
 */
OO.ui.infuse = function ( node, config ) {
	if ( typeof node === 'string' ) {
		// Deprecate passing a selector, which was accidentally introduced in Ibf95b0dee.
		// @since 0.41.0
		OO.ui.warnDeprecation(
			'Passing a selector to infuse is deprecated. Use an HTMLElement or jQuery collection instead.'
		);
	}
	return OO.ui.Element.static.infuse( node, config );
};

/**
 * Get a localized message.
 *
 * After the message key, message parameters may optionally be passed. In the default
 * implementation, any occurrences of $1 are replaced with the first parameter, $2 with the
 * second parameter, etc.
 * Alternative implementations of OO.ui.msg may use any substitution system they like, as long
 * as they support unnamed, ordered message parameters.
 *
 * In environments that provide a localization system, this function should be overridden to
 * return the message translated in the user's language. The default implementation always
 * returns English messages. An example of doing this with
 * [jQuery.i18n](https://github.com/wikimedia/jquery.i18n) follows.
 *
 *     @example
 *     const messagePath = 'oojs-ui/dist/i18n/',
 *         languages = [ $.i18n().locale, 'ur', 'en' ],
 *         languageMap = {};
 *
 *     for ( let i = 0, iLen = languages.length; i < iLen; i++ ) {
 *         languageMap[ languages[ i ] ] = messagePath + languages[ i ].toLowerCase() + '.json';
 *     }
 *
 *     $.i18n().load( languageMap ).done( function() {
 *         // Replace the built-in `msg` only once we've loaded the internationalization.
 *         // OOUI uses `OO.ui.deferMsg` for all initially-loaded messages. So long as
 *         // you put off creating any widgets until this promise is complete, no English
 *         // will be displayed.
 *         OO.ui.msg = $.i18n;
 *
 *         // A button displaying "OK" in the default locale
 *         const button = new OO.ui.ButtonWidget( {
 *             label: OO.ui.msg( 'ooui-dialog-message-accept' ),
 *             icon: 'check'
 *         } );
 *         $( document.body ).append( button.$element );
 *
 *         // A button displaying "OK" in Urdu
 *         $.i18n().locale = 'ur';
 *         button = new OO.ui.ButtonWidget( {
 *             label: OO.ui.msg( 'ooui-dialog-message-accept' ),
 *             icon: 'check'
 *         } );
 *         $( document.body ).append( button.$element );
 *     } );
 *
 * @param {string} key Message key
 * @param {...any} [params] Message parameters
 * @return {string} Translated message with parameters substituted
 */
OO.ui.msg = function ( key, ...params ) {
	// `OO.ui.msg.messages` is defined in code generated during the build process
	const messages = OO.ui.msg.messages;

	let message = messages[ key ];
	if ( typeof message === 'string' ) {
		// Perform $1 substitution
		message = message.replace( /\$(\d+)/g, ( unused, n ) => {
			const i = parseInt( n, 10 );
			return params[ i - 1 ] !== undefined ? params[ i - 1 ] : '$' + n;
		} );
	} else {
		// Return placeholder if message not found
		message = '[' + key + ']';
	}
	return message;
};

/**
 * Package a message and arguments for deferred resolution.
 *
 * Use this when you are statically specifying a message and the message may not yet be present.
 *
 * @param {string} key Message key
 * @param {...any} [params] Message parameters
 * @return {Function} Function that returns the resolved message when executed
 */
OO.ui.deferMsg = function () {
	// eslint-disable-next-line mediawiki/msg-doc
	return () => OO.ui.msg( ...arguments );
};

/**
 * Resolve a message.
 *
 * If the message is a function it will be executed, otherwise it will pass through directly.
 *
 * @param {Function|string|any} msg
 * @return {string|any} Resolved message when there was something to resolve, pass through
 *  otherwise
 */
OO.ui.resolveMsg = function ( msg ) {
	if ( typeof msg === 'function' ) {
		return msg();
	}
	return msg;
};

/**
 * @param {string} url
 * @return {boolean}
 */
OO.ui.isSafeUrl = function ( url ) {
	// Keep this function in sync with php/Tag.php

	function stringStartsWith( haystack, needle ) {
		return haystack.slice( 0, needle.length ) === needle;
	}

	const protocolAllowList = [
		'bitcoin', 'ftp', 'ftps', 'geo', 'git', 'gopher', 'http', 'https', 'irc', 'ircs',
		'magnet', 'mailto', 'mms', 'news', 'nntp', 'redis', 'sftp', 'sip', 'sips', 'sms', 'ssh',
		'svn', 'tel', 'telnet', 'urn', 'worldwind', 'xmpp'
	];

	if ( url === '' ) {
		return true;
	}

	for ( let i = 0; i < protocolAllowList.length; i++ ) {
		if ( stringStartsWith( url, protocolAllowList[ i ] + ':' ) ) {
			return true;
		}
	}

	// This matches '//' too
	if ( stringStartsWith( url, '/' ) || stringStartsWith( url, './' ) ) {
		return true;
	}
	if ( stringStartsWith( url, '?' ) || stringStartsWith( url, '#' ) ) {
		return true;
	}

	return false;
};

/**
 * Check if the user has a 'mobile' device.
 *
 * For our purposes this means the user is primarily using an
 * on-screen keyboard, touch input instead of a mouse and may
 * have a physically small display.
 *
 * It is left up to implementors to decide how to compute this
 * so the default implementation always returns false.
 *
 * @return {boolean} User is on a mobile device
 */
OO.ui.isMobile = function () {
	return false;
};

/**
 * Get the additional spacing that should be taken into account when displaying elements that are
 * clipped to the viewport, e.g. dropdown menus and popups. This is meant to be overridden to avoid
 * such menus overlapping any fixed headers/toolbars/navigation used by the site.
 *
 * @return {Object} Object with the properties 'top', 'right', 'bottom', 'left', each representing
 *  the extra spacing from that edge of viewport (in pixels)
 */
OO.ui.getViewportSpacing = function () {
	return {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0
	};
};

/**
 * Get the element where elements that are positioned outside of normal flow are inserted,
 * for example dialogs and dropdown menus.
 *
 * This is meant to be overridden if the site needs to style this element in some way
 * (e.g. setting font size), and doesn't want to style the whole document.
 *
 * @return {HTMLElement}
 */
OO.ui.getTeleportTarget = function () {
	return document.body;
};

/**
 * Get the default overlay, which is used by various widgets when they are passed `$overlay: true`.
 * See <https://www.mediawiki.org/wiki/OOUI/Concepts#Overlays>.
 *
 * @return {jQuery} Default overlay node
 */
OO.ui.getDefaultOverlay = function () {
	if ( !OO.ui.$defaultOverlay ) {
		OO.ui.$defaultOverlay = $( '<div>' ).addClass( 'oo-ui-defaultOverlay' );
		$( OO.ui.getTeleportTarget() ).append( OO.ui.$defaultOverlay );
	}
	return OO.ui.$defaultOverlay;
};

// Define a custom HTML element that does nothing except to expose the `connectedCallback` callback
// as `onConnectOOUI` property. We use it in some widgets to detect when they are connected.
if ( window.customElements ) {
	window.customElements.define( 'ooui-connect-detector', class extends HTMLElement {
		connectedCallback() {
			if ( this.onConnectOOUI instanceof Function ) {
				this.onConnectOOUI();
			}
		}
	} );
}

/**
 * Message store for the default implementation of OO.ui.msg.
 *
 * Environments that provide a localization system should not use this, but should override
 * OO.ui.msg altogether.
 *
 * @private
 */
OO.ui.msg.messages = {
	"ooui-copytextlayout-copy": "Copy",
	"ooui-outline-control-move-down": "Move item down",
	"ooui-outline-control-move-up": "Move item up",
	"ooui-outline-control-remove": "Remove item",
	"ooui-toolbar-more": "More",
	"ooui-toolgroup-expand": "More",
	"ooui-toolgroup-collapse": "Fewer",
	"ooui-item-remove": "Remove",
	"ooui-dialog-message-accept": "OK",
	"ooui-dialog-message-reject": "Cancel",
	"ooui-dialog-process-error": "Something went wrong",
	"ooui-dialog-process-dismiss": "Dismiss",
	"ooui-dialog-process-retry": "Try again",
	"ooui-dialog-process-continue": "Continue",
	"ooui-combobox-button-label": "Toggle options",
	"ooui-selectfile-button-select": "Select a file",
	"ooui-selectfile-button-select-multiple": "Select files",
	"ooui-selectfile-placeholder": "No file is selected",
	"ooui-selectfile-dragdrop-placeholder": "Drop file here",
	"ooui-selectfile-dragdrop-placeholder-multiple": "Drop files here",
	"ooui-popup-widget-close-button-aria-label": "Close",
	"ooui-field-help": "Help"
};

/*!
 * Mixin namespace.
 */

/**
 * Namespace for OOUI mixins.
 *
 * Mixins are named according to the type of object they are intended to
 * be mixed in to.  For example, OO.ui.mixin.GroupElement is intended to be
 * mixed in to an instance of OO.ui.Element, and OO.ui.mixin.GroupWidget
 * is intended to be mixed in to an instance of OO.ui.Widget.
 *
 * @namespace
 */
OO.ui.mixin = {};

// getDocument( element ) is preferrable to window.document
/* global document:off */

/**
 * Each Element represents a rendering in the DOM—a button or an icon, for example, or anything
 * that is visible to a user. Unlike {@link OO.ui.Widget widgets}, plain elements usually do not
 * have events connected to them and can't be interacted with.
 *
 * @abstract
 * @class
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {string[]} [config.classes] The names of the CSS classes to apply to the element. CSS styles are
 *  added to the top level (e.g., the outermost div) of the element. See the
 *  [OOUI documentation on MediaWiki][2] for an example.
 *  [2]: https://www.mediawiki.org/wiki/OOUI/Widgets/Buttons_and_Switches#cssExample
 * @param {string} [config.id] The HTML id attribute used in the rendered tag.
 * @param {string} [config.text] Text to insert
 * @param {Array} [config.content] An array of content elements to append (after #text).
 *  Strings will be html-escaped; use an OO.ui.HtmlSnippet to append raw HTML.
 *  Instances of OO.ui.Element will have their $element appended.
 * @param {jQuery} [config.$content] Content elements to append (after #text).
 * @param {jQuery} [config.$element] Wrapper element. Defaults to a new element with #getTagName.
 * @param {any} [config.data] Custom data of any type or combination of types (e.g., string, number,
 *  array, object).
 *  Data can also be specified with the #setData method.
 */
OO.ui.Element = function OoUiElement( config ) {
	if ( OO.ui.isDemo ) {
		this.initialConfig = config;
	}
	// Configuration initialization
	config = config || {};

	// Properties
	this.elementId = null;
	this.visible = true;
	this.data = config.data;
	this.$element = config.$element ||
		$( window.document.createElement( this.getTagName() ) );
	this.elementGroup = null;

	// Initialization
	const doc = OO.ui.Element.static.getDocument( this.$element );
	if ( Array.isArray( config.classes ) ) {
		this.$element.addClass( config.classes );
	}
	if ( config.id ) {
		this.setElementId( config.id );
	}
	if ( config.text ) {
		this.$element.text( config.text );
	}
	if ( config.content ) {
		// The `content` property treats plain strings as text; use an
		// HtmlSnippet to append HTML content.  `OO.ui.Element`s get their
		// appropriate $element appended.
		this.$element.append( config.content.map( ( v ) => {
			if ( typeof v === 'string' ) {
				// Escape string so it is properly represented in HTML.
				// Don't create empty text nodes for empty strings.
				return v ? doc.createTextNode( v ) : undefined;
			} else if ( v instanceof OO.ui.HtmlSnippet ) {
				// Bypass escaping.
				return v.toString();
			} else if ( v instanceof OO.ui.Element ) {
				return v.$element;
			}
			return v;
		} ) );
	}
	if ( config.$content ) {
		// The `$content` property treats plain strings as HTML.
		this.$element.append( config.$content );
	}
};

/* Setup */

OO.initClass( OO.ui.Element );

/* Static Properties */

/**
 * The name of the HTML tag used by the element.
 *
 * The static value may be ignored if the #getTagName method is overridden.
 *
 * @static
 * @property {string}
 */
OO.ui.Element.static.tagName = 'div';

/* Static Methods */

/**
 * Reconstitute a JavaScript object corresponding to a widget created
 * by the PHP implementation.
 *
 * @param {HTMLElement|jQuery} node
 *   A single node for the widget to infuse.
 * @param {Object} [config] Configuration options
 * @return {OO.ui.Element}
 *   The `OO.ui.Element` corresponding to this (infusable) document node.
 *   For `Tag` objects emitted on the HTML side (used occasionally for content)
 *   the value returned is a newly-created Element wrapping around the existing
 *   DOM node.
 */
OO.ui.Element.static.infuse = function ( node, config ) {
	const obj = OO.ui.Element.static.unsafeInfuse( node, config, false );

	// Verify that the type matches up.
	// FIXME: uncomment after T89721 is fixed, see T90929.
	/*
	if ( !( obj instanceof this['class'] ) ) {
		throw new Error( 'Infusion type mismatch!' );
	}
	*/
	return obj;
};

/**
 * Implementation helper for `infuse`; skips the type check and has an
 * extra property so that only the top-level invocation touches the DOM.
 *
 * @private
 * @param {HTMLElement|jQuery} elem
 * @param {Object} [config] Configuration options
 * @param {jQuery.Promise} [domPromise] A promise that will be resolved
 *     when the top-level widget of this infusion is inserted into DOM,
 *     replacing the original element; only used internally.
 * @return {OO.ui.Element}
 */
OO.ui.Element.static.unsafeInfuse = function ( elem, config, domPromise ) {
	// look for a cached result of a previous infusion.
	let $elem = $( elem );

	if ( $elem.length > 1 ) {
		throw new Error( 'Collection contains more than one element' );
	}
	if ( !$elem.length ) {
		throw new Error( 'Widget not found' );
	}
	if ( $elem[ 0 ].$oouiInfused ) {
		$elem = $elem[ 0 ].$oouiInfused;
	}

	const id = $elem.attr( 'id' );
	const doc = this.getDocument( $elem );
	let data = $elem.data( 'ooui-infused' );
	if ( data ) {
		// cached!
		if ( data === true ) {
			throw new Error( 'Circular dependency! ' + id );
		}
		if ( domPromise ) {
			// Pick up dynamic state, like focus, value of form inputs, scroll position, etc.
			const stateCache = data.constructor.static.gatherPreInfuseState( $elem, data );
			// Restore dynamic state after the new element is re-inserted into DOM under
			// infused parent.
			domPromise.done( data.restorePreInfuseState.bind( data, stateCache ) );
			const infusedChildrenCache = $elem.data( 'ooui-infused-children' );
			if ( infusedChildrenCache && infusedChildrenCache.length ) {
				infusedChildrenCache.forEach( ( childData ) => {
					const childState = childData.constructor.static.gatherPreInfuseState(
						$elem,
						childData
					);
					domPromise.done(
						childData.restorePreInfuseState.bind( childData, childState )
					);
				} );
			}
		}
		return data;
	}
	data = $elem.attr( 'data-ooui' );
	if ( !data ) {
		throw new Error( 'No infusion data found: ' + id );
	}
	try {
		data = JSON.parse( data );
	} catch ( _ ) {
		data = null;
	}
	if ( !( data && data._ ) ) {
		throw new Error( 'No valid infusion data found: ' + id );
	}
	if ( data._ === 'Tag' ) {
		// Special case: this is a raw Tag; wrap existing node, don't rebuild.
		return new OO.ui.Element( Object.assign( {}, config, { $element: $elem } ) );
	}
	const parts = data._.split( '.' );
	const cls = OO.getProp.apply( OO, [ window ].concat( parts ) );

	if ( !( cls && ( cls === OO.ui.Element || cls.prototype instanceof OO.ui.Element ) ) ) {
		throw new Error( 'Unknown widget type: id: ' + id + ', class: ' + data._ );
	}

	let top;
	if ( !domPromise ) {
		top = $.Deferred();
		domPromise = top.promise();
	}
	$elem.data( 'ooui-infused', true ); // prevent loops
	data.id = id; // implicit
	const infusedChildren = [];
	data = OO.copy( data, null, ( value ) => {
		let infused;
		if ( OO.isPlainObject( value ) ) {
			if ( value.tag && doc.getElementById( value.tag ) ) {
				infused = OO.ui.Element.static.unsafeInfuse(
					doc.getElementById( value.tag ), config, domPromise
				);
				infusedChildren.push( infused );
				// Flatten the structure
				infusedChildren.push.apply(
					infusedChildren,
					infused.$element.data( 'ooui-infused-children' ) || []
				);
				infused.$element.removeData( 'ooui-infused-children' );
				return infused;
			}
			if ( value.html !== undefined ) {
				return new OO.ui.HtmlSnippet( value.html );
			}
		}
	} );
	// allow widgets to reuse parts of the DOM
	data = cls.static.reusePreInfuseDOM( $elem[ 0 ], data );
	// pick up dynamic state, like focus, value of form inputs, scroll position, etc.
	const state = cls.static.gatherPreInfuseState( $elem[ 0 ], data );
	// rebuild widget
	// eslint-disable-next-line new-cap
	const obj = new cls( Object.assign( {}, config, data ) );
	// If anyone is holding a reference to the old DOM element,
	// let's allow them to OO.ui.infuse() it and do what they expect, see T105828.
	// Do not use jQuery.data(), as using it on detached nodes leaks memory in 1.x line by design.
	$elem[ 0 ].$oouiInfused = obj.$element;
	// now replace old DOM with this new DOM.
	if ( top ) {
		// An efficient constructor might be able to reuse the entire DOM tree of the original
		// element, so only mutate the DOM if we need to.
		if ( $elem[ 0 ] !== obj.$element[ 0 ] ) {
			$elem.replaceWith( obj.$element );
		}
		top.resolve();
	}
	obj.$element
		.data( {
			'ooui-infused': obj,
			'ooui-infused-children': infusedChildren
		} )
		// set the 'data-ooui' attribute so we can identify infused widgets
		.attr( 'data-ooui', '' );
	// restore dynamic state after the new element is inserted into DOM
	domPromise.done( obj.restorePreInfuseState.bind( obj, state ) );
	return obj;
};

/**
 * Pick out parts of `node`'s DOM to be reused when infusing a widget.
 *
 * This method **must not** make any changes to the DOM, only find interesting pieces and add them
 * to `config` (which should then be returned). Actual DOM juggling should then be done by the
 * constructor, which will be given the enhanced config.
 *
 * @protected
 * @param {HTMLElement} node
 * @param {Object} config
 * @return {Object}
 */
OO.ui.Element.static.reusePreInfuseDOM = function ( node, config ) {
	return config;
};

/**
 * Gather the dynamic state (focus, value of form inputs, scroll position, etc.) of an HTML DOM
 * node (and its children) that represent an Element of the same class and the given configuration,
 * generated by the PHP implementation.
 *
 * This method is called just before `node` is detached from the DOM. The return value of this
 * function will be passed to #restorePreInfuseState after the newly created widget's #$element
 * is inserted into DOM to replace `node`.
 *
 * @protected
 * @param {HTMLElement} node
 * @param {Object} config
 * @return {Object}
 */
OO.ui.Element.static.gatherPreInfuseState = function () {
	return {};
};

/**
 * Get the document of an element.
 *
 * @static
 * @param {jQuery|HTMLElement|HTMLDocument|Window} obj Object to get the document for
 * @return {HTMLDocument|null} Document object
 */
OO.ui.Element.static.getDocument = function ( obj ) {
	// HTMLElement
	return obj.ownerDocument ||
		// Window
		obj.document ||
		// HTMLDocument
		( obj.nodeType === Node.DOCUMENT_NODE && obj ) ||
		// jQuery - selections created "offscreen" won't have a context, so .context isn't reliable
		( obj[ 0 ] && obj[ 0 ].ownerDocument ) ||
		// Empty jQuery selections might have a context
		obj.context ||
		null;
};

/**
 * Get the window of an element or document.
 *
 * @static
 * @param {jQuery|HTMLElement|HTMLDocument|Window} obj Context to get the window for
 * @return {Window} Window object
 */
OO.ui.Element.static.getWindow = function ( obj ) {
	const doc = this.getDocument( obj );
	return doc.defaultView;
};

/**
 * Get the direction of an element or document.
 *
 * @static
 * @param {jQuery|HTMLElement|HTMLDocument|Window} obj Context to get the direction for
 * @return {string} Text direction, either 'ltr' or 'rtl'
 */
OO.ui.Element.static.getDir = function ( obj ) {
	if ( obj instanceof $ ) {
		obj = obj[ 0 ];
	}
	const isDoc = obj.nodeType === Node.DOCUMENT_NODE;
	const isWin = obj.document !== undefined;
	if ( isDoc || isWin ) {
		if ( isWin ) {
			obj = obj.document;
		}
		obj = obj.body;
	}
	return $( obj ).css( 'direction' );
};

/**
 * Get the offset between two frames.
 *
 * TODO: Make this function not use recursion.
 *
 * @static
 * @param {Window} from Window of the child frame
 * @param {Window} [to=window] Window of the parent frame
 * @param {Object} [offset] Offset to start with, used internally
 * @return {Object} Offset object, containing left and top properties
 */
OO.ui.Element.static.getFrameOffset = function ( from, to, offset ) {
	if ( !to ) {
		to = window;
	}
	if ( !offset ) {
		offset = { top: 0, left: 0 };
	}
	if ( from.parent === from ) {
		return offset;
	}

	// Get iframe element
	let frame;
	const frames = from.parent.document.getElementsByTagName( 'iframe' );
	for ( let i = 0, len = frames.length; i < len; i++ ) {
		if ( frames[ i ].contentWindow === from ) {
			frame = frames[ i ];
			break;
		}
	}

	// Recursively accumulate offset values
	if ( frame ) {
		const rect = frame.getBoundingClientRect();
		offset.left += rect.left;
		offset.top += rect.top;
		if ( from !== to ) {
			this.getFrameOffset( from.parent, offset );
		}
	}
	return offset;
};

/**
 * Get the offset between two elements.
 *
 * The two elements may be in a different frame, but in that case the frame $element is in must
 * be contained in the frame $anchor is in.
 *
 * @static
 * @param {jQuery} $element Element whose position to get
 * @param {jQuery} $anchor Element to get $element's position relative to
 * @return {Object} Translated position coordinates, containing top and left properties
 */
OO.ui.Element.static.getRelativePosition = function ( $element, $anchor ) {
	const pos = $element.offset();
	const anchorPos = $anchor.offset();
	const anchorDocument = this.getDocument( $anchor );

	let elementDocument = this.getDocument( $element );

	// If $element isn't in the same document as $anchor, traverse up
	while ( elementDocument !== anchorDocument ) {
		const iframe = elementDocument.defaultView.frameElement;
		if ( !iframe ) {
			throw new Error( '$element frame is not contained in $anchor frame' );
		}
		const iframePos = $( iframe ).offset();
		pos.left += iframePos.left;
		pos.top += iframePos.top;
		elementDocument = this.getDocument( iframe );
	}
	pos.left -= anchorPos.left;
	pos.top -= anchorPos.top;
	return pos;
};

/**
 * Get element border sizes.
 *
 * @static
 * @param {HTMLElement} el Element to measure
 * @return {Object} Dimensions object with `top`, `left`, `bottom` and `right` properties
 */
OO.ui.Element.static.getBorders = function ( el ) {
	const doc = this.getDocument( el ),
		win = doc.defaultView,
		style = win.getComputedStyle( el, null ),
		$el = $( el ),
		top = parseFloat( style ? style.borderTopWidth : $el.css( 'borderTopWidth' ) ) || 0,
		left = parseFloat( style ? style.borderLeftWidth : $el.css( 'borderLeftWidth' ) ) || 0,
		bottom = parseFloat( style ? style.borderBottomWidth : $el.css( 'borderBottomWidth' ) ) || 0,
		right = parseFloat( style ? style.borderRightWidth : $el.css( 'borderRightWidth' ) ) || 0;

	return {
		top: top,
		left: left,
		bottom: bottom,
		right: right
	};
};

/**
 * Get dimensions of an element or window.
 *
 * @static
 * @param {HTMLElement|Window} el Element to measure
 * @return {Object} Dimensions object with `borders`, `scroll`, `scrollbar` and `rect` properties
 */
OO.ui.Element.static.getDimensions = function ( el ) {
	const doc = this.getDocument( el ),
		win = doc.defaultView;

	if ( win === el || el === doc.documentElement ) {
		const $win = $( win );
		return {
			borders: { top: 0, left: 0, bottom: 0, right: 0 },
			scroll: {
				top: $win.scrollTop(),
				left: OO.ui.Element.static.getScrollLeft( win )
			},
			scrollbar: { right: 0, bottom: 0 },
			rect: {
				top: 0,
				left: 0,
				bottom: $win.innerHeight(),
				right: $win.innerWidth()
			}
		};
	} else {
		const $el = $( el );
		return {
			borders: this.getBorders( el ),
			scroll: {
				top: $el.scrollTop(),
				left: OO.ui.Element.static.getScrollLeft( el )
			},
			scrollbar: {
				right: $el.innerWidth() - el.clientWidth,
				bottom: $el.innerHeight() - el.clientHeight
			},
			rect: el.getBoundingClientRect()
		};
	}
};

( function () {
	let rtlScrollType = null;

	// Adapted from <https://github.com/othree/jquery.rtl-scroll-type>.
	// Original code copyright 2012 Wei-Ko Kao, licensed under the MIT License.
	function rtlScrollTypeTest() {
		const $definer = $( '<div>' ).attr( {
				dir: 'rtl',
				style: 'font-size: 14px; width: 4px; height: 1px; position: absolute; top: -1000px; overflow: scroll;'
			} ).text( 'ABCD' ),
			definer = $definer[ 0 ];

		$definer.appendTo( 'body' );
		if ( definer.scrollLeft > 0 ) {
			// Safari, Chrome
			rtlScrollType = 'default';
		} else {
			definer.scrollLeft = 1;
			if ( definer.scrollLeft === 0 ) {
				// Firefox, old Opera
				rtlScrollType = 'negative';
			}
		}
		$definer.remove();
	}

	function isRoot( el ) {
		return el === el.window ||
			el === el.ownerDocument.body ||
			el === el.ownerDocument.documentElement;
	}

	/**
	 * Convert native `scrollLeft` value to a value consistent between browsers. See #getScrollLeft.
	 *
	 * @param {number} nativeOffset Native `scrollLeft` value
	 * @param {HTMLElement|Window} el Element from which the value was obtained
	 * @return {number}
	 */
	OO.ui.Element.static.computeNormalizedScrollLeft = function ( nativeOffset, el ) {
		// All browsers use the correct scroll type ('negative') on the root, so don't
		// do any fixups when looking at the root element
		const direction = isRoot( el ) ? 'ltr' : $( el ).css( 'direction' );

		if ( direction === 'rtl' ) {
			if ( rtlScrollType === null ) {
				rtlScrollTypeTest();
			}
			if ( rtlScrollType === 'reverse' ) {
				return -nativeOffset;
			} else if ( rtlScrollType === 'default' ) {
				return nativeOffset - el.scrollWidth + el.clientWidth;
			}
		}

		return nativeOffset;
	};

	/**
	 * Convert our normalized `scrollLeft` value to a value for current browser. See #getScrollLeft.
	 *
	 * @param {number} normalizedOffset Normalized `scrollLeft` value
	 * @param {HTMLElement|Window} el Element on which the value will be set
	 * @return {number}
	 */
	OO.ui.Element.static.computeNativeScrollLeft = function ( normalizedOffset, el ) {
		// All browsers use the correct scroll type ('negative') on the root, so don't
		// do any fixups when looking at the root element
		const direction = isRoot( el ) ? 'ltr' : $( el ).css( 'direction' );

		if ( direction === 'rtl' ) {
			if ( rtlScrollType === null ) {
				rtlScrollTypeTest();
			}
			if ( rtlScrollType === 'reverse' ) {
				return -normalizedOffset;
			} else if ( rtlScrollType === 'default' ) {
				return normalizedOffset + el.scrollWidth - el.clientWidth;
			}
		}

		return normalizedOffset;
	};

	/**
	 * Get the number of pixels that an element's content is scrolled to the left.
	 *
	 * This function smooths out browser inconsistencies (nicely described in the README at
	 * <https://github.com/othree/jquery.rtl-scroll-type>) and produces a result consistent
	 * with Firefox's 'scrollLeft', which seems the most sensible.
	 *
	 * (Firefox's scrollLeft handling is nice because it increases from left to right, consistently
	 * with `getBoundingClientRect().left` and related APIs; because initial value is zero, so
	 * resetting it is easy; because adapting a hardcoded scroll position to a symmetrical RTL
	 * interface requires just negating it, rather than involving `clientWidth` and `scrollWidth`;
	 * and because if you mess up and don't adapt your code to RTL, it will scroll to the beginning
	 * rather than somewhere randomly in the middle but not where you wanted.)
	 *
	 * @static
	 * @method
	 * @param {HTMLElement|Window} el Element to measure
	 * @return {number} Scroll position from the left.
	 *  If the element's direction is LTR, this is a positive number between `0` (initial scroll
	 *  position) and `el.scrollWidth - el.clientWidth` (furthest possible scroll position).
	 *  If the element's direction is RTL, this is a negative number between `0` (initial scroll
	 *  position) and `-el.scrollWidth + el.clientWidth` (furthest possible scroll position).
	 */
	OO.ui.Element.static.getScrollLeft = function ( el ) {
		let scrollLeft = isRoot( el ) ? $( window ).scrollLeft() : el.scrollLeft;
		scrollLeft = OO.ui.Element.static.computeNormalizedScrollLeft( scrollLeft, el );
		return scrollLeft;
	};

	/**
	 * Set the number of pixels that an element's content is scrolled to the left.
	 *
	 * See #getScrollLeft.
	 *
	 * @static
	 * @method
	 * @param {HTMLElement|Window} el Element to scroll (and to use in calculations)
	 * @param {number} scrollLeft Scroll position from the left.
	 *  If the element's direction is LTR, this must be a positive number between
	 *  `0` (initial scroll position) and `el.scrollWidth - el.clientWidth`
	 *  (furthest possible scroll position).
	 *  If the element's direction is RTL, this must be a negative number between
	 *  `0` (initial scroll position) and `-el.scrollWidth + el.clientWidth`
	 *  (furthest possible scroll position).
	 */
	OO.ui.Element.static.setScrollLeft = function ( el, scrollLeft ) {
		scrollLeft = OO.ui.Element.static.computeNativeScrollLeft( scrollLeft, el );
		if ( isRoot( el ) ) {
			$( window ).scrollLeft( scrollLeft );
		} else {
			el.scrollLeft = scrollLeft;
		}
	};
}() );

/**
 * Get the root scrollable element of given element's document.
 *
 * Support: Chrome <= 60
 * On older versions of Blink, `document.documentElement` can't be used to get or set
 * the scrollTop property; instead we have to use `document.body`. Changing and testing the value
 * lets us use 'body' or 'documentElement' based on what is working.
 *
 * https://code.google.com/p/chromium/issues/detail?id=303131
 *
 * @static
 * @param {HTMLElement} el Element to find root scrollable parent for
 * @return {HTMLBodyElement|HTMLHtmlElement} Scrollable parent, `<body>` or `<html>`
 */
OO.ui.Element.static.getRootScrollableElement = function ( el ) {
	const doc = this.getDocument( el );

	if ( OO.ui.scrollableElement === undefined ) {
		const body = doc.body;
		const scrollTop = body.scrollTop;
		body.scrollTop = 1;

		// In some browsers (observed in Chrome 56 on Linux Mint 18.1),
		// body.scrollTop doesn't become exactly 1, but a fractional value like 0.76
		if ( Math.round( body.scrollTop ) === 1 ) {
			body.scrollTop = scrollTop;
			OO.ui.scrollableElement = 'body';
		} else {
			OO.ui.scrollableElement = 'documentElement';
		}
	}

	return doc[ OO.ui.scrollableElement ];
};

/**
 * Get closest scrollable container.
 *
 * Traverses up until either a scrollable element or the root is reached, in which case the root
 * scrollable element will be returned (see #getRootScrollableElement).
 *
 * @static
 * @param {HTMLElement} el Element to find scrollable container for
 * @param {string} [dimension] Dimension of scrolling to look for; `x`, `y` or omit for either
 * @return {HTMLElement} Closest scrollable container
 */
OO.ui.Element.static.getClosestScrollableContainer = function ( el, dimension ) {
	const doc = this.getDocument( el );
	const rootScrollableElement = this.getRootScrollableElement( el );
	// Browsers do not correctly return the computed value of 'overflow' when 'overflow-x' and
	// 'overflow-y' have different values, so we need to check the separate properties.
	let props = [ 'overflow-x', 'overflow-y' ];
	let $parent = $( el ).parent();

	if ( el === doc.documentElement ) {
		return rootScrollableElement;
	}

	if ( dimension === 'x' || dimension === 'y' ) {
		props = [ 'overflow-' + dimension ];
	}

	// The parent of <html> is the document, so check we haven't traversed that far
	while ( $parent.length && $parent[ 0 ] !== doc ) {
		if ( $parent[ 0 ] === rootScrollableElement ) {
			return $parent[ 0 ];
		}
		let i = props.length;
		while ( i-- ) {
			const val = $parent.css( props[ i ] );
			// We assume that elements with 'overflow' (in any direction) set to 'hidden' will
			// never be scrolled in that direction, but they can actually be scrolled
			// programatically. The user can unintentionally perform a scroll in such case even if
			// the application doesn't scroll programatically, e.g. when jumping to an anchor, or
			// when using built-in find functionality.
			// This could cause funny issues...
			if ( val === 'auto' || val === 'scroll' ) {
				if ( $parent[ 0 ] === doc.body ) {
					// If overflow is set on <body>, return the rootScrollableElement
					// (<body> or <html>) as <body> may not be scrollable.
					return rootScrollableElement;
				} else {
					return $parent[ 0 ];
				}
			}
		}
		$parent = $parent.parent();
	}
	// The element is unattached… return something moderately sensible.
	return rootScrollableElement;
};

/**
 * Scroll element into view.
 *
 * @static
 * @param {HTMLElement|Object} elOrPosition Element to scroll into view
 * @param {Object} [config] Configuration options
 * @param {string} [config.animate=true] Animate to the new scroll offset.
 * @param {string} [config.duration='fast'] jQuery animation duration value
 * @param {string} [config.direction] Scroll in only one direction, e.g. 'x' or 'y', omit
 *  to scroll in both directions
 * @param {Object} [config.alignToTop=false] Aligns the top of the element to the top of the visible
 *  area of the scrollable ancestor.
 * @param {Object} [config.padding] Additional padding on the container to scroll past.
 *  Object containing any of 'top', 'bottom', 'left', or 'right' as numbers.
 * @param {Object} [config.scrollContainer] Scroll container. Defaults to
 *  getClosestScrollableContainer of the element.
 * @return {jQuery.Promise} Promise which resolves when the scroll is complete
 */
OO.ui.Element.static.scrollIntoView = function ( elOrPosition, config ) {
	const deferred = $.Deferred();

	// Configuration initialization
	config = config || {};

	const padding = Object.assign( {
		top: 0,
		bottom: 0,
		left: 0,
		right: 0
	}, config.padding );

	let animate = config.animate !== false;
	if ( window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) {
		// Respect 'prefers-reduced-motion' user preference
		animate = false;
	}

	const animations = {};
	const elementPosition = elOrPosition instanceof HTMLElement ?
		this.getDimensions( elOrPosition ).rect :
		elOrPosition;
	const container = config.scrollContainer || (
		elOrPosition instanceof HTMLElement ?
			this.getClosestScrollableContainer( elOrPosition, config.direction ) :
			// No scrollContainer or element, use global document
			this.getClosestScrollableContainer( window.document.body )
	);
	const $container = $( container );
	const containerDimensions = this.getDimensions( container );
	const $window = $( this.getWindow( container ) );

	// Compute the element's position relative to the container
	let position;
	if ( $container.is( 'html, body' ) ) {
		// If the scrollable container is the root, this is easy
		position = {
			top: elementPosition.top,
			bottom: $window.innerHeight() - elementPosition.bottom,
			left: elementPosition.left,
			right: $window.innerWidth() - elementPosition.right
		};
	} else {
		// Otherwise, we have to subtract el's coordinates from container's coordinates
		position = {
			top: elementPosition.top -
				( containerDimensions.rect.top + containerDimensions.borders.top ),
			bottom: containerDimensions.rect.bottom - containerDimensions.borders.bottom -
				containerDimensions.scrollbar.bottom - elementPosition.bottom,
			left: elementPosition.left -
				( containerDimensions.rect.left + containerDimensions.borders.left ),
			right: containerDimensions.rect.right - containerDimensions.borders.right -
				containerDimensions.scrollbar.right - elementPosition.right
		};
	}

	if ( !config.direction || config.direction === 'y' ) {
		if ( position.top < padding.top || config.alignToTop ) {
			animations.scrollTop = containerDimensions.scroll.top + position.top - padding.top;
		} else if ( position.bottom < padding.bottom ) {
			animations.scrollTop = containerDimensions.scroll.top +
				// Scroll the bottom into view, but not at the expense
				// of scrolling the top out of view
				Math.min( position.top - padding.top, -position.bottom + padding.bottom );
		}
	}
	if ( !config.direction || config.direction === 'x' ) {
		if ( position.left < padding.left ) {
			animations.scrollLeft = containerDimensions.scroll.left + position.left - padding.left;
		} else if ( position.right < padding.right ) {
			animations.scrollLeft = containerDimensions.scroll.left +
				// Scroll the right into view, but not at the expense
				// of scrolling the left out of view
				Math.min( position.left - padding.left, -position.right + padding.right );
		}
		if ( animations.scrollLeft !== undefined ) {
			animations.scrollLeft =
				OO.ui.Element.static.computeNativeScrollLeft( animations.scrollLeft, container );
		}
	}
	if ( !$.isEmptyObject( animations ) ) {
		if ( animate ) {
			// eslint-disable-next-line no-jquery/no-animate
			$container.stop( true ).animate( animations, {
				duration: config.duration === undefined ? 'fast' : config.duration,
				always: deferred.resolve
			} );
		} else {
			$container.stop( true );
			for ( const method in animations ) {
				$container[ method ]( animations[ method ] );
			}
			deferred.resolve();
		}
	} else {
		deferred.resolve();
	}
	return deferred.promise();
};

/**
 * Force the browser to reconsider whether it really needs to render scrollbars inside the element
 * and reserve space for them, because it probably doesn't.
 *
 * Workaround primarily for <https://code.google.com/p/chromium/issues/detail?id=387290>, but also
 * similar bugs in other browsers. "Just" forcing a reflow is not sufficient in all cases, we need
 * to first actually detach (or hide, but detaching is simpler) all children, *then* force a
 * reflow, and then reattach (or show) them back.
 *
 * @static
 * @param {HTMLElement} el Element to reconsider the scrollbars on
 */
OO.ui.Element.static.reconsiderScrollbars = function ( el ) {
	// Save scroll position
	const scrollLeft = el.scrollLeft;
	const scrollTop = el.scrollTop;
	const nodes = [];
	// Detach all children
	while ( el.firstChild ) {
		nodes.push( el.firstChild );
		el.removeChild( el.firstChild );
	}
	// Force reflow
	// eslint-disable-next-line no-unused-expressions
	el.offsetHeight;
	// Reattach all children
	for ( let i = 0, len = nodes.length; i < len; i++ ) {
		el.appendChild( nodes[ i ] );
	}
	// Restore scroll position (no-op if scrollbars disappeared)
	el.scrollLeft = scrollLeft;
	el.scrollTop = scrollTop;
};

/* Methods */

/**
 * Toggle visibility of an element.
 *
 * @param {boolean} [show] Make element visible, omit to toggle visibility
 * @fires OO.ui.Widget#toggle
 * @chainable
 * @return {OO.ui.Element} The element, for chaining
 */
OO.ui.Element.prototype.toggle = function ( show ) {
	show = show === undefined ? !this.visible : !!show;

	if ( show !== this.isVisible() ) {
		this.visible = show;
		this.$element.toggleClass( 'oo-ui-element-hidden', !this.visible );
		this.emit( 'toggle', show );
	}

	return this;
};

/**
 * Check if element is visible.
 *
 * @return {boolean} element is visible
 */
OO.ui.Element.prototype.isVisible = function () {
	return this.visible;
};

/**
 * Get element data.
 *
 * @return {any} Element data
 */
OO.ui.Element.prototype.getData = function () {
	return this.data;
};

/**
 * Set element data.
 *
 * @param {any} data Element data
 * @chainable
 * @return {OO.ui.Element} The element, for chaining
 */
OO.ui.Element.prototype.setData = function ( data ) {
	this.data = data;
	return this;
};

/**
 * Set the element has an 'id' attribute.
 *
 * @param {string} id
 * @chainable
 * @return {OO.ui.Element} The element, for chaining
 */
OO.ui.Element.prototype.setElementId = function ( id ) {
	this.elementId = id;
	this.$element.attr( 'id', id );
	return this;
};

/**
 * Ensure that the element has an 'id' attribute, setting it to an unique value if it's missing,
 * and return its value.
 *
 * @return {string}
 */
OO.ui.Element.prototype.getElementId = function () {
	if ( this.elementId === null ) {
		this.setElementId( OO.ui.generateElementId() );
	}
	return this.elementId;
};

/**
 * Check if element supports one or more methods.
 *
 * @param {string|string[]} methods Method or list of methods to check
 * @return {boolean} All methods are supported
 */
OO.ui.Element.prototype.supports = function ( methods ) {
	if ( !Array.isArray( methods ) ) {
		return typeof this[ methods ] === 'function';
	}

	return methods.every( ( method ) => typeof this[ method ] === 'function' );
};

/**
 * Update the theme-provided classes.
 *
 * This is called in element mixins and widget classes any time state changes.
 *   Updating is debounced, minimizing overhead of changing multiple attributes and
 *   guaranteeing that theme updates do not occur within an element's constructor
 */
OO.ui.Element.prototype.updateThemeClasses = function () {
	OO.ui.theme.queueUpdateElementClasses( this );
};

/**
 * Get the HTML tag name.
 *
 * Override this method to base the result on instance information.
 *
 * @return {string} HTML tag name
 */
OO.ui.Element.prototype.getTagName = function () {
	return this.constructor.static.tagName;
};

/**
 * Check if the element is attached to the DOM
 *
 * @return {boolean} The element is attached to the DOM
 */
OO.ui.Element.prototype.isElementAttached = function () {
	return this.$element[ 0 ].isConnected;
};

/**
 * Get the DOM document.
 *
 * @return {HTMLDocument} Document object
 */
OO.ui.Element.prototype.getElementDocument = function () {
	// Don't cache this in other ways either because subclasses could can change this.$element
	return OO.ui.Element.static.getDocument( this.$element );
};

/**
 * Get the DOM window.
 *
 * @return {Window} Window object
 */
OO.ui.Element.prototype.getElementWindow = function () {
	return OO.ui.Element.static.getWindow( this.$element );
};

/**
 * Get closest scrollable container.
 *
 * @return {HTMLElement} Closest scrollable container
 */
OO.ui.Element.prototype.getClosestScrollableElementContainer = function () {
	return OO.ui.Element.static.getClosestScrollableContainer( this.$element[ 0 ] );
};

/**
 * Get group element is in.
 *
 * @return {OO.ui.mixin.GroupElement|null} Group element, null if none
 */
OO.ui.Element.prototype.getElementGroup = function () {
	return this.elementGroup;
};

/**
 * Set group element is in.
 *
 * @param {OO.ui.mixin.GroupElement|null} group Group element, null if none
 * @chainable
 * @return {OO.ui.Element} The element, for chaining
 */
OO.ui.Element.prototype.setElementGroup = function ( group ) {
	this.elementGroup = group;
	return this;
};

/**
 * Scroll element into view.
 *
 * @param {Object} [config] Configuration options
 * @return {jQuery.Promise} Promise which resolves when the scroll is complete
 */
OO.ui.Element.prototype.scrollElementIntoView = function ( config ) {
	if (
		!this.isElementAttached() ||
		!this.isVisible() ||
		( this.getElementGroup() && !this.getElementGroup().isVisible() )
	) {
		return $.Deferred().resolve();
	}
	return OO.ui.Element.static.scrollIntoView( this.$element[ 0 ], config );
};

/**
 * Restore the pre-infusion dynamic state for this widget.
 *
 * This method is called after #$element has been inserted into DOM. The parameter is the return
 * value of #gatherPreInfuseState.
 *
 * @protected
 * @param {Object} state
 */
OO.ui.Element.prototype.restorePreInfuseState = function () {
};

/**
 * Wraps an HTML snippet for use with configuration values which default
 * to strings.  This bypasses the default html-escaping done to string
 * values.
 *
 * @class
 *
 * @constructor
 * @param {string} content HTML content
 */
OO.ui.HtmlSnippet = function OoUiHtmlSnippet( content ) {
	// Properties
	this.content = content;
};

/* Setup */

OO.initClass( OO.ui.HtmlSnippet );

/* Methods */

/**
 * Render into HTML.
 *
 * @return {string} Unchanged HTML snippet.
 */
OO.ui.HtmlSnippet.prototype.toString = function () {
	return this.content;
};

/**
 * Layouts are containers for elements and are used to arrange other widgets of arbitrary type in
 * a way that is centrally controlled and can be updated dynamically. Layouts can be, and usually
 * are, combined.
 * See {@link OO.ui.FieldsetLayout FieldsetLayout}, {@link OO.ui.FieldLayout FieldLayout},
 * {@link OO.ui.FormLayout FormLayout}, {@link OO.ui.PanelLayout PanelLayout},
 * {@link OO.ui.StackLayout StackLayout}, {@link OO.ui.PageLayout PageLayout},
 * {@link OO.ui.HorizontalLayout HorizontalLayout}, and {@link OO.ui.BookletLayout BookletLayout}
 * for more information and examples.
 *
 * @abstract
 * @class
 * @extends OO.ui.Element
 * @mixes OO.EventEmitter
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
OO.ui.Layout = function OoUiLayout( config ) {
	// Configuration initialization
	config = config || {};

	// Parent constructor
	OO.ui.Layout.super.call( this, config );

	// Mixin constructors
	OO.EventEmitter.call( this );

	// Initialization
	this.$element.addClass( 'oo-ui-layout' );
};

/* Setup */

OO.inheritClass( OO.ui.Layout, OO.ui.Element );
OO.mixinClass( OO.ui.Layout, OO.EventEmitter );

/* Methods */

/**
 * Reset scroll offsets
 *
 * @chainable
 * @return {OO.ui.Layout} The layout, for chaining
 */
OO.ui.Layout.prototype.resetScroll = function () {
	this.$element[ 0 ].scrollTop = 0;
	OO.ui.Element.static.setScrollLeft( this.$element[ 0 ], 0 );

	return this;
};

/**
 * Widgets are compositions of one or more OOUI elements that users can both view
 * and interact with. All widgets can be configured and modified via a standard API,
 * and their state can change dynamically according to a model.
 *
 * @abstract
 * @class
 * @extends OO.ui.Element
 * @mixes OO.EventEmitter
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {boolean} [config.disabled=false] Disable the widget. Disabled widgets cannot be used and their
 *  appearance reflects this state.
 */
OO.ui.Widget = function OoUiWidget( config ) {
	// Parent constructor
	OO.ui.Widget.super.call( this, config );

	// Mixin constructors
	OO.EventEmitter.call( this );

	// Properties
	this.disabled = null;
	this.wasDisabled = null;

	// Initialization
	this.$element.addClass( 'oo-ui-widget' );
	this.setDisabled( config && config.disabled );
};

/* Setup */

OO.inheritClass( OO.ui.Widget, OO.ui.Element );
OO.mixinClass( OO.ui.Widget, OO.EventEmitter );

/* Events */

/**
 * A 'disable' event is emitted when the disabled state of the widget changes
 * (i.e. on disable **and** enable).
 *
 * @event OO.ui.Widget#disable
 * @param {boolean} disabled Widget is disabled
 */

/**
 * A 'toggle' event is emitted when the visibility of the widget changes.
 *
 * @event OO.ui.Widget#toggle
 * @param {boolean} visible Widget is visible
 */

/* Methods */

/**
 * Check if the widget is disabled.
 *
 * @return {boolean} Widget is disabled
 */
OO.ui.Widget.prototype.isDisabled = function () {
	return this.disabled;
};

/**
 * Set the 'disabled' state of the widget.
 *
 * When a widget is disabled, it cannot be used and its appearance is updated to reflect this state.
 *
 * @param {boolean} [disabled=false] Disable widget
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.Widget.prototype.setDisabled = function ( disabled ) {
	this.disabled = !!disabled;
	const isDisabled = this.isDisabled();
	if ( isDisabled !== this.wasDisabled ) {
		this.$element.toggleClass( 'oo-ui-widget-disabled', isDisabled );
		this.$element.toggleClass( 'oo-ui-widget-enabled', !isDisabled );
		this.$element.attr( 'aria-disabled', isDisabled ? 'true' : null );
		this.emit( 'disable', isDisabled );
		this.updateThemeClasses();
		this.wasDisabled = isDisabled;
	}

	return this;
};

/**
 * Update the disabled state, in case of changes in parent widget.
 *
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.Widget.prototype.updateDisabled = function () {
	this.setDisabled( this.disabled );
	return this;
};

/**
 * Get an ID of a labelable node which is part of this widget, if any, to be used for `<label for>`
 * value.
 *
 * If this function returns null, the widget should have a meaningful #simulateLabelClick method
 * instead.
 *
 * @return {string|null} The ID of the labelable element
 */
OO.ui.Widget.prototype.getInputId = function () {
	return null;
};

/**
 * Simulate the behavior of clicking on a label (a HTML `<label>` element) bound to this input.
 * HTML only allows `<label>` to act on specific "labelable" elements; complex widgets might need to
 * override this method to provide intuitive, accessible behavior.
 *
 * By default, this does nothing. OO.ui.mixin.TabIndexedElement overrides it for focusable widgets.
 * Individual widgets may override it too.
 *
 * This method is called by OO.ui.LabelWidget and OO.ui.FieldLayout. It should not be called
 * directly.
 */
OO.ui.Widget.prototype.simulateLabelClick = function () {
};

/**
 * Set the element with the given ID as a label for this widget.
 *
 * @param {string|null} id
 */
OO.ui.Widget.prototype.setLabelledBy = function ( id ) {
	if ( id ) {
		this.$element.attr( 'aria-labelledby', id );
	} else {
		this.$element.removeAttr( 'aria-labelledby' );
	}
};

/**
 * Theme logic.
 *
 * @abstract
 * @class
 *
 * @constructor
 */
OO.ui.Theme = function OoUiTheme() {
	this.elementClassesQueue = [];
	this.debouncedUpdateQueuedElementClasses = OO.ui.debounce( this.updateQueuedElementClasses );
};

/* Setup */

OO.initClass( OO.ui.Theme );

/* Methods */

/**
 * Get a list of classes to be applied to a widget.
 *
 * The 'on' and 'off' lists combined MUST contain keys for all classes the theme adds or removes,
 * otherwise state transitions will not work properly.
 *
 * @param {OO.ui.Element} element Element for which to get classes
 * @return {Object.<string,string[]>} Categorized class names with `on` and `off` lists
 */
OO.ui.Theme.prototype.getElementClasses = function () {
	return { on: [], off: [] };
};

/**
 * Update CSS classes provided by the theme.
 *
 * For elements with theme logic hooks, this should be called any time there's a state change.
 *
 * @param {OO.ui.Element} element Element for which to update classes
 */
OO.ui.Theme.prototype.updateElementClasses = function ( element ) {
	const domElements = [];

	if ( element.$icon ) {
		domElements.push( element.$icon[ 0 ] );
	}
	if ( element.$indicator ) {
		domElements.push( element.$indicator[ 0 ] );
	}

	if ( domElements.length ) {
		const classes = this.getElementClasses( element );
		$( domElements )
			.removeClass( classes.off )
			.addClass( classes.on );
	}
};

/**
 * @private
 */
OO.ui.Theme.prototype.updateQueuedElementClasses = function () {
	for ( let i = 0; i < this.elementClassesQueue.length; i++ ) {
		this.updateElementClasses( this.elementClassesQueue[ i ] );
	}
	// Clear the queue
	this.elementClassesQueue = [];
};

/**
 * Queue #updateElementClasses to be called for this element.
 *
 * QUnit tests override this method to directly call #queueUpdateElementClasses,
 *   to make them synchronous.
 *
 * @param {OO.ui.Element} element Element for which to update classes
 */
OO.ui.Theme.prototype.queueUpdateElementClasses = function ( element ) {
	// Keep items in the queue unique. Use lastIndexOf to start checking from the end because that's
	// the most common case (this method is often called repeatedly for the same element).
	if ( this.elementClassesQueue.lastIndexOf( element ) !== -1 ) {
		return;
	}
	this.elementClassesQueue.push( element );
	this.debouncedUpdateQueuedElementClasses();
};

/**
 * Get the transition duration in milliseconds for dialogs opening/closing
 *
 * The dialog should be fully rendered this many milliseconds after the
 * ready process has executed.
 *
 * @return {number} Transition duration in milliseconds
 */
OO.ui.Theme.prototype.getDialogTransitionDuration = function () {
	return 0;
};

/**
 * The TabIndexedElement class is an attribute mixin used to add additional functionality to an
 * element created by another class. The mixin provides a ‘tabIndex’ property, which specifies the
 * order in which users will navigate through the focusable elements via the Tab key.
 *
 *     @example
 *     // TabIndexedElement is mixed into the ButtonWidget class
 *     // to provide a tabIndex property.
 *     const button1 = new OO.ui.ButtonWidget( {
 *             label: 'fourth',
 *             tabIndex: 4
 *         } ),
 *         button2 = new OO.ui.ButtonWidget( {
 *             label: 'second',
 *             tabIndex: 2
 *         } ),
 *         button3 = new OO.ui.ButtonWidget( {
 *             label: 'third',
 *             tabIndex: 3
 *         } ),
 *         button4 = new OO.ui.ButtonWidget( {
 *             label: 'first',
 *             tabIndex: 1
 *         } );
 *     $( document.body ).append(
 *         button1.$element,
 *         button2.$element,
 *         button3.$element,
 *         button4.$element
 *      );
 *
 * @abstract
 * @class
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {jQuery} [config.$tabIndexed] The element that should use the tabindex functionality. By default,
 *  the functionality is applied to the element created by the class ($element). If a different
 *  element is specified, the tabindex functionality will be applied to it instead.
 * @param {string|number|null} [config.tabIndex=0] Number that specifies the element’s position in the
 *  tab-navigation order (e.g., 1 for the first focusable element). Use 0 to use the default
 *  navigation order; use -1 to remove the element from the tab-navigation flow.
 */
OO.ui.mixin.TabIndexedElement = function OoUiMixinTabIndexedElement( config ) {
	// Configuration initialization
	config = Object.assign( { tabIndex: 0 }, config );

	// Properties
	this.$tabIndexed = null;
	this.tabIndex = null;

	// Events
	this.connect( this, {
		disable: 'onTabIndexedElementDisable'
	} );

	// Initialization
	this.setTabIndex( config.tabIndex );
	this.setTabIndexedElement( config.$tabIndexed || this.$element );
};

/* Setup */

OO.initClass( OO.ui.mixin.TabIndexedElement );

/* Methods */

/**
 * Set the element that should use the tabindex functionality.
 *
 * This method is used to retarget a tabindex mixin so that its functionality applies
 * to the specified element. If an element is currently using the functionality, the mixin’s
 * effect on that element is removed before the new element is set up.
 *
 * @param {jQuery} $tabIndexed Element that should use the tabindex functionality
 * @chainable
 * @return {OO.ui.Element} The element, for chaining
 */
OO.ui.mixin.TabIndexedElement.prototype.setTabIndexedElement = function ( $tabIndexed ) {
	const tabIndex = this.tabIndex;
	// Remove attributes from old $tabIndexed
	this.setTabIndex( null );
	// Force update of new $tabIndexed
	this.$tabIndexed = $tabIndexed;
	this.tabIndex = tabIndex;
	return this.updateTabIndex();
};

/**
 * Set the value of the tabindex.
 *
 * @param {string|number|null} tabIndex Tabindex value, or `null` for no tabindex
 * @chainable
 * @return {OO.ui.Element} The element, for chaining
 */
OO.ui.mixin.TabIndexedElement.prototype.setTabIndex = function ( tabIndex ) {
	tabIndex = /^-?\d+$/.test( tabIndex ) ? Number( tabIndex ) : null;

	if ( this.tabIndex !== tabIndex ) {
		this.tabIndex = tabIndex;
		this.updateTabIndex();
	}

	return this;
};

/**
 * Update the `tabindex` attribute, in case of changes to tab index or
 * disabled state.
 *
 * @private
 * @chainable
 * @return {OO.ui.Element} The element, for chaining
 */
OO.ui.mixin.TabIndexedElement.prototype.updateTabIndex = function () {
	if ( this.$tabIndexed ) {
		if ( this.tabIndex !== null ) {
			// Do not index over disabled elements
			this.$tabIndexed.attr( {
				tabindex: this.isDisabled() ? -1 : this.tabIndex,
				// Support: ChromeVox and NVDA
				// These do not seem to inherit aria-disabled from parent elements
				'aria-disabled': this.isDisabled() ? 'true' : null
			} );
		} else {
			this.$tabIndexed.removeAttr( 'tabindex aria-disabled' );
		}
	}
	return this;
};

/**
 * Handle disable events.
 *
 * @private
 * @param {boolean} disabled Element is disabled
 */
OO.ui.mixin.TabIndexedElement.prototype.onTabIndexedElementDisable = function () {
	this.updateTabIndex();
};

/**
 * Get the value of the tabindex.
 *
 * @return {number|null} Tabindex value
 */
OO.ui.mixin.TabIndexedElement.prototype.getTabIndex = function () {
	return this.tabIndex;
};

/**
 * Get an ID of a focusable element of this widget, if any, to be used for `<label for>` value.
 *
 * If the element already has an ID then that is returned, otherwise unique ID is
 * generated, set on the element, and returned.
 *
 * @return {string|null} The ID of the focusable element
 */
OO.ui.mixin.TabIndexedElement.prototype.getInputId = function () {
	if ( !this.$tabIndexed ) {
		return null;
	}
	if ( !this.isLabelableNode( this.$tabIndexed ) ) {
		return null;
	}

	let id = this.$tabIndexed.attr( 'id' );
	if ( id === undefined ) {
		id = OO.ui.generateElementId();
		this.$tabIndexed.attr( 'id', id );
	}

	return id;
};

/**
 * Whether the node is 'labelable' according to the HTML spec
 * (i.e., whether it can be interacted with through a `<label for="…">`).
 * See: <https://html.spec.whatwg.org/multipage/forms.html#category-label>.
 *
 * @private
 * @param {jQuery} $node
 * @return {boolean}
 */
OO.ui.mixin.TabIndexedElement.prototype.isLabelableNode = function ( $node ) {
	const
		labelableTags = [ 'button', 'meter', 'output', 'progress', 'select', 'textarea' ],
		tagName = ( $node.prop( 'tagName' ) || '' ).toLowerCase();

	if ( tagName === 'input' && $node.attr( 'type' ) !== 'hidden' ) {
		return true;
	}
	if ( labelableTags.indexOf( tagName ) !== -1 ) {
		return true;
	}
	return false;
};

/**
 * Focus this element.
 *
 * @chainable
 * @return {OO.ui.Element} The element, for chaining
 */
OO.ui.mixin.TabIndexedElement.prototype.focus = function () {
	if ( !this.isDisabled() ) {
		this.$tabIndexed.trigger( 'focus' );
	}
	return this;
};

/**
 * Blur this element.
 *
 * @chainable
 * @return {OO.ui.Element} The element, for chaining
 */
OO.ui.mixin.TabIndexedElement.prototype.blur = function () {
	this.$tabIndexed.trigger( 'blur' );
	return this;
};

/**
 * @inheritdoc OO.ui.Widget
 */
OO.ui.mixin.TabIndexedElement.prototype.simulateLabelClick = function () {
	this.focus();
};

/**
 * ButtonElement is often mixed into other classes to generate a button, which is a clickable
 * interface element that can be configured with access keys for keyboard interaction.
 * See the [OOUI documentation on MediaWiki][1] for examples.
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Widgets/Buttons_and_Switches#Buttons
 *
 * @abstract
 * @class
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {jQuery} [config.$button] The button element created by the class.
 *  If this configuration is omitted, the button element will use a generated `<a>`.
 * @param {boolean} [config.framed=true] Render the button with a frame
 */
OO.ui.mixin.ButtonElement = function OoUiMixinButtonElement( config ) {
	// Configuration initialization
	config = config || {};

	// Properties
	this.$button = null;
	this.framed = null;
	this.active = config.active !== undefined && config.active;
	this.onDocumentMouseUpHandler = this.onDocumentMouseUp.bind( this );
	this.onMouseDownHandler = this.onMouseDown.bind( this );
	this.onDocumentKeyUpHandler = this.onDocumentKeyUp.bind( this );
	this.onKeyDownHandler = this.onKeyDown.bind( this );
	this.onClickHandler = this.onClick.bind( this );
	this.onKeyPressHandler = this.onKeyPress.bind( this );

	// Initialization
	this.$element.addClass( 'oo-ui-buttonElement' );
	this.toggleFramed( config.framed === undefined || config.framed );
	this.setButtonElement( config.$button || $( '<a>' ) );
};

/* Setup */

OO.initClass( OO.ui.mixin.ButtonElement );

/* Static Properties */

/**
 * Cancel mouse down events.
 *
 * This property is usually set to `true` to prevent the focus from changing when the button is
 * clicked.
 * Classes such as {@link OO.ui.mixin.DraggableElement DraggableElement} and
 * {@link OO.ui.ButtonOptionWidget ButtonOptionWidget} use a value of `false` so that dragging
 * behavior is possible and mousedown events can be handled by a parent widget.
 *
 * @static
 * @property {boolean}
 */
OO.ui.mixin.ButtonElement.static.cancelButtonMouseDownEvents = true;

/* Events */

/**
 * A 'click' event is emitted when the button element is clicked.
 *
 * @event OO.ui.mixin.ButtonElement#click
 */

/* Methods */

/**
 * Set the button element.
 *
 * This method is used to retarget a button mixin so that its functionality applies to
 * the specified button element instead of the one created by the class. If a button element
 * is already set, the method will remove the mixin’s effect on that element.
 *
 * @param {jQuery} $button Element to use as button
 */
OO.ui.mixin.ButtonElement.prototype.setButtonElement = function ( $button ) {
	if ( this.$button ) {
		this.$button
			.removeClass( 'oo-ui-buttonElement-button' )
			.removeAttr( 'role accesskey' )
			.off( {
				mousedown: this.onMouseDownHandler,
				keydown: this.onKeyDownHandler,
				click: this.onClickHandler,
				keypress: this.onKeyPressHandler
			} );
	}

	this.$button = $button
		.addClass( 'oo-ui-buttonElement-button' )
		.on( {
			mousedown: this.onMouseDownHandler,
			keydown: this.onKeyDownHandler,
			click: this.onClickHandler,
			keypress: this.onKeyPressHandler
		} );

	// Add `role="button"` on `<a>` elements, where it's needed
	// `toUpperCase()` is added for XHTML documents
	if ( this.$button.prop( 'tagName' ).toUpperCase() === 'A' ) {
		this.$button.attr( 'role', 'button' );
	}
};

/**
 * Handles mouse down events.
 *
 * @protected
 * @param {jQuery.Event} e Mouse down event
 * @return {undefined|boolean} False to prevent default if event is handled
 */
OO.ui.mixin.ButtonElement.prototype.onMouseDown = function ( e ) {
	if ( this.isDisabled() || e.which !== OO.ui.MouseButtons.LEFT ) {
		return;
	}
	this.$element.addClass( 'oo-ui-buttonElement-pressed' );
	// Run the mouseup handler no matter where the mouse is when the button is let go, so we can
	// reliably remove the pressed class
	this.getElementDocument().addEventListener( 'mouseup', this.onDocumentMouseUpHandler, true );
	// Prevent change of focus unless specifically configured otherwise
	if ( this.constructor.static.cancelButtonMouseDownEvents ) {
		return false;
	}
};

/**
 * Handles document mouse up events.
 *
 * @protected
 * @param {MouseEvent} e Mouse up event
 */
OO.ui.mixin.ButtonElement.prototype.onDocumentMouseUp = function ( e ) {
	if ( this.isDisabled() || e.which !== OO.ui.MouseButtons.LEFT ) {
		return;
	}
	this.$element.removeClass( 'oo-ui-buttonElement-pressed' );
	// Stop listening for mouseup, since we only needed this once
	this.getElementDocument().removeEventListener( 'mouseup', this.onDocumentMouseUpHandler, true );
};

/**
 * Handles mouse click events.
 *
 * @protected
 * @param {jQuery.Event} e Mouse click event
 * @fires OO.ui.mixin.ButtonElement#click
 * @return {undefined|boolean} False to prevent default if event is handled
 */
OO.ui.mixin.ButtonElement.prototype.onClick = function ( e ) {
	if ( !this.isDisabled() && e.which === OO.ui.MouseButtons.LEFT ) {
		if ( this.emit( 'click' ) ) {
			return false;
		}
	}
};

/**
 * Handles key down events.
 *
 * @protected
 * @param {jQuery.Event} e Key down event
 */
OO.ui.mixin.ButtonElement.prototype.onKeyDown = function ( e ) {
	if ( this.isDisabled() || ( e.which !== OO.ui.Keys.SPACE && e.which !== OO.ui.Keys.ENTER ) ) {
		return;
	}
	this.$element.addClass( 'oo-ui-buttonElement-pressed' );
	// Run the keyup handler no matter where the key is when the button is let go, so we can
	// reliably remove the pressed class
	this.getElementDocument().addEventListener( 'keyup', this.onDocumentKeyUpHandler, true );
};

/**
 * Handles document key up events.
 *
 * @protected
 * @param {KeyboardEvent} e Key up event
 */
OO.ui.mixin.ButtonElement.prototype.onDocumentKeyUp = function ( e ) {
	if ( this.isDisabled() || ( e.which !== OO.ui.Keys.SPACE && e.which !== OO.ui.Keys.ENTER ) ) {
		return;
	}
	this.$element.removeClass( 'oo-ui-buttonElement-pressed' );
	// Stop listening for keyup, since we only needed this once
	this.getElementDocument().removeEventListener( 'keyup', this.onDocumentKeyUpHandler, true );
};

/**
 * Handles key press events.
 *
 * @protected
 * @param {jQuery.Event} e Key press event
 * @fires OO.ui.mixin.ButtonElement#click
 * @return {undefined|boolean} False to prevent default if event is handled
 */
OO.ui.mixin.ButtonElement.prototype.onKeyPress = function ( e ) {
	if ( !this.isDisabled() && ( e.which === OO.ui.Keys.SPACE || e.which === OO.ui.Keys.ENTER ) ) {
		if ( this.emit( 'click' ) ) {
			return false;
		}
	}
};

/**
 * Check if button has a frame.
 *
 * @return {boolean} Button is framed
 */
OO.ui.mixin.ButtonElement.prototype.isFramed = function () {
	return this.framed;
};

/**
 * Render the button with or without a frame. Omit the `framed` parameter to toggle the button frame
 * on and off.
 *
 * @param {boolean} [framed] Make button framed, omit to toggle
 * @chainable
 * @return {OO.ui.Element} The element, for chaining
 */
OO.ui.mixin.ButtonElement.prototype.toggleFramed = function ( framed ) {
	framed = framed === undefined ? !this.framed : !!framed;
	if ( framed !== this.framed ) {
		this.framed = framed;
		this.$element
			.toggleClass( 'oo-ui-buttonElement-frameless', !framed )
			.toggleClass( 'oo-ui-buttonElement-framed', framed );
		this.updateThemeClasses();
	}

	return this;
};

/**
 * Set the button's active state.
 *
 * The active state can be set on:
 *
 *  - {@link OO.ui.ButtonOptionWidget ButtonOptionWidget} when it is selected
 *  - {@link OO.ui.ToggleButtonWidget ToggleButtonWidget} when it is toggle on
 *  - {@link OO.ui.ButtonWidget ButtonWidget} when clicking the button would only refresh the page
 *
 * @protected
 * @param {boolean} [value=false] Make button active
 * @chainable
 * @return {OO.ui.Element} The element, for chaining
 */
OO.ui.mixin.ButtonElement.prototype.setActive = function ( value ) {
	this.active = !!value;
	this.$element.toggleClass( 'oo-ui-buttonElement-active', this.active );
	this.updateThemeClasses();
	return this;
};

/**
 * Check if the button is active
 *
 * @protected
 * @return {boolean} The button is active
 */
OO.ui.mixin.ButtonElement.prototype.isActive = function () {
	return this.active;
};

/**
 * Any OOUI widget that contains other widgets (such as {@link OO.ui.ButtonWidget buttons} or
 * {@link OO.ui.OptionWidget options}) mixes in GroupElement. Adding, removing, and clearing
 * items from the group is done through the interface the class provides.
 * For more information, please see the [OOUI documentation on MediaWiki][1].
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Elements/Groups
 *
 * @abstract
 * @mixes OO.EmitterList
 * @class
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {jQuery} [config.$group] The container element created by the class. If this configuration
 *  is omitted, the group element will use a generated `<div>`.
 */
OO.ui.mixin.GroupElement = function OoUiMixinGroupElement( config ) {
	// Configuration initialization
	config = config || {};

	// Mixin constructors
	OO.EmitterList.call( this, config );

	// Properties
	this.$group = null;

	// Initialization
	this.setGroupElement( config.$group || $( '<div>' ) );
};

/* Setup */

OO.mixinClass( OO.ui.mixin.GroupElement, OO.EmitterList );

/* Events */

/**
 * A change event is emitted when the set of selected items changes.
 *
 * @event OO.ui.mixin.GroupElement#change
 * @param {OO.ui.Element[]} items Items currently in the group
 */

/* Methods */

/**
 * Set the group element.
 *
 * If an element is already set, items will be moved to the new element.
 *
 * @param {jQuery} $group Element to use as group
 */
OO.ui.mixin.GroupElement.prototype.setGroupElement = function ( $group ) {
	this.$group = $group;
	for ( let i = 0, len = this.items.length; i < len; i++ ) {
		this.$group.append( this.items[ i ].$element );
	}
};

/**
 * Find an item by its data.
 *
 * Only the first item with matching data will be returned. To return all matching items,
 * use the #findItemsFromData method.
 *
 * @param {any} data Item data to search for
 * @return {OO.ui.Element|null} Item with equivalent data, `null` if none exists
 */
OO.ui.mixin.GroupElement.prototype.findItemFromData = function ( data ) {
	const hash = OO.getHash( data );

	for ( let i = 0, len = this.items.length; i < len; i++ ) {
		const item = this.items[ i ];
		if ( hash === OO.getHash( item.getData() ) ) {
			return item;
		}
	}

	return null;
};

/**
 * Find items by their data.
 *
 * All items with matching data will be returned. To return only the first match, use the
 * #findItemFromData method instead.
 *
 * @param {any} data Item data to search for
 * @return {OO.ui.Element[]} Items with equivalent data
 */
OO.ui.mixin.GroupElement.prototype.findItemsFromData = function ( data ) {
	const hash = OO.getHash( data ),
		items = [];

	for ( let i = 0, len = this.items.length; i < len; i++ ) {
		const item = this.items[ i ];
		if ( hash === OO.getHash( item.getData() ) ) {
			items.push( item );
		}
	}

	return items;
};

/**
 * Add items to the group.
 *
 * Items will be added to the end of the group array unless the optional `index` parameter
 * specifies a different insertion point. Adding an existing item will move it to the end of the
 * array or the point specified by the `index`.
 *
 * @param {OO.ui.Element|OO.ui.Element[]} [items] Elements to add to the group
 * @param {number} [index] Index of the insertion point
 * @chainable
 * @return {OO.ui.Element} The element, for chaining
 */
OO.ui.mixin.GroupElement.prototype.addItems = function ( items, index ) {
	if ( !items || items.length === 0 ) {
		return this;
	}

	// Mixin method
	OO.EmitterList.prototype.addItems.call( this, items, index );

	this.emit( 'change', this.getItems() );
	return this;
};

/**
 * Move an item from its current position to a new index.
 *
 * The item is expected to exist in the list. If it doesn't,
 * the method will throw an exception.
 *
 * See https://doc.wikimedia.org/oojs/master/OO.EmitterList.html
 *
 * @private
 * @param {OO.EventEmitter} items Item to add
 * @param {number} newIndex Index to move the item to
 * @return {number} The index the item was moved to
 * @throws {Error} If item is not in the list
 */
OO.ui.mixin.GroupElement.prototype.moveItem = function ( items, newIndex ) {
	// insertItemElements expects this.items to not have been modified yet, so call before the mixin
	this.insertItemElements( items, newIndex );

	// Mixin method
	newIndex = OO.EmitterList.prototype.moveItem.call( this, items, newIndex );

	return newIndex;
};

/**
 * Utility method to insert an item into the list, and
 * connect it to aggregate events.
 *
 * Don't call this directly unless you know what you're doing.
 * Use #addItems instead.
 *
 * This method can be extended in child classes to produce
 * different behavior when an item is inserted. For example,
 * inserted items may also be attached to the DOM or may
 * interact with some other nodes in certain ways. Extending
 * this method is allowed, but if overridden, the aggregation
 * of events must be preserved, or behavior of emitted events
 * will be broken.
 *
 * If you are extending this method, please make sure the
 * parent method is called.
 *
 * See https://doc.wikimedia.org/oojs/master/OO.EmitterList.html
 *
 * @protected
 * @param {OO.EventEmitter|Object} item Item to add
 * @param {number} index Index to add items at
 * @return {number} The index the item was added at
 */
OO.ui.mixin.GroupElement.prototype.insertItem = function ( item, index ) {
	item.setElementGroup( this );
	this.insertItemElements( item, index );

	// Mixin method
	index = OO.EmitterList.prototype.insertItem.call( this, item, index );

	return index;
};

/**
 * Insert elements into the group
 *
 * @private
 * @param {OO.ui.Element} item Item to insert
 * @param {number} index Insertion index
 */
OO.ui.mixin.GroupElement.prototype.insertItemElements = function ( item, index ) {
	if ( index === undefined || index < 0 || index >= this.items.length ) {
		this.$group.append( item.$element );
	} else if ( index === 0 ) {
		this.$group.prepend( item.$element );
	} else {
		this.items[ index ].$element.before( item.$element );
	}
};

/**
 * Remove the specified items from a group.
 *
 * Removed items are detached (not removed) from the DOM so that they may be reused.
 * To remove all items from a group, you may wish to use the #clearItems method instead.
 *
 * @param {OO.ui.Element[]} items An array of items to remove
 * @chainable
 * @return {OO.ui.Element} The element, for chaining
 */
OO.ui.mixin.GroupElement.prototype.removeItems = function ( items ) {
	if ( items.length === 0 ) {
		return this;
	}

	// Remove specific items elements
	for ( let i = 0, len = items.length; i < len; i++ ) {
		const item = items[ i ];
		const index = this.items.indexOf( item );
		if ( index !== -1 ) {
			item.setElementGroup( null );
			item.$element.detach();
		}
	}

	// Mixin method
	OO.EmitterList.prototype.removeItems.call( this, items );

	this.emit( 'change', this.getItems() );
	return this;
};

/**
 * Clear all items from the group.
 *
 * Cleared items are detached from the DOM, not removed, so that they may be reused.
 * To remove only a subset of items from a group, use the #removeItems method.
 *
 * @chainable
 * @return {OO.ui.Element} The element, for chaining
 */
OO.ui.mixin.GroupElement.prototype.clearItems = function () {
	// Remove all item elements
	for ( let i = 0, len = this.items.length; i < len; i++ ) {
		this.items[ i ].setElementGroup( null );
		this.items[ i ].$element.detach();
	}

	// Mixin method
	OO.EmitterList.prototype.clearItems.call( this );

	this.emit( 'change', this.getItems() );
	return this;
};

/**
 * LabelElement is often mixed into other classes to generate a label, which
 * helps identify the function of an interface element.
 * See the [OOUI documentation on MediaWiki][1] for more information.
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Widgets/Icons,_Indicators,_and_Labels#Labels
 *
 * @abstract
 * @class
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {jQuery} [config.$label] The label element created by the class. If this
 *  configuration is omitted, the label element will use a generated `<span>`.
 * @param {jQuery|string|Function|OO.ui.HtmlSnippet} [config.label] The label text. The label can be
 *  specified as a plaintext string, a jQuery selection of elements, or a function that will
 *  produce a string in the future. See the [OOUI documentation on MediaWiki][2] for examples.
 *  [2]: https://www.mediawiki.org/wiki/OOUI/Widgets/Icons,_Indicators,_and_Labels#Labels
 * @param {boolean} [config.invisibleLabel=false] Whether the label should be visually hidden (but still
 *  accessible to screen-readers).
 */
OO.ui.mixin.LabelElement = function OoUiMixinLabelElement( config ) {
	// Configuration initialization
	config = config || {};

	// Properties
	this.$label = null;
	this.label = null;
	this.invisibleLabel = false;

	// Initialization
	this.setLabel( config.label || this.constructor.static.label );
	this.setLabelElement( config.$label || $( '<span>' ) );
	this.setInvisibleLabel( config.invisibleLabel );
};

/* Setup */

OO.initClass( OO.ui.mixin.LabelElement );

/* Events */

/**
 * @event OO.ui.mixin.LabelElement#labelChange
 */

/* Static Properties */

/**
 * The label text. The label can be specified as a plaintext string, a function that will
 * produce a string (will be resolved on construction time), or `null` for no label. The static
 * value will be overridden if a label is specified with the #label config option.
 *
 * @static
 * @property {string|Function|null}
 */
OO.ui.mixin.LabelElement.static.label = null;

/* Static methods */

/**
 * Highlight the first occurrence of the query in the given text
 *
 * @param {string} text Text
 * @param {string} query Query to find
 * @param {Function} [compare] Optional string comparator, e.g. Intl.Collator().compare
 * @param {boolean} [combineMarks=false] Pull combining marks into highlighted text
 * @return {jQuery} Text with the first match of the query
 *  sub-string wrapped in highlighted span
 */
OO.ui.mixin.LabelElement.static.highlightQuery = function ( text, query, compare, combineMarks ) {
	let offset = -1,
		comboLength = 0,
		comboMarks = '',
		comboRegex,
		comboMatch;

	const $result = $( '<span>' );

	if ( compare ) {
		const tLen = text.length;
		const qLen = query.length;
		for ( let i = 0; offset === -1 && i <= tLen - qLen; i++ ) {
			if ( compare( query, text.slice( i, i + qLen ) ) === 0 ) {
				offset = i;
			}
		}
	} else {
		offset = text.toLowerCase().indexOf( query.toLowerCase() );
	}

	if ( !query.length || offset === -1 ) {
		$result.text( text );
	} else {
		// Look for combining characters after the match
		if ( combineMarks ) {
			// Equivalent to \p{Mark} (which is not currently available in JavaScript)
			comboMarks = '[\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u07FD\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08D3-\u08E1\u08E3-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u09FE\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0AFA-\u0AFF\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C00-\u0C04\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D00-\u0D03\u0D3B\u0D3C\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F\u109A-\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u1885\u1886\u18A9\u1920-\u192B\u1930-\u193B\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B04\u1B34-\u1B44\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF7-\u1CF9\u1DC0-\u1DF9\u1DFB-\u1DFF\u20D0-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\uA66F-\uA672\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C5\uA8E0-\uA8F1\uA8FF\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9E5\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F]';

			comboRegex = new RegExp( '(^)' + comboMarks + '*' );
			comboMatch = text.slice( offset + query.length ).match( comboRegex );

			if ( comboMatch && comboMatch.length ) {
				comboLength = comboMatch[ 0 ].length;
			}
		}

		$result.append(
			document.createTextNode( text.slice( 0, offset ) ),
			$( '<span>' )
				.addClass( 'oo-ui-labelElement-label-highlight' )
				.text( text.slice( offset, offset + query.length + comboLength ) ),
			document.createTextNode( text.slice( offset + query.length + comboLength ) )
		);
	}
	return $result.contents();
};

/* Methods */

/**
 * Replace the wrapper element (an empty `<span>` by default) with another one (e.g. an
 * `<a href="…">`), without touching the label's content. This is the same as using the "$label"
 * config on construction time.
 *
 * If an element is already set, it will be cleaned up before setting up the new element.
 *
 * @param {jQuery} $label Element to use as label
 * @chainable
 * @return {OO.ui.mixin.LabelElement} The element, for chaining
 */
OO.ui.mixin.LabelElement.prototype.setLabelElement = function ( $label ) {
	if ( this.$label ) {
		this.$label.removeClass( 'oo-ui-labelElement-label' ).empty();
	}

	this.$label = $label.addClass( 'oo-ui-labelElement-label' );
	this.setLabelContent( this.label );
	return this;
};

/**
 * Set the 'id' attribute of the label element.
 *
 * @param {string} id
 * @chainable
 * @return {OO.ui.mixin.LabelElement} The element, for chaining
 */
OO.ui.mixin.LabelElement.prototype.setLabelId = function ( id ) {
	this.$label.attr( 'id', id );
	return this;
};

/**
 * Replace both the visible content of the label (same as #setLabelContent) as well as the value
 * returned by #getLabel, without touching the label's wrapper element. This is the same as using
 * the "label" config on construction time.
 *
 * An empty string will result in the label being hidden. A string containing only whitespace will
 * be converted to a single `&nbsp;`.
 *
 * To change the wrapper element, use #setLabelElement or the "$label" config.
 *
 * @param {jQuery|string|OO.ui.HtmlSnippet|Function|null} label Label nodes; text; a function that
 *  returns nodes or text; or null for no label
 * @chainable
 * @return {OO.ui.Element} The element, for chaining
 */
OO.ui.mixin.LabelElement.prototype.setLabel = function ( label ) {
	label = OO.ui.resolveMsg( label );
	label = ( ( typeof label === 'string' || label instanceof $ ) && label.length ) || ( label instanceof OO.ui.HtmlSnippet && label.toString().length ) ? label : null;

	if ( this.label !== label ) {
		if ( this.$label ) {
			this.setLabelContent( label );
		}
		this.label = label;
		this.$element.toggleClass( 'oo-ui-labelElement', !!this.label && !this.invisibleLabel );
		this.emit( 'labelChange' );
	}

	return this;
};

/**
 * Set whether the label should be visually hidden (but still accessible to screen-readers).
 *
 * @param {boolean} [invisibleLabel=false]
 * @chainable
 * @return {OO.ui.Element} The element, for chaining
 */
OO.ui.mixin.LabelElement.prototype.setInvisibleLabel = function ( invisibleLabel ) {
	invisibleLabel = !!invisibleLabel;

	if ( this.invisibleLabel !== invisibleLabel ) {
		this.invisibleLabel = invisibleLabel;
		this.$label.toggleClass( 'oo-ui-labelElement-invisible', this.invisibleLabel );
		// Pretend that there is no label, a lot of CSS has been written with this assumption
		this.$element.toggleClass( 'oo-ui-labelElement', !!this.label && !this.invisibleLabel );
		this.emit( 'labelChange' );
	}

	return this;
};

/**
 * Set the label as plain text with a highlighted query
 *
 * @param {string} text Text label to set
 * @param {string} query Substring of text to highlight
 * @param {Function} [compare] Optional string comparator, e.g. Intl.Collator().compare
 * @param {boolean} [combineMarks=false] Pull combining marks into highlighted text
 * @chainable
 * @return {OO.ui.Element} The element, for chaining
 */
OO.ui.mixin.LabelElement.prototype.setHighlightedQuery = function (
	text, query, compare, combineMarks
) {
	return this.setLabel(
		this.constructor.static.highlightQuery( text, query, compare, combineMarks )
	);
};

/**
 * Get the label's value as provided via #setLabel or the "label" config. Note this is not
 * necessarily the same as the label's visible content when #setLabelContent was used.
 *
 * @return {jQuery|string|null} Label nodes; text; or null for no label
 */
OO.ui.mixin.LabelElement.prototype.getLabel = function () {
	return this.label;
};

/**
 * Replace the visible content of the label, without touching it's wrapper element. Note this is not
 * the same as using the "label" config on construction time. #setLabelContent does not change the
 * value returned by #getLabel.
 *
 * To change the value as well, use #setLabel or the "label" config. To change the wrapper element,
 * use #setLabelElement or the "$label" config.
 *
 * @private
 * @param {jQuery|string|null} label Label nodes; text; or null for no label
 */
OO.ui.mixin.LabelElement.prototype.setLabelContent = function ( label ) {
	if ( typeof label === 'string' ) {
		if ( label.match( /^\s*$/ ) ) {
			// Convert whitespace only string to a single non-breaking space
			this.$label.html( '&nbsp;' );
		} else {
			this.$label.text( label );
		}
	} else if ( label instanceof OO.ui.HtmlSnippet ) {
		this.$label.html( label.toString() );
	} else if ( label instanceof $ ) {
		this.$label.empty().append( label );
	} else {
		this.$label.empty();
	}
};

/**
 * IconElement is often mixed into other classes to generate an icon.
 * Icons are graphics, about the size of normal text. They are used to aid the user
 * in locating a control or to convey information in a space-efficient way. See the
 * [OOUI documentation on MediaWiki][1] for a list of icons
 * included in the library.
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Widgets/Icons,_Indicators,_and_Labels#Icons
 *
 * @abstract
 * @class
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {jQuery} [config.$icon] The icon element created by the class. If this configuration is omitted,
 *  the icon element will use a generated `<span>`. To use a different HTML tag, or to specify that
 *  the icon element be set to an existing icon instead of the one generated by this class, set a
 *  value using a jQuery selection. For example:
 *
 *      // Use a <div> tag instead of a <span>
 *     $icon: $( '<div>' )
 *     // Use an existing icon element instead of the one generated by the class
 *     $icon: this.$element
 *     // Use an icon element from a child widget
 *     $icon: this.childwidget.$element
 * @param {Object|string} [config.icon=''] The symbolic name of the icon (e.g., ‘remove’ or ‘menu’), or a
 *  map of symbolic names. A map is used for i18n purposes and contains a `default` icon
 *  name and additional names keyed by language code. The `default` name is used when no icon is
 *  keyed by the user's language.
 *
 *  Example of an i18n map:
 *
 *     { default: 'bold-a', en: 'bold-b', de: 'bold-f' }
 *  See the [OOUI documentation on MediaWiki][2] for a list of icons included in the library.
 * [2]: https://www.mediawiki.org/wiki/OOUI/Widgets/Icons,_Indicators,_and_Labels#Icons
 */
OO.ui.mixin.IconElement = function OoUiMixinIconElement( config ) {
	// Configuration initialization
	config = config || {};

	// Properties
	this.$icon = null;
	this.icon = null;

	// Initialization
	this.setIcon( config.icon || this.constructor.static.icon );
	this.setIconElement( config.$icon || $( '<span>' ) );
};

/* Setup */

OO.initClass( OO.ui.mixin.IconElement );

/* Static Properties */

/**
 * The symbolic name of the icon (e.g., ‘remove’ or ‘menu’), or a map of symbolic names. A map
 * is used for i18n purposes and contains a `default` icon name and additional names keyed by
 * language code. The `default` name is used when no icon is keyed by the user's language.
 *
 * Example of an i18n map:
 *
 *     { default: 'bold-a', en: 'bold-b', de: 'bold-f' }
 *
 * Note: the static property will be overridden if the #icon configuration is used.
 *
 * @static
 * @property {Object|string}
 */
OO.ui.mixin.IconElement.static.icon = null;

/**
 * The icon title, displayed when users move the mouse over the icon. The value can be text, a
 * function that returns title text, or `null` for no title.
 *
 * The static property will be overridden if the #iconTitle configuration is used.
 *
 * @static
 * @property {string|Function|null}
 */
OO.ui.mixin.IconElement.static.iconTitle = null;

/* Methods */

/**
 * Set the icon element. This method is used to retarget an icon mixin so that its functionality
 * applies to the specified icon element instead of the one created by the class. If an icon
 * element is already set, the mixin’s effect on that element is removed. Generated CSS classes
 * and mixin methods will no longer affect the element.
 *
 * @param {jQuery} $icon Element to use as icon
 */
OO.ui.mixin.IconElement.prototype.setIconElement = function ( $icon ) {
	if ( this.$icon ) {
		this.$icon
			.removeClass( 'oo-ui-iconElement-icon oo-ui-icon-' + this.icon )
			.removeAttr( 'title' );
	}

	this.$icon = $icon
		.addClass( 'oo-ui-iconElement-icon' )
		.toggleClass( 'oo-ui-iconElement-noIcon', !this.icon )
		.toggleClass( 'oo-ui-icon-' + this.icon, !!this.icon );
	if ( this.iconTitle !== null ) {
		this.$icon.attr( 'title', this.iconTitle );
	}

	this.updateThemeClasses();
};

/**
 * Set icon by symbolic name (e.g., ‘remove’ or ‘menu’). Use `null` to remove an icon.
 * The icon parameter can also be set to a map of icon names. See the #icon config setting
 * for an example.
 *
 * @param {Object|string|null} icon A symbolic icon name, a {@link OO.ui.mixin.IconElement.static.icon map of icon names} keyed
 *  by language code, or `null` to remove the icon.
 * @chainable
 * @return {OO.ui.Element} The element, for chaining
 */
OO.ui.mixin.IconElement.prototype.setIcon = function ( icon ) {
	if ( icon && typeof icon !== 'string' ) {
		icon = OO.ui.getLocalValue( icon, null, 'default' );
	}

	if ( this.icon === icon ) {
		return this;
	}

	this.$element.toggleClass( 'oo-ui-iconElement', !!icon );
	if ( this.$icon ) {
		if ( this.icon ) {
			this.$icon.removeClass( 'oo-ui-icon-' + this.icon );
		}
		if ( icon ) {
			this.$icon.addClass( 'oo-ui-icon-' + icon );
		}
		this.$icon.toggleClass( 'oo-ui-iconElement-noIcon', !icon );
	}

	this.icon = icon;
	this.updateThemeClasses();

	return this;
};

/**
 * Get the symbolic name of the icon.
 *
 * @return {string} Icon name
 */
OO.ui.mixin.IconElement.prototype.getIcon = function () {
	return this.icon;
};

/**
 * IndicatorElement is often mixed into other classes to generate an indicator.
 * Indicators are small graphics that are generally used in two ways:
 *
 * - To draw attention to the status of an item. For example, an indicator might be
 *   used to show that an item in a list has errors that need to be resolved.
 * - To clarify the function of a control that acts in an exceptional way (a button
 *   that opens a menu instead of performing an action directly, for example).
 *
 * For a list of indicators included in the library, please see the
 * [OOUI documentation on MediaWiki][1].
 *
 * Note that indicators don't come with any functionality by default. See e.g.
 * {@link OO.ui.SearchInputWidget SearchInputWidget} for a working 'clear' or
 * {@link OO.ui.ComboBoxInputWidget ComboBoxInputWidget} for a working 'down' indicator.
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Widgets/Icons,_Indicators,_and_Labels#Indicators
 *
 * @abstract
 * @class
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {jQuery} [config.$indicator] The indicator element created by the class. If this
 *  configuration is omitted, the indicator element will use a generated `<span>`.
 * @param {string} [config.indicator] Symbolic name of the indicator (e.g. ‘required’ or ‘down’).
 *  See the [OOUI documentation on MediaWiki][2] for a list of indicators included
 *  in the library.
 * [2]: https://www.mediawiki.org/wiki/OOUI/Widgets/Icons,_Indicators,_and_Labels#Indicators
 */
OO.ui.mixin.IndicatorElement = function OoUiMixinIndicatorElement( config ) {
	// Configuration initialization
	config = config || {};

	// Properties
	this.$indicator = null;
	this.indicator = null;

	// Initialization
	this.setIndicator( config.indicator || this.constructor.static.indicator );
	this.setIndicatorElement( config.$indicator || $( '<span>' ) );
};

/* Setup */

OO.initClass( OO.ui.mixin.IndicatorElement );

/* Static Properties */

/**
 * Symbolic name of the indicator (e.g. ‘required’ or ‘down’).
 * The static property will be overridden if the #indicator configuration is used.
 *
 * @static
 * @property {string|null}
 */
OO.ui.mixin.IndicatorElement.static.indicator = null;

/**
 * A text string used as the indicator title, a function that returns title text, or `null`
 * for no title. The static property will be overridden if the #indicatorTitle configuration is
 * used.
 *
 * @static
 * @property {string|Function|null}
 */
OO.ui.mixin.IndicatorElement.static.indicatorTitle = null;

/* Methods */

/**
 * Set the indicator element.
 *
 * If an element is already set, it will be cleaned up before setting up the new element.
 *
 * @param {jQuery} $indicator Element to use as indicator
 */
OO.ui.mixin.IndicatorElement.prototype.setIndicatorElement = function ( $indicator ) {
	if ( this.$indicator ) {
		this.$indicator
			.removeClass( 'oo-ui-indicatorElement-indicator oo-ui-indicator-' + this.indicator )
			.removeAttr( 'title' );
	}

	this.$indicator = $indicator
		.addClass( 'oo-ui-indicatorElement-indicator' )
		.toggleClass( 'oo-ui-indicatorElement-noIndicator', !this.indicator )
		.toggleClass( 'oo-ui-indicator-' + this.indicator, !!this.indicator );
	if ( this.indicatorTitle !== null ) {
		this.$indicator.attr( 'title', this.indicatorTitle );
	}

	this.updateThemeClasses();
};

/**
 * Set the indicator by its symbolic name. Built-in names currently include ‘clear’, ‘up’,
 * ‘down’ and ‘required’ (declared via indicators.json). Use `null` to remove the indicator.
 *
 * @param {string|null} indicator Symbolic name of indicator, or `null` for no indicator
 * @chainable
 * @return {OO.ui.Element} The element, for chaining
 */
OO.ui.mixin.IndicatorElement.prototype.setIndicator = function ( indicator ) {
	indicator = typeof indicator === 'string' && indicator.length ? indicator.trim() : null;

	if ( this.indicator !== indicator ) {
		if ( this.$indicator ) {
			if ( this.indicator !== null ) {
				this.$indicator.removeClass( 'oo-ui-indicator-' + this.indicator );
			}
			if ( indicator !== null ) {
				this.$indicator.addClass( 'oo-ui-indicator-' + indicator );
			}
		}
		this.indicator = indicator;
	}

	this.$element.toggleClass( 'oo-ui-indicatorElement', !!this.indicator );
	if ( this.$indicator ) {
		this.$indicator.toggleClass( 'oo-ui-indicatorElement-noIndicator', !this.indicator );
	}
	this.updateThemeClasses();

	return this;
};

/**
 * Get the symbolic name of the indicator (e.g., ‘required’ or ‘down’).
 *
 * @return {string|null} Symbolic name of indicator, null if not set
 */
OO.ui.mixin.IndicatorElement.prototype.getIndicator = function () {
	return this.indicator;
};

/**
 * The FlaggedElement class is an attribute mixin, meaning that it is used to add
 * additional functionality to an element created by another class. The class provides
 * a ‘flags’ property assigned the name (or an array of names) of styling flags,
 * which are used to customize the look and feel of a widget to better describe its
 * importance and functionality.
 *
 * The library currently contains the following styling flags for general use:
 *
 * - **progressive**: Progressive styling is applied to convey that the widget will move the user
 *   forward in a process.
 * - **destructive**: Destructive styling is applied to convey that the widget will remove
 *   something.
 *
 * {@link OO.ui.ActionWidget ActionWidgets}, which are a special kind of button that execute an
 * action, use these flags: **primary** and **safe**.
 * Please see the [OOUI documentation on MediaWiki][1] for more information.
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Elements/Flagged
 *
 * The flags affect the appearance of the buttons:
 *
 *     @example
 *     // FlaggedElement is mixed into ButtonWidget to provide styling flags
 *     const button1 = new OO.ui.ButtonWidget( {
 *             label: 'Progressive',
 *             flags: 'progressive'
 *         } ),
 *         button2 = new OO.ui.ButtonWidget( {
 *             label: 'Destructive',
 *             flags: 'destructive'
 *         } );
 *     $( document.body ).append( button1.$element, button2.$element );
 *
 * @abstract
 * @class
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {string|string[]} [config.flags] The name or names of the flags (e.g., 'progressive' or 'primary')
 *  to apply.
 *  Please see the [OOUI documentation on MediaWiki][2] for more information about available flags.
 *  [2]: https://www.mediawiki.org/wiki/OOUI/Elements/Flagged
 * @param {jQuery} [config.$flagged] The flagged element. By default,
 *  the flagged functionality is applied to the element created by the class ($element).
 *  If a different element is specified, the flagged functionality will be applied to it instead.
 */
OO.ui.mixin.FlaggedElement = function OoUiMixinFlaggedElement( config ) {
	// Configuration initialization
	config = config || {};

	// Properties
	this.flags = {};
	this.$flagged = null;

	// Initialization
	this.setFlags( config.flags || this.constructor.static.flags );
	this.setFlaggedElement( config.$flagged || this.$element );
};

/* Setup */

OO.initClass( OO.ui.mixin.FlaggedElement );

/* Events */

/**
 * A flag event is emitted when the #clearFlags or #setFlags methods are used. The `changes`
 * parameter contains the name of each modified flag and indicates whether it was
 * added or removed.
 *
 * @event OO.ui.mixin.FlaggedElement#flag
 * @param {Object.<string,boolean>} changes Object keyed by flag name. A Boolean `true` indicates
 * that the flag was added, `false` that the flag was removed.
 */

/* Static Properties */

/**
 * Initial value to pass to setFlags if no value is provided in config.
 *
 * @static
 * @property {string|string[]|Object.<string, boolean>}
 */
OO.ui.mixin.FlaggedElement.static.flags = null;

/* Methods */

/**
 * Set the flagged element.
 *
 * This method is used to retarget a flagged mixin so that its functionality applies to the
 * specified element.
 * If an element is already set, the method will remove the mixin’s effect on that element.
 *
 * @param {jQuery} $flagged Element that should be flagged
 */
OO.ui.mixin.FlaggedElement.prototype.setFlaggedElement = function ( $flagged ) {
	const classNames = Object.keys( this.flags ).map( ( flag ) => 'oo-ui-flaggedElement-' + flag );

	if ( this.$flagged ) {
		this.$flagged.removeClass( classNames );
	}

	this.$flagged = $flagged.addClass( classNames );
};

/**
 * Check if the specified flag is set.
 *
 * @param {string} flag Name of flag
 * @return {boolean} The flag is set
 */
OO.ui.mixin.FlaggedElement.prototype.hasFlag = function ( flag ) {
	// This may be called before the constructor, thus before this.flags is set
	return this.flags && ( flag in this.flags );
};

/**
 * Get the names of all flags set.
 *
 * @return {string[]} Flag names
 */
OO.ui.mixin.FlaggedElement.prototype.getFlags = function () {
	// This may be called before the constructor, thus before this.flags is set
	return Object.keys( this.flags || {} );
};

/**
 * Clear all flags.
 *
 * @chainable
 * @return {OO.ui.Element} The element, for chaining
 * @fires OO.ui.mixin.FlaggedElement#flag
 */
OO.ui.mixin.FlaggedElement.prototype.clearFlags = function () {
	const changes = {},
		remove = [],
		classPrefix = 'oo-ui-flaggedElement-';

	for ( const flag in this.flags ) {
		const className = classPrefix + flag;
		changes[ flag ] = false;
		delete this.flags[ flag ];
		remove.push( className );
	}

	if ( this.$flagged ) {
		this.$flagged.removeClass( remove );
	}

	this.updateThemeClasses();
	this.emit( 'flag', changes );

	return this;
};

/**
 * Add one or more flags.
 *
 * @param {string|string[]|Object.<string, boolean>} flags A flag name, an array of flag names,
 *  or an object keyed by flag name with a boolean value that indicates whether the flag should
 *  be added (`true`) or removed (`false`).
 * @chainable
 * @return {OO.ui.Element} The element, for chaining
 * @fires OO.ui.mixin.FlaggedElement#flag
 */
OO.ui.mixin.FlaggedElement.prototype.setFlags = function ( flags ) {
	const changes = {},
		add = [],
		remove = [],
		classPrefix = 'oo-ui-flaggedElement-';

	let className, flag;
	if ( typeof flags === 'string' ) {
		className = classPrefix + flags;
		// Set
		if ( !this.flags[ flags ] ) {
			this.flags[ flags ] = true;
			add.push( className );
		}
	} else if ( Array.isArray( flags ) ) {
		for ( let i = 0, len = flags.length; i < len; i++ ) {
			flag = flags[ i ];
			className = classPrefix + flag;
			// Set
			if ( !this.flags[ flag ] ) {
				changes[ flag ] = true;
				this.flags[ flag ] = true;
				add.push( className );
			}
		}
	} else if ( OO.isPlainObject( flags ) ) {
		for ( flag in flags ) {
			className = classPrefix + flag;
			if ( flags[ flag ] ) {
				// Set
				if ( !this.flags[ flag ] ) {
					changes[ flag ] = true;
					this.flags[ flag ] = true;
					add.push( className );
				}
			} else {
				// Remove
				if ( this.flags[ flag ] ) {
					changes[ flag ] = false;
					delete this.flags[ flag ];
					remove.push( className );
				}
			}
		}
	}

	if ( this.$flagged ) {
		this.$flagged
			.addClass( add )
			.removeClass( remove );
	}

	this.updateThemeClasses();
	this.emit( 'flag', changes );

	return this;
};

/**
 * TitledElement is mixed into other classes to provide a `title` attribute.
 * Titles are rendered by the browser and are made visible when the user moves
 * the mouse over the element. Titles are not visible on touch devices.
 *
 *     @example
 *     // TitledElement provides a `title` attribute to the
 *     // ButtonWidget class.
 *     const button = new OO.ui.ButtonWidget( {
 *         label: 'Button with Title',
 *         title: 'I am a button'
 *     } );
 *     $( document.body ).append( button.$element );
 *
 * @abstract
 * @class
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {jQuery} [config.$titled] The element to which the `title` attribute is applied.
 *  If this config is omitted, the title functionality is applied to $element, the
 *  element created by the class.
 * @param {string|Function} [config.title] The title text or a function that returns text. If
 *  this config is omitted, the value of the {@link OO.ui.mixin.TitledElement.static.title static title} property is used.
 *  If config for an invisible label ({@link OO.ui.mixin.LabelElement}) is present, and a title is
 *  omitted, the label will be used as a fallback for the title.
 */
OO.ui.mixin.TitledElement = function OoUiMixinTitledElement( config ) {
	// Configuration initialization
	config = config || {};

	// Properties
	this.$titled = null;
	this.title = null;

	// Initialization
	let title = config.title !== undefined ? config.title : this.constructor.static.title;
	if (
		title === null &&
		config.invisibleLabel &&
		typeof config.label === 'string'
	) {
		// If config for an invisible label is present, use this as a fallback title
		title = config.label;
	}
	this.setTitle( title );
	this.setTitledElement( config.$titled || this.$element );
};

/* Setup */

OO.initClass( OO.ui.mixin.TitledElement );

/* Static Properties */

/**
 * The title text, a function that returns text, or `null` for no title. The value of the static
 * property is overridden if the #title config option is used.
 *
 * If the element has a default title (e.g. `<input type=file>`), `null` will allow that title to be
 * shown. Use empty string to suppress it.
 *
 * @static
 * @property {string|Function|null}
 */
OO.ui.mixin.TitledElement.static.title = null;

/* Methods */

/**
 * Set the titled element.
 *
 * This method is used to retarget a TitledElement mixin so that its functionality applies to the
 * specified element.
 * If an element is already set, the mixin’s effect on that element is removed before the new
 * element is set up.
 *
 * @param {jQuery} $titled Element that should use the 'titled' functionality
 */
OO.ui.mixin.TitledElement.prototype.setTitledElement = function ( $titled ) {
	if ( this.$titled ) {
		this.$titled.removeAttr( 'title' );
	}

	this.$titled = $titled;
	this.updateTitle();
};

/**
 * Set title.
 *
 * @param {string|Function|null} title Title text, a function that returns text, or `null`
 *  for no title
 * @chainable
 * @return {OO.ui.Element} The element, for chaining
 */
OO.ui.mixin.TitledElement.prototype.setTitle = function ( title ) {
	title = OO.ui.resolveMsg( title );
	title = typeof title === 'string' ? title : null;

	if ( this.title !== title ) {
		this.title = title;
		this.updateTitle();
	}

	return this;
};

/**
 * Update the title attribute, in case of changes to title or accessKey.
 *
 * @protected
 * @chainable
 * @return {OO.ui.Element} The element, for chaining
 */
OO.ui.mixin.TitledElement.prototype.updateTitle = function () {
	let title = this.getTitle();
	if ( this.$titled ) {
		if ( title !== null ) {
			// Only if this is an AccessKeyedElement
			if ( this.formatTitleWithAccessKey ) {
				title = this.formatTitleWithAccessKey( title );
			}
			this.$titled.attr( 'title', title );
		} else {
			this.$titled.removeAttr( 'title' );
		}
	}
	return this;
};

/**
 * Get title.
 *
 * @return {string|null} Title string
 */
OO.ui.mixin.TitledElement.prototype.getTitle = function () {
	return this.title;
};

/**
 * AccessKeyedElement is mixed into other classes to provide an `accesskey` HTML attribute.
 * Access keys allow an user to go to a specific element by using
 * a shortcut combination of a browser specific keys + the key
 * set to the field.
 *
 *     @example
 *     // AccessKeyedElement provides an `accesskey` attribute to the
 *     // ButtonWidget class.
 *     const button = new OO.ui.ButtonWidget( {
 *         label: 'Button with access key',
 *         accessKey: 'k'
 *     } );
 *     $( document.body ).append( button.$element );
 *
 * @abstract
 * @class
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {jQuery} [config.$accessKeyed] The element to which the `accesskey` attribute is applied.
 *  If this config is omitted, the access key functionality is applied to $element, the
 *  element created by the class.
 * @param {string|Function|null} [config.accessKey=null] The key or a function that returns the key. If
 *  this config is omitted, no access key will be added.
 */
OO.ui.mixin.AccessKeyedElement = function OoUiMixinAccessKeyedElement( config ) {
	// Configuration initialization
	config = config || {};

	// Properties
	this.$accessKeyed = null;
	this.accessKey = null;

	// Initialization
	this.setAccessKey( config.accessKey || null );
	this.setAccessKeyedElement( config.$accessKeyed || this.$element );

	// If this is also a TitledElement and it initialized before we did, we may have
	// to update the title with the access key
	if ( this.updateTitle ) {
		this.updateTitle();
	}
};

/* Setup */

OO.initClass( OO.ui.mixin.AccessKeyedElement );

/* Static Properties */

/**
 * The access key, a function that returns a key, or `null` for no access key.
 *
 * @static
 * @property {string|Function|null}
 */
OO.ui.mixin.AccessKeyedElement.static.accessKey = null;

/* Methods */

/**
 * Set the access keyed element.
 *
 * This method is used to retarget a AccessKeyedElement mixin so that its functionality applies to
 * the specified element.
 * If an element is already set, the mixin's effect on that element is removed before the new
 * element is set up.
 *
 * @param {jQuery} $accessKeyed Element that should use the 'access keyed' functionality
 */
OO.ui.mixin.AccessKeyedElement.prototype.setAccessKeyedElement = function ( $accessKeyed ) {
	if ( this.$accessKeyed ) {
		this.$accessKeyed.removeAttr( 'accesskey' );
	}

	this.$accessKeyed = $accessKeyed;
	if ( this.accessKey ) {
		this.$accessKeyed.attr( 'accesskey', this.accessKey );
	}
};

/**
 * Set access key.
 *
 * @param {string|Function|null} accessKey Key, a function that returns a key, or `null` for no
 *  access key
 * @chainable
 * @return {OO.ui.Element} The element, for chaining
 */
OO.ui.mixin.AccessKeyedElement.prototype.setAccessKey = function ( accessKey ) {
	accessKey = OO.ui.resolveMsg( accessKey );
	accessKey = typeof accessKey === 'string' ? accessKey : null;

	if ( this.accessKey !== accessKey ) {
		if ( this.$accessKeyed ) {
			if ( accessKey !== null ) {
				this.$accessKeyed.attr( 'accesskey', accessKey );
			} else {
				this.$accessKeyed.removeAttr( 'accesskey' );
			}
		}
		this.accessKey = accessKey;

		// Only if this is a TitledElement
		if ( this.updateTitle ) {
			this.updateTitle();
		}
	}

	return this;
};

/**
 * Get access key.
 *
 * @return {string} accessKey string
 */
OO.ui.mixin.AccessKeyedElement.prototype.getAccessKey = function () {
	return this.accessKey;
};

/**
 * Add information about the access key to the element's tooltip label.
 * (This is only public for hacky usage in FieldLayout.)
 *
 * @param {string} title Tooltip label for `title` attribute
 * @return {string}
 */
OO.ui.mixin.AccessKeyedElement.prototype.formatTitleWithAccessKey = function ( title ) {
	if ( !this.$accessKeyed ) {
		// Not initialized yet; the constructor will call updateTitle() which will rerun this
		// function.
		return title;
	}
	// Use jquery.accessKeyLabel if available to show modifiers, otherwise just display the
	// single key.
	let accessKey;
	if ( $.fn.updateTooltipAccessKeys && $.fn.updateTooltipAccessKeys.getAccessKeyLabel ) {
		accessKey = $.fn.updateTooltipAccessKeys.getAccessKeyLabel( this.$accessKeyed[ 0 ] );
	} else {
		accessKey = this.getAccessKey();
	}
	if ( accessKey ) {
		title += ' [' + accessKey + ']';
	}
	return title;
};

/**
 * RequiredElement is mixed into other classes to provide a `required` attribute.
 *
 * @abstract
 * @class
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {jQuery} [config.$required] The element to which the `required` attribute is applied.
 *  If this config is omitted, the required functionality is applied to $input if it
 *  exists, or $element if it doesn't.
 * @param {boolean} [config.required=false] Mark the field as required with `true`.
 * @param {OO.ui.Element} [config.indicatorElement=this] Element which mixes in OO.ui.mixin.IndicatorElement
 *  Will set the indicator on that element to 'required' when the element is required.
 *  Note that `false` & setting `indicator: 'required'` will result in no indicator shown.
 */
OO.ui.mixin.RequiredElement = function OoUiMixinRequiredElement( config ) {
	// Configuration initialization
	config = config || {};

	// Properties
	this.$required = config.$required || this.$input || this.$element;
	this.required = false;
	this.indicatorElement = config.indicatorElement !== undefined ? config.indicatorElement : this;
	if ( this.indicatorElement && !this.indicatorElement.getIndicator ) {
		throw new Error( 'config.indicatorElement must mixin OO.ui.mixin.IndicatorElement.' );
	}

	// Initialization
	this.setRequired( !!config.required );
};

/* Setup */

OO.initClass( OO.ui.mixin.RequiredElement );

/* Methods */

/**
 * Set the element which can take the required attribute.
 *
 * This method is used to retarget a RequiredElement mixin so that its functionality applies to the
 * specified element.
 * If an element is already set, the mixin’s effect on that element is removed before the new
 * element is set up.
 *
 * @param {jQuery} $required Element that should use the 'required' functionality
 */
OO.ui.mixin.RequiredElement.prototype.setRequiredElement = function ( $required ) {
	if ( this.$required === $required ) {
		return;
	}

	if ( this.$required && this.required ) {
		this.updateRequiredElement( false );
	}

	this.$required = $required;
	this.updateRequiredElement();
};

/**
 * @private
 * @param {boolean} [state]
 */
OO.ui.mixin.RequiredElement.prototype.updateRequiredElement = function ( state ) {
	if ( state === undefined ) {
		state = this.required;
	}

	this.$required
		.prop( 'required', state );
};

/**
 * Check if the input is {@link OO.ui.mixin.RequiredElement#required required}.
 *
 * @return {boolean}
 */
OO.ui.mixin.RequiredElement.prototype.isRequired = function () {
	return this.required;
};

/**
 * Set the {@link OO.ui.mixin.RequiredElement#required required} state of the input.
 *
 * @param {boolean} state Make input required
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.mixin.RequiredElement.prototype.setRequired = function ( state ) {
	if ( this.required === state ) {
		return this;
	}

	this.required = !!state;
	this.updateRequiredElement();
	if ( this.indicatorElement ) {
		// Make sure to not destroy other, unrelated indicators
		const expected = state ? null : 'required';
		if ( this.indicatorElement.getIndicator() === expected ) {
			this.indicatorElement.setIndicator( state ? 'required' : null );
		}
	}
	return this;
};

/**
 * ButtonWidget is a generic widget for buttons. A wide variety of looks,
 * feels, and functionality can be customized via the class’s configuration options
 * and methods. Please see the [OOUI documentation on MediaWiki][1] for more information
 * and examples.
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Widgets/Buttons_and_Switches
 *
 * NOTE: HTML form buttons should use the OO.ui.ButtonInputWidget class.
 *
 *     @example
 *     // A button widget.
 *     const button = new OO.ui.ButtonWidget( {
 *         label: 'Button with Icon',
 *         icon: 'trash',
 *         title: 'Remove'
 *     } );
 *     $( document.body ).append( button.$element );
 *
 * @class
 * @extends OO.ui.Widget
 * @mixes OO.ui.mixin.ButtonElement
 * @mixes OO.ui.mixin.IconElement
 * @mixes OO.ui.mixin.IndicatorElement
 * @mixes OO.ui.mixin.LabelElement
 * @mixes OO.ui.mixin.TitledElement
 * @mixes OO.ui.mixin.FlaggedElement
 * @mixes OO.ui.mixin.TabIndexedElement
 * @mixes OO.ui.mixin.AccessKeyedElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {boolean} [config.active=false] Whether button should be shown as active
 * @param {string} [config.href=null] Hyperlink to visit when the button is clicked.
 * @param {string} [config.target=null] The frame or window in which to open the hyperlink.
 * @param {boolean} [config.noFollow=true] Search engine traversal hint
 * @param {string|string[]} [config.rel=[]] Relationship attributes for the hyperlink
 */
OO.ui.ButtonWidget = function OoUiButtonWidget( config ) {
	// Configuration initialization
	config = config || {};

	// Parent constructor
	OO.ui.ButtonWidget.super.call( this, config );

	// Mixin constructors
	OO.ui.mixin.ButtonElement.call( this, config );
	OO.ui.mixin.IconElement.call( this, config );
	OO.ui.mixin.IndicatorElement.call( this, config );
	OO.ui.mixin.LabelElement.call( this, config );
	OO.ui.mixin.TitledElement.call( this, Object.assign( {
		$titled: this.$button
	}, config ) );
	OO.ui.mixin.FlaggedElement.call( this, config );
	OO.ui.mixin.TabIndexedElement.call( this, Object.assign( {
		$tabIndexed: this.$button
	}, config ) );
	OO.ui.mixin.AccessKeyedElement.call( this, Object.assign( {
		$accessKeyed: this.$button
	}, config ) );

	// Properties
	this.href = null;
	this.target = null;
	this.noFollow = false;
	this.rel = [];

	// Events
	this.connect( this, {
		disable: 'onDisable'
	} );

	// Initialization
	this.$button.append( this.$icon, this.$label, this.$indicator );
	this.$element
		.addClass( 'oo-ui-buttonWidget' )
		.append( this.$button );
	this.setActive( config.active );
	this.setHref( config.href );
	this.setTarget( config.target );
	if ( config.rel !== undefined ) {
		this.setRel( config.rel );
	} else {
		this.setNoFollow( config.noFollow );
	}
};

/* Setup */

OO.inheritClass( OO.ui.ButtonWidget, OO.ui.Widget );
OO.mixinClass( OO.ui.ButtonWidget, OO.ui.mixin.ButtonElement );
OO.mixinClass( OO.ui.ButtonWidget, OO.ui.mixin.IconElement );
OO.mixinClass( OO.ui.ButtonWidget, OO.ui.mixin.IndicatorElement );
OO.mixinClass( OO.ui.ButtonWidget, OO.ui.mixin.LabelElement );
OO.mixinClass( OO.ui.ButtonWidget, OO.ui.mixin.TitledElement );
OO.mixinClass( OO.ui.ButtonWidget, OO.ui.mixin.FlaggedElement );
OO.mixinClass( OO.ui.ButtonWidget, OO.ui.mixin.TabIndexedElement );
OO.mixinClass( OO.ui.ButtonWidget, OO.ui.mixin.AccessKeyedElement );

/* Static Properties */

/**
 * @static
 * @inheritdoc
 */
OO.ui.ButtonWidget.static.cancelButtonMouseDownEvents = false;

/**
 * @static
 * @inheritdoc
 */
OO.ui.ButtonWidget.static.tagName = 'span';

/* Methods */

/**
 * Get hyperlink location.
 *
 * @return {string|null} Hyperlink location
 */
OO.ui.ButtonWidget.prototype.getHref = function () {
	return this.href;
};

/**
 * Get hyperlink target.
 *
 * @return {string|null} Hyperlink target
 */
OO.ui.ButtonWidget.prototype.getTarget = function () {
	return this.target;
};

/**
 * Get search engine traversal hint.
 *
 * @return {boolean} Whether search engines should avoid traversing this hyperlink
 */
OO.ui.ButtonWidget.prototype.getNoFollow = function () {
	return this.noFollow;
};

/**
 * Get the relationship attribute of the hyperlink.
 *
 * @return {string[]} Relationship attributes that apply to the hyperlink
 */
OO.ui.ButtonWidget.prototype.getRel = function () {
	return this.rel;
};

/**
 * Set hyperlink location.
 *
 * @param {string|null} href Hyperlink location, null to remove
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.ButtonWidget.prototype.setHref = function ( href ) {
	href = typeof href === 'string' ? href : null;
	if ( href !== null && !OO.ui.isSafeUrl( href ) ) {
		href = './' + href;
	}

	if ( href !== this.href ) {
		this.href = href;
		this.updateHref();
	}

	return this;
};

/**
 * Update the `href` attribute, in case of changes to href or
 * disabled state.
 *
 * @private
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.ButtonWidget.prototype.updateHref = function () {
	if ( this.href !== null && !this.isDisabled() ) {
		this.$button.attr( 'href', this.href );
	} else {
		this.$button.removeAttr( 'href' );
	}

	return this;
};

/**
 * Handle disable events.
 *
 * @private
 * @param {boolean} disabled Element is disabled
 */
OO.ui.ButtonWidget.prototype.onDisable = function () {
	this.updateHref();
};

/**
 * Set hyperlink target.
 *
 * @param {string|null} target Hyperlink target, null to remove
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.ButtonWidget.prototype.setTarget = function ( target ) {
	target = typeof target === 'string' ? target : null;

	if ( target !== this.target ) {
		this.target = target;
		if ( target !== null ) {
			this.$button.attr( 'target', target );
		} else {
			this.$button.removeAttr( 'target' );
		}
	}

	return this;
};

/**
 * Set search engine traversal hint.
 *
 * @param {boolean} [noFollow=true] True if search engines should avoid traversing this hyperlink
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.ButtonWidget.prototype.setNoFollow = function ( noFollow ) {
	noFollow = typeof noFollow === 'boolean' ? noFollow : true;

	if ( noFollow !== this.noFollow ) {
		let rel;
		if ( noFollow ) {
			rel = this.rel.concat( [ 'nofollow' ] );
		} else {
			rel = this.rel.filter( ( value ) => value !== 'nofollow' );
		}
		this.setRel( rel );
	}

	return this;
};

/**
 * Set the `rel` attribute of the hyperlink.
 *
 * @param {string|string[]} [rel] Relationship attributes for the hyperlink, omit to remove
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.ButtonWidget.prototype.setRel = function ( rel ) {
	if ( !Array.isArray( rel ) ) {
		rel = rel ? [ rel ] : [];
	}

	this.rel = rel;
	// For backwards compatibility.
	this.noFollow = rel.indexOf( 'nofollow' ) !== -1;
	this.$button.attr( 'rel', rel.join( ' ' ) || null );

	return this;
};

// Override method visibility hints from ButtonElement
/**
 * @method setActive
 * @inheritdoc OO.ui.mixin.ButtonElement
 * @memberof OO.ui.ButtonWidget#
 */
/**
 * @method isActive
 * @inheritdoc OO.ui.mixin.ButtonElement
 * @memberof OO.ui.ButtonWidget#
 */

/**
 * A ButtonGroupWidget groups related buttons and is used together with OO.ui.ButtonWidget and
 * its subclasses. Each button in a group is addressed by a unique reference. Buttons can be added,
 * removed, and cleared from the group.
 *
 *     @example
 *     // A ButtonGroupWidget with two buttons.
 *     const button1 = new OO.ui.PopupButtonWidget( {
 *             label: 'Select a category',
 *             icon: 'menu',
 *             popup: {
 *                 $content: $( '<p>List of categories…</p>' ),
 *                 padded: true,
 *                 align: 'left'
 *             }
 *         } ),
 *         button2 = new OO.ui.ButtonWidget( {
 *             label: 'Add item'
 *         } ),
 *         buttonGroup = new OO.ui.ButtonGroupWidget( {
 *             items: [ button1, button2 ]
 *         } );
 *     $( document.body ).append( buttonGroup.$element );
 *
 * @class
 * @extends OO.ui.Widget
 * @mixes OO.ui.mixin.GroupElement
 * @mixes OO.ui.mixin.TitledElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {OO.ui.ButtonWidget[]} [config.items] Buttons to add
 */
OO.ui.ButtonGroupWidget = function OoUiButtonGroupWidget( config ) {
	// Configuration initialization
	config = config || {};

	// Parent constructor
	OO.ui.ButtonGroupWidget.super.call( this, config );

	// Mixin constructors
	OO.ui.mixin.GroupElement.call( this, Object.assign( {
		$group: this.$element
	}, config ) );
	OO.ui.mixin.TitledElement.call( this, config );

	// Initialization
	this.$element.addClass( 'oo-ui-buttonGroupWidget' );
	this.addItems( config.items || [] );
};

/* Setup */

OO.inheritClass( OO.ui.ButtonGroupWidget, OO.ui.Widget );
OO.mixinClass( OO.ui.ButtonGroupWidget, OO.ui.mixin.GroupElement );
OO.mixinClass( OO.ui.ButtonGroupWidget, OO.ui.mixin.TitledElement );

/* Static Properties */

/**
 * @static
 * @inheritdoc
 */
OO.ui.ButtonGroupWidget.static.tagName = 'span';

/* Methods */

/**
 * Focus the widget
 *
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.ButtonGroupWidget.prototype.focus = function () {
	if ( !this.isDisabled() ) {
		if ( this.items[ 0 ] ) {
			this.items[ 0 ].focus();
		}
	}
	return this;
};

/**
 * @inheritdoc
 */
OO.ui.ButtonGroupWidget.prototype.simulateLabelClick = function () {
	this.focus();
};

/**
 * IconWidget is a generic widget for {@link OO.ui.mixin.IconElement icons}.
 * In general, IconWidgets should be used with OO.ui.LabelWidget, which creates a label that
 * identifies the icon’s function. See the [OOUI documentation on MediaWiki][1]
 * for a list of icons included in the library.
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Widgets/Icons,_Indicators,_and_Labels#Icons
 *
 *     @example
 *     // An IconWidget with a label via LabelWidget.
 *     const myIcon = new OO.ui.IconWidget( {
 *             icon: 'help',
 *             title: 'Help'
 *          } ),
 *          // Create a label.
 *          iconLabel = new OO.ui.LabelWidget( {
 *              label: 'Help'
 *          } );
 *      $( document.body ).append( myIcon.$element, iconLabel.$element );
 *
 * @class
 * @extends OO.ui.Widget
 * @mixes OO.ui.mixin.IconElement
 * @mixes OO.ui.mixin.TitledElement
 * @mixes OO.ui.mixin.LabelElement
 * @mixes OO.ui.mixin.FlaggedElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
OO.ui.IconWidget = function OoUiIconWidget( config ) {
	// Configuration initialization
	config = config || {};

	// Parent constructor
	OO.ui.IconWidget.super.call( this, config );

	// Mixin constructors
	OO.ui.mixin.IconElement.call( this, Object.assign( {
		$icon: this.$element
	}, config ) );
	OO.ui.mixin.TitledElement.call( this, Object.assign( {
		$titled: this.$element
	}, config ) );
	OO.ui.mixin.LabelElement.call( this, Object.assign( {
		$label: this.$element,
		invisibleLabel: true
	}, config ) );
	OO.ui.mixin.FlaggedElement.call( this, Object.assign( {
		$flagged: this.$element
	}, config ) );

	// Initialization
	this.$element.addClass( 'oo-ui-iconWidget' );
	// Remove class added by LabelElement initialization. It causes unexpected CSS to apply when
	// nested in other widgets, because this widget used to not mix in LabelElement.
	this.$element.removeClass( 'oo-ui-labelElement-label' );
};

/* Setup */

OO.inheritClass( OO.ui.IconWidget, OO.ui.Widget );
OO.mixinClass( OO.ui.IconWidget, OO.ui.mixin.IconElement );
OO.mixinClass( OO.ui.IconWidget, OO.ui.mixin.TitledElement );
OO.mixinClass( OO.ui.IconWidget, OO.ui.mixin.LabelElement );
OO.mixinClass( OO.ui.IconWidget, OO.ui.mixin.FlaggedElement );

/* Static Properties */

/**
 * @static
 * @inheritdoc
 */
OO.ui.IconWidget.static.tagName = 'span';

/**
 * IndicatorWidgets create indicators, which are small graphics that are generally used to draw
 * attention to the status of an item or to clarify the function within a control. For a list of
 * indicators included in the library, please see the [OOUI documentation on MediaWiki][1].
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Widgets/Icons,_Indicators,_and_Labels#Indicators
 *
 *     @example
 *     // An indicator widget.
 *     const indicator1 = new OO.ui.IndicatorWidget( {
 *             indicator: 'required'
 *         } ),
 *         // Create a fieldset layout to add a label.
 *         fieldset = new OO.ui.FieldsetLayout();
 *     fieldset.addItems( [
 *         new OO.ui.FieldLayout( indicator1, {
 *             label: 'A required indicator:'
 *         } )
 *     ] );
 *     $( document.body ).append( fieldset.$element );
 *
 * @class
 * @extends OO.ui.Widget
 * @mixes OO.ui.mixin.IndicatorElement
 * @mixes OO.ui.mixin.TitledElement
 * @mixes OO.ui.mixin.LabelElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
OO.ui.IndicatorWidget = function OoUiIndicatorWidget( config ) {
	// Configuration initialization
	config = config || {};

	// Parent constructor
	OO.ui.IndicatorWidget.super.call( this, config );

	// Mixin constructors
	OO.ui.mixin.IndicatorElement.call( this, Object.assign( {
		$indicator: this.$element
	}, config ) );
	OO.ui.mixin.TitledElement.call( this, Object.assign( {
		$titled: this.$element
	}, config ) );
	OO.ui.mixin.LabelElement.call( this, Object.assign( {
		$label: this.$element,
		invisibleLabel: true
	}, config ) );

	// Initialization
	this.$element.addClass( 'oo-ui-indicatorWidget' );
	// Remove class added by LabelElement initialization. It causes unexpected CSS to apply when
	// nested in other widgets, because this widget used to not mix in LabelElement.
	this.$element.removeClass( 'oo-ui-labelElement-label' );
};

/* Setup */

OO.inheritClass( OO.ui.IndicatorWidget, OO.ui.Widget );
OO.mixinClass( OO.ui.IndicatorWidget, OO.ui.mixin.IndicatorElement );
OO.mixinClass( OO.ui.IndicatorWidget, OO.ui.mixin.TitledElement );
OO.mixinClass( OO.ui.IndicatorWidget, OO.ui.mixin.LabelElement );

/* Static Properties */

/**
 * @static
 * @inheritdoc
 */
OO.ui.IndicatorWidget.static.tagName = 'span';

/**
 * LabelWidgets help identify the function of interface elements. Each LabelWidget can
 * be configured with a `label` option that is set to a string, a label node, or a function:
 *
 * - String: a plaintext string
 * - jQuery selection: a jQuery selection, used for anything other than a plaintext label, e.g., a
 *   label that includes a link or special styling, such as a gray color or additional
 *   graphical elements.
 * - Function: a function that will produce a string in the future. Functions are used
 *   in cases where the value of the label is not currently defined.
 *
 * In addition, the LabelWidget can be associated with an {@link OO.ui.InputWidget input widget},
 * which will come into focus when the label is clicked.
 *
 *     @example
 *     // Two LabelWidgets.
 *     const label1 = new OO.ui.LabelWidget( {
 *             label: 'plaintext label'
 *         } ),
 *         label2 = new OO.ui.LabelWidget( {
 *             label: $( '<a>' ).attr( 'href', 'default.html' ).text( 'jQuery label' )
 *         } ),
 *         // Create a fieldset layout with fields for each example.
 *         fieldset = new OO.ui.FieldsetLayout();
 *     fieldset.addItems( [
 *         new OO.ui.FieldLayout( label1 ),
 *         new OO.ui.FieldLayout( label2 )
 *     ] );
 *     $( document.body ).append( fieldset.$element );
 *
 * @class
 * @extends OO.ui.Widget
 * @mixes OO.ui.mixin.LabelElement
 * @mixes OO.ui.mixin.TitledElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {OO.ui.InputWidget} [config.input] {@link OO.ui.InputWidget Input widget} that uses the label.
 *  Clicking the label will focus the specified input field.
 */
OO.ui.LabelWidget = function OoUiLabelWidget( config ) {
	// Configuration initialization
	config = config || {};

	// Parent constructor
	OO.ui.LabelWidget.super.call( this, config );

	// Mixin constructors
	OO.ui.mixin.LabelElement.call( this, Object.assign( {
		$label: this.$element
	}, config ) );
	OO.ui.mixin.TitledElement.call( this, config );

	// Properties
	this.input = config.input;

	// Initialization
	if ( this.input ) {
		if ( this.input.getInputId() ) {
			this.$element.attr( 'for', this.input.getInputId() );
		} else {
			this.$label.on( 'click', () => {
				this.input.simulateLabelClick();
			} );
		}
	}
	this.$element.addClass( 'oo-ui-labelWidget' );
};

/* Setup */

OO.inheritClass( OO.ui.LabelWidget, OO.ui.Widget );
OO.mixinClass( OO.ui.LabelWidget, OO.ui.mixin.LabelElement );
OO.mixinClass( OO.ui.LabelWidget, OO.ui.mixin.TitledElement );

/* Static Properties */

/**
 * @static
 * @inheritdoc
 */
OO.ui.LabelWidget.static.tagName = 'label';

/**
 * MessageWidget produces a visual component for sending a notice to the user
 * with an icon and distinct design noting its purpose. The MessageWidget changes
 * its visual presentation based on the type chosen, which also denotes its UX
 * purpose.
 *
 * @class
 * @extends OO.ui.Widget
 * @mixes OO.ui.mixin.IconElement
 * @mixes OO.ui.mixin.LabelElement
 * @mixes OO.ui.mixin.TitledElement
 * @mixes OO.ui.mixin.FlaggedElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {string} [config.type='notice'] The type of the notice widget. This will also
 *  impact the flags that the widget receives (and hence its CSS design) as well
 *  as the icon that appears. Available types:
 *  'notice', 'error', 'warning', 'success'
 * @param {boolean} [config.inline=false] Set the notice as an inline notice. The default
 *  is not inline, or 'boxed' style.
 * @param {boolean} [config.showClose] Show a close button. Can't be used with inline.
 */
OO.ui.MessageWidget = function OoUiMessageWidget( config ) {
	// Configuration initialization
	config = config || {};

	// Parent constructor
	OO.ui.MessageWidget.super.call( this, config );

	// Mixin constructors
	OO.ui.mixin.IconElement.call( this, config );
	OO.ui.mixin.LabelElement.call( this, config );
	OO.ui.mixin.TitledElement.call( this, config );
	OO.ui.mixin.FlaggedElement.call( this, config );

	// Set type
	this.setType( config.type );
	this.setInline( config.inline );

	// If an icon is passed in, set it again as setType will
	// have overridden the setIcon call in the IconElement constructor
	if ( config.icon ) {
		this.setIcon( config.icon );
	}

	if ( !this.inline && config.showClose ) {
		this.closeButton = new OO.ui.ButtonWidget( {
			classes: [ 'oo-ui-messageWidget-close' ],
			framed: false,
			icon: 'close',
			label: OO.ui.msg( 'ooui-popup-widget-close-button-aria-label' ),
			invisibleLabel: true
		} );
		this.closeButton.connect( this, {
			click: 'onCloseButtonClick'
		} );
		this.$element.addClass( 'oo-ui-messageWidget-showClose' );
	}

	// Build the widget
	this.$element
		.append( this.$icon, this.$label, this.closeButton && this.closeButton.$element )
		.addClass( 'oo-ui-messageWidget' );
};

/* Setup */

OO.inheritClass( OO.ui.MessageWidget, OO.ui.Widget );
OO.mixinClass( OO.ui.MessageWidget, OO.ui.mixin.IconElement );
OO.mixinClass( OO.ui.MessageWidget, OO.ui.mixin.LabelElement );
OO.mixinClass( OO.ui.MessageWidget, OO.ui.mixin.TitledElement );
OO.mixinClass( OO.ui.MessageWidget, OO.ui.mixin.FlaggedElement );

/* Events */

/**
 * @event OO.ui.MessageWidget#close
 */

/* Static Properties */

/**
 * An object defining the icon name per defined type.
 *
 * @static
 * @property {Object}
 */
OO.ui.MessageWidget.static.iconMap = {
	notice: 'infoFilled',
	error: 'error',
	warning: 'alert',
	success: 'success'
};

/* Methods */

/**
 * Set the inline state of the widget.
 *
 * @param {boolean} [inline=false] Widget is inline
 */
OO.ui.MessageWidget.prototype.setInline = function ( inline ) {
	inline = !!inline;

	if ( this.inline !== inline ) {
		this.inline = inline;
		this.$element
			.toggleClass( 'oo-ui-messageWidget-block', !this.inline );
	}
};
/**
 * Set the widget type. The given type must belong to the list of
 * legal types set by OO.ui.MessageWidget.static.iconMap
 *
 * @param {string} [type='notice']
 */
OO.ui.MessageWidget.prototype.setType = function ( type ) {
	if ( !this.constructor.static.iconMap[ type ] ) {
		type = 'notice';
	}

	if ( this.type !== type ) {
		// Flags
		this.clearFlags();
		this.setFlags( type );

		// Set the icon and its variant
		this.setIcon( this.constructor.static.iconMap[ type ] );
		this.$icon.removeClass( 'oo-ui-image-' + this.type );
		this.$icon.addClass( 'oo-ui-image-' + type );

		if ( type === 'error' ) {
			this.$element.attr( 'role', 'alert' );
			this.$element.removeAttr( 'aria-live' );
		} else {
			this.$element.removeAttr( 'role' );
			this.$element.attr( 'aria-live', 'polite' );
		}

		this.type = type;
	}
};

/**
 * Handle click events on the close button
 *
 * @param {jQuery} e jQuery event
 * @fires OO.ui.MessageWidget#close
 */
OO.ui.MessageWidget.prototype.onCloseButtonClick = function () {
	this.toggle( false );
	this.emit( 'close' );
};

/**
 * ToggleWidget implements basic behavior of widgets with an on/off state.
 * Please see OO.ui.ToggleButtonWidget and OO.ui.ToggleSwitchWidget for examples.
 *
 * @abstract
 * @class
 * @extends OO.ui.Widget
 * @mixes OO.ui.mixin.TitledElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {boolean} [config.value=false] The toggle’s initial on/off state.
 *  By default, the toggle is in the 'off' state.
 */
OO.ui.ToggleWidget = function OoUiToggleWidget( config ) {
	// Configuration initialization
	config = config || {};

	// Parent constructor
	OO.ui.ToggleWidget.super.call( this, config );

	// Mixin constructor
	OO.ui.mixin.TitledElement.call( this, config );

	// Properties
	this.value = null;

	// Initialization
	this.$element.addClass( 'oo-ui-toggleWidget' );
	this.setValue( !!config.value );
};

/* Setup */

OO.inheritClass( OO.ui.ToggleWidget, OO.ui.Widget );
OO.mixinClass( OO.ui.ToggleWidget, OO.ui.mixin.TitledElement );

/* Events */

/**
 * A change event is emitted when the on/off state of the toggle changes.
 *
 * @event OO.ui.ToggleWidget#change
 * @param {boolean} value Value representing the new state of the toggle
 */

/* Methods */

/**
 * Get the value representing the toggle’s state.
 *
 * @return {boolean} The on/off state of the toggle
 */
OO.ui.ToggleWidget.prototype.getValue = function () {
	return this.value;
};

/**
 * Set the state of the toggle: `true` for 'on', `false` for 'off'.
 *
 * @param {boolean} [value=false] The state of the toggle
 * @fires OO.ui.ToggleWidget#change
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.ToggleWidget.prototype.setValue = function ( value ) {
	value = !!value;
	if ( this.value !== value ) {
		this.value = value;
		this.emit( 'change', value );
		this.$element.toggleClass( 'oo-ui-toggleWidget-on', value );
		this.$element.toggleClass( 'oo-ui-toggleWidget-off', !value );
	}
	return this;
};

/**
 * ToggleSwitches are switches that slide on and off. Their state is represented by a Boolean
 * value (`true` for ‘on’, and `false` otherwise, the default). The ‘off’ state is represented
 * visually by a slider in the leftmost position.
 *
 *     @example
 *     // Toggle switches in the 'off' and 'on' position.
 *     const toggleSwitch1 = new OO.ui.ToggleSwitchWidget(),
 *         toggleSwitch2 = new OO.ui.ToggleSwitchWidget( {
 *             value: true
 *         } );
 *         // Create a FieldsetLayout to layout and label switches.
 *         fieldset = new OO.ui.FieldsetLayout( {
 *             label: 'Toggle switches'
 *         } );
 *     fieldset.addItems( [
 *         new OO.ui.FieldLayout( toggleSwitch1, {
 *             label: 'Off',
 *             align: 'top'
 *         } ),
 *         new OO.ui.FieldLayout( toggleSwitch2, {
 *             label: 'On',
 *             align: 'top'
 *         } )
 *     ] );
 *     $( document.body ).append( fieldset.$element );
 *
 * @class
 * @extends OO.ui.ToggleWidget
 * @mixes OO.ui.mixin.TabIndexedElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {boolean} [config.value=false] The toggle switch’s initial on/off state.
 *  By default, the toggle switch is in the 'off' position.
 */
OO.ui.ToggleSwitchWidget = function OoUiToggleSwitchWidget( config ) {
	// Parent constructor
	OO.ui.ToggleSwitchWidget.super.call( this, config );

	// Mixin constructors
	OO.ui.mixin.TabIndexedElement.call( this, config );

	// Properties
	this.dragging = false;
	this.dragStart = null;
	this.sliding = false;
	this.$glow = $( '<span>' );
	this.$grip = $( '<span>' );

	// Events
	this.$element.on( {
		click: this.onClick.bind( this ),
		keypress: this.onKeyPress.bind( this )
	} );

	// Initialization
	this.$glow.addClass( 'oo-ui-toggleSwitchWidget-glow' );
	this.$grip.addClass( 'oo-ui-toggleSwitchWidget-grip' );
	this.$element
		.addClass( 'oo-ui-toggleSwitchWidget' )
		.attr( 'role', 'switch' )
		.append( this.$glow, this.$grip );
};

/* Setup */

OO.inheritClass( OO.ui.ToggleSwitchWidget, OO.ui.ToggleWidget );
OO.mixinClass( OO.ui.ToggleSwitchWidget, OO.ui.mixin.TabIndexedElement );

/* Methods */

/**
 * Handle mouse click events.
 *
 * @private
 * @param {jQuery.Event} e Mouse click event
 * @return {undefined|boolean} False to prevent default if event is handled
 */
OO.ui.ToggleSwitchWidget.prototype.onClick = function ( e ) {
	if ( !this.isDisabled() && e.which === OO.ui.MouseButtons.LEFT ) {
		this.setValue( !this.value );
	}
	return false;
};

/**
 * Handle key press events.
 *
 * @private
 * @param {jQuery.Event} e Key press event
 * @return {undefined|boolean} False to prevent default if event is handled
 */
OO.ui.ToggleSwitchWidget.prototype.onKeyPress = function ( e ) {
	if ( !this.isDisabled() && ( e.which === OO.ui.Keys.SPACE || e.which === OO.ui.Keys.ENTER ) ) {
		this.setValue( !this.value );
		return false;
	}
};

/**
 * @inheritdoc
 */
OO.ui.ToggleSwitchWidget.prototype.setValue = function ( value ) {
	OO.ui.ToggleSwitchWidget.super.prototype.setValue.call( this, value );
	this.$element.attr( 'aria-checked', this.value.toString() );
	return this;
};

/**
 * @inheritdoc
 */
OO.ui.ToggleSwitchWidget.prototype.simulateLabelClick = function () {
	if ( !this.isDisabled() ) {
		this.setValue( !this.value );
	}
	this.focus();
};

/**
 * PendingElement is a mixin that is used to create elements that notify users that something is
 * happening and that they should wait before proceeding. The pending state is visually represented
 * with a pending texture that appears in the head of a pending
 * {@link OO.ui.ProcessDialog process dialog} or in the input field of a
 * {@link OO.ui.TextInputWidget text input widget}.
 *
 * Currently, {@link OO.ui.ActionWidget Action widgets}, which mix in this class, can also be marked
 * as pending, but only when used in {@link OO.ui.MessageDialog message dialogs}. The behavior is
 * not currently supported for action widgets used in process dialogs.
 *
 *     @example
 *     function MessageDialog( config ) {
 *         MessageDialog.super.call( this, config );
 *     }
 *     OO.inheritClass( MessageDialog, OO.ui.MessageDialog );
 *
 *     MessageDialog.static.name = 'myMessageDialog';
 *     MessageDialog.static.actions = [
 *         { action: 'save', label: 'Done', flags: 'primary' },
 *         { label: 'Cancel', flags: 'safe' }
 *     ];
 *
 *     MessageDialog.prototype.initialize = function () {
 *         MessageDialog.super.prototype.initialize.apply( this, arguments );
 *         this.content = new OO.ui.PanelLayout( { padded: true } );
 *         this.content.$element.append( '<p>Click the \'Done\' action widget to see its pending ' +
 *             'state. Note that action widgets can be marked pending in message dialogs but not ' +
 *             'process dialogs.</p>' );
 *         this.$body.append( this.content.$element );
 *     };
 *     MessageDialog.prototype.getBodyHeight = function () {
 *         return 100;
 *     }
 *     MessageDialog.prototype.getActionProcess = function ( action ) {
 *         if ( action === 'save' ) {
 *             this.getActions().get({actions: 'save'})[0].pushPending();
 *             return new OO.ui.Process()
 *                 .next( 1000 )
 *                 .next( () => {
 *                     this.getActions().get({actions: 'save'})[0].popPending();
 *                 } );
 *         }
 *         return MessageDialog.super.prototype.getActionProcess.call( this, action );
 *     };
 *
 *     const windowManager = new OO.ui.WindowManager();
 *     $( document.body ).append( windowManager.$element );
 *
 *     const dialog = new MessageDialog();
 *     windowManager.addWindows( [ dialog ] );
 *     windowManager.openWindow( dialog );
 *
 * @abstract
 * @class
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {jQuery} [config.$pending] Element to mark as pending, defaults to this.$element
 */
OO.ui.mixin.PendingElement = function OoUiMixinPendingElement( config ) {
	// Configuration initialization
	config = config || {};

	// Properties
	this.pending = 0;
	this.$pending = null;

	// Initialisation
	this.setPendingElement( config.$pending || this.$element );
};

/* Setup */

OO.initClass( OO.ui.mixin.PendingElement );

/* Methods */

/**
 * Set the pending element (and clean up any existing one).
 *
 * @param {jQuery} $pending The element to set to pending.
 */
OO.ui.mixin.PendingElement.prototype.setPendingElement = function ( $pending ) {
	if ( this.$pending ) {
		this.$pending.removeClass( 'oo-ui-pendingElement-pending' );
	}

	this.$pending = $pending;
	if ( this.pending > 0 ) {
		this.$pending.addClass( 'oo-ui-pendingElement-pending' );
	}
};

/**
 * Check if an element is pending.
 *
 * @return {boolean} Element is pending
 */
OO.ui.mixin.PendingElement.prototype.isPending = function () {
	return !!this.pending;
};

/**
 * Increase the pending counter. The pending state will remain active until the counter is zero
 * (i.e., the number of calls to #pushPending and #popPending is the same).
 *
 * @chainable
 * @return {OO.ui.Element} The element, for chaining
 */
OO.ui.mixin.PendingElement.prototype.pushPending = function () {
	if ( this.pending === 0 ) {
		this.$pending.addClass( 'oo-ui-pendingElement-pending' );
		this.updateThemeClasses();
	}
	this.pending++;

	return this;
};

/**
 * Decrease the pending counter. The pending state will remain active until the counter is zero
 * (i.e., the number of calls to #pushPending and #popPending is the same).
 *
 * @chainable
 * @return {OO.ui.Element} The element, for chaining
 */
OO.ui.mixin.PendingElement.prototype.popPending = function () {
	if ( this.pending === 1 ) {
		this.$pending.removeClass( 'oo-ui-pendingElement-pending' );
		this.updateThemeClasses();
	}
	this.pending = Math.max( 0, this.pending - 1 );

	return this;
};

/**
 * Element that will stick adjacent to a specified container, even when it is inserted elsewhere
 * in the document (for example, in an OO.ui.Window's $overlay).
 *
 * The elements's position is automatically calculated and maintained when window is resized or the
 * page is scrolled. If you reposition the container manually, you have to call #position to make
 * sure the element is still placed correctly.
 *
 * As positioning is only possible when both the element and the container are attached to the DOM
 * and visible, it's only done after you call #togglePositioning. You might want to do this inside
 * the #toggle method to display a floating popup, for example.
 *
 * @abstract
 * @class
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {jQuery} [config.$floatable] Node to position, assigned to #$floatable, omit to use #$element
 * @param {jQuery} [config.$floatableContainer] Node to position adjacent to
 * @param {string} [config.verticalPosition='below'] Where to position $floatable vertically:
 *  'below': Directly below $floatableContainer, aligning f's top edge with fC's bottom edge
 *  'above': Directly above $floatableContainer, aligning f's bottom edge with fC's top edge
 *  'top': Align the top edge with $floatableContainer's top edge
 *  'bottom': Align the bottom edge with $floatableContainer's bottom edge
 *  'center': Vertically align the center with $floatableContainer's center
 * @param {string} [config.horizontalPosition='start'] Where to position $floatable horizontally:
 *  'before': Directly before $floatableContainer, aligning f's end edge with fC's start edge
 *  'after': Directly after $floatableContainer, aligning f's start edge with fC's end edge
 *  'start': Align the start (left in LTR, right in RTL) edge with $floatableContainer's start edge
 *  'end': Align the end (right in LTR, left in RTL) edge with $floatableContainer's end edge
 *  'center': Horizontally align the center with $floatableContainer's center
 * @param {boolean} [config.hideWhenOutOfView=true] Whether to hide the floatable element if the
 *   container is out of view
 * @param {number} [config.spacing=0] Spacing from $floatableContainer, when $floatable is
 *  positioned outside the container (i.e. below/above/before/after).
 */
OO.ui.mixin.FloatableElement = function OoUiMixinFloatableElement( config ) {
	// Configuration initialization
	config = config || {};

	// Properties
	this.$floatable = null;
	this.$floatableContainer = null;
	this.$floatableWindow = null;
	this.$floatableClosestScrollable = null;
	this.floatableOutOfView = false;
	this.onFloatableScrollHandler = this.position.bind( this );
	this.onFloatableWindowResizeHandler = this.position.bind( this );

	// Initialization
	this.setFloatableContainer( config.$floatableContainer );
	this.setFloatableElement( config.$floatable || this.$element );
	this.setVerticalPosition( config.verticalPosition || 'below' );
	this.setHorizontalPosition( config.horizontalPosition || 'start' );
	this.spacing = config.spacing || 0;
	this.hideWhenOutOfView = config.hideWhenOutOfView === undefined ?
		true : !!config.hideWhenOutOfView;
};

/* Methods */

/**
 * Set floatable element.
 *
 * If an element is already set, it will be cleaned up before setting up the new element.
 *
 * @param {jQuery} $floatable Element to make floatable
 */
OO.ui.mixin.FloatableElement.prototype.setFloatableElement = function ( $floatable ) {
	if ( this.$floatable ) {
		this.$floatable.removeClass( 'oo-ui-floatableElement-floatable' );
		this.$floatable.css( { top: '', left: '', bottom: '', right: '' } );
	}

	this.$floatable = $floatable.addClass( 'oo-ui-floatableElement-floatable' );
	this.position();
};

/**
 * Set floatable container.
 *
 * The element will be positioned relative to the specified container.
 *
 * @param {jQuery|null} $floatableContainer Container to keep visible, or null to unset
 */
OO.ui.mixin.FloatableElement.prototype.setFloatableContainer = function ( $floatableContainer ) {
	this.$floatableContainer = $floatableContainer;
	if ( this.$floatable ) {
		this.position();
	}
};

/**
 * Change how the element is positioned vertically.
 *
 * @param {string} position 'below', 'above', 'top', 'bottom' or 'center'
 */
OO.ui.mixin.FloatableElement.prototype.setVerticalPosition = function ( position ) {
	if ( [ 'below', 'above', 'top', 'bottom', 'center' ].indexOf( position ) === -1 ) {
		throw new Error( 'Invalid value for vertical position: ' + position );
	}
	if ( this.verticalPosition !== position ) {
		this.verticalPosition = position;
		if ( this.$floatable ) {
			this.position();
		}
	}
};

/**
 * Change how the element is positioned horizontally.
 *
 * @param {string} position 'before', 'after', 'start', 'end' or 'center'
 */
OO.ui.mixin.FloatableElement.prototype.setHorizontalPosition = function ( position ) {
	if ( [ 'before', 'after', 'start', 'end', 'center' ].indexOf( position ) === -1 ) {
		throw new Error( 'Invalid value for horizontal position: ' + position );
	}
	if ( this.horizontalPosition !== position ) {
		this.horizontalPosition = position;
		if ( this.$floatable ) {
			this.position();
		}
	}
};

/**
 * Toggle positioning.
 *
 * Do not turn positioning on until after the element is attached to the DOM and visible.
 *
 * @param {boolean} [positioning] Enable positioning, omit to toggle
 * @chainable
 * @return {OO.ui.Element} The element, for chaining
 */
OO.ui.mixin.FloatableElement.prototype.togglePositioning = function ( positioning ) {
	if ( !this.$floatable || !this.$floatableContainer ) {
		return this;
	}

	positioning = positioning === undefined ? !this.positioning : !!positioning;

	if ( positioning && !this.warnedUnattached && !this.isElementAttached() ) {
		OO.ui.warnDeprecation( 'FloatableElement#togglePositioning: Before calling this method, the element must be attached to the DOM.' );
		this.warnedUnattached = true;
	}

	if ( this.positioning !== positioning ) {
		this.positioning = positioning;

		let closestScrollableOfContainer = OO.ui.Element.static.getClosestScrollableContainer(
			this.$floatableContainer[ 0 ]
		);
		// If the scrollable is the root, we have to listen to scroll events
		// on the window because of browser inconsistencies.
		if ( $( closestScrollableOfContainer ).is( 'html, body' ) ) {
			closestScrollableOfContainer = OO.ui.Element.static.getWindow(
				closestScrollableOfContainer
			);
		}

		if ( positioning ) {
			this.$floatableWindow = $( this.getElementWindow() );
			this.$floatableWindow.on( 'resize', this.onFloatableWindowResizeHandler );

			this.$floatableClosestScrollable = $( closestScrollableOfContainer );
			this.$floatableClosestScrollable.on( 'scroll', this.onFloatableScrollHandler );

			// Initial position after visible
			this.position();
		} else {
			if ( this.$floatableWindow ) {
				this.$floatableWindow.off( 'resize', this.onFloatableWindowResizeHandler );
				this.$floatableWindow = null;
			}

			if ( this.$floatableClosestScrollable ) {
				this.$floatableClosestScrollable.off( 'scroll', this.onFloatableScrollHandler );
				this.$floatableClosestScrollable = null;
			}

			this.$floatable.css( { top: '', left: '', bottom: '', right: '' } );
		}
	}

	return this;
};

/**
 * Check whether the bottom edge of the given element is within the viewport of the given
 * container.
 *
 * @private
 * @param {jQuery} $element
 * @param {jQuery} $container
 * @return {boolean}
 */
OO.ui.mixin.FloatableElement.prototype.isElementInViewport = function ( $element, $container ) {
	const direction = $element.css( 'direction' );

	const elemRect = $element[ 0 ].getBoundingClientRect();
	let contRect;
	if ( $container[ 0 ] === window ) {
		const viewportSpacing = OO.ui.getViewportSpacing();
		contRect = {
			top: 0,
			left: 0,
			right: document.documentElement.clientWidth,
			bottom: document.documentElement.clientHeight
		};
		contRect.top += viewportSpacing.top;
		contRect.left += viewportSpacing.left;
		contRect.right -= viewportSpacing.right;
		contRect.bottom -= viewportSpacing.bottom;
	} else {
		contRect = $container[ 0 ].getBoundingClientRect();
	}

	const topEdgeInBounds = elemRect.top >= contRect.top && elemRect.top <= contRect.bottom;
	const bottomEdgeInBounds = elemRect.bottom >= contRect.top && elemRect.bottom <= contRect.bottom;
	const leftEdgeInBounds = elemRect.left >= contRect.left && elemRect.left <= contRect.right;
	const rightEdgeInBounds = elemRect.right >= contRect.left && elemRect.right <= contRect.right;
	let startEdgeInBounds, endEdgeInBounds;
	if ( direction === 'rtl' ) {
		startEdgeInBounds = rightEdgeInBounds;
		endEdgeInBounds = leftEdgeInBounds;
	} else {
		startEdgeInBounds = leftEdgeInBounds;
		endEdgeInBounds = rightEdgeInBounds;
	}

	if ( this.verticalPosition === 'below' && !bottomEdgeInBounds ) {
		return false;
	}
	if ( this.verticalPosition === 'above' && !topEdgeInBounds ) {
		return false;
	}
	if ( this.horizontalPosition === 'before' && !startEdgeInBounds ) {
		return false;
	}
	if ( this.horizontalPosition === 'after' && !endEdgeInBounds ) {
		return false;
	}

	// The other positioning values are all about being inside the container,
	// so in those cases all we care about is that any part of the container is visible.
	return elemRect.top <= contRect.bottom && elemRect.bottom >= contRect.top &&
		elemRect.left <= contRect.right && elemRect.right >= contRect.left;
};

/**
 * Check if the floatable is hidden to the user because it was offscreen.
 *
 * @return {boolean} Floatable is out of view
 */
OO.ui.mixin.FloatableElement.prototype.isFloatableOutOfView = function () {
	return this.floatableOutOfView;
};

/**
 * Position the floatable below its container.
 *
 * This should only be done when both of them are attached to the DOM and visible.
 *
 * @chainable
 * @return {OO.ui.Element} The element, for chaining
 */
OO.ui.mixin.FloatableElement.prototype.position = function () {
	if ( !this.positioning ) {
		return this;
	}

	if ( !(
		// To continue, some things need to be true:
		// The element must actually be in the DOM
		this.isElementAttached() && (
			// The closest scrollable is the current window
			this.$floatableClosestScrollable[ 0 ] === this.getElementWindow() ||
			// OR is an element in the element's DOM
			$.contains( this.getElementDocument(), this.$floatableClosestScrollable[ 0 ] )
		)
	) ) {
		// Abort early if important parts of the widget are no longer attached to the DOM
		return this;
	}

	this.floatableOutOfView = this.hideWhenOutOfView &&
		!this.isElementInViewport( this.$floatableContainer, this.$floatableClosestScrollable );
	this.$floatable.toggleClass( 'oo-ui-element-hidden', this.floatableOutOfView );
	if ( this.floatableOutOfView ) {
		return this;
	}

	this.$floatable.css( this.computePosition() );

	// We updated the position, so re-evaluate the clipping state.
	// (ClippableElement does not listen to 'scroll' events on $floatableContainer's parent, and so
	// will not notice the need to update itself.)
	// TODO: This is terrible, we shouldn't need to know about ClippableElement at all here.
	// Why does it not listen to the right events in the right places?
	if ( this.clip ) {
		this.clip();
	}

	return this;
};

/**
 * Compute how #$floatable should be positioned based on the position of #$floatableContainer
 * and the positioning settings. This is a helper for #position that shouldn't be called directly,
 * but may be overridden by subclasses if they want to change or add to the positioning logic.
 *
 * @return {Object} New position to apply with .css(). Keys are 'top', 'left', 'bottom' and 'right'.
 */
OO.ui.mixin.FloatableElement.prototype.computePosition = function () {
	const newPos = { top: '', left: '', bottom: '', right: '' };
	const direction = this.$floatableContainer.css( 'direction' );

	let $offsetParent = this.$floatable.offsetParent();

	if ( $offsetParent.is( 'html' ) ) {
		// The innerHeight/Width and clientHeight/Width calculations don't work well on the
		// <html> element, but they do work on the <body>
		$offsetParent = $( $offsetParent[ 0 ].ownerDocument.body );
	}
	const isBody = $offsetParent.is( 'body' );
	const scrollableX = $offsetParent.css( 'overflow-x' ) === 'scroll' ||
		$offsetParent.css( 'overflow-x' ) === 'auto';
	const scrollableY = $offsetParent.css( 'overflow-y' ) === 'scroll' ||
		$offsetParent.css( 'overflow-y' ) === 'auto';

	const vertScrollbarWidth = $offsetParent.innerWidth() - $offsetParent.prop( 'clientWidth' );
	const horizScrollbarHeight = $offsetParent.innerHeight() - $offsetParent.prop( 'clientHeight' );
	// We don't need to compute and add scrollTop and scrollLeft if the scrollable container
	// is the body, or if it isn't scrollable
	const scrollTop = scrollableY && !isBody ?
		$offsetParent.scrollTop() : 0;
	const scrollLeft = scrollableX && !isBody ?
		OO.ui.Element.static.getScrollLeft( $offsetParent[ 0 ] ) : 0;

	// Avoid passing the <body> to getRelativePosition(), because it won't return what we expect
	// if the <body> has a margin
	const containerPos = isBody ?
		this.$floatableContainer.offset() :
		OO.ui.Element.static.getRelativePosition( this.$floatableContainer, $offsetParent );
	containerPos.bottom = containerPos.top + this.$floatableContainer.outerHeight();
	containerPos.right = containerPos.left + this.$floatableContainer.outerWidth();
	containerPos.start = direction === 'rtl' ? containerPos.right : containerPos.left;
	containerPos.end = direction === 'rtl' ? containerPos.left : containerPos.right;

	if ( this.verticalPosition === 'below' ) {
		newPos.top = containerPos.bottom + this.spacing;
	} else if ( this.verticalPosition === 'above' ) {
		newPos.bottom = $offsetParent.outerHeight() - containerPos.top + this.spacing;
	} else if ( this.verticalPosition === 'top' ) {
		newPos.top = containerPos.top;
	} else if ( this.verticalPosition === 'bottom' ) {
		newPos.bottom = $offsetParent.outerHeight() - containerPos.bottom;
	} else if ( this.verticalPosition === 'center' ) {
		newPos.top = containerPos.top +
			( this.$floatableContainer.height() - this.$floatable.height() ) / 2;
	}

	if ( this.horizontalPosition === 'before' ) {
		newPos.end = containerPos.start - this.spacing;
	} else if ( this.horizontalPosition === 'after' ) {
		newPos.start = containerPos.end + this.spacing;
	} else if ( this.horizontalPosition === 'start' ) {
		newPos.start = containerPos.start;
	} else if ( this.horizontalPosition === 'end' ) {
		newPos.end = containerPos.end;
	} else if ( this.horizontalPosition === 'center' ) {
		newPos.left = containerPos.left +
			( this.$floatableContainer.width() - this.$floatable.width() ) / 2;
	}

	if ( newPos.start !== undefined ) {
		if ( direction === 'rtl' ) {
			newPos.right = ( isBody ? $( $offsetParent[ 0 ].ownerDocument.documentElement ) :
				$offsetParent ).outerWidth() - newPos.start;
		} else {
			newPos.left = newPos.start;
		}
		delete newPos.start;
	}
	if ( newPos.end !== undefined ) {
		if ( direction === 'rtl' ) {
			newPos.left = newPos.end;
		} else {
			newPos.right = ( isBody ? $( $offsetParent[ 0 ].ownerDocument.documentElement ) :
				$offsetParent ).outerWidth() - newPos.end;
		}
		delete newPos.end;
	}

	// Account for scroll position
	if ( newPos.top !== '' ) {
		newPos.top += scrollTop;
	}
	if ( newPos.bottom !== '' ) {
		newPos.bottom -= scrollTop;
	}
	if ( newPos.left !== '' ) {
		newPos.left += scrollLeft;
	}
	if ( newPos.right !== '' ) {
		newPos.right -= scrollLeft;
	}

	// Account for scrollbar gutter
	if ( newPos.bottom !== '' ) {
		newPos.bottom -= horizScrollbarHeight;
	}
	if ( direction === 'rtl' ) {
		if ( newPos.left !== '' ) {
			newPos.left -= vertScrollbarWidth;
		}
	} else {
		if ( newPos.right !== '' ) {
			newPos.right -= vertScrollbarWidth;
		}
	}

	return newPos;
};

/**
 * Element that can be automatically clipped to visible boundaries.
 *
 * Whenever the element's natural height changes, you have to call
 * {@link OO.ui.mixin.ClippableElement#clip} to make sure it's still
 * clipping correctly.
 *
 * The dimensions of #$clippableContainer will be compared to the boundaries of the
 * nearest scrollable container. If #$clippableContainer is too tall and/or too wide,
 * then #$clippable will be given a fixed reduced height and/or width and will be made
 * scrollable. By default, #$clippable and #$clippableContainer are the same element,
 * but you can build a static footer by setting #$clippableContainer to an element that contains
 * #$clippable and the footer.
 *
 * @abstract
 * @class
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {jQuery} [config.$clippable] Node to clip, assigned to #$clippable, omit to use #$element
 * @param {jQuery} [config.$clippableContainer] Node to keep visible, assigned to #$clippableContainer,
 *   omit to use #$clippable
 */
OO.ui.mixin.ClippableElement = function OoUiMixinClippableElement( config ) {
	// Configuration initialization
	config = config || {};

	// Properties
	this.$clippable = null;
	this.$clippableContainer = null;
	this.clipping = false;
	this.clippedHorizontally = false;
	this.clippedVertically = false;
	this.$clippableScrollableContainer = null;
	this.$clippableScroller = null;
	this.$clippableWindow = null;
	this.idealWidth = null;
	this.idealHeight = null;
	this.onClippableScrollHandler = this.clip.bind( this );
	this.onClippableWindowResizeHandler = this.clip.bind( this );

	// Initialization
	if ( config.$clippableContainer ) {
		this.setClippableContainer( config.$clippableContainer );
	}
	this.setClippableElement( config.$clippable || this.$element );
};

/* Methods */

/**
 * Set clippable element.
 *
 * If an element is already set, it will be cleaned up before setting up the new element.
 *
 * @param {jQuery} $clippable Element to make clippable
 */
OO.ui.mixin.ClippableElement.prototype.setClippableElement = function ( $clippable ) {
	if ( this.$clippable ) {
		this.$clippable.removeClass( 'oo-ui-clippableElement-clippable' );
		this.$clippable.css( { width: '', height: '', overflowX: '', overflowY: '' } );
		OO.ui.Element.static.reconsiderScrollbars( this.$clippable[ 0 ] );
	}

	this.$clippable = $clippable.addClass( 'oo-ui-clippableElement-clippable' );
	this.clip();
};

/**
 * Set clippable container.
 *
 * This is the container that will be measured when deciding whether to clip. When clipping,
 * #$clippable will be resized in order to keep the clippable container fully visible.
 *
 * If the clippable container is unset, #$clippable will be used.
 *
 * @param {jQuery|null} $clippableContainer Container to keep visible, or null to unset
 */
OO.ui.mixin.ClippableElement.prototype.setClippableContainer = function ( $clippableContainer ) {
	this.$clippableContainer = $clippableContainer;
	if ( this.$clippable ) {
		this.clip();
	}
};

/**
 * Toggle clipping.
 *
 * Do not turn clipping on until after the element is attached to the DOM and visible.
 *
 * @param {boolean} [clipping] Enable clipping, omit to toggle
 * @chainable
 * @return {OO.ui.Element} The element, for chaining
 */
OO.ui.mixin.ClippableElement.prototype.toggleClipping = function ( clipping ) {
	clipping = clipping === undefined ? !this.clipping : !!clipping;

	if ( clipping && !this.warnedUnattached && !this.isElementAttached() ) {
		OO.ui.warnDeprecation( 'ClippableElement#toggleClipping: Before calling this method, the element must be attached to the DOM.' );
		this.warnedUnattached = true;
	}

	if ( this.clipping !== clipping ) {
		this.clipping = clipping;
		if ( clipping ) {
			this.$clippableScrollableContainer = $( this.getClosestScrollableElementContainer() );
			// If the clippable container is the root, we have to listen to scroll events and check
			// jQuery.scrollTop on the window because of browser inconsistencies
			this.$clippableScroller = this.$clippableScrollableContainer.is( 'html, body' ) ?
				$( OO.ui.Element.static.getWindow( this.$clippableScrollableContainer ) ) :
				this.$clippableScrollableContainer;
			this.$clippableScroller.on( 'scroll', this.onClippableScrollHandler );
			this.$clippableWindow = $( this.getElementWindow() )
				.on( 'resize', this.onClippableWindowResizeHandler );
			// Initial clip after visible
			this.clip();
		} else {
			this.$clippable.css( {
				width: '',
				height: '',
				maxWidth: '',
				maxHeight: '',
				overflowX: '',
				overflowY: ''
			} );
			OO.ui.Element.static.reconsiderScrollbars( this.$clippable[ 0 ] );

			this.$clippableScrollableContainer = null;
			this.$clippableScroller.off( 'scroll', this.onClippableScrollHandler );
			this.$clippableScroller = null;
			this.$clippableWindow.off( 'resize', this.onClippableWindowResizeHandler );
			this.$clippableWindow = null;
		}
	}

	return this;
};

/**
 * Check if the element will be clipped to fit the visible area of the nearest scrollable container.
 *
 * @return {boolean} Element will be clipped to the visible area
 */
OO.ui.mixin.ClippableElement.prototype.isClipping = function () {
	return this.clipping;
};

/**
 * Check if the bottom or right of the element is being clipped by the nearest scrollable container.
 *
 * @return {boolean} Part of the element is being clipped
 */
OO.ui.mixin.ClippableElement.prototype.isClipped = function () {
	return this.clippedHorizontally || this.clippedVertically;
};

/**
 * Check if the right of the element is being clipped by the nearest scrollable container.
 *
 * @return {boolean} Part of the element is being clipped
 */
OO.ui.mixin.ClippableElement.prototype.isClippedHorizontally = function () {
	return this.clippedHorizontally;
};

/**
 * Check if the bottom of the element is being clipped by the nearest scrollable container.
 *
 * @return {boolean} Part of the element is being clipped
 */
OO.ui.mixin.ClippableElement.prototype.isClippedVertically = function () {
	return this.clippedVertically;
};

/**
 * Set the ideal size. These are the dimensions #$clippable will have when it's not being clipped.
 *
 * @param {number|string} [width] Width as a number of pixels or CSS string with unit suffix
 * @param {number|string} [height] Height as a number of pixels or CSS string with unit suffix
 */
OO.ui.mixin.ClippableElement.prototype.setIdealSize = function ( width, height ) {
	this.idealWidth = width;
	this.idealHeight = height;

	if ( !this.clipping ) {
		// Update dimensions
		this.$clippable.css( { width: width, height: height } );
	}
	// While clipping, idealWidth and idealHeight are not considered
};

/**
 * Return the side of the clippable on which it is "anchored" (aligned to something else).
 * ClippableElement will clip the opposite side when reducing element's width.
 *
 * Classes that mix in ClippableElement should override this to return 'right' if their
 * clippable is absolutely positioned and using 'right: Npx' (and not using 'left').
 * If your class also mixes in FloatableElement, this is handled automatically.
 *
 * (This can't be guessed from the actual CSS because the computed values for 'left'/'right' are
 * always in pixels, even if they were unset or set to 'auto'.)
 *
 * When in doubt, 'left' (or 'right' in RTL) is a reasonable fallback.
 *
 * @return {string} 'left' or 'right'
 */
OO.ui.mixin.ClippableElement.prototype.getHorizontalAnchorEdge = function () {
	if ( this.computePosition && this.positioning && this.computePosition().right !== '' ) {
		return 'right';
	}
	return 'left';
};

/**
 * Return the side of the clippable on which it is "anchored" (aligned to something else).
 * ClippableElement will clip the opposite side when reducing element's width.
 *
 * Classes that mix in ClippableElement should override this to return 'bottom' if their
 * clippable is absolutely positioned and using 'bottom: Npx' (and not using 'top').
 * If your class also mixes in FloatableElement, this is handled automatically.
 *
 * (This can't be guessed from the actual CSS because the computed values for 'left'/'right' are
 * always in pixels, even if they were unset or set to 'auto'.)
 *
 * When in doubt, 'top' is a reasonable fallback.
 *
 * @return {string} 'top' or 'bottom'
 */
OO.ui.mixin.ClippableElement.prototype.getVerticalAnchorEdge = function () {
	if ( this.computePosition && this.positioning && this.computePosition().bottom !== '' ) {
		return 'bottom';
	}
	return 'top';
};

/**
 * Clip element to visible boundaries and allow scrolling when needed. You should call this method
 * when the element's natural height changes.
 *
 * Element will be clipped the bottom or right of the element is within 10px of the edge of, or
 * overlapped by, the visible area of the nearest scrollable container.
 *
 * Because calling clip() when the natural height changes isn't always possible, we also set
 * max-height when the element isn't being clipped. This means that if the element tries to grow
 * beyond the edge, something reasonable will happen before clip() is called.
 *
 * @chainable
 * @return {OO.ui.Element} The element, for chaining
 */
OO.ui.mixin.ClippableElement.prototype.clip = function () {
	if ( !this.clipping ) {
		// this.$clippableScrollableContainer and this.$clippableWindow are null, so the below
		// will fail
		return this;
	}

	function rectCopy( rect ) {
		return {
			left: rect.left,
			top: rect.top,
			right: rect.right,
			bottom: rect.bottom,
			x: rect.x,
			y: rect.y,
			width: rect.width,
			height: rect.height
		};
	}

	function rectIntersection( a, b ) {
		const out = {};
		out.top = Math.max( a.top, b.top );
		out.left = Math.max( a.left, b.left );
		out.bottom = Math.min( a.bottom, b.bottom );
		out.right = Math.min( a.right, b.right );
		return out;
	}

	const viewportSpacing = OO.ui.getViewportSpacing();

	let $viewport, viewportRect;
	if ( this.$clippableScrollableContainer.is( 'html, body' ) ) {
		$viewport = $( this.$clippableScrollableContainer[ 0 ].ownerDocument.body );
		// Dimensions of the browser window, rather than the element!
		viewportRect = {
			top: 0,
			left: 0,
			right: document.documentElement.clientWidth,
			bottom: document.documentElement.clientHeight
		};
		viewportRect.top += viewportSpacing.top;
		viewportRect.left += viewportSpacing.left;
		viewportRect.right -= viewportSpacing.right;
		viewportRect.bottom -= viewportSpacing.bottom;
	} else {
		$viewport = this.$clippableScrollableContainer;
		viewportRect = $viewport[ 0 ].getBoundingClientRect();
		// Convert into a plain object
		viewportRect = rectCopy( viewportRect );
	}

	// Account for scrollbar gutter
	const direction = $viewport.css( 'direction' );
	const vertScrollbarWidth = $viewport.innerWidth() - $viewport.prop( 'clientWidth' );
	const horizScrollbarHeight = $viewport.innerHeight() - $viewport.prop( 'clientHeight' );
	viewportRect.bottom -= horizScrollbarHeight;
	if ( direction === 'rtl' ) {
		viewportRect.left += vertScrollbarWidth;
	} else {
		viewportRect.right -= vertScrollbarWidth;
	}

	// Extra tolerance so that the sloppy code below doesn't result in results that are off
	// by one or two pixels. (And also so that we have space to display drop shadows.)
	// Chosen by fair dice roll.
	const buffer = 7;
	viewportRect.top += buffer;
	viewportRect.left += buffer;
	viewportRect.right -= buffer;
	viewportRect.bottom -= buffer;

	const $item = this.$clippableContainer || this.$clippable;

	const extraHeight = $item.outerHeight() - this.$clippable.outerHeight();
	const extraWidth = $item.outerWidth() - this.$clippable.outerWidth();

	let itemRect = $item[ 0 ].getBoundingClientRect();
	// Convert into a plain object
	itemRect = rectCopy( itemRect );

	// Item might already be clipped, so we can't just use its dimensions (in case we might need to
	// make it larger than before). Extend the rectangle to the maximum size we are allowed to take.
	if ( this.getHorizontalAnchorEdge() === 'right' ) {
		itemRect.left = viewportRect.left;
	} else {
		itemRect.right = viewportRect.right;
	}
	if ( this.getVerticalAnchorEdge() === 'bottom' ) {
		itemRect.top = viewportRect.top;
	} else {
		itemRect.bottom = viewportRect.bottom;
	}

	const availableRect = rectIntersection( viewportRect, itemRect );

	let desiredWidth = Math.max( 0, availableRect.right - availableRect.left );
	let desiredHeight = Math.max( 0, availableRect.bottom - availableRect.top );
	// It should never be desirable to exceed the dimensions of the browser viewport... right?
	desiredWidth = Math.min( desiredWidth,
		document.documentElement.clientWidth - viewportSpacing.left - viewportSpacing.right );
	desiredHeight = Math.min( desiredHeight,
		document.documentElement.clientHeight - viewportSpacing.top - viewportSpacing.right );
	const allotedWidth = Math.ceil( desiredWidth - extraWidth );
	const allotedHeight = Math.ceil( desiredHeight - extraHeight );
	const naturalWidth = this.$clippable.prop( 'scrollWidth' );
	const naturalHeight = this.$clippable.prop( 'scrollHeight' );
	const clipWidth = allotedWidth < naturalWidth;
	const clipHeight = allotedHeight < naturalHeight;

	if ( clipWidth ) {
		// The hacks below are no longer needed for Firefox and Chrome after T349034,
		// but may still be needed for Safari. TODO: Test and maybe remove them.

		// Set overflow to 'scroll' first to avoid browser bugs causing bogus scrollbars (T67059),
		// then to 'auto' which is what we want.
		// Forcing a reflow is a smaller workaround than calling reconsiderScrollbars() for
		// this case.
		this.$clippable.css( 'overflowX', 'scroll' );
		// eslint-disable-next-line no-unused-expressions
		this.$clippable[ 0 ].offsetHeight; // Force reflow
		// The order matters here. If overflow is not set first, Chrome displays bogus scrollbars.
		// See T157672.
		this.$clippable.css( 'overflowX', 'auto' );
		// eslint-disable-next-line no-unused-expressions
		this.$clippable[ 0 ].offsetHeight; // Force reflow
		this.$clippable.css( {
			width: Math.max( 0, allotedWidth ),
			maxWidth: ''
		} );
	} else {
		this.$clippable.css( {
			overflowX: '',
			width: this.idealWidth || '',
			maxWidth: Math.max( 0, allotedWidth )
		} );
	}
	if ( clipHeight ) {
		// The hacks below are no longer needed for Firefox and Chrome after T349034,
		// but may still be needed for Safari. TODO: Test and maybe remove them.

		// Set overflow to 'scroll' first to avoid browser bugs causing bogus scrollbars (T67059),
		// then to 'auto' which is what we want.
		// Forcing a reflow is a smaller workaround than calling reconsiderScrollbars() for
		// this case.
		this.$clippable.css( 'overflowY', 'scroll' );
		// eslint-disable-next-line no-unused-expressions
		this.$clippable[ 0 ].offsetHeight; // Force reflow
		// The order matters here. If overflow is not set first, Chrome displays bogus scrollbars.
		// See T157672.
		this.$clippable.css( 'overflowY', 'auto' );
		// eslint-disable-next-line no-unused-expressions
		this.$clippable[ 0 ].offsetHeight; // Force reflow
		this.$clippable.css( {
			height: Math.max( 0, allotedHeight ),
			maxHeight: ''
		} );
	} else {
		this.$clippable.css( {
			overflowY: '',
			height: this.idealHeight || '',
			maxHeight: Math.max( 0, allotedHeight )
		} );
	}

	// If we stopped clipping in at least one of the dimensions
	if ( ( this.clippedHorizontally && !clipWidth ) || ( this.clippedVertically && !clipHeight ) ) {
		OO.ui.Element.static.reconsiderScrollbars( this.$clippable[ 0 ] );
	}

	this.clippedHorizontally = clipWidth;
	this.clippedVertically = clipHeight;

	return this;
};

/**
 * PopupWidget is a container for content. The popup is overlaid and positioned absolutely.
 * By default, each popup has an anchor that points toward its origin.
 * Please see the [OOUI documentation on MediaWiki.org][1] for more information and examples.
 *
 * Unlike most widgets, PopupWidget is initially hidden and must be shown by calling #toggle.
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Widgets/Popups
 *
 *     @example
 *     // A PopupWidget.
 *     const popup = new OO.ui.PopupWidget( {
 *         $content: $( '<p>Hi there!</p>' ),
 *         padded: true,
 *         width: 300
 *     } );
 *
 *     $( document.body ).append( popup.$element );
 *     // To display the popup, toggle the visibility to 'true'.
 *     popup.toggle( true );
 *
 * @class
 * @extends OO.ui.Widget
 * @mixes OO.ui.mixin.IconElement
 * @mixes OO.ui.mixin.LabelElement
 * @mixes OO.ui.mixin.ClippableElement
 * @mixes OO.ui.mixin.FloatableElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {number|null} [config.width=320] Width of popup in pixels. Pass `null` to use automatic width.
 * @param {number|null} [config.height=null] Height of popup in pixels. Pass `null` to use automatic height.
 * @param {boolean} [config.anchor=true] Show anchor pointing to origin of popup
 * @param {string} [config.position='below'] Where to position the popup relative to $floatableContainer
 *  'above': Put popup above $floatableContainer; anchor points down to the horizontal center
 *    of $floatableContainer
 *  'below': Put popup below $floatableContainer; anchor points up to the horizontal center
 *    of $floatableContainer
 *  'before': Put popup to the left (LTR) / right (RTL) of $floatableContainer; anchor points
 *    endwards (right/left) to the vertical center of $floatableContainer
 *  'after': Put popup to the right (LTR) / left (RTL) of $floatableContainer; anchor points
 *    startwards (left/right) to the vertical center of $floatableContainer
 * @param {string} [config.align='center'] How to align the popup to $floatableContainer
 *  'forwards': If position is above/below, move the popup as far endwards (right in LTR, left in
 *    RTL) as possible while still keeping the anchor within the popup; if position is before/after,
 *    move the popup as far downwards as possible.
 *  'backwards': If position is above/below, move the popup as far startwards (left in LTR, right in
 *    RTL) as possible while still keeping the anchor within the popup; if position is before/after,
 *     move the popup as far upwards as possible.
 *  'center': Horizontally (if position is above/below) or vertically (before/after) align the
 *     center of the popup with the center of $floatableContainer.
 * 'force-left': Alias for 'forwards' in LTR and 'backwards' in RTL
 * 'force-right': Alias for 'backwards' in RTL and 'forwards' in LTR
 * @param {boolean} [config.autoFlip=true] Whether to automatically switch the popup's position between
 *  'above' and 'below', or between 'before' and 'after', if there is not enough space in the
 *  desired direction to display the popup without clipping
 * @param {jQuery} [config.$container] Constrain the popup to the boundaries of the specified container.
 *  See the [OOUI docs on MediaWiki][3] for an example.
 *  [3]: https://www.mediawiki.org/wiki/OOUI/Widgets/Popups#containerExample
 * @param {number} [config.containerPadding=10] Padding between the popup and its container, specified as a
 *  number of pixels.
 * @param {jQuery} [config.$content] Content to append to the popup's body
 * @param {jQuery} [config.$footer] Content to append to the popup's footer
 * @param {boolean} [config.autoClose=false] Automatically close the popup when it loses focus.
 * @param {jQuery} [config.$autoCloseIgnore] Elements that will not close the popup when clicked.
 *  This config option is only relevant if #autoClose is set to `true`. See the
 *  [OOUI documentation on MediaWiki][2] for an example.
 *  [2]: https://www.mediawiki.org/wiki/OOUI/Widgets/Popups#autocloseExample
 * @param {boolean} [config.head=false] Show a popup header that contains a #label (if specified) and close
 *  button.
 * @param {boolean} [config.hideCloseButton=false]
 * @param {boolean} [config.padded=false] Add padding to the popup's body
 */
OO.ui.PopupWidget = function OoUiPopupWidget( config ) {
	// Configuration initialization
	config = config || {};

	// Parent constructor
	OO.ui.PopupWidget.super.call( this, config );

	// Properties (must be set before ClippableElement constructor call)
	this.$body = $( '<div>' );
	this.$popup = $( '<div>' );

	// Mixin constructors
	OO.ui.mixin.IconElement.call( this, config );
	OO.ui.mixin.LabelElement.call( this, config );
	OO.ui.mixin.ClippableElement.call( this, Object.assign( {
		$clippable: this.$body,
		$clippableContainer: this.$popup
	}, config ) );
	OO.ui.mixin.FloatableElement.call( this, config );

	// Properties
	this.$anchor = $( '<div>' );
	// If undefined, will be computed lazily in computePosition()
	this.$container = config.$container;
	this.containerPadding = config.containerPadding !== undefined ? config.containerPadding : 10;
	this.autoClose = !!config.autoClose;
	this.transitionTimeout = null;
	this.anchored = false;
	this.onDocumentMouseDownHandler = this.onDocumentMouseDown.bind( this );
	this.onDocumentKeyDownHandler = this.onDocumentKeyDown.bind( this );
	this.onTabKeyDownHandler = this.onTabKeyDown.bind( this );
	this.onShiftTabKeyDownHandler = this.onShiftTabKeyDown.bind( this );

	// Initialization
	this.setSize( config.width, config.height );
	this.toggleAnchor( config.anchor === undefined || config.anchor );
	this.setAlignment( config.align || 'center' );
	this.setPosition( config.position || 'below' );
	this.setAutoFlip( config.autoFlip === undefined || config.autoFlip );
	this.setAutoCloseIgnore( config.$autoCloseIgnore );
	this.$body.addClass( 'oo-ui-popupWidget-body' );
	this.$anchor.addClass( 'oo-ui-popupWidget-anchor' );
	this.$popup
		.addClass( 'oo-ui-popupWidget-popup' )
		.append( this.$body );
	this.$element
		.addClass( 'oo-ui-popupWidget' )
		.append( this.$popup, this.$anchor );
	// Move content, which was added to #$element by OO.ui.Widget, to the body
	// FIXME This is gross, we should use '$body' or something for the config
	if ( config.$content instanceof $ ) {
		this.$body.append( config.$content );
	}

	this.padded = !!config.padded;
	if ( config.padded ) {
		this.$body.addClass( 'oo-ui-popupWidget-body-padded' );
	}

	if ( config.head ) {
		if ( !config.hideCloseButton ) {
			this.closeButton = new OO.ui.ButtonWidget( {
				framed: false,
				icon: 'close',
				label: OO.ui.msg( 'ooui-popup-widget-close-button-aria-label' ),
				invisibleLabel: true
			} );
			this.closeButton.connect( this, {
				click: 'onCloseButtonClick'
			} );
		}
		this.$head = $( '<div>' )
			.addClass( 'oo-ui-popupWidget-head' )
			.append( this.$icon, this.$label, this.closeButton && this.closeButton.$element );
		this.$popup.prepend( this.$head );
	}

	if ( config.$footer ) {
		this.$footer = $( '<div>' )
			.addClass( 'oo-ui-popupWidget-footer' )
			.append( config.$footer );
		this.$popup.append( this.$footer );
	}

	// Initially hidden - using #toggle may cause errors if subclasses override toggle with methods
	// that reference properties not initialized at that time of parent class construction
	// TODO: Find a better way to handle post-constructor setup
	this.visible = false;
	this.$element.addClass( 'oo-ui-element-hidden' );
};

/* Setup */

OO.inheritClass( OO.ui.PopupWidget, OO.ui.Widget );
OO.mixinClass( OO.ui.PopupWidget, OO.ui.mixin.IconElement );
OO.mixinClass( OO.ui.PopupWidget, OO.ui.mixin.LabelElement );
OO.mixinClass( OO.ui.PopupWidget, OO.ui.mixin.ClippableElement );
OO.mixinClass( OO.ui.PopupWidget, OO.ui.mixin.FloatableElement );

/* Events */

/**
 * The popup is ready: it is visible and has been positioned and clipped.
 *
 * @event OO.ui.PopupWidget#ready
 */

/**
 * The popup is no longer visible.
 *
 * @event OO.ui.PopupWidget#closing
 */

/* Methods */

/**
 * Handles document mouse down events.
 *
 * @private
 * @param {MouseEvent} e Mouse down event
 */
OO.ui.PopupWidget.prototype.onDocumentMouseDown = function ( e ) {
	if (
		this.isVisible() &&
		!OO.ui.contains( this.$element.add( this.$autoCloseIgnore ).get(), e.target, true )
	) {
		this.toggle( false );
	}
};

/**
 * Bind document mouse down listener.
 *
 * @private
 */
OO.ui.PopupWidget.prototype.bindDocumentMouseDownListener = function () {
	// Capture clicks outside popup
	this.getElementDocument().addEventListener( 'mousedown', this.onDocumentMouseDownHandler, true );
	// We add 'click' event because iOS safari needs to respond to this event.
	// We can't use 'touchstart' (as is usually the equivalent to 'mousedown') because
	// then it will trigger when scrolling. While iOS Safari has some reported behavior
	// of occasionally not emitting 'click' properly, that event seems to be the standard
	// that it should be emitting, so we add it to this and will operate the event handler
	// on whichever of these events was triggered first
	this.getElementDocument().addEventListener( 'click', this.onDocumentMouseDownHandler, true );
};

/**
 * Handles close button click events.
 *
 * @private
 */
OO.ui.PopupWidget.prototype.onCloseButtonClick = function () {
	if ( this.isVisible() ) {
		this.toggle( false );
	}
};

/**
 * Unbind document mouse down listener.
 *
 * @private
 */
OO.ui.PopupWidget.prototype.unbindDocumentMouseDownListener = function () {
	this.getElementDocument().removeEventListener( 'mousedown', this.onDocumentMouseDownHandler, true );
	this.getElementDocument().removeEventListener( 'click', this.onDocumentMouseDownHandler, true );
};

/**
 * Handles document key down events.
 *
 * @private
 * @param {KeyboardEvent} e Key down event
 */
OO.ui.PopupWidget.prototype.onDocumentKeyDown = function ( e ) {
	if (
		e.which === OO.ui.Keys.ESCAPE &&
		this.isVisible()
	) {
		this.toggle( false );
		e.preventDefault();
		e.stopPropagation();
	}
};

/**
 * Bind document key down listener.
 *
 * @private
 */
OO.ui.PopupWidget.prototype.bindDocumentKeyDownListener = function () {
	this.getElementDocument().addEventListener( 'keydown', this.onDocumentKeyDownHandler, true );
};

/**
 * Unbind document key down listener.
 *
 * @private
 */
OO.ui.PopupWidget.prototype.unbindDocumentKeyDownListener = function () {
	this.getElementDocument().removeEventListener( 'keydown', this.onDocumentKeyDownHandler, true );
};

/**
 * Handles Tab key down events.
 *
 * @private
 * @param {KeyboardEvent} e Key down event
 */
OO.ui.PopupWidget.prototype.onTabKeyDown = function ( e ) {
	if ( !e.shiftKey && e.which === OO.ui.Keys.TAB ) {
		e.preventDefault();
		this.toggle( false );
	}
};

/**
 * Handles Shift + Tab key down events.
 *
 * @private
 * @param {KeyboardEvent} e Key down event
 */
OO.ui.PopupWidget.prototype.onShiftTabKeyDown = function ( e ) {
	if ( e.shiftKey && e.which === OO.ui.Keys.TAB ) {
		e.preventDefault();
		this.toggle( false );
	}
};

/**
 * Show, hide, or toggle the visibility of the anchor.
 *
 * @param {boolean} [show] Show anchor, omit to toggle
 */
OO.ui.PopupWidget.prototype.toggleAnchor = function ( show ) {
	show = show === undefined ? !this.anchored : !!show;

	if ( this.anchored !== show ) {
		this.$element.toggleClass( 'oo-ui-popupWidget-anchored oo-ui-popupWidget-anchored-' + this.anchorEdge, show );
		this.anchored = show;
	}
};

/**
 * Change which edge the anchor appears on.
 *
 * @param {string} edge 'top', 'bottom', 'start' or 'end'
 */
OO.ui.PopupWidget.prototype.setAnchorEdge = function ( edge ) {
	if ( [ 'top', 'bottom', 'start', 'end' ].indexOf( edge ) === -1 ) {
		throw new Error( 'Invalid value for edge: ' + edge );
	}
	if ( this.anchorEdge !== null ) {
		this.$element.removeClass( 'oo-ui-popupWidget-anchored-' + this.anchorEdge );
	}
	this.anchorEdge = edge;
	if ( this.anchored ) {
		this.$element.addClass( 'oo-ui-popupWidget-anchored-' + edge );
	}
};

/**
 * Check if the anchor is visible.
 *
 * @return {boolean} Anchor is visible
 */
OO.ui.PopupWidget.prototype.hasAnchor = function () {
	return this.anchored;
};

/**
 * Toggle visibility of the popup. The popup is initially hidden and must be shown by calling
 * `.toggle( true )` after its #$element is attached to the DOM.
 *
 * Do not show the popup while it is not attached to the DOM. The calculations required to display
 * it in the right place and with the right dimensions only work correctly while it is attached.
 * Side-effects may include broken interface and exceptions being thrown. This wasn't always
 * strictly enforced, so currently it only generates a warning in the browser console.
 *
 * @fires OO.ui.PopupWidget#ready
 * @inheritdoc
 */
OO.ui.PopupWidget.prototype.toggle = function ( show ) {
	show = show === undefined ? !this.isVisible() : !!show;

	const change = show !== this.isVisible();

	if ( show && !this.warnedUnattached && !this.isElementAttached() ) {
		OO.ui.warnDeprecation( 'PopupWidget#toggle: Before calling this method, the popup must be attached to the DOM.' );
		this.warnedUnattached = true;
	}
	if ( show && !this.$floatableContainer && this.isElementAttached() ) {
		// Fall back to the parent node if the floatableContainer is not set
		this.setFloatableContainer( this.$element.parent() );
	}

	if ( change && show && this.autoFlip ) {
		// Reset auto-flipping before showing the popup again. It's possible we no longer need to
		// flip (e.g. if the user scrolled).
		this.isAutoFlipped = false;
	}

	// Parent method
	OO.ui.PopupWidget.super.prototype.toggle.call( this, show );

	if ( change ) {
		this.togglePositioning( show && !!this.$floatableContainer );

		// Find the first and last focusable element in the popup widget
		const $lastFocusableElement = OO.ui.findFocusable( this.$element, true );
		const $firstFocusableElement = OO.ui.findFocusable( this.$element, false );

		if ( show ) {
			if ( this.autoClose ) {
				this.bindDocumentMouseDownListener();
				this.bindDocumentKeyDownListener();

				// Bind a keydown event to the first and last focusable element
				// If user presses the tab key on this item, dismiss the popup and
				// take focus back to the caller, ideally the caller implements this functionality
				// This is to prevent illogical focus order, a common accessibility pitfall.
				// Alternative Fix: Implement focus trap for popup widget.
				$lastFocusableElement.on( 'keydown', this.onTabKeyDownHandler );
				$firstFocusableElement.on( 'keydown', this.onShiftTabKeyDownHandler );
			}
			this.updateDimensions();
			this.toggleClipping( true );

			if ( this.autoFlip ) {
				if ( this.popupPosition === 'above' || this.popupPosition === 'below' ) {
					if ( this.isClippedVertically() || this.isFloatableOutOfView() ) {
						// If opening the popup in the normal direction causes it to be clipped,
						// open in the opposite one instead
						const normalHeight = this.$element.height();
						this.isAutoFlipped = !this.isAutoFlipped;
						this.position();
						if ( this.isClippedVertically() || this.isFloatableOutOfView() ) {
							// If that also causes it to be clipped, open in whichever direction
							// we have more space
							const oppositeHeight = this.$element.height();
							if ( oppositeHeight < normalHeight ) {
								this.isAutoFlipped = !this.isAutoFlipped;
								this.position();
							}
						}
					}
				}
				if ( this.popupPosition === 'before' || this.popupPosition === 'after' ) {
					if ( this.isClippedHorizontally() || this.isFloatableOutOfView() ) {
						// If opening the popup in the normal direction causes it to be clipped,
						// open in the opposite one instead
						const normalWidth = this.$element.width();
						this.isAutoFlipped = !this.isAutoFlipped;
						// Due to T180173 horizontally clipped PopupWidgets have messed up
						// dimensions, which causes positioning to be off. Toggle clipping back and
						// forth to work around.
						this.toggleClipping( false );
						this.position();
						this.toggleClipping( true );
						if ( this.isClippedHorizontally() || this.isFloatableOutOfView() ) {
							// If that also causes it to be clipped, open in whichever direction
							// we have more space
							const oppositeWidth = this.$element.width();
							if ( oppositeWidth < normalWidth ) {
								this.isAutoFlipped = !this.isAutoFlipped;
								// Due to T180173, horizontally clipped PopupWidgets have messed up
								// dimensions, which causes positioning to be off. Toggle clipping
								// back and forth to work around.
								this.toggleClipping( false );
								this.position();
								this.toggleClipping( true );
							}
						}
					}
				}
			}

			this.emit( 'ready' );
		} else {
			this.toggleClipping( false );
			if ( this.autoClose ) {
				// Remove binded keydown event from the first and last focusable elements
				// when popup closes
				$lastFocusableElement.off( 'keydown', this.onTabKeyDownHandler );
				$firstFocusableElement.off( 'keydown', this.onShiftTabKeyDownHandler );

				this.unbindDocumentMouseDownListener();
				this.unbindDocumentKeyDownListener();
			}

			// This is so we can restore focus to the parent when the pop widget dismisses
			// Also, we're emitting an event
			// so we don't have to tie this implementation to the caller.
			// Let the caller handle this details.
			this.emit( 'closing' );
		}
	}

	return this;
};

/**
 * Set the size of the popup.
 *
 * Changing the size may also change the popup's position depending on the alignment.
 *
 * @param {number|null} [width=320] Width in pixels. Pass `null` to use automatic width.
 * @param {number|null} [height=null] Height in pixels. Pass `null` to use automatic height.
 * @param {boolean} [transition=false] Use a smooth transition
 * @chainable
 */
OO.ui.PopupWidget.prototype.setSize = function ( width, height, transition ) {
	this.width = width !== undefined ? width : 320;
	this.height = height !== undefined ? height : null;
	if ( this.isVisible() ) {
		this.updateDimensions( transition );
	}
};

/**
 * Update the size and position.
 *
 * Only use this to keep the popup properly anchored. Use #setSize to change the size, and this will
 * be called automatically.
 *
 * @param {boolean} [transition=false] Use a smooth transition
 * @chainable
 */
OO.ui.PopupWidget.prototype.updateDimensions = function ( transition ) {
	// Prevent transition from being interrupted
	clearTimeout( this.transitionTimeout );
	if ( transition ) {
		// Enable transition
		this.$element.addClass( 'oo-ui-popupWidget-transitioning' );
	}

	this.position();

	if ( transition ) {
		// Prevent transitioning after transition is complete
		this.transitionTimeout = setTimeout( () => {
			this.$element.removeClass( 'oo-ui-popupWidget-transitioning' );
		}, 200 );
	} else {
		// Prevent transitioning immediately
		this.$element.removeClass( 'oo-ui-popupWidget-transitioning' );
	}
};

/**
 * @inheritdoc
 */
OO.ui.PopupWidget.prototype.computePosition = function () {
	const popupPos = {},
		anchorCss = { left: '', right: '', top: '', bottom: '' },
		popupPositionOppositeMap = {
			above: 'below',
			below: 'above',
			before: 'after',
			after: 'before'
		},
		alignMap = {
			ltr: {
				'force-left': 'backwards',
				'force-right': 'forwards'
			},
			rtl: {
				'force-left': 'forwards',
				'force-right': 'backwards'
			}
		},
		anchorEdgeMap = {
			above: 'bottom',
			below: 'top',
			before: 'end',
			after: 'start'
		},
		hPosMap = {
			forwards: 'start',
			center: 'center',
			backwards: this.anchored ? 'before' : 'end'
		},
		vPosMap = {
			forwards: 'top',
			center: 'center',
			backwards: 'bottom'
		};

	if ( !this.$container ) {
		// Lazy-initialize $container if not specified in constructor
		this.$container = $( this.getClosestScrollableElementContainer() );
	}
	const direction = this.$container.css( 'direction' );

	// Set height and width before we do anything else, since it might cause our measurements
	// to change (e.g. due to scrollbars appearing or disappearing), and it also affects centering
	this.setIdealSize(
		// The properties refer to the width of this.$popup, but we set the properties on this.$body
		// to make calculations work out right (T180173), so we subtract padding here.
		this.width !== null ? this.width - ( this.padded ? 24 : 0 ) : 'auto',
		this.height !== null ? this.height - ( this.padded ? 10 : 0 ) : 'auto'
	);

	const align = alignMap[ direction ][ this.align ] || this.align;
	let popupPosition = this.popupPosition;
	if ( this.isAutoFlipped ) {
		popupPosition = popupPositionOppositeMap[ popupPosition ];
	}

	// If the popup is positioned before or after, then the anchor positioning is vertical,
	// otherwise horizontal
	const vertical = popupPosition === 'before' || popupPosition === 'after';
	const start = vertical ? 'top' : ( direction === 'rtl' ? 'right' : 'left' );
	const end = vertical ? 'bottom' : ( direction === 'rtl' ? 'left' : 'right' );
	const near = vertical ? 'top' : 'left';
	const far = vertical ? 'bottom' : 'right';
	const sizeProp = vertical ? 'Height' : 'Width';
	const popupSize = vertical ? this.$popup.height() : this.$popup.width();

	this.setAnchorEdge( anchorEdgeMap[ popupPosition ] );
	this.horizontalPosition = vertical ? popupPosition : hPosMap[ align ];
	this.verticalPosition = vertical ? vPosMap[ align ] : popupPosition;

	// Parent method
	const parentPosition = OO.ui.mixin.FloatableElement.prototype.computePosition.call( this );
	// Find out which property FloatableElement used for positioning, and adjust that value
	const positionProp = vertical ?
		( parentPosition.top !== '' ? 'top' : 'bottom' ) :
		( parentPosition.left !== '' ? 'left' : 'right' );

	// Figure out where the near and far edges of the popup and $floatableContainer are
	const floatablePos = this.$floatableContainer.offset();
	floatablePos[ far ] = floatablePos[ near ] + this.$floatableContainer[ 'outer' + sizeProp ]();
	// Measure where the offsetParent is and compute our position based on that and parentPosition
	const offsetParentPos = this.$element.offsetParent()[ 0 ] === document.documentElement ?
		{ top: 0, left: 0 } :
		this.$element.offsetParent().offset();

	if ( positionProp === near ) {
		popupPos[ near ] = offsetParentPos[ near ] + parentPosition[ near ];
		popupPos[ far ] = popupPos[ near ] + popupSize;
	} else {
		popupPos[ far ] = offsetParentPos[ near ] +
			this.$element.offsetParent()[ 'inner' + sizeProp ]() - parentPosition[ far ];
		popupPos[ near ] = popupPos[ far ] - popupSize;
	}

	let anchorOffset, positionAdjustment;
	if ( this.anchored ) {
		// Position the anchor (which is positioned relative to the popup) to point to
		// $floatableContainer
		const anchorPos = ( floatablePos[ start ] + floatablePos[ end ] ) / 2;
		anchorOffset = ( start === far ? -1 : 1 ) * ( anchorPos - popupPos[ start ] );

		// If the anchor is less than 2*anchorSize from either edge, move the popup to make more
		// space this.$anchor.width()/height() returns 0 because of the CSS trickery we use, so use
		// scrollWidth/Height
		const anchorSize = this.$anchor[ 0 ][ 'scroll' + sizeProp ];
		const anchorMargin = parseFloat( this.$anchor.css( 'margin-' + start ) );
		if ( anchorOffset + anchorMargin < 2 * anchorSize ) {
			// Not enough space for the anchor on the start side; pull the popup startwards
			positionAdjustment = ( positionProp === start ? -1 : 1 ) *
				( 2 * anchorSize - ( anchorOffset + anchorMargin ) );
		} else if ( anchorOffset + anchorMargin > popupSize - 2 * anchorSize ) {
			// Not enough space for the anchor on the end side; pull the popup endwards
			positionAdjustment = ( positionProp === end ? -1 : 1 ) *
				( anchorOffset + anchorMargin - ( popupSize - 2 * anchorSize ) );
		} else {
			positionAdjustment = 0;
		}
	} else {
		positionAdjustment = 0;
	}

	// Check if the popup will go beyond the edge of this.$container
	const containerPos = this.$container[ 0 ] === document.documentElement ?
		{ top: 0, left: 0 } :
		this.$container.offset();
	containerPos[ far ] = containerPos[ near ] + this.$container[ 'inner' + sizeProp ]();
	if ( this.$container[ 0 ] === document.documentElement ) {
		const viewportSpacing = OO.ui.getViewportSpacing();
		containerPos[ near ] += viewportSpacing[ near ];
		containerPos[ far ] -= viewportSpacing[ far ];
	}
	// Take into account how much the popup will move because of the adjustments we're going to make
	popupPos[ near ] += ( positionProp === near ? 1 : -1 ) * positionAdjustment;
	popupPos[ far ] += ( positionProp === near ? 1 : -1 ) * positionAdjustment;
	if ( containerPos[ near ] + this.containerPadding > popupPos[ near ] ) {
		// Popup goes beyond the near (left/top) edge, move it to the right/bottom
		positionAdjustment += ( positionProp === near ? 1 : -1 ) *
			( containerPos[ near ] + this.containerPadding - popupPos[ near ] );
	} else if ( containerPos[ far ] - this.containerPadding < popupPos[ far ] ) {
		// Popup goes beyond the far (right/bottom) edge, move it to the left/top
		positionAdjustment += ( positionProp === far ? 1 : -1 ) *
			( popupPos[ far ] - ( containerPos[ far ] - this.containerPadding ) );
	}

	if ( this.anchored ) {
		// Adjust anchorOffset for positionAdjustment
		anchorOffset += ( positionProp === start ? -1 : 1 ) * positionAdjustment;

		// Position the anchor
		anchorCss[ start ] = anchorOffset;
		this.$anchor.css( anchorCss );
	}

	// Move the popup if needed
	parentPosition[ positionProp ] += positionAdjustment;

	return parentPosition;
};

/**
 * Set popup alignment
 *
 * @param {string} [align=center] Alignment of the popup, `center`, `force-left`, `force-right`,
 *  `backwards` or `forwards`.
 */
OO.ui.PopupWidget.prototype.setAlignment = function ( align ) {
	// Validate alignment
	if ( [ 'force-left', 'force-right', 'backwards', 'forwards', 'center' ].indexOf( align ) > -1 ) {
		this.align = align;
	} else {
		this.align = 'center';
	}
	this.position();
};

/**
 * Get popup alignment
 *
 * @return {string} Alignment of the popup, `center`, `force-left`, `force-right`,
 *  `backwards` or `forwards`.
 */
OO.ui.PopupWidget.prototype.getAlignment = function () {
	return this.align;
};

/**
 * Change the positioning of the popup.
 *
 * @param {string} position 'above', 'below', 'before' or 'after'
 */
OO.ui.PopupWidget.prototype.setPosition = function ( position ) {
	if ( [ 'above', 'below', 'before', 'after' ].indexOf( position ) === -1 ) {
		position = 'below';
	}
	this.popupPosition = position;
	this.position();
};

/**
 * Get popup positioning.
 *
 * @return {string} 'above', 'below', 'before' or 'after'
 */
OO.ui.PopupWidget.prototype.getPosition = function () {
	return this.popupPosition;
};

/**
 * Set popup auto-flipping.
 *
 * @param {boolean} [autoFlip=false] Whether to automatically switch the popup's position between
 *  'above' and 'below', or between 'before' and 'after', if there is not enough space in the
 *  desired direction to display the popup without clipping
 */
OO.ui.PopupWidget.prototype.setAutoFlip = function ( autoFlip ) {
	autoFlip = !!autoFlip;

	if ( this.autoFlip !== autoFlip ) {
		this.autoFlip = autoFlip;
	}
};

/**
 * Set which elements will not close the popup when clicked.
 *
 * For auto-closing popups, clicks on these elements will not cause the popup to auto-close.
 *
 * @param {jQuery} $autoCloseIgnore Elements to ignore for auto-closing
 */
OO.ui.PopupWidget.prototype.setAutoCloseIgnore = function ( $autoCloseIgnore ) {
	this.$autoCloseIgnore = $autoCloseIgnore;
};

/**
 * Get an ID of the body element, this can be used as the
 * `aria-describedby` attribute for an input field.
 *
 * @return {string} The ID of the body element
 */
OO.ui.PopupWidget.prototype.getBodyId = function () {
	let id = this.$body.attr( 'id' );
	if ( id === undefined ) {
		id = OO.ui.generateElementId();
		this.$body.attr( 'id', id );
	}
	return id;
};

/**
 * PopupElement is mixed into other classes to generate a {@link OO.ui.PopupWidget popup widget}.
 * A popup is a container for content. It is overlaid and positioned absolutely. By default, each
 * popup has an anchor, which is an arrow-like protrusion that points toward the popup’s origin.
 * See {@link OO.ui.PopupWidget PopupWidget} for an example.
 *
 * @abstract
 * @class
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {Object} [config.popup] Configuration to pass to popup
 * @param {boolean} [config.popup.autoClose=true] Popup auto-closes when it loses focus
 */
OO.ui.mixin.PopupElement = function OoUiMixinPopupElement( config ) {
	// Configuration initialization
	config = config || {};

	// Properties
	this.popup = new OO.ui.PopupWidget( Object.assign(
		{
			autoClose: true,
			$floatableContainer: this.$element
		},
		config.popup,
		{
			$autoCloseIgnore: this.$element.add( config.popup && config.popup.$autoCloseIgnore )
		}
	) );
};

/* Methods */

/**
 * Get popup.
 *
 * @return {OO.ui.PopupWidget} Popup widget
 */
OO.ui.mixin.PopupElement.prototype.getPopup = function () {
	return this.popup;
};

/**
 * PopupButtonWidgets toggle the visibility of a contained {@link OO.ui.PopupWidget PopupWidget},
 * which is used to display additional information or options.
 *
 *     @example
 *     // A PopupButtonWidget.
 *     const popupButton = new OO.ui.PopupButtonWidget( {
 *         label: 'Popup button with options',
 *         icon: 'menu',
 *         popup: {
 *             $content: $( '<p>Additional options here.</p>' ),
 *             padded: true,
 *             align: 'force-left'
 *         }
 *     } );
 *     // Append the button to the DOM.
 *     $( document.body ).append( popupButton.$element );
 *
 * @class
 * @extends OO.ui.ButtonWidget
 * @mixes OO.ui.mixin.PopupElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {jQuery} [config.$overlay] Render the popup into a separate layer. This configuration is useful
 *  in cases where the expanded popup is larger than its containing `<div>`. The specified overlay
 *  layer is usually on top of the containing `<div>` and has a larger area. By default, the popup
 *  uses relative positioning.
 *  See <https://www.mediawiki.org/wiki/OOUI/Concepts#Overlays>.
 */
OO.ui.PopupButtonWidget = function OoUiPopupButtonWidget( config ) {
	// Configuration initialization
	config = config || {};

	// Parent constructor
	OO.ui.PopupButtonWidget.super.call( this, config );

	// Mixin constructors
	OO.ui.mixin.PopupElement.call( this, config );

	// Properties
	this.$overlay = ( config.$overlay === true ?
		OO.ui.getDefaultOverlay() : config.$overlay ) || this.$element;

	// Events
	this.connect( this, {
		click: 'onAction'
	} );

	// Initialization
	this.$element.addClass( 'oo-ui-popupButtonWidget' );
	this.$button.attr( {
		'aria-haspopup': 'dialog',
		'aria-owns': this.popup.getElementId()
	} );
	this.popup.$element
		.addClass( 'oo-ui-popupButtonWidget-popup' )
		.attr( {
			role: 'dialog',
			'aria-describedby': this.getElementId()
		} )
		.toggleClass( 'oo-ui-popupButtonWidget-framed-popup', this.isFramed() )
		.toggleClass( 'oo-ui-popupButtonWidget-frameless-popup', !this.isFramed() );
	this.$overlay.append( this.popup.$element );
};

/* Setup */

OO.inheritClass( OO.ui.PopupButtonWidget, OO.ui.ButtonWidget );
OO.mixinClass( OO.ui.PopupButtonWidget, OO.ui.mixin.PopupElement );

/* Methods */

/**
 * Handle the button action being triggered.
 *
 * @private
 */
OO.ui.PopupButtonWidget.prototype.onAction = function () {
	this.popup.toggle();
};

/**
 * Mixin for OO.ui.Widget subclasses to provide OO.ui.mixin.GroupElement.
 *
 * Use together with OO.ui.mixin.ItemWidget to make disabled state inheritable.
 *
 * @private
 * @abstract
 * @class
 * @mixes OO.ui.mixin.GroupElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
OO.ui.mixin.GroupWidget = function OoUiMixinGroupWidget( config ) {
	// Mixin constructors
	OO.ui.mixin.GroupElement.call( this, config );
};

/* Setup */

OO.mixinClass( OO.ui.mixin.GroupWidget, OO.ui.mixin.GroupElement );

/* Methods */

/**
 * Set the disabled state of the widget.
 *
 * This will also update the disabled state of child widgets.
 *
 * @param {boolean} [disabled=false] Disable widget
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.mixin.GroupWidget.prototype.setDisabled = function ( disabled ) {
	// Parent method
	// Note: Calling #setDisabled this way assumes this is mixed into an OO.ui.Widget
	OO.ui.Widget.prototype.setDisabled.call( this, disabled );

	// During construction, #setDisabled is called before the OO.ui.mixin.GroupElement constructor
	if ( this.items ) {
		for ( let i = 0, len = this.items.length; i < len; i++ ) {
			this.items[ i ].updateDisabled();
		}
	}

	return this;
};

/**
 * Mixin for widgets used as items in widgets that mix in OO.ui.mixin.GroupWidget.
 *
 * Item widgets have a reference to a OO.ui.mixin.GroupWidget while they are attached to the group.
 * This allows bidirectional communication.
 *
 * Use together with OO.ui.mixin.GroupWidget to make disabled state inheritable.
 *
 * @private
 * @abstract
 * @class
 *
 * @constructor
 */
OO.ui.mixin.ItemWidget = function OoUiMixinItemWidget() {
	//
};

/* Methods */

/**
 * Check if widget is disabled.
 *
 * Checks parent if present, making disabled state inheritable.
 *
 * @return {boolean} Widget is disabled
 */
OO.ui.mixin.ItemWidget.prototype.isDisabled = function () {
	return this.disabled ||
		( this.elementGroup instanceof OO.ui.Widget && this.elementGroup.isDisabled() );
};

/**
 * Set group element is in.
 *
 * @param {OO.ui.mixin.GroupElement|null} group Group element, null if none
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.mixin.ItemWidget.prototype.setElementGroup = function ( group ) {
	// Parent method
	// Note: Calling #setElementGroup this way assumes this is mixed into an OO.ui.Element
	OO.ui.Element.prototype.setElementGroup.call( this, group );

	// Initialize item disabled states
	this.updateDisabled();

	return this;
};

/**
 * OptionWidgets are special elements that can be selected and configured with data. The
 * data is often unique for each option, but it does not have to be. OptionWidgets are used
 * with OO.ui.SelectWidget to create a selection of mutually exclusive options. For more information
 * and examples, please see the [OOUI documentation on MediaWiki][1].
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Widgets/Selects_and_Options
 *
 * @class
 * @extends OO.ui.Widget
 * @mixes OO.ui.mixin.ItemWidget
 * @mixes OO.ui.mixin.LabelElement
 * @mixes OO.ui.mixin.FlaggedElement
 * @mixes OO.ui.mixin.AccessKeyedElement
 * @mixes OO.ui.mixin.TitledElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {boolean} [config.selected=false]
 */
OO.ui.OptionWidget = function OoUiOptionWidget( config ) {
	// Configuration initialization
	config = config || {};

	// Parent constructor
	OO.ui.OptionWidget.super.call( this, config );

	// Mixin constructors
	OO.ui.mixin.ItemWidget.call( this );
	OO.ui.mixin.LabelElement.call( this, config );
	OO.ui.mixin.FlaggedElement.call( this, config );
	OO.ui.mixin.AccessKeyedElement.call( this, config );
	OO.ui.mixin.TitledElement.call( this, config );

	// Properties
	this.highlighted = false;
	this.pressed = false;
	this.setSelected( !!config.selected );

	// Initialization
	this.$element
		.data( 'oo-ui-optionWidget', this )
		// Allow programmatic focussing (and by access key), but not tabbing
		.attr( {
			tabindex: '-1',
			role: 'option'
		} )
		.addClass( 'oo-ui-optionWidget' )
		.append( this.$label );
};

/* Setup */

OO.inheritClass( OO.ui.OptionWidget, OO.ui.Widget );
OO.mixinClass( OO.ui.OptionWidget, OO.ui.mixin.ItemWidget );
OO.mixinClass( OO.ui.OptionWidget, OO.ui.mixin.LabelElement );
OO.mixinClass( OO.ui.OptionWidget, OO.ui.mixin.FlaggedElement );
OO.mixinClass( OO.ui.OptionWidget, OO.ui.mixin.AccessKeyedElement );
OO.mixinClass( OO.ui.OptionWidget, OO.ui.mixin.TitledElement );

/* Static Properties */

/**
 * Whether this option can be selected. See #setSelected.
 *
 * @static
 * @property {boolean}
 */
OO.ui.OptionWidget.static.selectable = true;

/**
 * Whether this option can be highlighted. See #setHighlighted.
 *
 * @static
 * @property {boolean}
 */
OO.ui.OptionWidget.static.highlightable = true;

/**
 * Whether this option can be pressed. See #setPressed.
 *
 * @static
 * @property {boolean}
 */
OO.ui.OptionWidget.static.pressable = true;

/**
 * Whether this option will be scrolled into view when it is selected.
 *
 * @static
 * @property {boolean}
 */
OO.ui.OptionWidget.static.scrollIntoViewOnSelect = false;

/* Methods */

/**
 * Check if the option can be selected.
 *
 * @return {boolean} Item is selectable
 */
OO.ui.OptionWidget.prototype.isSelectable = function () {
	return this.constructor.static.selectable && !this.disabled && this.isVisible();
};

/**
 * Check if the option can be highlighted. A highlight indicates that the option
 * may be selected when a user presses Enter key or clicks. Disabled items cannot
 * be highlighted.
 *
 * @return {boolean} Item is highlightable
 */
OO.ui.OptionWidget.prototype.isHighlightable = function () {
	return this.constructor.static.highlightable && !this.disabled && this.isVisible();
};

/**
 * Check if the option can be pressed. The pressed state occurs when a user mouses
 * down on an item, but has not yet let go of the mouse.
 *
 * @return {boolean} Item is pressable
 */
OO.ui.OptionWidget.prototype.isPressable = function () {
	return this.constructor.static.pressable && !this.disabled && this.isVisible();
};

/**
 * Check if the option is selected.
 *
 * @return {boolean} Item is selected
 */
OO.ui.OptionWidget.prototype.isSelected = function () {
	return this.selected;
};

/**
 * Check if the option is highlighted. A highlight indicates that the
 * item may be selected when a user presses Enter key or clicks.
 *
 * @return {boolean} Item is highlighted
 */
OO.ui.OptionWidget.prototype.isHighlighted = function () {
	return this.highlighted;
};

/**
 * Check if the option is pressed. The pressed state occurs when a user mouses
 * down on an item, but has not yet let go of the mouse. The item may appear
 * selected, but it will not be selected until the user releases the mouse.
 *
 * @return {boolean} Item is pressed
 */
OO.ui.OptionWidget.prototype.isPressed = function () {
	return this.pressed;
};

/**
 * Set the option’s selected state. In general, all modifications to the selection
 * should be handled by the SelectWidget’s
 * {@link OO.ui.SelectWidget#selectItem selectItem( [item] )} method instead of this method.
 *
 * @param {boolean} [state=false] Select option
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.OptionWidget.prototype.setSelected = function ( state ) {
	if ( this.constructor.static.selectable ) {
		this.selected = !!state;
		this.$element
			.toggleClass( 'oo-ui-optionWidget-selected', state )
			.attr( 'aria-selected', this.selected.toString() );
		if ( state && this.constructor.static.scrollIntoViewOnSelect ) {
			this.scrollElementIntoView();
		}
		this.updateThemeClasses();
	}
	return this;
};

/**
 * Set the option’s highlighted state. In general, all programmatic
 * modifications to the highlight should be handled by the
 * SelectWidget’s {@link OO.ui.SelectWidget#highlightItem highlightItem( [item] )}
 * method instead of this method.
 *
 * @param {boolean} [state=false] Highlight option
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.OptionWidget.prototype.setHighlighted = function ( state ) {
	if ( this.constructor.static.highlightable ) {
		this.highlighted = !!state;
		this.$element.toggleClass( 'oo-ui-optionWidget-highlighted', state );
		this.updateThemeClasses();
	}
	return this;
};

/**
 * Set the option’s pressed state. In general, all
 * programmatic modifications to the pressed state should be handled by the
 * SelectWidget’s {@link OO.ui.SelectWidget#pressItem pressItem( [item] )}
 * method instead of this method.
 *
 * @param {boolean} [state=false] Press option
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.OptionWidget.prototype.setPressed = function ( state ) {
	if ( this.constructor.static.pressable ) {
		this.pressed = !!state;
		this.$element.toggleClass( 'oo-ui-optionWidget-pressed', state );
		this.updateThemeClasses();
	}
	return this;
};

/**
 * Get text to match search strings against.
 *
 * The default implementation returns the label text, but subclasses
 * can override this to provide more complex behavior.
 *
 * @return {string|boolean} String to match search string against
 */
OO.ui.OptionWidget.prototype.getMatchText = function () {
	const label = this.getLabel();
	return typeof label === 'string' ? label : this.$label.text();
};

/**
 * A SelectWidget is of a generic selection of options. The OOUI library contains several types of
 * select widgets, including {@link OO.ui.ButtonSelectWidget button selects},
 * {@link OO.ui.RadioSelectWidget radio selects}, and {@link OO.ui.MenuSelectWidget
 * menu selects}.
 *
 * This class should be used together with OO.ui.OptionWidget or OO.ui.DecoratedOptionWidget. For
 * more information, please see the [OOUI documentation on MediaWiki][1].
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Widgets/Selects_and_Options
 *
 *     @example
 *     // A select widget with three options.
 *     const select = new OO.ui.SelectWidget( {
 *         items: [
 *             new OO.ui.OptionWidget( {
 *                 data: 'a',
 *                 label: 'Option One',
 *             } ),
 *             new OO.ui.OptionWidget( {
 *                 data: 'b',
 *                 label: 'Option Two',
 *             } ),
 *             new OO.ui.OptionWidget( {
 *                 data: 'c',
 *                 label: 'Option Three',
 *             } )
 *         ]
 *     } );
 *     $( document.body ).append( select.$element );
 *
 * @abstract
 * @class
 * @extends OO.ui.Widget
 * @mixes OO.ui.mixin.GroupWidget
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {OO.ui.OptionWidget[]} [config.items] An array of options to add to the select.
 *  Options are created with {@link OO.ui.OptionWidget OptionWidget} classes. See
 *  the [OOUI documentation on MediaWiki][2] for examples.
 *  [2]: https://www.mediawiki.org/wiki/OOUI/Widgets/Selects_and_Options
 * @param {boolean} [config.multiselect=false] Allow for multiple selections
 */
OO.ui.SelectWidget = function OoUiSelectWidget( config ) {
	// Configuration initialization
	config = config || {};

	// Parent constructor
	OO.ui.SelectWidget.super.call( this, config );

	// Mixin constructors
	OO.ui.mixin.GroupWidget.call( this, Object.assign( {
		$group: this.$element
	}, config ) );

	// Properties
	this.pressed = false;
	this.selecting = null;
	this.multiselect = !!config.multiselect;
	this.onDocumentMouseUpHandler = this.onDocumentMouseUp.bind( this );
	this.onDocumentMouseMoveHandler = this.onDocumentMouseMove.bind( this );
	this.onDocumentKeyDownHandler = this.onDocumentKeyDown.bind( this );
	this.onDocumentKeyPressHandler = this.onDocumentKeyPress.bind( this );
	this.keyPressBuffer = '';
	this.keyPressBufferTimer = null;
	this.blockMouseOverEvents = 0;

	// Events
	this.connect( this, {
		toggle: 'onToggle'
	} );
	this.$element.on( {
		focusin: this.onFocus.bind( this ),
		mousedown: this.onMouseDown.bind( this ),
		mouseover: this.onMouseOver.bind( this ),
		mouseleave: this.onMouseLeave.bind( this )
	} );

	// Initialization
	this.$element
		.addClass( 'oo-ui-selectWidget oo-ui-selectWidget-unpressed' )
		.attr( {
			role: 'listbox',
			'aria-multiselectable': this.multiselect.toString()
		} );
	this.setFocusOwner( this.$element );
	this.addItems( config.items || [] );
};

/* Setup */

OO.inheritClass( OO.ui.SelectWidget, OO.ui.Widget );
OO.mixinClass( OO.ui.SelectWidget, OO.ui.mixin.GroupWidget );

/* Events */

/**
 * A `highlight` event is emitted when the highlight is changed with the #highlightItem method.
 *
 * @event OO.ui.SelectWidget#highlight
 * @param {OO.ui.OptionWidget|null} item Highlighted item
 */

/**
 * A `press` event is emitted when the #pressItem method is used to programmatically modify the
 * pressed state of an option.
 *
 * @event OO.ui.SelectWidget#press
 * @param {OO.ui.OptionWidget|null} item Pressed item
 */

/**
 * A `select` event is emitted when the selection is modified programmatically with the #selectItem
 * method.
 *
 * @event OO.ui.SelectWidget#select
 * @param {OO.ui.OptionWidget[]|OO.ui.OptionWidget|null} items Currently selected items
 */

/**
 * A `choose` event is emitted when an item is chosen with the #chooseItem method.
 *
 * @event OO.ui.SelectWidget#choose
 * @param {OO.ui.OptionWidget} item Chosen item
 * @param {boolean} selected Item is selected
 */

/**
 * An `add` event is emitted when options are added to the select with the #addItems method.
 *
 * @event OO.ui.SelectWidget#add
 * @param {OO.ui.OptionWidget[]} items Added items
 * @param {number} index Index of insertion point
 */

/**
 * A `remove` event is emitted when options are removed from the select with the #clearItems
 * or #removeItems methods.
 *
 * @event OO.ui.SelectWidget#remove
 * @param {OO.ui.OptionWidget[]} items Removed items
 */

/* Static Properties */

/**
 * Whether this widget will respond to the navigation keys Home, End, PageUp, PageDown.
 *
 * @static
 * @property {boolean}
 */
OO.ui.SelectWidget.static.handleNavigationKeys = false;

/**
 * Whether selecting items using arrow keys or navigation keys in this widget will wrap around after
 * the user reaches the beginning or end of the list.
 *
 * @static
 * @property {boolean}
 */
OO.ui.SelectWidget.static.listWrapsAround = true;

/* Static methods */

/**
 * Normalize text for filter matching
 *
 * @param {string} text Text
 * @return {string} Normalized text
 */
OO.ui.SelectWidget.static.normalizeForMatching = function ( text ) {
	// Replace trailing whitespace, normalize multiple spaces and make case insensitive
	let normalized = text.trim().replace( /\s+/, ' ' ).toLowerCase();

	// Normalize Unicode
	normalized = normalized.normalize();

	return normalized;
};

/* Methods */

/**
 * Handle focus events
 *
 * @private
 * @param {jQuery.Event} event
 */
OO.ui.SelectWidget.prototype.onFocus = function ( event ) {
	let item;
	if ( event.target === this.$element[ 0 ] ) {
		// This widget was focussed, e.g. by the user tabbing to it.
		// The styles for focus state depend on one of the items being selected.
		if ( !this.findFirstSelectedItem() ) {
			item = this.findFirstSelectableItem();
		}
	} else {
		if ( event.target.tabIndex === -1 ) {
			// One of the options got focussed (and the event bubbled up here).
			// They can't be tabbed to, but they can be activated using access keys.
			// OptionWidgets and focusable UI elements inside them have tabindex="-1" set.
			item = this.findTargetItem( event );
			if ( item && !( item.isHighlightable() || item.isSelectable() ) ) {
				// The item is disabled (weirdly, disabled items can be focussed in Firefox and IE,
				// but not in Chrome). Do nothing (do not highlight or select anything).
				return;
			}
		} else {
			// There is something actually user-focusable in one of the labels of the options, and
			// the user focussed it (e.g. by tabbing to it). Do nothing (especially, don't change
			// the focus).
			return;
		}
	}

	if ( item ) {
		if ( item.constructor.static.highlightable ) {
			this.highlightItem( item );
		} else {
			this.selectItem( item );
		}
	}

	if ( event.target !== this.$element[ 0 ] ) {
		this.$focusOwner.trigger( 'focus' );
	}
};

/**
 * Handle mouse down events.
 *
 * @private
 * @param {jQuery.Event} e Mouse down event
 * @return {undefined|boolean} False to prevent default if event is handled
 */
OO.ui.SelectWidget.prototype.onMouseDown = function ( e ) {
	if ( !this.isDisabled() && e.which === OO.ui.MouseButtons.LEFT ) {
		this.togglePressed( true );
		const item = this.findTargetItem( e );
		if ( item && item.isSelectable() ) {
			this.pressItem( item );
			this.selecting = item;
			this.getElementDocument().addEventListener( 'mouseup', this.onDocumentMouseUpHandler, true );
			this.getElementDocument().addEventListener( 'mousemove', this.onDocumentMouseMoveHandler, true );
		}
	}
	return false;
};

/**
 * Handle document mouse up events.
 *
 * @private
 * @param {MouseEvent} e Mouse up event
 * @return {undefined|boolean} False to prevent default if event is handled
 */
OO.ui.SelectWidget.prototype.onDocumentMouseUp = function ( e ) {
	this.togglePressed( false );
	if ( !this.selecting ) {
		const item = this.findTargetItem( e );
		if ( item && item.isSelectable() ) {
			this.selecting = item;
		}
	}
	if ( !this.isDisabled() && e.which === OO.ui.MouseButtons.LEFT && this.selecting ) {
		this.pressItem( null );
		this.chooseItem( this.selecting );
		this.selecting = null;
	}

	this.getElementDocument().removeEventListener( 'mouseup', this.onDocumentMouseUpHandler, true );
	this.getElementDocument().removeEventListener( 'mousemove', this.onDocumentMouseMoveHandler, true );

	return false;
};

/**
 * Handle document mouse move events.
 *
 * @private
 * @param {MouseEvent} e Mouse move event
 */
OO.ui.SelectWidget.prototype.onDocumentMouseMove = function ( e ) {
	if ( !this.isDisabled() && this.pressed ) {
		const item = this.findTargetItem( e );
		if ( item && item !== this.selecting && item.isSelectable() ) {
			this.pressItem( item );
			this.selecting = item;
		}
	}
};

/**
 * Handle mouse over events.
 *
 * @private
 * @param {jQuery.Event} e Mouse over event
 * @return {undefined|boolean} False to prevent default if event is handled
 */
OO.ui.SelectWidget.prototype.onMouseOver = function ( e ) {
	if ( this.blockMouseOverEvents ) {
		return;
	}
	if ( !this.isDisabled() ) {
		const item = this.findTargetItem( e );
		this.highlightItem( item && item.isHighlightable() ? item : null );
	}
	return false;
};

/**
 * Handle mouse leave events.
 *
 * @private
 * @param {jQuery.Event} e Mouse over event
 * @return {undefined|boolean} False to prevent default if event is handled
 */
OO.ui.SelectWidget.prototype.onMouseLeave = function () {
	if ( !this.isDisabled() ) {
		this.highlightItem( null );
	}
	return false;
};

/**
 * Handle document key down events.
 *
 * @protected
 * @param {KeyboardEvent} e Key down event
 */
OO.ui.SelectWidget.prototype.onDocumentKeyDown = function ( e ) {
	let handled = false;

	const currentItem =
		( this.isVisible() && this.findHighlightedItem() ) ||
		( !this.multiselect && this.findSelectedItem() );

	let nextItem;
	if ( !this.isDisabled() ) {
		switch ( e.keyCode ) {
			case OO.ui.Keys.ENTER:
				if ( currentItem ) {
					// Select highlighted item or toggle when multiselect is enabled
					this.chooseItem( currentItem );
					handled = true;
				}
				break;
			case OO.ui.Keys.UP:
			case OO.ui.Keys.LEFT:
			case OO.ui.Keys.DOWN:
			case OO.ui.Keys.RIGHT:
				this.clearKeyPressBuffer();
				nextItem = this.findRelativeSelectableItem(
					currentItem,
					e.keyCode === OO.ui.Keys.UP || e.keyCode === OO.ui.Keys.LEFT ? -1 : 1,
					null,
					this.constructor.static.listWrapsAround
				);
				handled = true;
				break;
			case OO.ui.Keys.HOME:
			case OO.ui.Keys.END:
				if ( this.constructor.static.handleNavigationKeys ) {
					this.clearKeyPressBuffer();
					nextItem = this.findRelativeSelectableItem(
						null,
						e.keyCode === OO.ui.Keys.HOME ? 1 : -1,
						null,
						this.constructor.static.listWrapsAround
					);
					handled = true;
				}
				break;
			case OO.ui.Keys.PAGEUP:
			case OO.ui.Keys.PAGEDOWN:
				if ( this.constructor.static.handleNavigationKeys ) {
					this.clearKeyPressBuffer();
					nextItem = this.findRelativeSelectableItem(
						currentItem,
						e.keyCode === OO.ui.Keys.PAGEUP ? -10 : 10,
						null,
						this.constructor.static.listWrapsAround
					);
					handled = true;
				}
				break;
			case OO.ui.Keys.ESCAPE:
			case OO.ui.Keys.TAB:
				if ( currentItem ) {
					currentItem.setHighlighted( false );
				}
				this.unbindDocumentKeyDownListener();
				this.unbindDocumentKeyPressListener();
				// Don't prevent tabbing away / defocusing
				handled = false;
				break;
		}

		if ( nextItem ) {
			if ( this.isVisible() && nextItem.constructor.static.highlightable ) {
				this.highlightItem( nextItem );
			} else {
				if ( this.screenReaderMode ) {
					this.highlightItem( nextItem );
				}
				this.chooseItem( nextItem );
			}
			this.scrollItemIntoView( nextItem );
		}

		if ( handled ) {
			e.preventDefault();
			e.stopPropagation();
		}
	}
};

/**
 * Bind document key down listener.
 *
 * @protected
 */
OO.ui.SelectWidget.prototype.bindDocumentKeyDownListener = function () {
	this.getElementDocument().addEventListener( 'keydown', this.onDocumentKeyDownHandler, true );
};

/**
 * Unbind document key down listener.
 *
 * @protected
 */
OO.ui.SelectWidget.prototype.unbindDocumentKeyDownListener = function () {
	this.getElementDocument().removeEventListener( 'keydown', this.onDocumentKeyDownHandler, true );
};

/**
 * Scroll item into view, preventing spurious mouse highlight actions from happening.
 *
 * @param {OO.ui.OptionWidget} item Item to scroll into view
 */
OO.ui.SelectWidget.prototype.scrollItemIntoView = function ( item ) {
	// Chromium's Blink engine will generate spurious 'mouseover' events during programmatic
	// scrolling and around 100-150 ms after it is finished.
	this.blockMouseOverEvents++;
	item.scrollElementIntoView().done( () => {
		setTimeout( () => {
			this.blockMouseOverEvents--;
		}, 200 );
	} );
};

/**
 * Clear the key-press buffer
 *
 * @protected
 */
OO.ui.SelectWidget.prototype.clearKeyPressBuffer = function () {
	if ( this.keyPressBufferTimer ) {
		clearTimeout( this.keyPressBufferTimer );
		this.keyPressBufferTimer = null;
	}
	this.keyPressBuffer = '';
};

/**
 * Handle key press events.
 *
 * @protected
 * @param {KeyboardEvent} e Key press event
 * @return {undefined|boolean} False to prevent default if event is handled
 */
OO.ui.SelectWidget.prototype.onDocumentKeyPress = function ( e ) {
	if ( !e.charCode ) {
		if ( e.keyCode === OO.ui.Keys.BACKSPACE && this.keyPressBuffer !== '' ) {
			this.keyPressBuffer = this.keyPressBuffer.slice( 0, this.keyPressBuffer.length - 1 );
			return false;
		}
		return;
	}

	const c = String.fromCodePoint( e.charCode );

	if ( this.keyPressBufferTimer ) {
		clearTimeout( this.keyPressBufferTimer );
	}
	this.keyPressBufferTimer = setTimeout( this.clearKeyPressBuffer.bind( this ), 1500 );

	let item = ( this.isVisible() && this.findHighlightedItem() ) ||
		( !this.multiselect && this.findSelectedItem() );

	if ( this.keyPressBuffer === c ) {
		// Common (if weird) special case: typing "xxxx" will cycle through all
		// the items beginning with "x".
		if ( item ) {
			item = this.findRelativeSelectableItem( item, 1 );
		}
	} else {
		this.keyPressBuffer += c;
	}

	const filter = this.getItemMatcher( this.keyPressBuffer, false );
	if ( !item || !filter( item ) ) {
		item = this.findRelativeSelectableItem( item, 1, filter );
	}
	if ( item ) {
		if ( this.isVisible() && item.constructor.static.highlightable ) {
			this.highlightItem( item );
		} else {
			if ( this.screenReaderMode ) {
				this.highlightItem( item );
			}
			this.chooseItem( item );
		}
		this.scrollItemIntoView( item );
	}

	e.preventDefault();
	e.stopPropagation();
};

/**
 * Get a matcher for the specific string
 *
 * @protected
 * @param {string} query String to match against items
 * @param {string} [mode='prefix'] Matching mode: 'substring', 'prefix', or 'exact'
 * @return {Function} function ( OO.ui.OptionWidget ) => boolean
 */
OO.ui.SelectWidget.prototype.getItemMatcher = function ( query, mode ) {
	const normalizeForMatching = this.constructor.static.normalizeForMatching,
		normalizedQuery = normalizeForMatching( query );

	// Empty string matches everything, except in "exact" mode where it matches nothing
	if ( !normalizedQuery ) {
		return function () {
			return mode !== 'exact';
		};
	}

	return function ( item ) {
		const matchText = normalizeForMatching( item.getMatchText() );
		switch ( mode ) {
			case 'exact':
				return matchText === normalizedQuery;
			case 'substring':
				return matchText.indexOf( normalizedQuery ) !== -1;
			// 'prefix'
			default:
				return matchText.indexOf( normalizedQuery ) === 0;
		}
	};
};

/**
 * Bind document key press listener.
 *
 * @protected
 */
OO.ui.SelectWidget.prototype.bindDocumentKeyPressListener = function () {
	this.getElementDocument().addEventListener( 'keypress', this.onDocumentKeyPressHandler, true );
};

/**
 * Unbind document key down listener.
 *
 * If you override this, be sure to call this.clearKeyPressBuffer() from your
 * implementation.
 *
 * @protected
 */
OO.ui.SelectWidget.prototype.unbindDocumentKeyPressListener = function () {
	this.getElementDocument().removeEventListener( 'keypress', this.onDocumentKeyPressHandler, true );
	this.clearKeyPressBuffer();
};

/**
 * Visibility change handler
 *
 * @protected
 * @param {boolean} visible
 */
OO.ui.SelectWidget.prototype.onToggle = function ( visible ) {
	if ( !visible ) {
		this.clearKeyPressBuffer();
	}
};

/**
 * Get the closest item to a jQuery.Event.
 *
 * @private
 * @param {jQuery.Event} e
 * @return {OO.ui.OptionWidget|null} Outline item widget, `null` if none was found
 */
OO.ui.SelectWidget.prototype.findTargetItem = function ( e ) {
	const $option = $( e.target ).closest( '.oo-ui-optionWidget' );
	if ( !$option.closest( '.oo-ui-selectWidget' ).is( this.$element ) ) {
		return null;
	}
	return $option.data( 'oo-ui-optionWidget' ) || null;
};

/**
 * @return {OO.ui.OptionWidget|null} The first (of possibly many) selected item, if any
 */
OO.ui.SelectWidget.prototype.findFirstSelectedItem = function () {
	for ( let i = 0; i < this.items.length; i++ ) {
		if ( this.items[ i ].isSelected() ) {
			return this.items[ i ];
		}
	}
	return null;
};

/**
 * Find all selected items, if there are any. If the widget allows for multiselect
 * it will return an array of selected options. If the widget doesn't allow for
 * multiselect, it will return the selected option or null if no item is selected.
 *
 * @return {OO.ui.OptionWidget[]|OO.ui.OptionWidget|null} If the widget is multiselect
 *  then return an array of selected items (or empty array),
 *  if the widget is not multiselect, return a single selected item, or `null`
 *  if no item is selected
 */
OO.ui.SelectWidget.prototype.findSelectedItems = function () {
	if ( !this.multiselect ) {
		return this.findFirstSelectedItem();
	}

	return this.items.filter( ( item ) => item.isSelected() );
};

/**
 * Find selected item.
 *
 * @return {OO.ui.OptionWidget[]|OO.ui.OptionWidget|null} If the widget is multiselect
 *  then return an array of selected items (or empty array),
 *  if the widget is not multiselect, return a single selected item, or `null`
 *  if no item is selected
 */
OO.ui.SelectWidget.prototype.findSelectedItem = function () {
	return this.findSelectedItems();
};

/**
 * Find highlighted item.
 *
 * @return {OO.ui.OptionWidget|null} Highlighted item, `null` if no item is highlighted
 */
OO.ui.SelectWidget.prototype.findHighlightedItem = function () {
	for ( let i = 0; i < this.items.length; i++ ) {
		if ( this.items[ i ].isHighlighted() ) {
			return this.items[ i ];
		}
	}
	return null;
};

/**
 * Toggle pressed state.
 *
 * Press is a state that occurs when a user mouses down on an item, but
 * has not yet let go of the mouse. The item may appear selected, but it will not be selected
 * until the user releases the mouse.
 *
 * @param {boolean} [pressed] An option is being pressed, omit to toggle
 */
OO.ui.SelectWidget.prototype.togglePressed = function ( pressed ) {
	if ( pressed === undefined ) {
		pressed = !this.pressed;
	}
	if ( pressed !== this.pressed ) {
		this.$element
			.toggleClass( 'oo-ui-selectWidget-pressed', pressed )
			.toggleClass( 'oo-ui-selectWidget-unpressed', !pressed );
		this.pressed = pressed;
	}
};

/**
 * Highlight an option. If the `item` param is omitted, no options will be highlighted
 * and any existing highlight will be removed. The highlight is mutually exclusive.
 *
 * @param {OO.ui.OptionWidget} [item] Item to highlight, omit for no highlight
 * @fires OO.ui.SelectWidget#highlight
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.SelectWidget.prototype.highlightItem = function ( item ) {
	if ( item && item.isHighlighted() ) {
		return this;
	}

	let changed = false;

	for ( let i = 0; i < this.items.length; i++ ) {
		const highlighted = this.items[ i ] === item;
		if ( this.items[ i ].isHighlighted() !== highlighted ) {
			this.items[ i ].setHighlighted( highlighted );
			if ( changed ) {
				// This was the second change; there can only be two, a set and an unset
				break;
			}
			// Un-highlighting can't fail, but highlighting can
			changed = !highlighted || this.items[ i ].isHighlighted();
		}
	}

	if ( changed ) {
		if ( item ) {
			this.$focusOwner.attr( 'aria-activedescendant', item.getElementId() );
		} else {
			this.$focusOwner.removeAttr( 'aria-activedescendant' );
		}
		this.emit( 'highlight', item );
	}

	return this;
};

/**
 * Fetch an item by its label.
 *
 * @param {string} label Label of the item to select.
 * @param {boolean} [prefix=false] Allow a prefix match, if only a single item matches
 * @return {OO.ui.Element|null} Item with equivalent label, `null` if none exists
 */
OO.ui.SelectWidget.prototype.getItemFromLabel = function ( label, prefix ) {
	const len = this.items.length;

	let filter = this.getItemMatcher( label, 'exact' );

	let i, item;
	for ( i = 0; i < len; i++ ) {
		item = this.items[ i ];
		if ( item instanceof OO.ui.OptionWidget && item.isSelectable() && filter( item ) ) {
			return item;
		}
	}

	if ( prefix ) {
		let found = null;
		filter = this.getItemMatcher( label, 'prefix' );
		for ( i = 0; i < len; i++ ) {
			item = this.items[ i ];
			if ( item instanceof OO.ui.OptionWidget && item.isSelectable() && filter( item ) ) {
				if ( found ) {
					return null;
				}
				found = item;
			}
		}
		if ( found ) {
			return found;
		}
	}

	return null;
};

/**
 * Programmatically select an option by its label. If the item does not exist,
 * all options will be deselected.
 *
 * @param {string} [label] Label of the item to select.
 * @param {boolean} [prefix=false] Allow a prefix match, if only a single item matches
 * @fires OO.ui.SelectWidget#select
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.SelectWidget.prototype.selectItemByLabel = function ( label, prefix ) {
	const itemFromLabel = this.getItemFromLabel( label, !!prefix );
	if ( label === undefined || !itemFromLabel ) {
		return this.selectItem();
	}
	return this.selectItem( itemFromLabel );
};

/**
 * Programmatically select an option by its data. If the `data` parameter is omitted,
 * or if the item does not exist, all options will be deselected.
 *
 * @param {Object|string} [data] Value of the item to select, omit to deselect all
 * @fires OO.ui.SelectWidget#select
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.SelectWidget.prototype.selectItemByData = function ( data ) {
	const itemFromData = this.findItemFromData( data );
	if ( data === undefined || !itemFromData ) {
		return this.selectItem();
	}
	return this.selectItem( itemFromData );
};

/**
 * Programmatically unselect an option by its reference. If the widget
 * allows for multiple selections, there may be other items still selected;
 * otherwise, no items will be selected.
 * If no item is given, all selected items will be unselected.
 *
 * @param {OO.ui.OptionWidget} [unselectedItem] Item to unselect, or nothing to unselect all
 * @fires OO.ui.SelectWidget#select
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.SelectWidget.prototype.unselectItem = function ( unselectedItem ) {
	if ( !unselectedItem ) {
		// Unselect all
		this.selectItem();
	} else if ( unselectedItem.isSelected() ) {
		unselectedItem.setSelected( false );
		// Other items might still be selected in multiselect mode
		this.emit( 'select', this.findSelectedItems() );
	}

	return this;
};

/**
 * Programmatically select an option by its reference. If the `item` parameter is omitted,
 * all options will be deselected.
 *
 * @param {OO.ui.OptionWidget} [item] Item to select, omit to deselect all
 * @fires OO.ui.SelectWidget#select
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.SelectWidget.prototype.selectItem = function ( item ) {
	if ( item ) {
		if ( item.isSelected() ) {
			return this;
		} else if ( this.multiselect ) {
			// We don't care about the state of the other items when multiselect is allowed
			item.setSelected( true );
			this.emit( 'select', this.findSelectedItems() );
			return this;
		}
	}

	let changed = false;

	for ( let i = 0; i < this.items.length; i++ ) {
		const selected = this.items[ i ] === item;
		if ( this.items[ i ].isSelected() !== selected ) {
			this.items[ i ].setSelected( selected );
			if ( changed && !this.multiselect ) {
				// This was the second change; there can only be two, a set and an unset
				break;
			}
			// Un-selecting can't fail, but selecting can
			changed = !selected || this.items[ i ].isSelected();
		}
	}

	if ( changed ) {
		// Fall back to the selected instead of the highlighted option (see #highlightItem) only
		// when we know highlighting is disabled. Unfortunately we can't know without an item.
		// Don't even try when an arbitrary number of options can be selected.
		if ( !this.multiselect && item && !item.constructor.static.highlightable ) {
			this.$focusOwner.attr( 'aria-activedescendant', item.getElementId() );
		}
		this.emit( 'select', this.findSelectedItems() );
	}

	return this;
};

/**
 * Press an item.
 *
 * Press is a state that occurs when a user mouses down on an item, but has not
 * yet let go of the mouse. The item may appear selected, but it will not be selected until the user
 * releases the mouse.
 *
 * @param {OO.ui.OptionWidget} [item] Item to press, omit to depress all
 * @fires OO.ui.SelectWidget#press
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.SelectWidget.prototype.pressItem = function ( item ) {
	if ( item && item.isPressed() ) {
		return this;
	}

	let changed = false;

	for ( let i = 0; i < this.items.length; i++ ) {
		const pressed = this.items[ i ] === item;
		if ( this.items[ i ].isPressed() !== pressed ) {
			this.items[ i ].setPressed( pressed );
			if ( changed ) {
				// This was the second change; there can only be two, a set and an unset
				break;
			}
			// Un-pressing can't fail, but pressing can
			changed = !pressed || this.items[ i ].isPressed();
		}
	}

	if ( changed ) {
		this.emit( 'press', item );
	}

	return this;
};

/**
 * Select an item or toggle an item's selection when multiselect is enabled.
 *
 * Note that ‘choose’ should never be modified programmatically. A user can choose
 * an option with the keyboard or mouse and it becomes selected. To select an item programmatically,
 * use the #selectItem method.
 *
 * This method is not identical to #selectItem and may vary further in subclasses that take
 * additional action when users choose an item with the keyboard or mouse.
 *
 * @param {OO.ui.OptionWidget} item Item to choose
 * @fires OO.ui.SelectWidget#choose
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.SelectWidget.prototype.chooseItem = function ( item ) {
	if ( item ) {
		if ( this.multiselect && item.isSelected() ) {
			this.unselectItem( item );
		} else {
			this.selectItem( item );
		}

		this.emit( 'choose', item, item.isSelected() );
	}

	return this;
};

/**
 * Find an option by its position relative to the specified item (or to the start of the option
 * array, if item is `null`). The direction and distance in which to search through the option array
 * is specified with a number: e.g. -1 for the previous item (the default) or 1 for the next item,
 * or 15 for the 15th next item, etc. The method will return an option, or `null` if there are no
 * options in the array.
 *
 * @param {OO.ui.OptionWidget|null} item Item to describe the start position, or `null` to start at
 *  the beginning of the array.
 * @param {number} offset Relative position: negative to move backward, positive to move forward
 * @param {Function} [filter] Only consider items for which this function returns
 *  true. Function takes an OO.ui.OptionWidget and returns a boolean.
 * @param {boolean} [wrap=false] Do not wrap around after reaching the last or first item
 * @return {OO.ui.OptionWidget|null} Item at position, `null` if there are no items in the select
 */
OO.ui.SelectWidget.prototype.findRelativeSelectableItem = function ( item, offset, filter, wrap ) {
	const step = offset > 0 ? 1 : -1,
		len = this.items.length;
	if ( wrap === undefined ) {
		wrap = true;
	}

	let nextIndex;
	if ( item instanceof OO.ui.OptionWidget ) {
		nextIndex = this.items.indexOf( item );
	} else {
		// If no item is selected and moving forward, start at the beginning.
		// If moving backward, start at the end.
		nextIndex = offset > 0 ? 0 : len - 1;
		offset -= step;
	}

	const previousItem = item;
	let nextItem = null;
	for ( let i = 0; i < len; i++ ) {
		item = this.items[ nextIndex ];
		if (
			item instanceof OO.ui.OptionWidget && item.isSelectable() &&
			( !filter || filter( item ) )
		) {
			nextItem = item;
		}

		if ( offset === 0 && nextItem && nextItem !== previousItem ) {
			// We walked at least the desired number of steps *and* we've selected a different item.
			// This is to ensure that disabled items don't cause us to get stuck or return null.
			break;
		}

		nextIndex += step;
		if ( nextIndex < 0 || nextIndex >= len ) {
			if ( wrap ) {
				nextIndex = ( nextIndex + len ) % len;
			} else {
				// We ran out of the list, return whichever was the last valid item
				break;
			}
		}
		if ( offset !== 0 ) {
			offset -= step;
		}
	}
	return nextItem;
};

/**
 * Find the next selectable item or `null` if there are no selectable items.
 * Disabled options and menu-section markers and breaks are not selectable.
 *
 * @return {OO.ui.OptionWidget|null} Item, `null` if there aren't any selectable items
 */
OO.ui.SelectWidget.prototype.findFirstSelectableItem = function () {
	return this.findRelativeSelectableItem( null, 1 );
};

/**
 * Add an array of options to the select. Optionally, an index number can be used to
 * specify an insertion point.
 *
 * @param {OO.ui.OptionWidget[]} [items] Options to add
 * @param {number} [index] Index to insert items after
 * @fires OO.ui.SelectWidget#add
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.SelectWidget.prototype.addItems = function ( items, index ) {
	if ( !items || items.length === 0 ) {
		return this;
	}

	// Mixin method
	OO.ui.mixin.GroupWidget.prototype.addItems.call( this, items, index );

	// Always provide an index, even if it was omitted
	this.emit( 'add', items, index === undefined ? this.items.length - items.length - 1 : index );

	return this;
};

/**
 * Remove the specified array of options from the select. Options will be detached
 * from the DOM, not removed, so they can be reused later. To remove all options from
 * the select, you may wish to use the #clearItems method instead.
 *
 * @param {OO.ui.OptionWidget[]} items Items to remove
 * @fires OO.ui.SelectWidget#remove
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.SelectWidget.prototype.removeItems = function ( items ) {
	// Deselect items being removed
	for ( let i = 0; i < items.length; i++ ) {
		const item = items[ i ];
		if ( item.isSelected() ) {
			this.selectItem( null );
		}
	}

	// Mixin method
	OO.ui.mixin.GroupWidget.prototype.removeItems.call( this, items );

	this.emit( 'remove', items );

	return this;
};

/**
 * Clear all options from the select. Options will be detached from the DOM, not removed,
 * so that they can be reused later. To remove a subset of options from the select, use
 * the #removeItems method.
 *
 * @fires OO.ui.SelectWidget#remove
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.SelectWidget.prototype.clearItems = function () {
	const items = this.items.slice();

	// Mixin method
	OO.ui.mixin.GroupWidget.prototype.clearItems.call( this );

	// Clear selection
	this.selectItem( null );

	this.emit( 'remove', items );

	return this;
};

/**
 * Set the DOM element which has focus while the user is interacting with this SelectWidget.
 *
 * This is used to set `aria-activedescendant` and `aria-expanded` on it.
 *
 * @protected
 * @param {jQuery} $focusOwner
 */
OO.ui.SelectWidget.prototype.setFocusOwner = function ( $focusOwner ) {
	this.$focusOwner = $focusOwner;
};

/**
 * DecoratedOptionWidgets are {@link OO.ui.OptionWidget options} that can be configured
 * with an {@link OO.ui.mixin.IconElement icon} and/or
 * {@link OO.ui.mixin.IndicatorElement indicator}.
 * This class is used with OO.ui.SelectWidget to create a selection of mutually exclusive
 * options. For more information about options and selects, please see the
 * [OOUI documentation on MediaWiki][1].
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Widgets/Selects_and_Options
 *
 *     @example
 *     // Decorated options in a select widget.
 *     const select = new OO.ui.SelectWidget( {
 *         items: [
 *             new OO.ui.DecoratedOptionWidget( {
 *                 data: 'a',
 *                 label: 'Option with icon',
 *                 icon: 'help'
 *             } ),
 *             new OO.ui.DecoratedOptionWidget( {
 *                 data: 'b',
 *                 label: 'Option with indicator',
 *                 indicator: 'next'
 *             } )
 *         ]
 *     } );
 *     $( document.body ).append( select.$element );
 *
 * @class
 * @extends OO.ui.OptionWidget
 * @mixes OO.ui.mixin.IconElement
 * @mixes OO.ui.mixin.IndicatorElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
OO.ui.DecoratedOptionWidget = function OoUiDecoratedOptionWidget( config ) {
	// Parent constructor
	OO.ui.DecoratedOptionWidget.super.call( this, config );

	// Mixin constructors
	OO.ui.mixin.IconElement.call( this, config );
	OO.ui.mixin.IndicatorElement.call( this, config );

	// Initialization
	this.$element
		.addClass( 'oo-ui-decoratedOptionWidget' )
		.prepend( this.$icon )
		.append( this.$indicator );
};

/* Setup */

OO.inheritClass( OO.ui.DecoratedOptionWidget, OO.ui.OptionWidget );
OO.mixinClass( OO.ui.DecoratedOptionWidget, OO.ui.mixin.IconElement );
OO.mixinClass( OO.ui.DecoratedOptionWidget, OO.ui.mixin.IndicatorElement );

/**
 * MenuOptionWidget is an option widget that looks like a menu item. The class is used with
 * OO.ui.MenuSelectWidget to create a menu of mutually exclusive options. Please see
 * the [OOUI documentation on MediaWiki][1] for more information.
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Widgets/Selects_and_Options#Menu_selects_and_options
 *
 * @class
 * @extends OO.ui.DecoratedOptionWidget
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
OO.ui.MenuOptionWidget = function OoUiMenuOptionWidget( config ) {
	// Parent constructor
	OO.ui.MenuOptionWidget.super.call( this, config );

	// Properties
	this.checkIcon = new OO.ui.IconWidget( {
		icon: 'check',
		classes: [ 'oo-ui-menuOptionWidget-checkIcon' ]
	} );

	// Initialization
	this.$element
		.prepend( this.checkIcon.$element )
		.addClass( 'oo-ui-menuOptionWidget' );
};

/* Setup */

OO.inheritClass( OO.ui.MenuOptionWidget, OO.ui.DecoratedOptionWidget );

/* Static Properties */

/**
 * @static
 * @inheritdoc
 */
OO.ui.MenuOptionWidget.static.scrollIntoViewOnSelect = true;

/**
 * MenuSectionOptionWidgets are used inside {@link OO.ui.MenuSelectWidget menu select widgets} to
 * group one or more related {@link OO.ui.MenuOptionWidget menu options}. MenuSectionOptionWidgets
 * cannot be highlighted or selected.
 *
 *     @example
 *     const dropdown = new OO.ui.DropdownWidget( {
 *         menu: {
 *             items: [
 *                 new OO.ui.MenuSectionOptionWidget( {
 *                     label: 'Dogs'
 *                 } ),
 *                 new OO.ui.MenuOptionWidget( {
 *                     data: 'corgi',
 *                     label: 'Welsh Corgi'
 *                 } ),
 *                 new OO.ui.MenuOptionWidget( {
 *                     data: 'poodle',
 *                     label: 'Standard Poodle'
 *                 } ),
 *                 new OO.ui.MenuSectionOptionWidget( {
 *                     label: 'Cats'
 *                 } ),
 *                 new OO.ui.MenuOptionWidget( {
 *                     data: 'lion',
 *                     label: 'Lion'
 *                 } )
 *             ]
 *         }
 *     } );
 *     $( document.body ).append( dropdown.$element );
 *
 * @class
 * @extends OO.ui.DecoratedOptionWidget
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
OO.ui.MenuSectionOptionWidget = function OoUiMenuSectionOptionWidget( config ) {
	// Parent constructor
	OO.ui.MenuSectionOptionWidget.super.call( this, config );

	// Initialization
	this.$element
		.addClass( 'oo-ui-menuSectionOptionWidget' )
		.removeAttr( 'role aria-selected' );
	this.selected = false;
};

/* Setup */

OO.inheritClass( OO.ui.MenuSectionOptionWidget, OO.ui.DecoratedOptionWidget );

/* Static Properties */

/**
 * @static
 * @inheritdoc
 */
OO.ui.MenuSectionOptionWidget.static.selectable = false;

/**
 * @static
 * @inheritdoc
 */
OO.ui.MenuSectionOptionWidget.static.highlightable = false;

/**
 * MenuSelectWidget is a {@link OO.ui.SelectWidget select widget} that contains options and
 * is used together with OO.ui.MenuOptionWidget. It is designed be used as part of another widget.
 * See {@link OO.ui.DropdownWidget DropdownWidget},
 * {@link OO.ui.ComboBoxInputWidget ComboBoxInputWidget}, and
 * {@link OO.ui.mixin.LookupElement LookupElement} for examples of widgets that contain menus.
 * MenuSelectWidgets themselves are not instantiated directly, rather subclassed
 * and customized to be opened, closed, and displayed as needed.
 *
 * By default, menus are clipped to the visible viewport and are not visible when a user presses the
 * mouse outside the menu.
 *
 * Menus also have support for keyboard interaction:
 *
 * - Enter/Return key: choose and select a menu option
 * - Up-arrow key: highlight the previous menu option
 * - Down-arrow key: highlight the next menu option
 * - Escape key: hide the menu
 *
 * Unlike most widgets, MenuSelectWidget is initially hidden and must be shown by calling #toggle.
 *
 * Please see the [OOUI documentation on MediaWiki][1] for more information.
 * [1]: https://www.mediawiki.org/wiki/OOUI/Widgets/Selects_and_Options
 *
 * @class
 * @extends OO.ui.SelectWidget
 * @mixes OO.ui.mixin.ClippableElement
 * @mixes OO.ui.mixin.FloatableElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {OO.ui.TextInputWidget} [config.input] Text input used to implement option highlighting for menu
 *  items that match the text the user types. This config is used by
 *  {@link OO.ui.ComboBoxInputWidget ComboBoxInputWidget} and
 *  {@link OO.ui.mixin.LookupElement LookupElement}
 * @param {jQuery} [config.$input] Text input used to implement option highlighting for menu items that match
 *  the text the user types. This config is used by
 *  {@link OO.ui.TagMultiselectWidget TagMultiselectWidget}
 * @param {OO.ui.Widget} [config.widget] Widget associated with the menu's active state. If the user clicks
 *  the mouse anywhere on the page outside of this widget, the menu is hidden. For example, if
 *  there is a button that toggles the menu's visibility on click, the menu will be hidden then
 *  re-shown when the user clicks that button, unless the button (or its parent widget) is passed
 *  in here.
 * @param {boolean} [config.autoHide=true] Hide the menu when the mouse is pressed outside the menu.
 * @param {jQuery} [config.$autoCloseIgnore] If these elements are clicked, don't auto-hide the menu.
 * @param {boolean} [config.hideOnChoose=true] Hide the menu when the user chooses an option.
 * @param {boolean} [config.filterFromInput=false] Filter the displayed options from the input
 * @param {boolean} [config.highlightOnFilter=false] Highlight the first result when filtering
 * @param {string} [config.filterMode='prefix'] The mode by which the menu filters the results.
 *  Options are 'exact', 'prefix' or 'substring'. See `OO.ui.SelectWidget#getItemMatcher`
 * @param {number|string} [config.width] Width of the menu as a number of pixels or CSS string with unit
 *  suffix, used by {@link OO.ui.mixin.ClippableElement ClippableElement}
 */
OO.ui.MenuSelectWidget = function OoUiMenuSelectWidget( config ) {
	// Configuration initialization
	config = config || {};

	// Parent constructor
	OO.ui.MenuSelectWidget.super.call( this, config );

	// Mixin constructors
	OO.ui.mixin.ClippableElement.call( this, Object.assign( { $clippable: this.$group }, config ) );
	OO.ui.mixin.FloatableElement.call( this, config );

	// Initial vertical positions other than 'center' will result in
	// the menu being flipped if there is not enough space in the container.
	// Store the original position so we know what to reset to.
	this.originalVerticalPosition = this.verticalPosition;

	// Properties
	this.autoHide = config.autoHide === undefined || !!config.autoHide;
	this.hideOnChoose = config.hideOnChoose === undefined || !!config.hideOnChoose;
	this.filterFromInput = !!config.filterFromInput;
	this.previouslySelectedValue = null;
	this.$input = config.$input ? config.$input : config.input ? config.input.$input : null;
	this.$widget = config.widget ? config.widget.$element : null;
	this.$autoCloseIgnore = config.$autoCloseIgnore || $( [] );
	this.onDocumentMouseDownHandler = this.onDocumentMouseDown.bind( this );
	this.onInputEditHandler = OO.ui.debounce( this.updateItemVisibility.bind( this ), 100 );
	this.highlightOnFilter = !!config.highlightOnFilter;
	this.lastHighlightedItem = null;
	this.width = config.width;
	this.filterMode = config.filterMode;
	this.screenReaderMode = false;

	// Initialization
	this.$element.addClass( 'oo-ui-menuSelectWidget' );
	if ( config.widget ) {
		this.setFocusOwner( config.widget.$tabIndexed );
	}

	// Initially hidden - using #toggle may cause errors if subclasses override toggle with methods
	// that reference properties not initialized at that time of parent class construction
	// TODO: Find a better way to handle post-constructor setup
	this.visible = false;
	this.$element.addClass( 'oo-ui-element-hidden' );
	this.$focusOwner.attr( 'aria-expanded', 'false' );
};

/* Setup */

OO.inheritClass( OO.ui.MenuSelectWidget, OO.ui.SelectWidget );
OO.mixinClass( OO.ui.MenuSelectWidget, OO.ui.mixin.ClippableElement );
OO.mixinClass( OO.ui.MenuSelectWidget, OO.ui.mixin.FloatableElement );

/* Events */

/**
 * The menu is ready: it is visible and has been positioned and clipped.
 *
 * @event OO.ui.MenuSelectWidget#ready
 */

/* Static properties */

OO.ui.MenuSelectWidget.static.handleNavigationKeys = true;

OO.ui.MenuSelectWidget.static.listWrapsAround = false;

/**
 * Positions to flip to if there isn't room in the container for the
 * menu in a specific direction.
 *
 * @property {Object.<string,string>}
 */
OO.ui.MenuSelectWidget.static.flippedPositions = {
	below: 'above',
	above: 'below',
	top: 'bottom',
	bottom: 'top'
};

/* Methods */

/**
 * Handles document mouse down events.
 *
 * @protected
 * @param {MouseEvent} e Mouse down event
 */
OO.ui.MenuSelectWidget.prototype.onDocumentMouseDown = function ( e ) {
	if (
		this.isVisible() &&
		!OO.ui.contains(
			this.$element.add( this.$widget ).add( this.$autoCloseIgnore ).get(),
			e.target,
			true
		)
	) {
		this.toggle( false );
	}
};

/**
 * @inheritdoc
 */
OO.ui.MenuSelectWidget.prototype.onDocumentKeyDown = function ( e ) {
	let handled = false;

	const currentItem = this.findHighlightedItem() || this.findFirstSelectedItem();

	if ( !this.isDisabled() && this.getVisibleItems().length ) {
		switch ( e.keyCode ) {
			case OO.ui.Keys.ENTER:
				if ( this.isVisible() ) {
					OO.ui.MenuSelectWidget.super.prototype.onDocumentKeyDown.call( this, e );
				}
				break;
			case OO.ui.Keys.TAB:
				if ( this.isVisible() ) {
					if ( currentItem && !currentItem.isSelected() ) {
						// Was only highlighted, now let's select it. No-op if already selected.
						this.chooseItem( currentItem );
						handled = true;
					}
					this.toggle( false );
				}
				break;
			case OO.ui.Keys.LEFT:
			case OO.ui.Keys.RIGHT:
			case OO.ui.Keys.HOME:
			case OO.ui.Keys.END:
				// Do nothing if a text field is associated, these keys will be handled by the
				// text input
				if ( !this.$input ) {
					OO.ui.MenuSelectWidget.super.prototype.onDocumentKeyDown.call( this, e );
				}
				break;
			case OO.ui.Keys.ESCAPE:
				if ( this.isVisible() ) {
					if ( currentItem && !this.multiselect ) {
						currentItem.setHighlighted( false );
					}
					this.toggle( false );
					handled = true;
				}
				break;
			default:
				return OO.ui.MenuSelectWidget.super.prototype.onDocumentKeyDown.call( this, e );
		}
		if ( handled ) {
			e.preventDefault();
			e.stopPropagation();
		}
	}
};

/**
 * Return the visible items in the menu.
 *
 * @return {OO.ui.MenuOptionWidget[]} Visible items
 */
OO.ui.MenuSelectWidget.prototype.getVisibleItems = function () {
	return this.getItems().filter( ( item ) => item.isVisible() );
};

/**
 * Update menu item visibility and clipping after input changes (if filterFromInput is enabled)
 * or after items were added/removed (always).
 *
 * @protected
 */
OO.ui.MenuSelectWidget.prototype.updateItemVisibility = function () {
	if ( !this.filterFromInput || !this.$input ) {
		this.clip();
		return;
	}

	let anyVisible = false;

	const showAll = !this.isVisible() || this.previouslySelectedValue === this.$input.val(),
		filter = showAll ? null : this.getItemMatcher( this.$input.val(), this.filterMode );
	// Hide non-matching options, and also hide section headers if all options
	// in their section are hidden.
	let item;
	let section, sectionEmpty;
	for ( let i = 0; i < this.items.length; i++ ) {
		item = this.items[ i ];
		if ( item instanceof OO.ui.MenuSectionOptionWidget ) {
			if ( section ) {
				// If the previous section was empty, hide its header
				section.toggle( showAll || !sectionEmpty );
			}
			section = item;
			sectionEmpty = true;
		} else if ( item instanceof OO.ui.OptionWidget ) {
			const visible = !filter || filter( item );
			anyVisible = anyVisible || visible;
			sectionEmpty = sectionEmpty && !visible;
			item.toggle( visible );
		}
	}
	// Process the final section
	if ( section ) {
		section.toggle( showAll || !sectionEmpty );
	}

	if ( !anyVisible ) {
		this.highlightItem( null );
	}

	this.$element.toggleClass( 'oo-ui-menuSelectWidget-invisible', !anyVisible );

	if ( this.highlightOnFilter &&
		!( this.lastHighlightedItem && this.lastHighlightedItem.isSelectable() ) &&
		this.isVisible()
	) {
		// Highlight the first selectable item in the list
		item = this.findFirstSelectableItem();
		this.highlightItem( item );
		this.lastHighlightedItem = item;
	}

	// Reevaluate clipping
	this.clip();
};

/**
 * @inheritdoc
 */
OO.ui.MenuSelectWidget.prototype.bindDocumentKeyDownListener = function () {
	if ( this.$input ) {
		this.$input.on( 'keydown', this.onDocumentKeyDownHandler );
	} else {
		OO.ui.MenuSelectWidget.super.prototype.bindDocumentKeyDownListener.call( this );
	}
};

/**
 * @inheritdoc
 */
OO.ui.MenuSelectWidget.prototype.unbindDocumentKeyDownListener = function () {
	if ( this.$input ) {
		this.$input.off( 'keydown', this.onDocumentKeyDownHandler );
	} else {
		OO.ui.MenuSelectWidget.super.prototype.unbindDocumentKeyDownListener.call( this );
	}
};

/**
 * @inheritdoc
 */
OO.ui.MenuSelectWidget.prototype.bindDocumentKeyPressListener = function () {
	if ( this.$input ) {
		if ( this.filterFromInput ) {
			this.$input.on(
				'keydown mouseup cut paste change input select',
				this.onInputEditHandler
			);
			this.$input.one( 'keypress', () => {
				this.previouslySelectedValue = null;
			} );
			this.previouslySelectedValue = this.$input.val();
			this.updateItemVisibility();
		}
	} else {
		OO.ui.MenuSelectWidget.super.prototype.bindDocumentKeyPressListener.call( this );
	}
};

/**
 * @inheritdoc
 */
OO.ui.MenuSelectWidget.prototype.unbindDocumentKeyPressListener = function () {
	if ( this.$input ) {
		if ( this.filterFromInput ) {
			this.$input.off(
				'keydown mouseup cut paste change input select',
				this.onInputEditHandler
			);
			this.updateItemVisibility();
		}
	} else {
		OO.ui.MenuSelectWidget.super.prototype.unbindDocumentKeyPressListener.call( this );
	}
};

/**
 * Select an item or toggle an item's selection when multiselect is enabled.
 *
 * When a user chooses an item, the menu is closed, unless the hideOnChoose config option is
 * set to false.
 *
 * Note that ‘choose’ should never be modified programmatically. A user can choose an option with
 * the keyboard or mouse and it becomes selected. To select an item programmatically,
 * use the #selectItem method.
 *
 * @param {OO.ui.OptionWidget} item Item to choose
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.MenuSelectWidget.prototype.chooseItem = function ( item ) {
	OO.ui.MenuSelectWidget.super.prototype.chooseItem.call( this, item );
	if ( this.hideOnChoose ) {
		this.toggle( false );
	}
	return this;
};

/**
 * @inheritdoc
 */
OO.ui.MenuSelectWidget.prototype.addItems = function ( items, index ) {
	if ( !items || items.length === 0 ) {
		return this;
	}

	// Parent method
	OO.ui.MenuSelectWidget.super.prototype.addItems.call( this, items, index );

	this.updateItemVisibility();

	return this;
};

/**
 * @inheritdoc
 */
OO.ui.MenuSelectWidget.prototype.removeItems = function ( items ) {
	// Parent method
	OO.ui.MenuSelectWidget.super.prototype.removeItems.call( this, items );

	this.updateItemVisibility();

	return this;
};

/**
 * @inheritdoc
 */
OO.ui.MenuSelectWidget.prototype.clearItems = function () {
	// Parent method
	OO.ui.MenuSelectWidget.super.prototype.clearItems.call( this );

	this.updateItemVisibility();

	return this;
};

/**
 * Toggle visibility of the menu for screen readers.
 *
 * @param {boolean} [screenReaderMode=false]
 */
OO.ui.MenuSelectWidget.prototype.toggleScreenReaderMode = function ( screenReaderMode ) {
	screenReaderMode = !!screenReaderMode;
	this.screenReaderMode = screenReaderMode;

	this.$element.toggleClass( 'oo-ui-menuSelectWidget-screenReaderMode', this.screenReaderMode );

	if ( screenReaderMode ) {
		this.bindDocumentKeyDownListener();
		this.bindDocumentKeyPressListener();
	} else {
		this.$focusOwner.removeAttr( 'aria-activedescendant' );
		this.unbindDocumentKeyDownListener();
		this.unbindDocumentKeyPressListener();
	}
};

/**
 * Toggle visibility of the menu. The menu is initially hidden and must be shown by calling
 * `.toggle( true )` after its #$element is attached to the DOM.
 *
 * Do not show the menu while it is not attached to the DOM. The calculations required to display
 * it in the right place and with the right dimensions only work correctly while it is attached.
 * Side-effects may include broken interface and exceptions being thrown. This wasn't always
 * strictly enforced, so currently it only generates a warning in the browser console.
 *
 * @fires OO.ui.MenuSelectWidget#ready
 * @inheritdoc
 */
OO.ui.MenuSelectWidget.prototype.toggle = function ( visible ) {
	visible = ( visible === undefined ? !this.visible : !!visible ) && !!this.items.length;
	const change = visible !== this.isVisible();

	if ( visible && !this.warnedUnattached && !this.isElementAttached() ) {
		OO.ui.warnDeprecation( 'MenuSelectWidget#toggle: Before calling this method, the menu must be attached to the DOM.' );
		this.warnedUnattached = true;
	}

	if ( change && visible ) {
		// Reset position before showing the popup again. It's possible we no longer need to flip
		// (e.g. if the user scrolled).
		this.setVerticalPosition( this.originalVerticalPosition );
	}

	// Parent method
	OO.ui.MenuSelectWidget.super.prototype.toggle.call( this, visible );

	if ( change ) {
		if ( visible ) {

			if ( this.width ) {
				this.setIdealSize( this.width );
			} else if ( this.$floatableContainer ) {
				this.$clippable.css( 'width', 'auto' );
				this.setIdealSize(
					this.$floatableContainer[ 0 ].offsetWidth > this.$clippable[ 0 ].offsetWidth ?
						// Dropdown is smaller than handle so expand to width
						this.$floatableContainer[ 0 ].offsetWidth :
						// Dropdown is larger than handle so auto size
						'auto'
				);
				this.$clippable.css( 'width', '' );
			}

			this.togglePositioning( !!this.$floatableContainer );
			this.toggleClipping( true );

			if ( !this.screenReaderMode ) {
				this.bindDocumentKeyDownListener();
				this.bindDocumentKeyPressListener();
			}

			if (
				( this.isClippedVertically() || this.isFloatableOutOfView() ) &&
				this.originalVerticalPosition !== 'center'
			) {
				// If opening the menu in one direction causes it to be clipped, flip it
				const originalHeight = this.$element.height();
				this.setVerticalPosition(
					this.constructor.static.flippedPositions[ this.originalVerticalPosition ]
				);
				if ( this.isClippedVertically() || this.isFloatableOutOfView() ) {
					// If flipping also causes it to be clipped, open in whichever direction
					// we have more space
					const flippedHeight = this.$element.height();
					if ( originalHeight > flippedHeight ) {
						this.setVerticalPosition( this.originalVerticalPosition );
					}
				}
			}
			// Note that we do not flip the menu's opening direction if the clipping changes
			// later (e.g. after the user scrolls), that seems like it would be annoying

			this.$focusOwner.attr( 'aria-expanded', 'true' );
			this.$focusOwner.attr( 'aria-owns', this.getElementId() );

			const selectedItem = !this.multiselect && this.findSelectedItem();
			if ( selectedItem ) {
				// TODO: Verify if this is even needed; This is already done on highlight changes
				// in SelectWidget#highlightItem, so we should just need to highlight the item
				// we need to highlight here and not bother with attr or checking selections.
				this.$focusOwner.attr( 'aria-activedescendant', selectedItem.getElementId() );
				selectedItem.scrollElementIntoView( { duration: 0 } );
			}

			// Auto-hide
			if ( this.autoHide ) {
				this.getElementDocument().addEventListener( 'mousedown', this.onDocumentMouseDownHandler, true );
			}

			this.emit( 'ready' );
		} else {
			this.$focusOwner.removeAttr( 'aria-activedescendant' );
			if ( !this.screenReaderMode ) {
				this.unbindDocumentKeyDownListener();
				this.unbindDocumentKeyPressListener();
			}
			this.$focusOwner.attr( 'aria-expanded', 'false' );
			this.$focusOwner.removeAttr( 'aria-owns' );
			this.getElementDocument().removeEventListener( 'mousedown', this.onDocumentMouseDownHandler, true );
			this.togglePositioning( false );
			this.toggleClipping( false );
			this.lastHighlightedItem = null;
		}
	}

	return this;
};

/**
 * Scroll to the top of the menu
 */
OO.ui.MenuSelectWidget.prototype.scrollToTop = function () {
	this.$element.scrollTop( 0 );
};

/**
 * DropdownWidgets are not menus themselves, rather they contain a menu of options created with
 * OO.ui.MenuOptionWidget. The DropdownWidget takes care of opening and displaying the menu so that
 * users can interact with it.
 *
 * If you want to use this within an HTML form, such as a OO.ui.FormLayout, use
 * OO.ui.DropdownInputWidget instead.
 *
 * For more information, please see the [OOUI documentation on MediaWiki][1].
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Widgets/Selects_and_Options#Menu_selects_and_options
 *
 *     @example
 *     // A DropdownWidget with a menu that contains three options.
 *     const dropdown = new OO.ui.DropdownWidget( {
 *         label: 'Dropdown menu: Select a menu option',
 *         menu: {
 *             items: [
 *                 new OO.ui.MenuOptionWidget( {
 *                     data: 'a',
 *                     label: 'First'
 *                 } ),
 *                 new OO.ui.MenuOptionWidget( {
 *                     data: 'b',
 *                     label: 'Second'
 *                 } ),
 *                 new OO.ui.MenuOptionWidget( {
 *                     data: 'c',
 *                     label: 'Third'
 *                 } )
 *             ]
 *         }
 *     } );
 *
 *     $( document.body ).append( dropdown.$element );
 *
 *     dropdown.getMenu().selectItemByData( 'b' );
 *
 *     dropdown.getMenu().findSelectedItem().getData(); // Returns 'b'.
 *
 * @class
 * @extends OO.ui.Widget
 * @mixes OO.ui.mixin.IconElement
 * @mixes OO.ui.mixin.IndicatorElement
 * @mixes OO.ui.mixin.LabelElement
 * @mixes OO.ui.mixin.TitledElement
 * @mixes OO.ui.mixin.TabIndexedElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {Object} [config.menu] Configuration options to pass to
 *  {@link OO.ui.MenuSelectWidget menu select widget}.
 * @param {jQuery|boolean} [config.$overlay] Render the menu into a separate layer. This configuration is
 *  useful in cases where the expanded menu is larger than its containing `<div>`. The specified
 *  overlay layer is usually on top of the containing `<div>` and has a larger area. By default,
 *  the menu uses relative positioning. Pass 'true' to use the default overlay.
 *  See <https://www.mediawiki.org/wiki/OOUI/Concepts#Overlays>.
 */
OO.ui.DropdownWidget = function OoUiDropdownWidget( config ) {
	// Configuration initialization
	config = Object.assign( { indicator: 'down' }, config );

	// Parent constructor
	OO.ui.DropdownWidget.super.call( this, config );

	// Properties (must be set before TabIndexedElement constructor call)
	this.$handle = $( '<span>' );
	this.$overlay = ( config.$overlay === true ?
		OO.ui.getDefaultOverlay() : config.$overlay ) || this.$element;

	// Mixin constructors
	OO.ui.mixin.IconElement.call( this, config );
	OO.ui.mixin.IndicatorElement.call( this, config );
	OO.ui.mixin.LabelElement.call( this, config );
	OO.ui.mixin.TitledElement.call( this, Object.assign( {
		$titled: this.$label
	}, config ) );
	OO.ui.mixin.TabIndexedElement.call( this, Object.assign( {
		$tabIndexed: this.$handle
	}, config ) );

	// Properties
	this.menu = new OO.ui.MenuSelectWidget( Object.assign( {
		widget: this,
		$floatableContainer: this.$element
	}, config.menu ) );

	// Events
	this.$handle.on( {
		click: this.onClick.bind( this ),
		keydown: this.onKeyDown.bind( this ),
		focus: this.onFocus.bind( this ),
		blur: this.onBlur.bind( this )
	} );
	this.menu.connect( this, {
		select: 'onMenuSelect',
		toggle: 'onMenuToggle'
	} );

	// Initialization
	const labelId = OO.ui.generateElementId();
	this.setLabelId( labelId );
	this.$label
		.attr( {
			role: 'textbox',
			'aria-readonly': 'true'
		} );
	this.$handle
		.addClass( 'oo-ui-dropdownWidget-handle' )
		.append( this.$icon, this.$label, this.$indicator )
		.attr( {
			role: 'combobox',
			'aria-autocomplete': 'list',
			'aria-expanded': 'false',
			'aria-haspopup': 'true',
			'aria-labelledby': labelId
		} );
	this.$element
		.addClass( 'oo-ui-dropdownWidget' )
		.append( this.$handle );
	this.$overlay.append( this.menu.$element );
};

/* Setup */

OO.inheritClass( OO.ui.DropdownWidget, OO.ui.Widget );
OO.mixinClass( OO.ui.DropdownWidget, OO.ui.mixin.IconElement );
OO.mixinClass( OO.ui.DropdownWidget, OO.ui.mixin.IndicatorElement );
OO.mixinClass( OO.ui.DropdownWidget, OO.ui.mixin.LabelElement );
OO.mixinClass( OO.ui.DropdownWidget, OO.ui.mixin.TitledElement );
OO.mixinClass( OO.ui.DropdownWidget, OO.ui.mixin.TabIndexedElement );

/* Methods */

/**
 * Get the menu.
 *
 * @return {OO.ui.MenuSelectWidget} Menu of widget
 */
OO.ui.DropdownWidget.prototype.getMenu = function () {
	return this.menu;
};

/**
 * Handles menu select events.
 *
 * @private
 * @param {OO.ui.MenuOptionWidget} item Selected menu item
 */
OO.ui.DropdownWidget.prototype.onMenuSelect = function ( item ) {
	let selectedLabel;

	if ( !item ) {
		this.setLabel( null );
		return;
	}

	selectedLabel = item.getLabel();

	// If the label is a DOM element, clone it, because setLabel will append() it
	if ( selectedLabel instanceof $ ) {
		selectedLabel = selectedLabel.clone();
	}

	this.setLabel( selectedLabel );
};

/**
 * Handle menu toggle events.
 *
 * @private
 * @param {boolean} isVisible Open state of the menu
 */
OO.ui.DropdownWidget.prototype.onMenuToggle = function ( isVisible ) {
	this.$element.toggleClass( 'oo-ui-dropdownWidget-open', isVisible );
};

/**
 * Handle mouse click events.
 *
 * @private
 * @param {jQuery.Event} e Mouse click event
 * @return {undefined|boolean} False to prevent default if event is handled
 */
OO.ui.DropdownWidget.prototype.onClick = function ( e ) {
	if ( !this.isDisabled() && e.which === OO.ui.MouseButtons.LEFT ) {
		this.menu.toggle();
	}
	return false;
};

/**
 * Handle key down events.
 *
 * @private
 * @param {jQuery.Event} e Key down event
 * @return {undefined|boolean} False to prevent default if event is handled
 */
OO.ui.DropdownWidget.prototype.onKeyDown = function ( e ) {
	if ( !this.isDisabled() ) {
		switch ( e.keyCode ) {
			case OO.ui.Keys.ENTER:
				this.menu.toggle();
				return false;
			case OO.ui.Keys.SPACE:
				if ( this.menu.keyPressBuffer === '' ) {
					// Avoid conflicts with type-to-search, see SelectWidget#onKeyPress.
					// Space only opens the menu is the user is not typing to search.
					this.menu.toggle();
					return false;
				}
				break;
		}
	}
};

/**
 * Handle focus events.
 *
 * @private
 * @param {jQuery.Event} e Focus event
 */
OO.ui.DropdownWidget.prototype.onFocus = function () {
	this.menu.toggleScreenReaderMode( true );
};

/**
 * Handle blur events.
 *
 * @private
 * @param {jQuery.Event} e Blur event
 */
OO.ui.DropdownWidget.prototype.onBlur = function () {
	this.menu.toggleScreenReaderMode( false );
};

/**
 * @inheritdoc
 */
OO.ui.DropdownWidget.prototype.setLabelledBy = function ( id ) {
	const labelId = this.$label.attr( 'id' );

	if ( id ) {
		this.$handle.attr( 'aria-labelledby', id + ' ' + labelId );
	} else {
		this.$handle.attr( 'aria-labelledby', labelId );
	}
};

/**
 * RadioOptionWidget is an option widget that looks like a radio button.
 * The class is used with OO.ui.RadioSelectWidget to create a selection of radio options.
 * Please see the [OOUI documentation on MediaWiki][1] for more information.
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Widgets/Selects_and_Options#Button_selects_and_option
 *
 * @class
 * @extends OO.ui.OptionWidget
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {any} [config.data]
 */
OO.ui.RadioOptionWidget = function OoUiRadioOptionWidget( config ) {
	// Configuration initialization
	config = config || {};

	// Properties (must be done before parent constructor which calls #setDisabled)
	this.radio = new OO.ui.RadioInputWidget( { value: config.data, tabIndex: -1 } );

	// Parent constructor
	OO.ui.RadioOptionWidget.super.call( this, config );

	// Initialization
	// Remove implicit role, we're handling it ourselves
	this.radio.$input.attr( 'role', 'presentation' );
	this.$element
		.addClass( 'oo-ui-radioOptionWidget' )
		.attr( { role: 'radio', 'aria-checked': 'false' } )
		.removeAttr( 'aria-selected' )
		.prepend( this.radio.$element );
};

/* Setup */

OO.inheritClass( OO.ui.RadioOptionWidget, OO.ui.OptionWidget );

/* Static Properties */

/**
 * @static
 * @inheritdoc
 */
OO.ui.RadioOptionWidget.static.highlightable = false;

/**
 * @static
 * @inheritdoc
 */
OO.ui.RadioOptionWidget.static.pressable = false;

/**
 * @static
 * @inheritdoc
 */
OO.ui.RadioOptionWidget.static.tagName = 'label';

/* Methods */

/**
 * @inheritdoc
 */
OO.ui.RadioOptionWidget.prototype.setSelected = function ( state ) {
	OO.ui.RadioOptionWidget.super.prototype.setSelected.call( this, state );

	this.radio.setSelected( state );
	this.$element
		.attr( 'aria-checked', this.selected.toString() )
		.removeAttr( 'aria-selected' );

	return this;
};

/**
 * @inheritdoc
 */
OO.ui.RadioOptionWidget.prototype.setDisabled = function ( disabled ) {
	OO.ui.RadioOptionWidget.super.prototype.setDisabled.call( this, disabled );

	this.radio.setDisabled( this.isDisabled() );

	return this;
};

/**
 * RadioSelectWidget is a {@link OO.ui.SelectWidget select widget} that contains radio
 * options and is used together with OO.ui.RadioOptionWidget. The RadioSelectWidget provides
 * an interface for adding, removing and selecting options.
 * Please see the [OOUI documentation on MediaWiki][1] for more information.
 *
 * If you want to use this within an HTML form, such as a OO.ui.FormLayout, use
 * OO.ui.RadioSelectInputWidget instead.
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Widgets/Selects_and_Options
 *
 *     @example
 *     // A RadioSelectWidget with RadioOptions.
 *     const option1 = new OO.ui.RadioOptionWidget( {
 *             data: 'a',
 *             label: 'Selected radio option'
 *         } ),
 *         option2 = new OO.ui.RadioOptionWidget( {
 *             data: 'b',
 *             label: 'Unselected radio option'
 *         } );
 *         radioSelect = new OO.ui.RadioSelectWidget( {
 *             items: [ option1, option2 ]
 *         } );
 *
 *     // Select 'option 1' using the RadioSelectWidget's selectItem() method.
 *     radioSelect.selectItem( option1 );
 *
 *     $( document.body ).append( radioSelect.$element );
 *
 * @class
 * @extends OO.ui.SelectWidget
 * @mixes OO.ui.mixin.TabIndexedElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
OO.ui.RadioSelectWidget = function OoUiRadioSelectWidget( config ) {
	// Parent constructor
	OO.ui.RadioSelectWidget.super.call( this, config );

	// Mixin constructors
	OO.ui.mixin.TabIndexedElement.call( this, config );

	// Events
	this.$element.on( {
		focus: this.bindDocumentKeyDownListener.bind( this ),
		blur: this.unbindDocumentKeyDownListener.bind( this )
	} );

	// Initialization
	this.$element
		.addClass( 'oo-ui-radioSelectWidget' )
		.attr( 'role', 'radiogroup' )
		// Not applicable to 'radiogroup', and it would always be 'false' anyway
		.removeAttr( 'aria-multiselectable' );
};

/* Setup */

OO.inheritClass( OO.ui.RadioSelectWidget, OO.ui.SelectWidget );
OO.mixinClass( OO.ui.RadioSelectWidget, OO.ui.mixin.TabIndexedElement );

/**
 * MultioptionWidgets are special elements that can be selected and configured with data. The
 * data is often unique for each option, but it does not have to be. MultioptionWidgets are used
 * with OO.ui.SelectWidget to create a selection of mutually exclusive options. For more information
 * and examples, please see the [OOUI documentation on MediaWiki][1].
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Widgets/Selects_and_Options
 *
 * @class
 * @extends OO.ui.Widget
 * @mixes OO.ui.mixin.ItemWidget
 * @mixes OO.ui.mixin.LabelElement
 * @mixes OO.ui.mixin.TitledElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {boolean} [config.selected=false] Whether the option is initially selected
 */
OO.ui.MultioptionWidget = function OoUiMultioptionWidget( config ) {
	// Configuration initialization
	config = config || {};

	// Parent constructor
	OO.ui.MultioptionWidget.super.call( this, config );

	// Mixin constructors
	OO.ui.mixin.ItemWidget.call( this );
	OO.ui.mixin.LabelElement.call( this, config );
	OO.ui.mixin.TitledElement.call( this, config );

	// Properties
	this.selected = null;

	// Initialization
	this.$element
		.addClass( 'oo-ui-multioptionWidget' )
		.append( this.$label );
	this.setSelected( config.selected );
};

/* Setup */

OO.inheritClass( OO.ui.MultioptionWidget, OO.ui.Widget );
OO.mixinClass( OO.ui.MultioptionWidget, OO.ui.mixin.ItemWidget );
OO.mixinClass( OO.ui.MultioptionWidget, OO.ui.mixin.LabelElement );
OO.mixinClass( OO.ui.MultioptionWidget, OO.ui.mixin.TitledElement );

/* Events */

/**
 * A change event is emitted when the selected state of the option changes.
 *
 * @event OO.ui.MultioptionWidget#change
 * @param {boolean} selected Whether the option is now selected
 */

/* Methods */

/**
 * Check if the option is selected.
 *
 * @return {boolean} Item is selected
 */
OO.ui.MultioptionWidget.prototype.isSelected = function () {
	return this.selected;
};

/**
 * Set the option’s selected state. In general, all modifications to the selection
 * should be handled by the SelectWidget’s
 * {@link OO.ui.SelectWidget#selectItem selectItem( [item] )} method instead of this method.
 *
 * @param {boolean} [state=false] Select option
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.MultioptionWidget.prototype.setSelected = function ( state ) {
	state = !!state;
	if ( this.selected !== state ) {
		this.selected = state;
		this.emit( 'change', state );
		this.$element.toggleClass( 'oo-ui-multioptionWidget-selected', state );
	}
	return this;
};

/**
 * MultiselectWidget allows selecting multiple options from a list.
 *
 * For more information about menus and options, please see the [OOUI documentation
 * on MediaWiki][1].
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Widgets/Selects_and_Options#Menu_selects_and_options
 *
 * @class
 * @abstract
 * @extends OO.ui.Widget
 * @mixes OO.ui.mixin.GroupWidget
 * @mixes OO.ui.mixin.TitledElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {OO.ui.MultioptionWidget[]} [config.items] An array of options to add to the multiselect.
 */
OO.ui.MultiselectWidget = function OoUiMultiselectWidget( config ) {
	// Parent constructor
	OO.ui.MultiselectWidget.super.call( this, config );

	// Configuration initialization
	config = config || {};

	// Mixin constructors
	OO.ui.mixin.GroupWidget.call( this, config );
	OO.ui.mixin.TitledElement.call( this, config );

	// Events
	this.aggregate( {
		change: 'select'
	} );
	// This is mostly for compatibility with TagMultiselectWidget... normally, 'change' is emitted
	// by GroupElement only when items are added/removed
	this.connect( this, {
		select: [ 'emit', 'change' ]
	} );

	// Initialization
	this.addItems( config.items || [] );
	this.$group.addClass( 'oo-ui-multiselectWidget-group' );
	this.$element.addClass( 'oo-ui-multiselectWidget' )
		.append( this.$group );
};

/* Setup */

OO.inheritClass( OO.ui.MultiselectWidget, OO.ui.Widget );
OO.mixinClass( OO.ui.MultiselectWidget, OO.ui.mixin.GroupWidget );
OO.mixinClass( OO.ui.MultiselectWidget, OO.ui.mixin.TitledElement );

/* Events */

/**
 * A change event is emitted when the set of items changes, or an item is selected or deselected.
 *
 * @event OO.ui.MultiselectWidget#change
 */

/**
 * A select event is emitted when an item is selected or deselected.
 *
 * @event OO.ui.MultiselectWidget#select
 */

/* Methods */

/**
 * Find options that are selected.
 *
 * @return {OO.ui.MultioptionWidget[]} Selected options
 */
OO.ui.MultiselectWidget.prototype.findSelectedItems = function () {
	return this.items.filter( ( item ) => item.isSelected() );
};

/**
 * Find the data of options that are selected.
 *
 * @return {Object[]|string[]} Values of selected options
 */
OO.ui.MultiselectWidget.prototype.findSelectedItemsData = function () {
	return this.findSelectedItems().map( ( item ) => item.data );
};

/**
 * Select options by reference. Options not mentioned in the `items` array will be deselected.
 *
 * @param {OO.ui.MultioptionWidget[]} items Items to select
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.MultiselectWidget.prototype.selectItems = function ( items ) {
	const itemsSet = new Set( items );
	this.items.forEach( ( item ) => {
		const selected = itemsSet.has( item );
		item.setSelected( selected );
	} );
	return this;
};

/**
 * Select items by their data. Options not mentioned in the `datas` array will be deselected.
 *
 * @param {Object[]|string[]} datas Values of items to select
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.MultiselectWidget.prototype.selectItemsByData = function ( datas ) {
	const dataHashSet = new Set( datas.map( ( data ) => OO.getHash( data ) ) );
	this.items.forEach( ( item ) => {
		const selected = dataHashSet.has( OO.getHash( item.getData() ) );
		item.setSelected( selected );
	} );
	return this;
};

/**
 * CheckboxMultioptionWidget is an option widget that looks like a checkbox.
 * The class is used with OO.ui.CheckboxMultiselectWidget to create a selection of checkbox options.
 * Please see the [OOUI documentation on MediaWiki][1] for more information.
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Widgets/Selects_and_Options#Button_selects_and_option
 *
 * @class
 * @extends OO.ui.MultioptionWidget
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
OO.ui.CheckboxMultioptionWidget = function OoUiCheckboxMultioptionWidget( config ) {
	// Configuration initialization
	config = config || {};

	// Properties (must be done before parent constructor which calls #setDisabled)
	this.checkbox = new OO.ui.CheckboxInputWidget();

	// Parent constructor
	OO.ui.CheckboxMultioptionWidget.super.call( this, config );

	// Events
	this.checkbox.on( 'change', this.onCheckboxChange.bind( this ) );
	this.$element.on( 'keydown', this.onKeyDown.bind( this ) );

	// Initialization
	this.$element
		.addClass( 'oo-ui-checkboxMultioptionWidget' )
		.prepend( this.checkbox.$element );
};

/* Setup */

OO.inheritClass( OO.ui.CheckboxMultioptionWidget, OO.ui.MultioptionWidget );

/* Static Properties */

/**
 * @static
 * @inheritdoc
 */
OO.ui.CheckboxMultioptionWidget.static.tagName = 'label';

/* Methods */

/**
 * Handle checkbox selected state change.
 *
 * @private
 */
OO.ui.CheckboxMultioptionWidget.prototype.onCheckboxChange = function () {
	this.setSelected( this.checkbox.isSelected() );
};

/**
 * @inheritdoc
 */
OO.ui.CheckboxMultioptionWidget.prototype.setSelected = function ( state ) {
	OO.ui.CheckboxMultioptionWidget.super.prototype.setSelected.call( this, state );
	this.checkbox.setSelected( state );
	return this;
};

/**
 * @inheritdoc
 */
OO.ui.CheckboxMultioptionWidget.prototype.setDisabled = function ( disabled ) {
	OO.ui.CheckboxMultioptionWidget.super.prototype.setDisabled.call( this, disabled );
	this.checkbox.setDisabled( this.isDisabled() );
	return this;
};

/**
 * Focus the widget.
 */
OO.ui.CheckboxMultioptionWidget.prototype.focus = function () {
	this.checkbox.focus();
};

/**
 * Handle key down events.
 *
 * @protected
 * @param {jQuery.Event} e
 */
OO.ui.CheckboxMultioptionWidget.prototype.onKeyDown = function ( e ) {
	const element = this.getElementGroup();

	let nextItem;
	if ( e.keyCode === OO.ui.Keys.LEFT || e.keyCode === OO.ui.Keys.UP ) {
		nextItem = element.getRelativeFocusableItem( this, -1 );
	} else if ( e.keyCode === OO.ui.Keys.RIGHT || e.keyCode === OO.ui.Keys.DOWN ) {
		nextItem = element.getRelativeFocusableItem( this, 1 );
	}

	if ( nextItem ) {
		e.preventDefault();
		nextItem.focus();
	}
};

/**
 * CheckboxMultiselectWidget is a {@link OO.ui.MultiselectWidget multiselect widget} that contains
 * checkboxes and is used together with OO.ui.CheckboxMultioptionWidget. The
 * CheckboxMultiselectWidget provides an interface for adding, removing and selecting options.
 * Please see the [OOUI documentation on MediaWiki][1] for more information.
 *
 * If you want to use this within an HTML form, such as a OO.ui.FormLayout, use
 * OO.ui.CheckboxMultiselectInputWidget instead.
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Widgets/Selects_and_Options
 *
 *     @example
 *     // A CheckboxMultiselectWidget with CheckboxMultioptions.
 *     const option1 = new OO.ui.CheckboxMultioptionWidget( {
 *             data: 'a',
 *             selected: true,
 *             label: 'Selected checkbox'
 *         } ),
 *         option2 = new OO.ui.CheckboxMultioptionWidget( {
 *             data: 'b',
 *             label: 'Unselected checkbox'
 *         } ),
 *         multiselect = new OO.ui.CheckboxMultiselectWidget( {
 *             items: [ option1, option2 ]
 *         } );
 *     $( document.body ).append( multiselect.$element );
 *
 * @class
 * @extends OO.ui.MultiselectWidget
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
OO.ui.CheckboxMultiselectWidget = function OoUiCheckboxMultiselectWidget( config ) {
	// Parent constructor
	OO.ui.CheckboxMultiselectWidget.super.call( this, config );

	// Properties
	this.$lastClicked = null;

	// Events
	this.$group.on( 'click', this.onClick.bind( this ) );

	// Initialization
	this.$element.addClass( 'oo-ui-checkboxMultiselectWidget' );
};

/* Setup */

OO.inheritClass( OO.ui.CheckboxMultiselectWidget, OO.ui.MultiselectWidget );

/* Methods */

/**
 * Get an option by its position relative to the specified item (or to the start of the
 * option array, if item is `null`). The direction in which to search through the option array
 * is specified with a number: -1 for reverse (the default) or 1 for forward. The method will
 * return an option, or `null` if there are no options in the array.
 *
 * @param {OO.ui.CheckboxMultioptionWidget|null} item Item to describe the start position, or
 *  `null` to start at the beginning of the array.
 * @param {number} direction Direction to move in: -1 to move backward, 1 to move forward
 * @return {OO.ui.CheckboxMultioptionWidget|null} Item at position, `null` if there are no items
 *  in the select.
 */
OO.ui.CheckboxMultiselectWidget.prototype.getRelativeFocusableItem = function ( item, direction ) {
	const increase = direction > 0 ? 1 : -1,
		len = this.items.length;

	let nextIndex;
	if ( item ) {
		const currentIndex = this.items.indexOf( item );
		nextIndex = ( currentIndex + increase + len ) % len;
	} else {
		// If no item is selected and moving forward, start at the beginning.
		// If moving backward, start at the end.
		nextIndex = direction > 0 ? 0 : len - 1;
	}

	for ( let i = 0; i < len; i++ ) {
		item = this.items[ nextIndex ];
		if ( item && !item.isDisabled() ) {
			return item;
		}
		nextIndex = ( nextIndex + increase + len ) % len;
	}
	return null;
};

/**
 * Handle click events on checkboxes.
 *
 * @param {jQuery.Event} e
 */
OO.ui.CheckboxMultiselectWidget.prototype.onClick = function ( e ) {
	const $lastClicked = this.$lastClicked,
		$nowClicked = $( e.target ).closest( '.oo-ui-checkboxMultioptionWidget' )
			.not( '.oo-ui-widget-disabled' );

	// Allow selecting multiple options at once by Shift-clicking them
	if ( $lastClicked && $nowClicked.length && e.shiftKey ) {
		const $options = this.$group.find( '.oo-ui-checkboxMultioptionWidget' );
		const lastClickedIndex = $options.index( $lastClicked );
		const nowClickedIndex = $options.index( $nowClicked );
		// If it's the same item, either the user is being silly, or it's a fake event generated
		// by the browser. In either case we don't need custom handling.
		if ( nowClickedIndex !== lastClickedIndex ) {
			const items = this.items;
			const wasSelected = items[ nowClickedIndex ].isSelected();
			const direction = nowClickedIndex > lastClickedIndex ? 1 : -1;

			// This depends on the DOM order of the items and the order of the .items array being
			// the same.
			for ( let i = lastClickedIndex; i !== nowClickedIndex; i += direction ) {
				if ( !items[ i ].isDisabled() ) {
					items[ i ].setSelected( !wasSelected );
				}
			}
			// For the now-clicked element, use immediate timeout to allow the browser to do its own
			// handling first, then set our value. The order in which events happen is different for
			// clicks on the <input> and on the <label> and there are additional fake clicks fired
			// for non-click actions that change the checkboxes.
			e.preventDefault();
			setTimeout( () => {
				if ( !items[ nowClickedIndex ].isDisabled() ) {
					items[ nowClickedIndex ].setSelected( !wasSelected );
				}
			} );
		}
	}

	if ( $nowClicked.length ) {
		this.$lastClicked = $nowClicked;
	}
};

/**
 * Focus the widget
 *
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.CheckboxMultiselectWidget.prototype.focus = function () {
	if ( !this.isDisabled() ) {
		const item = this.getRelativeFocusableItem( null, 1 );
		if ( item ) {
			item.focus();
		}
	}
	return this;
};

/**
 * @inheritdoc
 */
OO.ui.CheckboxMultiselectWidget.prototype.simulateLabelClick = function () {
	this.focus();
};

/**
 * Progress bars visually display the status of an operation, such as a download,
 * and can be either determinate or indeterminate:
 *
 * - **determinate** process bars show the percent of an operation that is complete.
 *
 * - **indeterminate** process bars use a visual display of motion to indicate that an operation
 *   is taking place. Because the extent of an indeterminate operation is unknown, the bar does
 *   not use percentages.
 *
 * The value of the `progress` configuration determines whether the bar is determinate
 * or indeterminate.
 *
 *     @example
 *     // Examples of determinate and indeterminate progress bars.
 *     const progressBar1 = new OO.ui.ProgressBarWidget( {
 *         progress: 33
 *     } );
 *     const progressBar2 = new OO.ui.ProgressBarWidget();
 *
 *     // Create a FieldsetLayout to layout progress bars.
 *     const fieldset = new OO.ui.FieldsetLayout;
 *     fieldset.addItems( [
 *         new OO.ui.FieldLayout( progressBar1, {
 *             label: 'Determinate',
 *             align: 'top'
 *         } ),
 *         new OO.ui.FieldLayout( progressBar2, {
 *             label: 'Indeterminate',
 *             align: 'top'
 *         } )
 *     ] );
 *     $( document.body ).append( fieldset.$element );
 *
 * @class
 * @extends OO.ui.Widget
 * @mixes OO.ui.mixin.PendingElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {number|boolean} [config.progress=false] The type of progress bar (determinate or indeterminate).
 *  To create a determinate progress bar, specify a number that reflects the initial
 *  percent complete.
 *  By default, the progress bar is indeterminate.
 * @param {boolean} [config.inline=false] Use a smaller inline variant on the progress bar
 */
OO.ui.ProgressBarWidget = function OoUiProgressBarWidget( config ) {
	// Configuration initialization
	config = config || {};

	// Parent constructor
	OO.ui.ProgressBarWidget.super.call( this, config );

	// Mixin constructors
	OO.ui.mixin.PendingElement.call( this, config );

	// Properties
	this.$bar = $( '<div>' );
	this.progress = null;

	// Initialization
	this.setProgress( config.progress !== undefined ? config.progress : false );
	this.$bar.addClass( 'oo-ui-progressBarWidget-bar' );
	this.$element
		.attr( {
			role: 'progressbar',
			'aria-valuemin': 0,
			'aria-valuemax': 100
		} )
		.addClass( 'oo-ui-progressBarWidget' )
		.append( this.$bar );

	if ( config.inline ) {
		this.$element.addClass( 'oo-ui-progressBarWidget-inline' );
	}
};

/* Setup */

OO.inheritClass( OO.ui.ProgressBarWidget, OO.ui.Widget );
OO.mixinClass( OO.ui.ProgressBarWidget, OO.ui.mixin.PendingElement );

/* Static Properties */

/**
 * @static
 * @inheritdoc
 */
OO.ui.ProgressBarWidget.static.tagName = 'div';

/* Methods */

/**
 * Get the percent of the progress that has been completed. Indeterminate progresses will
 * return `false`.
 *
 * @return {number|boolean} Progress percent
 */
OO.ui.ProgressBarWidget.prototype.getProgress = function () {
	return this.progress;
};

/**
 * Set the percent of the process completed or `false` for an indeterminate process.
 *
 * @param {number|boolean} progress Progress percent or `false` for indeterminate
 */
OO.ui.ProgressBarWidget.prototype.setProgress = function ( progress ) {
	this.progress = progress;

	if ( progress !== false ) {
		this.$bar.css( 'width', this.progress + '%' );
		this.$element.attr( 'aria-valuenow', this.progress );
	} else {
		this.$bar.css( 'width', '' );
		this.$element.removeAttr( 'aria-valuenow' );
	}
	this.$element.toggleClass( 'oo-ui-progressBarWidget-indeterminate', progress === false );
};

/**
 * InputWidget is the base class for all input widgets, which
 * include {@link OO.ui.TextInputWidget text inputs}, {@link OO.ui.CheckboxInputWidget checkbox
 * inputs}, {@link OO.ui.RadioInputWidget radio inputs}, and
 * {@link OO.ui.ButtonInputWidget button inputs}.
 * See the [OOUI documentation on MediaWiki][1] for more information and examples.
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Widgets/Inputs
 *
 * @abstract
 * @class
 * @extends OO.ui.Widget
 * @mixes OO.ui.mixin.TabIndexedElement
 * @mixes OO.ui.mixin.TitledElement
 * @mixes OO.ui.mixin.AccessKeyedElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {string} [config.name=''] The value of the input’s HTML `name` attribute.
 * @param {string} [config.value=''] The value of the input.
 * @param {string} [config.dir] The directionality of the input (ltr/rtl).
 * @param {string} [config.inputId] The value of the input’s HTML `id` attribute.
 * @param {Function} [config.inputFilter] The name of an input filter function. Input filters modify the
 *  value of an input before it is accepted.
 */
OO.ui.InputWidget = function OoUiInputWidget( config ) {
	// Configuration initialization
	config = config || {};

	// Parent constructor
	OO.ui.InputWidget.super.call( this, config );

	// Properties
	// See #reusePreInfuseDOM about config.$input
	this.$input = config.$input || this.getInputElement( config );
	this.value = '';
	this.inputFilter = config.inputFilter;

	// Mixin constructors
	OO.ui.mixin.TabIndexedElement.call( this, Object.assign( {
		$tabIndexed: this.$input
	}, config ) );
	OO.ui.mixin.TitledElement.call( this, Object.assign( {
		$titled: this.$input
	}, config ) );
	OO.ui.mixin.AccessKeyedElement.call( this, Object.assign( {
		$accessKeyed: this.$input
	}, config ) );

	// Events
	this.$input.on( 'keydown mouseup cut paste change input select', this.onEdit.bind( this ) );

	// Initialization
	this.$input
		.addClass( 'oo-ui-inputWidget-input' )
		.attr( 'name', config.name )
		.prop( 'disabled', this.isDisabled() );
	this.$element
		.addClass( 'oo-ui-inputWidget' )
		.append( this.$input );
	this.setValue( config.value );
	if ( config.dir ) {
		this.setDir( config.dir );
	}
	if ( config.inputId !== undefined ) {
		this.setInputId( config.inputId );
	}
};

/* Setup */

OO.inheritClass( OO.ui.InputWidget, OO.ui.Widget );
OO.mixinClass( OO.ui.InputWidget, OO.ui.mixin.TabIndexedElement );
OO.mixinClass( OO.ui.InputWidget, OO.ui.mixin.TitledElement );
OO.mixinClass( OO.ui.InputWidget, OO.ui.mixin.AccessKeyedElement );

/* Static Methods */

/**
 * @inheritdoc
 */
OO.ui.InputWidget.static.reusePreInfuseDOM = function ( node, config ) {
	const $input = $( node ).find( '.oo-ui-inputWidget-input' );
	config = OO.ui.InputWidget.super.static.reusePreInfuseDOM( node, config );
	// Reusing `$input` lets browsers preserve inputted values across page reloads, see T114134.
	if ( $input.length ) {
		config.$input = $input;
	}
	return config;
};

/**
 * @inheritdoc
 */
OO.ui.InputWidget.static.gatherPreInfuseState = function ( node, config ) {
	const state = OO.ui.InputWidget.super.static.gatherPreInfuseState( node, config );
	if ( config.$input ) {
		state.value = config.$input.val();
		// Might be better in TabIndexedElement, but it's awkward to do there because
		// mixins are awkward
		state.focus = config.$input.is( ':focus' );
	}
	return state;
};

/* Events */

/**
 * A change event is emitted when the value of the input changes.
 *
 * @event OO.ui.InputWidget#change
 * @param {string} value
 */

/* Methods */

/**
 * Get input element.
 *
 * Subclasses of OO.ui.InputWidget use the `config` parameter to produce different elements in
 * different circumstances. The element must have a `value` property (like form elements).
 *
 * @protected
 * @param {Object} config Configuration options
 * @return {jQuery} Input element
 */
OO.ui.InputWidget.prototype.getInputElement = function () {
	return $( '<input>' );
};

/**
 * Handle potentially value-changing events.
 *
 * @private
 * @param {jQuery.Event} e Key down, mouse up, cut, paste, change, input, or select event
 */
OO.ui.InputWidget.prototype.onEdit = function () {
	if ( !this.isDisabled() ) {
		this.setValue( this.$input.val() );
		// Allow the stack to clear so the value will be updated
		// TODO: This appears to only be used by TextInputWidget, and in current browsers
		// they always the value immediately, however it is mostly harmless so this can be
		// left in until more thoroughly tested.
		setTimeout( () => {
			this.setValue( this.$input.val() );
		} );
	}
};

/**
 * Get the value of the input.
 *
 * @return {string} Input value
 */
OO.ui.InputWidget.prototype.getValue = function () {
	// Resynchronize our internal data with DOM data. Other scripts executing on the page can modify
	// it, and we won't know unless they're kind enough to trigger a 'change' event.
	const value = this.$input.val();
	if ( this.value !== value ) {
		this.setValue( value );
	}
	return this.value;
};

/**
 * Set the directionality of the input.
 *
 * @param {string} dir Text directionality: 'ltr', 'rtl' or 'auto'
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.InputWidget.prototype.setDir = function ( dir ) {
	this.$input.prop( 'dir', dir );
	return this;
};

/**
 * Set the value of the input.
 *
 * @param {string} value New value
 * @fires OO.ui.InputWidget#change
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.InputWidget.prototype.setValue = function ( value ) {
	value = this.cleanUpValue( value );
	// Update the DOM if it has changed. Note that with cleanUpValue, it
	// is possible for the DOM value to change without this.value changing.
	if ( this.$input.val() !== value ) {
		this.$input.val( value );
	}
	if ( this.value !== value ) {
		this.value = value;
		this.emit( 'change', this.value );
	}
	// The first time that the value is set (probably while constructing the widget),
	// remember it in defaultValue. This property can be later used to check whether
	// the value of the input has been changed since it was created.
	if ( this.defaultValue === undefined ) {
		this.defaultValue = this.value;
		this.$input[ 0 ].defaultValue = this.defaultValue;
	}
	return this;
};

/**
 * Clean up incoming value.
 *
 * Ensures value is a string, and converts undefined and null to empty string.
 *
 * @private
 * @param {string} value Original value
 * @return {string} Cleaned up value
 */
OO.ui.InputWidget.prototype.cleanUpValue = function ( value ) {
	if ( value === undefined || value === null ) {
		return '';
	} else if ( this.inputFilter ) {
		return this.inputFilter( String( value ) );
	} else {
		return String( value );
	}
};

/**
 * @inheritdoc
 */
OO.ui.InputWidget.prototype.setDisabled = function ( state ) {
	OO.ui.InputWidget.super.prototype.setDisabled.call( this, state );
	if ( this.$input ) {
		this.$input.prop( 'disabled', this.isDisabled() );
	}
	return this;
};

/**
 * Set the 'id' attribute of the `<input>` element.
 *
 * @param {string} id
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.InputWidget.prototype.setInputId = function ( id ) {
	this.$input.attr( 'id', id );
	return this;
};

/**
 * @inheritdoc
 */
OO.ui.InputWidget.prototype.restorePreInfuseState = function ( state ) {
	OO.ui.InputWidget.super.prototype.restorePreInfuseState.call( this, state );
	if ( state.value !== undefined && state.value !== this.getValue() ) {
		this.setValue( state.value );
	}
	if ( state.focus ) {
		this.focus();
	}
};

/**
 * Data widget intended for creating `<input type="hidden">` inputs.
 *
 * @class
 * @extends OO.ui.Widget
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {string} [config.value=''] The value of the input.
 * @param {string} [config.name=''] The value of the input’s HTML `name` attribute.
 */
OO.ui.HiddenInputWidget = function OoUiHiddenInputWidget( config ) {
	// Configuration initialization
	config = Object.assign( { value: '', name: '' }, config );

	// Parent constructor
	OO.ui.HiddenInputWidget.super.call( this, config );

	// Initialization
	this.$element.attr( {
		type: 'hidden',
		value: config.value,
		name: config.name
	} );
	this.$element.removeAttr( 'aria-disabled' );
};

/* Setup */

OO.inheritClass( OO.ui.HiddenInputWidget, OO.ui.Widget );

/* Static Properties */

/**
 * @static
 * @inheritdoc
 */
OO.ui.HiddenInputWidget.static.tagName = 'input';

/**
 * ButtonInputWidget is used to submit HTML forms and is intended to be used within
 * a OO.ui.FormLayout. If you do not need the button to work with HTML forms, you probably
 * want to use OO.ui.ButtonWidget instead. Button input widgets can be rendered as either an
 * HTML `<button>` (the default) or an HTML `<input>` tags. See the
 * [OOUI documentation on MediaWiki][1] for more information.
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Widgets/Inputs#Button_inputs
 *
 *     @example
 *     // A ButtonInputWidget rendered as an HTML button, the default.
 *     const button = new OO.ui.ButtonInputWidget( {
 *         label: 'Input button',
 *         icon: 'check',
 *         value: 'check'
 *     } );
 *     $( document.body ).append( button.$element );
 *
 * @class
 * @extends OO.ui.InputWidget
 * @mixes OO.ui.mixin.ButtonElement
 * @mixes OO.ui.mixin.IconElement
 * @mixes OO.ui.mixin.IndicatorElement
 * @mixes OO.ui.mixin.LabelElement
 * @mixes OO.ui.mixin.FlaggedElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {string} [config.type='button'] The value of the HTML `'type'` attribute:
 *  'button', 'submit' or 'reset'.
 * @param {boolean} [config.useInputTag=false] Use an `<input>` tag instead of a `<button>` tag, the
 *  default. Widgets configured to be an `<input>` do not support {@link OO.ui.ButtonInputWidget#icon icons} and
 *  {@link OO.ui.ButtonInputWidget#indicator indicators}, non-plaintext {@link OO.ui.ButtonInputWidget#label labels}, or {@link OO.ui.ButtonInputWidget#value values}. In
 *  general, useInputTag should only be set to `true` when there’s need to support IE 6 in a form
 *  with multiple buttons.
 * @param {boolean} [config.formNoValidate=false] Whether to use `formnovalidate` attribute.
 */
OO.ui.ButtonInputWidget = function OoUiButtonInputWidget( config ) {
	// Configuration initialization
	config = Object.assign( { type: 'button', useInputTag: false, formNoValidate: false }, config );

	// See InputWidget#reusePreInfuseDOM about config.$input
	if ( config.$input ) {
		config.$input.empty();
	}

	// Properties (must be set before parent constructor, which calls #setValue)
	this.useInputTag = config.useInputTag;

	// Parent constructor
	OO.ui.ButtonInputWidget.super.call( this, config );

	// Mixin constructors
	OO.ui.mixin.ButtonElement.call( this, Object.assign( {
		$button: this.$input
	}, config ) );
	OO.ui.mixin.IconElement.call( this, config );
	OO.ui.mixin.IndicatorElement.call( this, config );
	OO.ui.mixin.LabelElement.call( this, config );
	OO.ui.mixin.FlaggedElement.call( this, config );

	// Initialization
	if ( !config.useInputTag ) {
		this.$input.append( this.$icon, this.$label, this.$indicator );
	}

	if ( config.formNoValidate ) {
		this.$input.attr( 'formnovalidate', 'formnovalidate' );
	}

	this.$element.addClass( 'oo-ui-buttonInputWidget' );
};

/* Setup */

OO.inheritClass( OO.ui.ButtonInputWidget, OO.ui.InputWidget );
OO.mixinClass( OO.ui.ButtonInputWidget, OO.ui.mixin.ButtonElement );
OO.mixinClass( OO.ui.ButtonInputWidget, OO.ui.mixin.IconElement );
OO.mixinClass( OO.ui.ButtonInputWidget, OO.ui.mixin.IndicatorElement );
OO.mixinClass( OO.ui.ButtonInputWidget, OO.ui.mixin.LabelElement );
OO.mixinClass( OO.ui.ButtonInputWidget, OO.ui.mixin.FlaggedElement );

/* Static Properties */

/**
 * @static
 * @inheritdoc
 */
OO.ui.ButtonInputWidget.static.tagName = 'span';

/* Methods */

/**
 * @inheritdoc
 * @protected
 */
OO.ui.ButtonInputWidget.prototype.getInputElement = function ( config ) {
	const type = config.type === 'submit' || config.type === 'reset' ? config.type : 'button';
	return $( '<' + ( config.useInputTag ? 'input' : 'button' ) + ' type="' + type + '">' );
};

/**
 * Set label value.
 *
 * If #useInputTag is `true`, the label is set as the `value` of the `<input>` tag.
 *
 * @param {jQuery|string|Function|null} label Label nodes, text, a function that returns nodes or
 *  text, or `null` for no label
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.ButtonInputWidget.prototype.setLabel = function ( label ) {
	label = OO.ui.resolveMsg( label );

	if ( this.useInputTag ) {
		// Discard non-plaintext labels
		if ( typeof label !== 'string' ) {
			label = '';
		}

		this.$input.val( label );
	}

	return OO.ui.mixin.LabelElement.prototype.setLabel.call( this, label );
};

/**
 * Set the value of the input.
 *
 * This method is disabled for button inputs configured as {@link OO.ui.ButtonInputWidget#useInputTag <input> tags}, as
 * they do not support {@link OO.ui.ButtonInputWidget#value values}.
 *
 * @param {string} value New value
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.ButtonInputWidget.prototype.setValue = function ( value ) {
	if ( !this.useInputTag ) {
		OO.ui.ButtonInputWidget.super.prototype.setValue.call( this, value );
	}
	return this;
};

/**
 * @inheritdoc
 */
OO.ui.ButtonInputWidget.prototype.getInputId = function () {
	// Disable generating `<label>` elements for buttons. One would very rarely need additional
	// label for a button, and it's already a big clickable target, and it causes
	// unexpected rendering.
	return null;
};

/**
 * CheckboxInputWidgets, like HTML checkboxes, can be selected and/or configured with a value.
 * Note that these {@link OO.ui.InputWidget input widgets} are best laid out
 * in {@link OO.ui.FieldLayout field layouts} that use the {@link OO.ui.FieldLayout#align inline}
 * alignment. For more information, please see the [OOUI documentation on MediaWiki][1].
 *
 * This widget can be used inside an HTML form, such as a OO.ui.FormLayout.
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Widgets/Inputs
 *
 *     @example
 *     // An example of selected, unselected, and disabled checkbox inputs.
 *     const checkbox1 = new OO.ui.CheckboxInputWidget( {
 *             value: 'a',
 *              selected: true
 *         } ),
 *         checkbox2 = new OO.ui.CheckboxInputWidget( {
 *             value: 'b'
 *         } ),
 *         checkbox3 = new OO.ui.CheckboxInputWidget( {
 *             value:'c',
 *             disabled: true
 *         } ),
 *         // Create a fieldset layout with fields for each checkbox.
 *         fieldset = new OO.ui.FieldsetLayout( {
 *             label: 'Checkboxes'
 *         } );
 *     fieldset.addItems( [
 *         new OO.ui.FieldLayout( checkbox1, { label: 'Selected checkbox', align: 'inline' } ),
 *         new OO.ui.FieldLayout( checkbox2, { label: 'Unselected checkbox', align: 'inline' } ),
 *         new OO.ui.FieldLayout( checkbox3, { label: 'Disabled checkbox', align: 'inline' } ),
 *     ] );
 *     $( document.body ).append( fieldset.$element );
 *
 * @class
 * @extends OO.ui.InputWidget
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {boolean} [config.selected=false] Select the checkbox initially. By default, the checkbox is
 *  not selected.
 * @param {boolean} [config.indeterminate=false] Whether the checkbox is in the indeterminate state.
 */
OO.ui.CheckboxInputWidget = function OoUiCheckboxInputWidget( config ) {
	// Configuration initialization
	config = config || {};

	// Parent constructor
	OO.ui.CheckboxInputWidget.super.call( this, config );

	// Mixin constructors
	OO.ui.mixin.RequiredElement.call( this, Object.assign( {}, {
		// TODO: Display the required indicator somewhere
		indicatorElement: null
	}, config ) );

	// Properties
	this.checkIcon = new OO.ui.IconWidget( {
		icon: 'check',
		classes: [ 'oo-ui-checkboxInputWidget-checkIcon' ]
	} );

	// Initialization
	this.$element
		.addClass( 'oo-ui-checkboxInputWidget' )
		// Required for pretty styling in WikimediaUI theme
		.append( this.checkIcon.$element );
	this.setSelected( config.selected !== undefined ? config.selected : false );
	this.setIndeterminate( config.indeterminate !== undefined ? config.indeterminate : false );
};

/* Setup */

OO.inheritClass( OO.ui.CheckboxInputWidget, OO.ui.InputWidget );
OO.mixinClass( OO.ui.CheckboxInputWidget, OO.ui.mixin.RequiredElement );

/* Events */

/**
 * A change event is emitted when the state of the input changes.
 *
 * @event OO.ui.CheckboxInputWidget#change
 * @param {boolean} selected
 * @param {boolean} indeterminate
 */

/* Static Properties */

/**
 * @inheritdoc
 */
OO.ui.CheckboxInputWidget.static.tagName = 'span';

/* Static Methods */

/**
 * @inheritdoc
 */
OO.ui.CheckboxInputWidget.static.gatherPreInfuseState = function ( node, config ) {
	const state = OO.ui.CheckboxInputWidget.super.static.gatherPreInfuseState( node, config );
	if ( config.$input ) {
		state.checked = config.$input.prop( 'checked' );
	}
	return state;
};

/* Methods */

/**
 * @inheritdoc
 * @protected
 */
OO.ui.CheckboxInputWidget.prototype.getInputElement = function () {
	return $( '<input>' ).attr( 'type', 'checkbox' );
};

/**
 * @inheritdoc
 */
OO.ui.CheckboxInputWidget.prototype.onEdit = function () {
	if ( !this.isDisabled() ) {
		// Allow the stack to clear so the value will be updated
		setTimeout( () => {
			this.setSelected( this.$input.prop( 'checked' ) );
			this.setIndeterminate( this.$input.prop( 'indeterminate' ) );
		} );
	}
};

/**
 * Set selection state of this checkbox.
 *
 * @param {boolean} [state=false] Selected state
 * @param {boolean} [internal=false] Used for internal calls to suppress events
 * @chainable
 * @return {OO.ui.CheckboxInputWidget} The widget, for chaining
 */
OO.ui.CheckboxInputWidget.prototype.setSelected = function ( state, internal ) {
	state = !!state;
	if ( this.selected !== state ) {
		this.selected = state;
		this.$input.prop( 'checked', this.selected );
		if ( !internal ) {
			this.setIndeterminate( false, true );
			this.emit( 'change', this.selected, this.indeterminate );
		}
	}
	// The first time that the selection state is set (probably while constructing the widget),
	// remember it in defaultSelected. This property can be later used to check whether
	// the selection state of the input has been changed since it was created.
	if ( this.defaultSelected === undefined ) {
		this.defaultSelected = this.selected;
		this.$input[ 0 ].defaultChecked = this.defaultSelected;
	}
	return this;
};

/**
 * Check if this checkbox is selected.
 *
 * @return {boolean} Checkbox is selected
 */
OO.ui.CheckboxInputWidget.prototype.isSelected = function () {
	// Resynchronize our internal data with DOM data. Other scripts executing on the page can modify
	// it, and we won't know unless they're kind enough to trigger a 'change' event.
	const selected = this.$input.prop( 'checked' );
	if ( this.selected !== selected ) {
		this.setSelected( selected );
	}
	return this.selected;
};

/**
 * Set indeterminate state of this checkbox.
 *
 * @param {boolean} [state=false] Indeterminate state
 * @param {boolean} [internal=false] Used for internal calls to suppress events
 * @chainable
 * @return {OO.ui.CheckboxInputWidget} The widget, for chaining
 */
OO.ui.CheckboxInputWidget.prototype.setIndeterminate = function ( state, internal ) {
	state = !!state;
	if ( this.indeterminate !== state ) {
		this.indeterminate = state;
		this.$input.prop( 'indeterminate', this.indeterminate );
		if ( !internal ) {
			this.setSelected( false, true );
			this.emit( 'change', this.selected, this.indeterminate );
		}
	}
	return this;
};

/**
 * Check if this checkbox is selected.
 *
 * @return {boolean} Checkbox is selected
 */
OO.ui.CheckboxInputWidget.prototype.isIndeterminate = function () {
	// Resynchronize our internal data with DOM data. Other scripts executing on the page can modify
	// it, and we won't know unless they're kind enough to trigger a 'change' event.
	const indeterminate = this.$input.prop( 'indeterminate' );
	if ( this.indeterminate !== indeterminate ) {
		this.setIndeterminate( indeterminate );
	}
	return this.indeterminate;
};

/**
 * @inheritdoc
 */
OO.ui.CheckboxInputWidget.prototype.simulateLabelClick = function () {
	if ( !this.isDisabled() ) {
		this.$handle.trigger( 'click' );
	}
	this.focus();
};

/**
 * @inheritdoc
 */
OO.ui.CheckboxInputWidget.prototype.restorePreInfuseState = function ( state ) {
	OO.ui.CheckboxInputWidget.super.prototype.restorePreInfuseState.call( this, state );
	if ( state.checked !== undefined && state.checked !== this.isSelected() ) {
		this.setSelected( state.checked );
	}
};

/**
 * DropdownInputWidget is a {@link OO.ui.DropdownWidget DropdownWidget} intended to be used
 * within an HTML form, such as a OO.ui.FormLayout. The selected value is synchronized with the
 * value of a hidden HTML `input` tag. Please see the [OOUI documentation on MediaWiki][1] for
 * more information about input widgets.
 *
 * A DropdownInputWidget always has a value (one of the options is always selected), unless there
 * are no options. If no `value` configuration option is provided, the first option is selected.
 * If you need a state representing no value (no option being selected), use a DropdownWidget.
 *
 * This and OO.ui.RadioSelectInputWidget support similar configuration options.
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Widgets/Inputs
 *
 *     @example
 *     // A DropdownInputWidget with three options.
 *     const dropdownInput = new OO.ui.DropdownInputWidget( {
 *         options: [
 *             { data: 'a', label: 'First' },
 *             { data: 'b', label: 'Second', disabled: true },
 *             { optgroup: 'Group label' },
 *             { data: 'c', label: 'First sub-item)' }
 *         ]
 *     } );
 *     $( document.body ).append( dropdownInput.$element );
 *
 * @class
 * @extends OO.ui.InputWidget
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {Object[]} [config.options=[]] Array of menu options in the format described above.
 * @param {Object} [config.dropdown] Configuration options for {@link OO.ui.DropdownWidget DropdownWidget}
 * @param {jQuery|boolean} [config.$overlay] Render the menu into a separate layer. This configuration is
 *  useful in cases where the expanded menu is larger than its containing `<div>`. The specified
 *  overlay layer is usually on top of the containing `<div>` and has a larger area. By default,
 *  the menu uses relative positioning. Pass 'true' to use the default overlay.
 *  See <https://www.mediawiki.org/wiki/OOUI/Concepts#Overlays>.
 */
OO.ui.DropdownInputWidget = function OoUiDropdownInputWidget( config ) {
	// Configuration initialization
	config = config || {};

	// Properties (must be done before parent constructor which calls #setDisabled)
	this.dropdownWidget = new OO.ui.DropdownWidget( Object.assign(
		{
			$overlay: config.$overlay
		},
		config.dropdown
	) );
	// Set up the options before parent constructor, which uses them to validate config.value.
	// Use this instead of setOptions() because this.$input is not set up yet.
	this.setOptionsData( config.options || [] );

	// Parent constructor
	OO.ui.DropdownInputWidget.super.call( this, config );

	// Mixin constructors
	OO.ui.mixin.RequiredElement.call( this, Object.assign( {}, {
		// TODO: Display the required indicator somewhere
		indicatorElement: null
	}, config ) );

	// Events
	this.dropdownWidget.getMenu().connect( this, {
		select: 'onMenuSelect'
	} );

	// Initialization
	this.$element
		.addClass( 'oo-ui-dropdownInputWidget' )
		.append( this.dropdownWidget.$element );
	if ( OO.ui.isMobile() ) {
		this.$element.addClass( 'oo-ui-isMobile' );
	}
	this.setTabIndexedElement( this.dropdownWidget.$tabIndexed );
	this.setTitledElement( this.dropdownWidget.$handle );
};

/* Setup */

OO.inheritClass( OO.ui.DropdownInputWidget, OO.ui.InputWidget );
OO.mixinClass( OO.ui.DropdownInputWidget, OO.ui.mixin.RequiredElement );

/* Methods */

/**
 * @inheritdoc
 * @protected
 */
OO.ui.DropdownInputWidget.prototype.getInputElement = function () {
	return $( '<select>' ).addClass( 'oo-ui-indicator-down' );
};

/**
 * Handles menu select events.
 *
 * @private
 * @param {OO.ui.MenuOptionWidget|null} item Selected menu item
 */
OO.ui.DropdownInputWidget.prototype.onMenuSelect = function ( item ) {
	this.setValue( item ? item.getData() : '' );
};

/**
 * @inheritdoc
 */
OO.ui.DropdownInputWidget.prototype.setValue = function ( value ) {
	value = this.cleanUpValue( value );
	// Only allow setting values that are actually present in the dropdown
	const selected = this.dropdownWidget.getMenu().findItemFromData( value ) ||
		this.dropdownWidget.getMenu().findFirstSelectableItem();
	this.dropdownWidget.getMenu().selectItem( selected );
	value = selected ? selected.getData() : '';
	OO.ui.DropdownInputWidget.super.prototype.setValue.call( this, value );
	if ( this.optionsDirty ) {
		// We reached this from the constructor or from #setOptions.
		// We have to update the <select> element.
		this.updateOptionsInterface();
	}
	return this;
};

/**
 * @inheritdoc
 */
OO.ui.DropdownInputWidget.prototype.setDisabled = function ( state ) {
	this.dropdownWidget.setDisabled( state );
	OO.ui.DropdownInputWidget.super.prototype.setDisabled.call( this, state );
	return this;
};

/**
 * Set the options available for this input.
 *
 * @param {Object[]} options Array of menu options in the format `{ data: …, label: … }`
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.DropdownInputWidget.prototype.setOptions = function ( options ) {
	const value = this.getValue();

	this.setOptionsData( options );

	// Re-set the value to update the visible interface (DropdownWidget and <select>).
	// In case the previous value is no longer an available option, select the first valid one.
	this.setValue( value );

	return this;
};

/**
 * Set the internal list of options, used e.g. by setValue() to see which options are allowed.
 *
 * This method may be called before the parent constructor, so various properties may not be
 * initialized yet.
 *
 * @param {Object[]} options Array of menu options (see #constructor for details).
 * @private
 */
OO.ui.DropdownInputWidget.prototype.setOptionsData = function ( options ) {
	this.optionsDirty = true;

	// Go through all the supplied option configs and create either
	// MenuSectionOption or MenuOption widgets from each.
	const optionWidgets = [];
	let previousOptgroup;
	for ( let optIndex = 0; optIndex < options.length; optIndex++ ) {
		const opt = options[ optIndex ];

		let optionWidget;
		if ( opt.optgroup !== undefined ) {
			// Create a <optgroup> menu item.
			optionWidget = this.createMenuSectionOptionWidget( opt.optgroup );
			previousOptgroup = optionWidget;

		} else {
			// Create a normal <option> menu item.
			const optValue = this.cleanUpValue( opt.data );
			optionWidget = this.createMenuOptionWidget(
				optValue,
				opt.label !== undefined ? opt.label : optValue
			);
		}

		// Disable the menu option if it is itself disabled or if its parent optgroup is disabled.
		if (
			opt.disabled !== undefined ||
			previousOptgroup instanceof OO.ui.MenuSectionOptionWidget &&
			previousOptgroup.isDisabled()
		) {
			optionWidget.setDisabled( true );
		}

		optionWidgets.push( optionWidget );
	}

	this.dropdownWidget.getMenu().clearItems().addItems( optionWidgets );
};

/**
 * Create a menu option widget.
 *
 * @protected
 * @param {string} data Item data
 * @param {string} label Item label
 * @return {OO.ui.MenuOptionWidget} Option widget
 */
OO.ui.DropdownInputWidget.prototype.createMenuOptionWidget = function ( data, label ) {
	return new OO.ui.MenuOptionWidget( {
		data: data,
		label: label
	} );
};

/**
 * Create a menu section option widget.
 *
 * @protected
 * @param {string} label Section item label
 * @return {OO.ui.MenuSectionOptionWidget} Menu section option widget
 */
OO.ui.DropdownInputWidget.prototype.createMenuSectionOptionWidget = function ( label ) {
	return new OO.ui.MenuSectionOptionWidget( {
		label: label
	} );
};

/**
 * Update the user-visible interface to match the internal list of options and value.
 *
 * This method must only be called after the parent constructor.
 *
 * @private
 */
OO.ui.DropdownInputWidget.prototype.updateOptionsInterface = function () {
	let $optionsContainer = this.$input;

	const defaultValue = this.defaultValue;

	this.$input.empty();

	this.dropdownWidget.getMenu().getItems().forEach( ( optionWidget ) => {
		let $optionNode;

		if ( !( optionWidget instanceof OO.ui.MenuSectionOptionWidget ) ) {
			$optionNode = $( '<option>' )
				.attr( 'value', optionWidget.getData() )
				.text( optionWidget.getLabel() );

			// Remember original selection state. This property can be later used to check whether
			// the selection state of the input has been changed since it was created.
			$optionNode[ 0 ].defaultSelected = ( optionWidget.getData() === defaultValue );

			$optionsContainer.append( $optionNode );
		} else {
			$optionNode = $( '<optgroup>' )
				.attr( 'label', optionWidget.getLabel() );
			this.$input.append( $optionNode );
			$optionsContainer = $optionNode;
		}

		// Disable the option or optgroup if required.
		if ( optionWidget.isDisabled() ) {
			$optionNode.prop( 'disabled', true );
		}
	} );

	this.optionsDirty = false;
};

/**
 * @inheritdoc
 */
OO.ui.DropdownInputWidget.prototype.focus = function () {
	this.dropdownWidget.focus();
	return this;
};

/**
 * @inheritdoc
 */
OO.ui.DropdownInputWidget.prototype.blur = function () {
	this.dropdownWidget.blur();
	return this;
};

/**
 * @inheritdoc
 */
OO.ui.DropdownInputWidget.prototype.setLabelledBy = function ( id ) {
	this.dropdownWidget.setLabelledBy( id );
};

/**
 * RadioInputWidget creates a single radio button. Because radio buttons are usually used as a set,
 * in most cases you will want to use a {@link OO.ui.RadioSelectWidget radio select}
 * with {@link OO.ui.RadioOptionWidget radio options} instead of this class. For more information,
 * please see the [OOUI documentation on MediaWiki][1].
 *
 * This widget can be used inside an HTML form, such as a OO.ui.FormLayout.
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Widgets/Inputs
 *
 *     @example
 *     // An example of selected, unselected, and disabled radio inputs
 *     const radio1 = new OO.ui.RadioInputWidget( {
 *         value: 'a',
 *         selected: true
 *     } );
 *     const radio2 = new OO.ui.RadioInputWidget( {
 *         value: 'b'
 *     } );
 *     const radio3 = new OO.ui.RadioInputWidget( {
 *         value: 'c',
 *         disabled: true
 *     } );
 *     // Create a fieldset layout with fields for each radio button.
 *     const fieldset = new OO.ui.FieldsetLayout( {
 *         label: 'Radio inputs'
 *     } );
 *     fieldset.addItems( [
 *         new OO.ui.FieldLayout( radio1, { label: 'Selected', align: 'inline' } ),
 *         new OO.ui.FieldLayout( radio2, { label: 'Unselected', align: 'inline' } ),
 *         new OO.ui.FieldLayout( radio3, { label: 'Disabled', align: 'inline' } ),
 *     ] );
 *     $( document.body ).append( fieldset.$element );
 *
 * @class
 * @extends OO.ui.InputWidget
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {boolean} [config.selected=false] Select the radio button initially. By default, the radio button
 *  is not selected.
 */
OO.ui.RadioInputWidget = function OoUiRadioInputWidget( config ) {
	// Configuration initialization
	config = config || {};

	// Parent constructor
	OO.ui.RadioInputWidget.super.call( this, config );

	// Mixin constructors
	OO.ui.mixin.RequiredElement.call( this, Object.assign( {}, {
		// TODO: Display the required indicator somewhere
		indicatorElement: null
	}, config ) );

	// Initialization
	this.$element
		.addClass( 'oo-ui-radioInputWidget' )
		// Required for pretty styling in WikimediaUI theme
		.append( $( '<span>' ) );
	this.setSelected( config.selected !== undefined ? config.selected : false );
};

/* Setup */

OO.inheritClass( OO.ui.RadioInputWidget, OO.ui.InputWidget );
OO.mixinClass( OO.ui.RadioInputWidget, OO.ui.mixin.RequiredElement );

/* Static Properties */

/**
 * @static
 * @inheritdoc
 */
OO.ui.RadioInputWidget.static.tagName = 'span';

/* Static Methods */

/**
 * @inheritdoc
 */
OO.ui.RadioInputWidget.static.gatherPreInfuseState = function ( node, config ) {
	const state = OO.ui.RadioInputWidget.super.static.gatherPreInfuseState( node, config );
	if ( config.$input ) {
		state.checked = config.$input.prop( 'checked' );
	}
	return state;
};

/* Methods */

/**
 * @inheritdoc
 * @protected
 */
OO.ui.RadioInputWidget.prototype.getInputElement = function () {
	return $( '<input>' ).attr( 'type', 'radio' );
};

/**
 * @inheritdoc
 */
OO.ui.RadioInputWidget.prototype.onEdit = function () {
	// RadioInputWidget doesn't track its state.
};

/**
 * Set selection state of this radio button.
 *
 * @param {boolean} state `true` for selected
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.RadioInputWidget.prototype.setSelected = function ( state ) {
	// RadioInputWidget doesn't track its state.
	this.$input.prop( 'checked', state );
	// The first time that the selection state is set (probably while constructing the widget),
	// remember it in defaultSelected. This property can be later used to check whether
	// the selection state of the input has been changed since it was created.
	if ( this.defaultSelected === undefined ) {
		this.defaultSelected = state;
		this.$input[ 0 ].defaultChecked = this.defaultSelected;
	}
	return this;
};

/**
 * Check if this radio button is selected.
 *
 * @return {boolean} Radio is selected
 */
OO.ui.RadioInputWidget.prototype.isSelected = function () {
	return this.$input.prop( 'checked' );
};

/**
 * @inheritdoc
 */
OO.ui.RadioInputWidget.prototype.simulateLabelClick = function () {
	if ( !this.isDisabled() ) {
		this.$input.trigger( 'click' );
	}
	this.focus();
};

/**
 * @inheritdoc
 */
OO.ui.RadioInputWidget.prototype.restorePreInfuseState = function ( state ) {
	OO.ui.RadioInputWidget.super.prototype.restorePreInfuseState.call( this, state );
	if ( state.checked !== undefined && state.checked !== this.isSelected() ) {
		this.setSelected( state.checked );
	}
};

/**
 * RadioSelectInputWidget is a {@link OO.ui.RadioSelectWidget RadioSelectWidget} intended to be
 * used within an HTML form, such as a OO.ui.FormLayout. The selected value is synchronized with
 * the value of a hidden HTML `input` tag. Please see the [OOUI documentation on MediaWiki][1] for
 * more information about input widgets.
 *
 * This and OO.ui.DropdownInputWidget support similar configuration options.
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Widgets/Inputs
 *
 *     @example
 *     // A RadioSelectInputWidget with three options
 *     const radioSelectInput = new OO.ui.RadioSelectInputWidget( {
 *         options: [
 *             { data: 'a', label: 'First' },
 *             { data: 'b', label: 'Second'},
 *             { data: 'c', label: 'Third' }
 *         ]
 *     } );
 *     $( document.body ).append( radioSelectInput.$element );
 *
 * @class
 * @extends OO.ui.InputWidget
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {Object[]} [config.options=[]] Array of menu options in the format `{ data: …, label: … }`
 */
OO.ui.RadioSelectInputWidget = function OoUiRadioSelectInputWidget( config ) {
	// Configuration initialization
	config = config || {};

	// Properties (must be done before parent constructor which calls #setDisabled)
	this.radioSelectWidget = new OO.ui.RadioSelectWidget();
	// Set up the options before parent constructor, which uses them to validate config.value.
	// Use this instead of setOptions() because this.$input is not set up yet
	this.setOptionsData( config.options || [] );

	// Parent constructor
	OO.ui.RadioSelectInputWidget.super.call( this, config );

	// Events
	this.radioSelectWidget.connect( this, {
		select: 'onMenuSelect'
	} );

	// Initialization
	this.$element
		.addClass( 'oo-ui-radioSelectInputWidget' )
		.append( this.radioSelectWidget.$element );
	this.setTabIndexedElement( this.radioSelectWidget.$tabIndexed );
};

/* Setup */

OO.inheritClass( OO.ui.RadioSelectInputWidget, OO.ui.InputWidget );

/* Static Methods */

/**
 * @inheritdoc
 */
OO.ui.RadioSelectInputWidget.static.gatherPreInfuseState = function ( node, config ) {
	const state = OO.ui.RadioSelectInputWidget.super.static.gatherPreInfuseState( node, config );
	state.value = $( node ).find( '.oo-ui-radioInputWidget .oo-ui-inputWidget-input:checked' ).val();
	return state;
};

/**
 * @inheritdoc
 */
OO.ui.RadioSelectInputWidget.static.reusePreInfuseDOM = function ( node, config ) {
	config = OO.ui.RadioSelectInputWidget.super.static.reusePreInfuseDOM( node, config );
	// Cannot reuse the `<input type=radio>` set
	delete config.$input;
	return config;
};

/* Methods */

/**
 * @inheritdoc
 * @protected
 */
OO.ui.RadioSelectInputWidget.prototype.getInputElement = function () {
	// Use this instead of <input type="hidden">, because hidden inputs do not have separate
	// 'value' and 'defaultValue' properties, and InputWidget wants to handle 'defaultValue'.
	return $( '<input>' ).addClass( 'oo-ui-element-hidden' );
};

/**
 * Handles menu select events.
 *
 * @private
 * @param {OO.ui.RadioOptionWidget} item Selected menu item
 */
OO.ui.RadioSelectInputWidget.prototype.onMenuSelect = function ( item ) {
	this.setValue( item.getData() );
};

/**
 * @inheritdoc
 */
OO.ui.RadioSelectInputWidget.prototype.setValue = function ( value ) {
	value = this.cleanUpValue( value );
	// Only allow setting values that are actually present in the dropdown
	const selected = this.radioSelectWidget.findItemFromData( value ) ||
		this.radioSelectWidget.findFirstSelectableItem();
	this.radioSelectWidget.selectItem( selected );
	value = selected ? selected.getData() : '';
	OO.ui.RadioSelectInputWidget.super.prototype.setValue.call( this, value );
	return this;
};

/**
 * @inheritdoc
 */
OO.ui.RadioSelectInputWidget.prototype.setDisabled = function ( state ) {
	this.radioSelectWidget.setDisabled( state );
	OO.ui.RadioSelectInputWidget.super.prototype.setDisabled.call( this, state );
	return this;
};

/**
 * Set the options available for this input.
 *
 * @param {Object[]} options Array of menu options in the format `{ data: …, label: … }`
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.RadioSelectInputWidget.prototype.setOptions = function ( options ) {
	const value = this.getValue();

	this.setOptionsData( options );

	// Re-set the value to update the visible interface (RadioSelectWidget).
	// In case the previous value is no longer an available option, select the first valid one.
	this.setValue( value );

	return this;
};

/**
 * Set the internal list of options, used e.g. by setValue() to see which options are allowed.
 *
 * This method may be called before the parent constructor, so various properties may not be
 * initialized yet.
 *
 * @param {Object[]} options Array of menu options in the format `{ data: …, label: … }`
 * @private
 */
OO.ui.RadioSelectInputWidget.prototype.setOptionsData = function ( options ) {
	this.radioSelectWidget
		.clearItems()
		.addItems( options.map( ( opt ) => {
			const optValue = this.cleanUpValue( opt.data );
			return new OO.ui.RadioOptionWidget( {
				data: optValue,
				label: opt.label !== undefined ? opt.label : optValue
			} );
		} ) );
};

/**
 * @inheritdoc
 */
OO.ui.RadioSelectInputWidget.prototype.focus = function () {
	this.radioSelectWidget.focus();
	return this;
};

/**
 * @inheritdoc
 */
OO.ui.RadioSelectInputWidget.prototype.blur = function () {
	this.radioSelectWidget.blur();
	return this;
};

/**
 * CheckboxMultiselectInputWidget is a
 * {@link OO.ui.CheckboxMultiselectWidget CheckboxMultiselectWidget} intended to be used within a
 * HTML form, such as a OO.ui.FormLayout. The selected values are synchronized with the value of
 * HTML `<input type=checkbox>` tags. Please see the [OOUI documentation on MediaWiki][1] for
 * more information about input widgets.
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Widgets/Inputs
 *
 *     @example
 *     // A CheckboxMultiselectInputWidget with three options.
 *     const multiselectInput = new OO.ui.CheckboxMultiselectInputWidget( {
 *         options: [
 *             { data: 'a', label: 'First' },
 *             { data: 'b', label: 'Second' },
 *             { data: 'c', label: 'Third' }
 *         ]
 *     } );
 *     $( document.body ).append( multiselectInput.$element );
 *
 * @class
 * @extends OO.ui.InputWidget
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {Object[]} [config.options=[]] Array of menu options in the format
 *  `{ data: …, label: …, disabled: … }`
 */
OO.ui.CheckboxMultiselectInputWidget = function OoUiCheckboxMultiselectInputWidget( config ) {
	// Configuration initialization
	config = config || {};

	// Properties (must be done before parent constructor which calls #setDisabled)
	this.checkboxMultiselectWidget = new OO.ui.CheckboxMultiselectWidget();
	// Must be set before the #setOptionsData call below
	this.inputName = config.name;
	// Set up the options before parent constructor, which uses them to validate config.value.
	// Use this instead of setOptions() because this.$input is not set up yet
	this.setOptionsData( config.options || [] );

	// Parent constructor
	OO.ui.CheckboxMultiselectInputWidget.super.call( this, config );

	// Events
	// HACK: When selecting multiple items, the 'select' event is fired after every item, and our
	// handler performs a linear-time operation (validating every selected value), so selecting
	// multiple items becomes quadratic (T335082#8815547). Debounce it, so that it only executes
	// once at the end of the selecting, making it linear again. This will make the internal state
	// momentarily inconsistent while the selecting is ongoing, but that's probably fine.
	this.onCheckboxesSelectHandler = OO.ui.debounce( this.onCheckboxesSelect );
	this.checkboxMultiselectWidget.connect( this, {
		select: 'onCheckboxesSelectHandler'
	} );

	// Initialization
	this.$element
		.addClass( 'oo-ui-checkboxMultiselectInputWidget' )
		.append( this.checkboxMultiselectWidget.$element );
	// We don't use this.$input, but rather the CheckboxInputWidgets inside each option
	this.$input.detach();
};

/* Setup */

OO.inheritClass( OO.ui.CheckboxMultiselectInputWidget, OO.ui.InputWidget );

/* Static Methods */

/**
 * @inheritdoc
 */
OO.ui.CheckboxMultiselectInputWidget.static.gatherPreInfuseState = function ( node, config ) {
	const state = OO.ui.CheckboxMultiselectInputWidget.super.static.gatherPreInfuseState(
		node, config
	);
	state.value = $( node ).find( '.oo-ui-checkboxInputWidget .oo-ui-inputWidget-input:checked' )
		.toArray().map( ( el ) => el.value );
	return state;
};

/**
 * @inheritdoc
 */
OO.ui.CheckboxMultiselectInputWidget.static.reusePreInfuseDOM = function ( node, config ) {
	config = OO.ui.CheckboxMultiselectInputWidget.super.static.reusePreInfuseDOM( node, config );
	// Cannot reuse the `<input type=checkbox>` set
	delete config.$input;
	return config;
};

/* Methods */

/**
 * @inheritdoc
 * @protected
 */
OO.ui.CheckboxMultiselectInputWidget.prototype.getInputElement = function () {
	// Actually unused
	return $( '<unused>' );
};

/**
 * Handles CheckboxMultiselectWidget select events.
 *
 * @private
 */
OO.ui.CheckboxMultiselectInputWidget.prototype.onCheckboxesSelect = function () {
	this.setValue( this.checkboxMultiselectWidget.findSelectedItemsData() );
};

/**
 * @inheritdoc
 */
OO.ui.CheckboxMultiselectInputWidget.prototype.getValue = function () {
	const value = this.$element.find( '.oo-ui-checkboxInputWidget .oo-ui-inputWidget-input:checked' )
		.toArray().map( ( el ) => el.value );
	if ( !OO.compare( this.value, value ) ) {
		this.setValue( value );
	}
	return this.value;
};

/**
 * @inheritdoc
 */
OO.ui.CheckboxMultiselectInputWidget.prototype.setValue = function ( value ) {
	value = this.cleanUpValue( value );
	this.checkboxMultiselectWidget.selectItemsByData( value );
	OO.ui.CheckboxMultiselectInputWidget.super.prototype.setValue.call( this, value );
	if ( this.optionsDirty ) {
		// We reached this from the constructor or from #setOptions.
		// We have to update the <select> element.
		this.updateOptionsInterface();
	}
	return this;
};

/**
 * Clean up incoming value.
 *
 * @param {string[]} value Original value
 * @return {string[]} Cleaned up value
 */
OO.ui.CheckboxMultiselectInputWidget.prototype.cleanUpValue = function ( value ) {
	const cleanValue = [];
	if ( !Array.isArray( value ) ) {
		return cleanValue;
	}
	const dataHashSet = new Set( this.checkboxMultiselectWidget.getItems().map( ( item ) => OO.getHash( item.getData() ) ) );
	for ( let i = 0; i < value.length; i++ ) {
		const singleValue = OO.ui.CheckboxMultiselectInputWidget.super.prototype.cleanUpValue
			.call( this, value[ i ] );
		// Remove options that we don't have here
		if ( !dataHashSet.has( OO.getHash( singleValue ) ) ) {
			continue;
		}
		cleanValue.push( singleValue );
	}
	return cleanValue;
};

/**
 * @inheritdoc
 */
OO.ui.CheckboxMultiselectInputWidget.prototype.setDisabled = function ( state ) {
	this.checkboxMultiselectWidget.setDisabled( state );
	OO.ui.CheckboxMultiselectInputWidget.super.prototype.setDisabled.call( this, state );
	return this;
};

/**
 * Set the options available for this input.
 *
 * @param {Object[]} options Array of menu options in the format
 *  `{ data: …, label: …, disabled: … }`
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.CheckboxMultiselectInputWidget.prototype.setOptions = function ( options ) {
	const value = this.getValue();

	this.setOptionsData( options );

	// Re-set the value to update the visible interface (CheckboxMultiselectWidget).
	// This will also get rid of any stale options that we just removed.
	this.setValue( value );

	return this;
};

/**
 * Set the internal list of options, used e.g. by setValue() to see which options are allowed.
 *
 * This method may be called before the parent constructor, so various properties may not be
 * initialized yet.
 *
 * @param {Object[]} options Array of menu options in the format
 *  `{ data: …, label: … }`
 * @private
 */
OO.ui.CheckboxMultiselectInputWidget.prototype.setOptionsData = function ( options ) {
	this.optionsDirty = true;

	this.checkboxMultiselectWidget
		.clearItems()
		.addItems( options.map( ( opt ) => {
			const optValue = OO.ui.CheckboxMultiselectInputWidget.super.prototype.cleanUpValue
				.call( this, opt.data );
			const optDisabled = opt.disabled !== undefined ? opt.disabled : false;
			const item = new OO.ui.CheckboxMultioptionWidget( {
				data: optValue,
				label: opt.label !== undefined ? opt.label : optValue,
				disabled: optDisabled
			} );
			// Set the 'name' and 'value' for form submission
			item.checkbox.$input.attr( 'name', this.inputName );
			item.checkbox.setValue( optValue );
			return item;
		} ) );
};

/**
 * Update the user-visible interface to match the internal list of options and value.
 *
 * This method must only be called after the parent constructor.
 *
 * @private
 */
OO.ui.CheckboxMultiselectInputWidget.prototype.updateOptionsInterface = function () {
	const defaultValueSet = new Set( this.defaultValue );

	this.checkboxMultiselectWidget.getItems().forEach( ( item ) => {
		// Remember original selection state. This property can be later used to check whether
		// the selection state of the input has been changed since it was created.
		const isDefault = defaultValueSet.has( item.getData() );
		item.checkbox.defaultSelected = isDefault;
		item.checkbox.$input[ 0 ].defaultChecked = isDefault;
	} );

	this.optionsDirty = false;
};

/**
 * @inheritdoc
 */
OO.ui.CheckboxMultiselectInputWidget.prototype.focus = function () {
	this.checkboxMultiselectWidget.focus();
	return this;
};

/**
 * TextInputWidgets, like HTML text inputs, can be configured with options that customize the
 * size of the field as well as its presentation. In addition, these widgets can be configured
 * with {@link OO.ui.mixin.IconElement icons}, {@link OO.ui.mixin.IndicatorElement indicators}, an
 * optional validation-pattern (used to determine if an input value is valid or not) and an input
 * filter, which modifies incoming values rather than validating them.
 * Please see the [OOUI documentation on MediaWiki][1] for more information and examples.
 *
 * This widget can be used inside an HTML form, such as a OO.ui.FormLayout.
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Widgets/Inputs
 *
 *     @example
 *     // A TextInputWidget.
 *     const textInput = new OO.ui.TextInputWidget( {
 *         value: 'Text input'
 *     } );
 *     $( document.body ).append( textInput.$element );
 *
 * @class
 * @extends OO.ui.InputWidget
 * @mixes OO.ui.mixin.IconElement
 * @mixes OO.ui.mixin.IndicatorElement
 * @mixes OO.ui.mixin.PendingElement
 * @mixes OO.ui.mixin.LabelElement
 * @mixes OO.ui.mixin.FlaggedElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {string} [config.type='text'] The value of the HTML `type` attribute: 'text', 'password'
 *  'email', 'url' or 'number'. Subclasses might support other types.
 * @param {string} [config.placeholder] Placeholder text
 * @param {boolean} [config.autofocus=false] Use an HTML `autofocus` attribute to
 *  instruct the browser to focus this widget.
 * @param {boolean} [config.readOnly=false] Prevent changes to the value of the text input.
 * @param {number} [config.maxLength] Maximum number of characters allowed in the input.
 * @param {number} [config.minLength] Minimum number of characters allowed in the input.
 *
 *  For unfortunate historical reasons, this counts the number of UTF-16 code units rather than
 *  Unicode codepoints, which means that codepoints outside the Basic Multilingual Plane (e.g.
 *  many emojis) count as 2 characters each.
 * @param {string} [config.labelPosition='after'] The position of the inline label relative to that of
 *  the value or placeholder text: `'before'` or `'after'`
 * @param {boolean|string} [config.autocomplete] Should the browser support autocomplete for this field?
 *  Type hints such as 'email' are also allowed.
 * @param {boolean} [config.spellcheck] Should the browser support spellcheck for this field (`undefined`
 *  means leaving it up to the browser).
 * @param {RegExp|Function|string} [config.validate] Validation pattern: when string, a symbolic name of a
 *  pattern defined by the class: 'non-empty' (the value cannot be an empty string) or 'integer'
 *  (the value must contain only numbers); when RegExp, a regular expression that must match the
 *  value for it to be considered valid; when Function, a function receiving the value as parameter
 *  that must return true, or promise resolving to true, for it to be considered valid.
 */
OO.ui.TextInputWidget = function OoUiTextInputWidget( config ) {
	// Configuration initialization
	config = Object.assign( {
		labelPosition: 'after'
	}, config );
	config.type = this.getValidType( config );
	if ( config.autocomplete === false ) {
		config.autocomplete = 'off';
	} else if ( config.autocomplete === true ) {
		config.autocomplete = 'on';
	}

	// Parent constructor
	OO.ui.TextInputWidget.super.call( this, config );

	// Mixin constructors
	OO.ui.mixin.IconElement.call( this, config );
	OO.ui.mixin.IndicatorElement.call( this, config );
	OO.ui.mixin.PendingElement.call( this, Object.assign( { $pending: this.$input }, config ) );
	OO.ui.mixin.LabelElement.call( this, config );
	OO.ui.mixin.FlaggedElement.call( this, config );
	OO.ui.mixin.RequiredElement.call( this, config );

	// Properties
	this.type = config.type;
	this.readOnly = false;
	this.validate = null;
	this.scrollWidth = null;

	this.setValidation( config.validate );
	this.setLabelPosition( config.labelPosition );

	// Events
	this.$input.on( {
		keypress: this.onKeyPress.bind( this ),
		blur: this.onBlur.bind( this ),
		focus: this.onFocus.bind( this )
	} );
	this.$icon.on( 'mousedown', this.onIconMouseDown.bind( this ) );
	this.$indicator.on( 'mousedown', this.onIndicatorMouseDown.bind( this ) );
	this.on( 'labelChange', this.updatePosition.bind( this ) );
	this.on( 'change', OO.ui.debounce( this.onDebouncedChange.bind( this ), 250 ) );

	// Initialization
	this.$element
		.addClass( 'oo-ui-textInputWidget oo-ui-textInputWidget-type-' + config.type )
		.append( this.$icon, this.$indicator );
	this.setReadOnly( !!config.readOnly );
	if ( config.placeholder !== undefined ) {
		this.$input.attr( 'placeholder', config.placeholder );
	}
	if ( config.maxLength !== undefined ) {
		this.$input.attr( 'maxlength', config.maxLength );
	}
	if ( config.minLength !== undefined ) {
		this.$input.attr( 'minlength', config.minLength );
	}
	if ( config.autofocus ) {
		this.$input.attr( 'autofocus', 'autofocus' );
	}
	if ( config.autocomplete !== null && config.autocomplete !== undefined ) {
		this.$input.attr( 'autocomplete', config.autocomplete );
		if ( config.autocomplete === 'off' ) {
			// Turning off autocompletion also disables "form caching" when the user navigates to a
			// different page and then clicks "Back". Re-enable it when leaving.
			// Borrowed from jQuery UI.
			$( window ).on( {
				beforeunload: function () {
					this.$input.removeAttr( 'autocomplete' );
				}.bind( this ),
				pageshow: function () {
					// Browsers don't seem to actually fire this event on "Back", they instead just
					// reload the whole page... it shouldn't hurt, though.
					this.$input.attr( 'autocomplete', 'off' );
				}.bind( this )
			} );
		}
	}
	if ( config.spellcheck !== undefined ) {
		this.$input.attr( 'spellcheck', config.spellcheck ? 'true' : 'false' );
	}
	if ( this.label ) {
		this.isWaitingToBeAttached = true;
		this.installParentChangeDetector();
	}
};

/* Setup */

OO.inheritClass( OO.ui.TextInputWidget, OO.ui.InputWidget );
OO.mixinClass( OO.ui.TextInputWidget, OO.ui.mixin.IconElement );
OO.mixinClass( OO.ui.TextInputWidget, OO.ui.mixin.IndicatorElement );
OO.mixinClass( OO.ui.TextInputWidget, OO.ui.mixin.PendingElement );
OO.mixinClass( OO.ui.TextInputWidget, OO.ui.mixin.LabelElement );
OO.mixinClass( OO.ui.TextInputWidget, OO.ui.mixin.FlaggedElement );
OO.mixinClass( OO.ui.TextInputWidget, OO.ui.mixin.RequiredElement );

/* Static Properties */

OO.ui.TextInputWidget.static.validationPatterns = {
	'non-empty': /.+/,
	integer: /^\d+$/
};

/* Events */

/**
 * An `enter` event is emitted when the user presses Enter key inside the text box.
 *
 * @event OO.ui.TextInputWidget#enter
 */

/* Methods */

/**
 * Focus the input element when clicking on the icon.
 *
 * @private
 * @param {jQuery.Event} e Mouse down event
 * @return {undefined|boolean} False to prevent default if event is handled
 */
OO.ui.TextInputWidget.prototype.onIconMouseDown = function ( e ) {
	if ( e.which === OO.ui.MouseButtons.LEFT ) {
		this.focus();
		return false;
	}
};

/**
 * Focus the input element when clicking on the indicator. This default implementation is
 * effectively only suitable for the 'required' indicator. If you are looking for functional 'clear'
 * or 'down' indicators, you might want to use the {@link OO.ui.SearchInputWidget SearchInputWidget}
 * or {@link OO.ui.ComboBoxInputWidget ComboBoxInputWidget} subclasses.
 *
 * @private
 * @param {jQuery.Event} e Mouse down event
 * @return {undefined|boolean} False to prevent default if event is handled
 */
OO.ui.TextInputWidget.prototype.onIndicatorMouseDown = function ( e ) {
	if ( e.which === OO.ui.MouseButtons.LEFT ) {
		this.focus();
		return false;
	}
};

/**
 * Handle key press events.
 *
 * @private
 * @param {jQuery.Event} e Key press event
 * @fires OO.ui.TextInputWidget#enter If Enter key is pressed
 */
OO.ui.TextInputWidget.prototype.onKeyPress = function ( e ) {
	if ( e.which === OO.ui.Keys.ENTER ) {
		this.emit( 'enter', e );
	}
};

/**
 * Handle blur events.
 *
 * @private
 * @param {jQuery.Event} e Blur event
 */
OO.ui.TextInputWidget.prototype.onBlur = function () {
	this.setValidityFlag();
};

/**
 * Handle focus events.
 *
 * @private
 * @param {jQuery.Event} e Focus event
 */
OO.ui.TextInputWidget.prototype.onFocus = function () {
	if ( this.isWaitingToBeAttached ) {
		// If we've received focus, then we must be attached to the document, and if
		// isWaitingToBeAttached is still true, that means the handler never fired. Fire it now.
		this.onElementAttach();
	}
	this.setValidityFlag( true );
};

/**
 * Handle element attach events.
 *
 * @private
 * @param {jQuery.Event} e Element attach event
 */
OO.ui.TextInputWidget.prototype.onElementAttach = function () {
	this.isWaitingToBeAttached = false;
	// Any previously calculated size is now probably invalid if we reattached elsewhere
	this.valCache = null;
	this.positionLabel();
};

/**
 * Handle debounced change events.
 *
 * @param {string} value
 * @private
 */
OO.ui.TextInputWidget.prototype.onDebouncedChange = function () {
	this.setValidityFlag();
};

/**
 * Check if the input is {@link OO.ui.TextInputWidget#readOnly read-only}.
 *
 * @return {boolean}
 */
OO.ui.TextInputWidget.prototype.isReadOnly = function () {
	return this.readOnly;
};

/**
 * Set the {@link OO.ui.TextInputWidget#readOnly read-only} state of the input.
 *
 * @param {boolean} [state=false] Make input read-only
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.TextInputWidget.prototype.setReadOnly = function ( state ) {
	this.readOnly = !!state;
	this.$input.prop( 'readOnly', this.readOnly );
	return this;
};

/**
 * Support function for making #onElementAttach work.
 */
OO.ui.TextInputWidget.prototype.installParentChangeDetector = function () {
	this.connectDetectorNode = document.createElement( 'ooui-connect-detector' );
	this.connectDetectorNode.onConnectOOUI = () => {
		if ( this.isElementAttached() ) {
			this.onElementAttach();
		}
	};

	this.$element.append( this.connectDetectorNode );
};

/**
 * @inheritdoc
 * @protected
 */
OO.ui.TextInputWidget.prototype.getInputElement = function ( config ) {
	const $input = $( '<input>' ).attr( 'type', config.type );

	if ( config.type === 'number' ) {
		$input.attr( 'step', 'any' );
	}

	return $input;
};

/**
 * Get sanitized value for 'type' for given config. Subclasses might support other types.
 *
 * @param {Object} config Configuration options
 * @param {string} [config.type='text']
 * @return {string}
 * @protected
 */
OO.ui.TextInputWidget.prototype.getValidType = function ( config ) {
	const allowedTypes = [
		'text',
		'password',
		'email',
		'url',
		'number'
	];
	return allowedTypes.indexOf( config.type ) !== -1 ? config.type : 'text';
};

/**
 * Focus the input and select a specified range within the text.
 *
 * @param {number} from Select from offset
 * @param {number} [to=from] Select to offset
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.TextInputWidget.prototype.selectRange = function ( from, to ) {
	const input = this.$input[ 0 ];

	to = to || from;

	const isBackwards = to < from,
		start = isBackwards ? to : from,
		end = isBackwards ? from : to;

	this.focus();

	try {
		input.setSelectionRange( start, end, isBackwards ? 'backward' : 'forward' );
	} catch ( e ) {
		// IE throws an exception if you call setSelectionRange on a unattached DOM node.
		// Rather than expensively check if the input is attached every time, just check
		// if it was the cause of an error being thrown. If not, rethrow the error.
		if ( this.getElementDocument().body.contains( input ) ) {
			throw e;
		}
	}
	return this;
};

/**
 * Get an object describing the current selection range in a directional manner
 *
 * @return {Object} Object containing 'from' and 'to' offsets
 */
OO.ui.TextInputWidget.prototype.getRange = function () {
	const input = this.$input[ 0 ],
		start = input.selectionStart,
		end = input.selectionEnd,
		isBackwards = input.selectionDirection === 'backward';

	return {
		from: isBackwards ? end : start,
		to: isBackwards ? start : end
	};
};

/**
 * Get the length of the text input value.
 *
 * This could differ from the length of #getValue if the
 * value gets filtered
 *
 * @return {number} Input length
 */
OO.ui.TextInputWidget.prototype.getInputLength = function () {
	return this.$input[ 0 ].value.length;
};

/**
 * Focus the input and select the entire text.
 *
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.TextInputWidget.prototype.select = function () {
	return this.selectRange( 0, this.getInputLength() );
};

/**
 * Focus the input and move the cursor to the start.
 *
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.TextInputWidget.prototype.moveCursorToStart = function () {
	return this.selectRange( 0 );
};

/**
 * Focus the input and move the cursor to the end.
 *
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.TextInputWidget.prototype.moveCursorToEnd = function () {
	return this.selectRange( this.getInputLength() );
};

/**
 * Insert new content into the input.
 *
 * @param {string} content Content to be inserted
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.TextInputWidget.prototype.insertContent = function ( content ) {
	const value = this.getValue(),
		range = this.getRange(),
		start = Math.min( range.from, range.to ),
		end = Math.max( range.from, range.to );

	this.setValue( value.slice( 0, start ) + content + value.slice( end ) );
	this.selectRange( start + content.length );
	return this;
};

/**
 * Insert new content either side of a selection.
 *
 * @param {string} pre Content to be inserted before the selection
 * @param {string} post Content to be inserted after the selection
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.TextInputWidget.prototype.encapsulateContent = function ( pre, post ) {
	const offset = pre.length,
		range = this.getRange(),
		start = Math.min( range.from, range.to ),
		end = Math.max( range.from, range.to );

	this.selectRange( start ).insertContent( pre );
	this.selectRange( offset + end ).insertContent( post );

	this.selectRange( offset + start, offset + end );
	return this;
};

/**
 * Set the validation pattern.
 *
 * The validation pattern is either a regular expression, a function, or the symbolic name of a
 * pattern defined by the class: 'non-empty' (the value cannot be an empty string) or 'integer' (the
 * value must contain only numbers).
 *
 * @param {RegExp|Function|string|null} validate Regular expression, function, or the symbolic name
 *  of a pattern (either ‘integer’ or ‘non-empty’) defined by the class.
 */
OO.ui.TextInputWidget.prototype.setValidation = function ( validate ) {
	this.validate = validate instanceof RegExp || validate instanceof Function ?
		validate :
		this.constructor.static.validationPatterns[ validate ];
};

/**
 * Sets the 'invalid' flag appropriately.
 *
 * @param {boolean} [isValid] Optionally override validation result
 */
OO.ui.TextInputWidget.prototype.setValidityFlag = function ( isValid ) {
	const setFlag = ( valid ) => {
		if ( !valid ) {
			this.$input.attr( 'aria-invalid', 'true' );
		} else {
			this.$input.removeAttr( 'aria-invalid' );
		}
		this.setFlags( { invalid: !valid } );
	};

	if ( isValid !== undefined ) {
		setFlag( isValid );
	} else {
		this.getValidity().then( () => {
			setFlag( true );
		}, () => {
			setFlag( false );
		} );
	}
};

/**
 * Get the validity of current value.
 *
 * This method returns a promise that resolves if the value is valid and rejects if
 * it isn't. Uses the {@link OO.ui.TextInputWidget#validate validation pattern}  to check for validity.
 *
 * @return {jQuery.Promise} A promise that resolves if the value is valid, rejects if not.
 */
OO.ui.TextInputWidget.prototype.getValidity = function () {
	function rejectOrResolve( valid ) {
		const deferred = $.Deferred(),
			promise = valid ? deferred.resolve() : deferred.reject();
		return promise.promise();
	}

	// Check browser validity and reject if it is invalid
	if ( this.$input[ 0 ].checkValidity && this.$input[ 0 ].checkValidity() === false ) {
		return rejectOrResolve( false );
	}

	if ( !this.validate ) {
		return rejectOrResolve( true );
	}

	// Run our checks if the browser thinks the field is valid
	let result;
	if ( this.validate instanceof Function ) {
		result = this.validate( this.getValue() );
		if ( result && typeof result.promise === 'function' ) {
			return result.promise().then( ( valid ) => rejectOrResolve( valid ) );
		}
	} else {
		// The only other type we accept is a RegExp, see #setValidation
		result = this.validate.test( this.getValue() );
	}
	return rejectOrResolve( result );
};

/**
 * Set the position of the inline label relative to that of the value: `‘before’` or `‘after’`.
 *
 * @param {string} labelPosition Label position, 'before' or 'after'
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.TextInputWidget.prototype.setLabelPosition = function ( labelPosition ) {
	this.labelPosition = labelPosition;
	if ( this.label ) {
		// If there is no label and we only change the position, #updatePosition is a no-op,
		// but it takes really a lot of work to do nothing.
		this.updatePosition();
	}
	return this;
};

/**
 * Update the position of the inline label.
 *
 * This method is called by #setLabelPosition, and can also be called on its own if
 * something causes the label to be mispositioned.
 *
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.TextInputWidget.prototype.updatePosition = function () {
	const after = this.labelPosition === 'after';

	this.$element
		.toggleClass( 'oo-ui-textInputWidget-labelPosition-after', !!this.label && after )
		.toggleClass( 'oo-ui-textInputWidget-labelPosition-before', !!this.label && !after );

	this.valCache = null;
	this.scrollWidth = null;
	this.positionLabel();

	return this;
};

/**
 * Position the label by setting the correct padding on the input.
 *
 * @private
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.TextInputWidget.prototype.positionLabel = function () {
	if ( this.isWaitingToBeAttached ) {
		// #onElementAttach will be called soon, which calls this method
		return this;
	}

	const newCss = {
		'padding-right': '',
		'padding-left': ''
	};

	if ( this.label ) {
		this.$element.append( this.$label );
	} else {
		this.$label.detach();
		// Clear old values if present
		this.$input.css( newCss );
		return;
	}

	const after = this.labelPosition === 'after',
		rtl = this.$element.css( 'direction' ) === 'rtl',
		property = after === rtl ? 'padding-left' : 'padding-right';

	newCss[ property ] = this.$label.outerWidth( true ) + ( after ? this.scrollWidth : 0 );
	// We have to clear the padding on the other side, in case the element direction changed
	this.$input.css( newCss );

	return this;
};

/**
 * SearchInputWidgets are TextInputWidgets with `type="search"` assigned and feature a
 * {@link OO.ui.mixin.IconElement 'search' icon} as well as a functional
 * {@link OO.ui.mixin.IndicatorElement 'clear' indicator} by default.
 * Please see the [OOUI documentation on MediaWiki][1] for more information and examples.
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Widgets/Inputs#SearchInputWidget
 *
 * @class
 * @extends OO.ui.TextInputWidget
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
OO.ui.SearchInputWidget = function OoUiSearchInputWidget( config ) {
	config = Object.assign( {
		icon: 'search'
	}, config );

	// Parent constructor
	OO.ui.SearchInputWidget.super.call( this, config );

	// Events
	this.connect( this, {
		change: 'onChange'
	} );
	this.$indicator.on( 'click', this.onIndicatorClick.bind( this ) );
	this.$indicator.on( 'keydown', this.onIndicatorKeyDown.bind( this ) );

	// Initialization
	this.updateSearchIndicator();
	this.connect( this, {
		disable: 'onDisable'
	} );
	this.$indicator
		.attr( {
			tabindex: -1,
			role: 'button'
		} );
};

/* Setup */

OO.inheritClass( OO.ui.SearchInputWidget, OO.ui.TextInputWidget );

/* Methods */

/**
 * @inheritdoc
 * @protected
 */
OO.ui.SearchInputWidget.prototype.getValidType = function () {
	return 'search';
};

/**
 * Clear and focus the input element when pressing enter on the 'clear' indicator.
 *
 * @param {jQuery.Event} e KeyDown event
 * @return {boolean}
 */
OO.ui.SearchInputWidget.prototype.onIndicatorKeyDown = function ( e ) {
	if ( e.keyCode === OO.ui.Keys.ENTER ) {
		// Clear the text field
		this.setValue( '' );
		this.focus();
		return false;
	}
};

/**
 * Clear and focus the input element when clicking on the 'clear' indicator.
 *
 * @param {jQuery.Event} e Click event
 * @return {boolean}
 */
OO.ui.SearchInputWidget.prototype.onIndicatorClick = function ( e ) {
	if ( e.which === OO.ui.MouseButtons.LEFT ) {
		// Clear the text field
		this.setValue( '' );
		this.focus();
		return false;
	}
};

/**
 * Update the 'clear' indicator displayed on type: 'search' text
 * fields, hiding it when the field is already empty or when it's not
 * editable.
 */
OO.ui.SearchInputWidget.prototype.updateSearchIndicator = function () {
	if ( this.getValue() === '' || this.isDisabled() || this.isReadOnly() ) {
		this.setIndicator( null );
	} else {
		this.setIndicator( 'clear' );
		this.$indicator.attr( 'aria-label', OO.ui.msg( 'ooui-item-remove' ) );
	}
};

/**
 * Handle change events.
 *
 * @private
 */
OO.ui.SearchInputWidget.prototype.onChange = function () {
	this.updateSearchIndicator();
};

/**
 * Handle disable events.
 *
 * @param {boolean} disabled Element is disabled
 * @private
 */
OO.ui.SearchInputWidget.prototype.onDisable = function () {
	this.updateSearchIndicator();
};

/**
 * @inheritdoc
 */
OO.ui.SearchInputWidget.prototype.setReadOnly = function ( state ) {
	OO.ui.SearchInputWidget.super.prototype.setReadOnly.call( this, state );
	this.updateSearchIndicator();
	return this;
};

/**
 * MultilineTextInputWidgets, like HTML textareas, are featuring customization options to
 * configure number of rows visible. In addition, these widgets can be autosized to fit user
 * inputs and can show {@link OO.ui.mixin.IconElement icons} and
 * {@link OO.ui.mixin.IndicatorElement indicators}.
 * Please see the [OOUI documentation on MediaWiki][1] for more information and examples.
 *
 * MultilineTextInputWidgets can also be used when a single line string is required, but
 * we want to display it to the user over mulitple lines (wrapped). This is done by setting
 * the `allowLinebreaks` config to `false`.
 *
 * This widget can be used inside an HTML form, such as a OO.ui.FormLayout.
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Widgets/Inputs#MultilineTextInputWidget
 *
 *     @example
 *     // A MultilineTextInputWidget.
 *     const multilineTextInput = new OO.ui.MultilineTextInputWidget( {
 *         value: 'Text input on multiple lines'
 *     } );
 *     $( document.body ).append( multilineTextInput.$element );
 *
 * @class
 * @extends OO.ui.TextInputWidget
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {number} [config.rows] Number of visible lines in textarea. If used with `autosize`,
 *  specifies minimum number of rows to display.
 * @param {boolean} [config.autosize=false] Automatically resize the text input to fit its content.
 *  Use the #maxRows config to specify a maximum number of displayed rows.
 * @param {number} [config.maxRows] Maximum number of rows to display when #autosize is set to true.
 *  Defaults to the maximum of `10` and `2 * rows`, or `10` if `rows` isn't provided.
 * @param {boolean} [config.allowLinebreaks=true] Whether to allow the user to add line breaks.
 */
OO.ui.MultilineTextInputWidget = function OoUiMultilineTextInputWidget( config ) {
	config = Object.assign( {
		type: 'text'
	}, config );

	// This property needs to exist before setValue in the parent constructor,
	// otherwise any linebreaks in the initial value won't be stripped by
	// cleanUpValue:
	this.allowLinebreaks = config.allowLinebreaks !== undefined ? config.allowLinebreaks : true;

	// Parent constructor
	OO.ui.MultilineTextInputWidget.super.call( this, config );

	// Properties
	this.autosize = !!config.autosize;
	this.styleHeight = null;
	this.minRows = config.rows !== undefined ? config.rows : '';
	this.maxRows = config.maxRows || Math.max( 2 * ( this.minRows || 0 ), 10 );

	// Clone for resizing
	if ( this.autosize ) {
		this.$clone = this.$input
			.clone()
			.removeAttr( 'id' )
			.removeAttr( 'name' )
			.insertAfter( this.$input )
			.attr( 'aria-hidden', 'true' )
			// Exclude scrollbars when calculating new size (T297963)
			.css( 'overflow', 'hidden' )
			.addClass( 'oo-ui-element-hidden' );
	}

	// Events
	this.connect( this, {
		change: 'onChange'
	} );

	// Initialization
	if ( config.rows ) {
		this.$input.attr( 'rows', config.rows );
	}
	if ( this.autosize ) {
		this.$input.addClass( 'oo-ui-textInputWidget-autosized' );
		this.isWaitingToBeAttached = true;
		this.installParentChangeDetector();
	}
};

/* Setup */

OO.inheritClass( OO.ui.MultilineTextInputWidget, OO.ui.TextInputWidget );

/* Events */

/**
 * An `resize` event is emitted when the widget changes size via the autosize functionality.
 *
 * @event OO.ui.MultilineTextInputWidget#resize
 */

/* Static Methods */

/**
 * @inheritdoc
 */
OO.ui.MultilineTextInputWidget.static.gatherPreInfuseState = function ( node, config ) {
	const state = OO.ui.MultilineTextInputWidget.super.static.gatherPreInfuseState( node, config );
	if ( config.$input ) {
		state.scrollTop = config.$input.scrollTop();
	}
	return state;
};

/* Methods */

/**
 * @inheritdoc
 */
OO.ui.MultilineTextInputWidget.prototype.onElementAttach = function () {
	OO.ui.MultilineTextInputWidget.super.prototype.onElementAttach.call( this );
	this.adjustSize();
};

/**
 * Handle change events.
 *
 * @private
 */
OO.ui.MultilineTextInputWidget.prototype.onChange = function () {
	this.adjustSize();
};

/**
 * @inheritdoc
 */
OO.ui.MultilineTextInputWidget.prototype.updatePosition = function () {
	OO.ui.MultilineTextInputWidget.super.prototype.updatePosition.call( this );
	this.adjustSize();
};

/**
 * @inheritdoc
 *
 * Modify to emit 'enter' on Ctrl/Meta+Enter, instead of plain Enter
 */
OO.ui.MultilineTextInputWidget.prototype.onKeyPress = function ( e ) {
	if ( !this.allowLinebreaks ) {
		// In this mode we're pretending to be a single-line input, so we
		// prevent adding newlines and react to enter in the same way as
		// TextInputWidget:
		if ( e.which === OO.ui.Keys.ENTER ) {
			e.preventDefault();
		}
		return OO.ui.TextInputWidget.prototype.onKeyPress.call( this, e );
	}
	if (
		( e.which === OO.ui.Keys.ENTER && ( e.ctrlKey || e.metaKey ) ) ||
		// Some platforms emit keycode 10 for Control+Enter keypress in a textarea
		e.which === 10
	) {
		this.emit( 'enter', e );
	}
};

/**
 * @inheritdoc
 */
OO.ui.MultilineTextInputWidget.prototype.cleanUpValue = function ( value ) {
	// Parent method will guarantee we're dealing with a string, and apply inputFilter:
	value = OO.ui.MultilineTextInputWidget.super.prototype.cleanUpValue( value );
	if ( !this.allowLinebreaks ) {
		// If we're forbidding linebreaks then clean them out of the incoming
		// value to avoid a confusing situation
		// TODO: Better handle a paste with linebreaks by using the paste event, as when
		// we use input filtering the cursor is always reset to the end of the input.
		value = value.replace( /\r?\n/g, ' ' );
	}
	return value;
};

/**
 * Automatically adjust the size of the text input.
 *
 * This only affects multiline inputs that are {@link OO.ui.MultilineTextInputWidget#autosize autosized}.
 *
 * @chainable
 * @param {boolean} [force=false] Force an update, even if the value hasn't changed
 * @return {OO.ui.Widget} The widget, for chaining
 * @fires OO.ui.MultilineTextInputWidget#resize
 */
OO.ui.MultilineTextInputWidget.prototype.adjustSize = function ( force ) {
	if ( force || this.$input.val() !== this.valCache ) {
		if ( this.autosize ) {
			this.$clone
				.val( this.$input.val() )
				.attr( 'rows', this.minRows )
				// Set inline height property to 0 to measure scroll height
				.css( 'height', 0 )
				.removeClass( 'oo-ui-element-hidden' );

			this.valCache = this.$input.val();

			// https://bugzilla.mozilla.org/show_bug.cgi?id=1799404
			// eslint-disable-next-line no-unused-expressions
			this.$clone[ 0 ].scrollHeight;
			const scrollHeight = this.$clone[ 0 ].scrollHeight;

			// Remove inline height property to measure natural heights
			this.$clone.css( 'height', '' );
			const innerHeight = this.$clone.innerHeight();
			const outerHeight = this.$clone.outerHeight();

			// Measure max rows height
			this.$clone
				.attr( 'rows', this.maxRows )
				.css( 'height', 'auto' )
				.val( '' );
			const maxInnerHeight = this.$clone.innerHeight();

			// Difference between reported innerHeight and scrollHeight with no scrollbars present.
			// This is sometimes non-zero on Blink-based browsers, depending on zoom level.
			const measurementError = maxInnerHeight - this.$clone[ 0 ].scrollHeight;
			const idealHeight = Math.min( maxInnerHeight, scrollHeight + measurementError );

			this.$clone.addClass( 'oo-ui-element-hidden' );

			// Only apply inline height when expansion beyond natural height is needed
			// Use the difference between the inner and outer height as a buffer
			const newHeight = idealHeight > innerHeight ? idealHeight + ( outerHeight - innerHeight ) : '';
			if ( newHeight !== this.styleHeight ) {
				this.$input.css( 'height', newHeight );
				this.styleHeight = newHeight;
				this.emit( 'resize' );
			}
		}
		const scrollWidth = this.$input[ 0 ].offsetWidth - this.$input[ 0 ].clientWidth;
		if ( scrollWidth !== this.scrollWidth ) {
			const property = this.$element.css( 'direction' ) === 'rtl' ? 'left' : 'right';
			// Reset
			this.$label.css( { right: '', left: '' } );
			this.$indicator.css( { right: '', left: '' } );

			if ( scrollWidth ) {
				this.$indicator.css( property, scrollWidth );
				if ( this.labelPosition === 'after' ) {
					this.$label.css( property, scrollWidth );
				}
			}

			this.scrollWidth = scrollWidth;
			this.positionLabel();
		}
	}
	return this;
};

/**
 * @inheritdoc
 * @protected
 */
OO.ui.MultilineTextInputWidget.prototype.getInputElement = function () {
	return $( '<textarea>' );
};

/**
 * Check if the input automatically adjusts its size.
 *
 * @return {boolean}
 */
OO.ui.MultilineTextInputWidget.prototype.isAutosizing = function () {
	return !!this.autosize;
};

/**
 * @inheritdoc
 */
OO.ui.MultilineTextInputWidget.prototype.restorePreInfuseState = function ( state ) {
	OO.ui.MultilineTextInputWidget.super.prototype.restorePreInfuseState.call( this, state );
	if ( state.scrollTop !== undefined ) {
		this.$input.scrollTop( state.scrollTop );
	}
};

/**
 * ComboBoxInputWidgets combine a {@link OO.ui.TextInputWidget text input} (where a value
 * can be entered manually) and a {@link OO.ui.MenuSelectWidget menu of options} (from which
 * a value can be chosen instead). Users can choose options from the combo box in one of two ways:
 *
 * - by typing a value in the text input field. If the value exactly matches the value of a menu
 *   option, that option will appear to be selected.
 * - by choosing a value from the menu. The value of the chosen option will then appear in the text
 *   input field.
 *
 * After the user chooses an option, its `data` will be used as a new value for the widget.
 * A `label` also can be specified for each option: if given, it will be shown instead of the
 * `data` in the dropdown menu.
 *
 * This widget can be used inside an HTML form, such as a OO.ui.FormLayout.
 *
 * For more information about menus and options, please see the
 * [OOUI documentation on MediaWiki][1].
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Widgets/Selects_and_Options#Menu_selects_and_options
 *
 *     @example
 *     // A ComboBoxInputWidget.
 *     const comboBox = new OO.ui.ComboBoxInputWidget( {
 *         value: 'Option 1',
 *         options: [
 *             { data: 'Option 1' },
 *             { data: 'Option 2' },
 *             { data: 'Option 3' }
 *         ]
 *     } );
 *     $( document.body ).append( comboBox.$element );
 *
 *     @example <caption>A ComboBoxInputWidget can have additional option labels:</caption>
 *     const comboBox = new OO.ui.ComboBoxInputWidget( {
 *         value: 'Option 1',
 *         options: [
 *             {
 *                 data: 'Option 1',
 *                 label: 'Option One'
 *             },
 *             {
 *                 data: 'Option 2',
 *                 label: 'Option Two'
 *             },
 *             {
 *                 data: 'Option 3',
 *                 label: 'Option Three'
 *             }
 *         ]
 *     } );
 *     $( document.body ).append( comboBox.$element );
 *
 * @class
 * @extends OO.ui.TextInputWidget
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {Object[]} [config.options=[]] Array of menu options in the format `{ data: …, label: … }`
 * @param {Object} [config.menu] Configuration options to pass to the {@link OO.ui.MenuSelectWidget menu
 *  select widget}.
 * @param {jQuery} [config.$overlay] Render the menu into a separate layer. This configuration is useful
 *  in cases where the expanded menu is larger than its containing `<div>`. The specified overlay
 *  layer is usually on top of the containing `<div>` and has a larger area. By default, the menu
 *  uses relative positioning.
 *  See <https://www.mediawiki.org/wiki/OOUI/Concepts#Overlays>.
 */
OO.ui.ComboBoxInputWidget = function OoUiComboBoxInputWidget( config ) {
	// Configuration initialization
	config = Object.assign( {
		autocomplete: false
	}, config );

	// See InputWidget#reusePreInfuseDOM about `config.$input`
	if ( config.$input ) {
		config.$input.removeAttr( 'list' );
	}

	// Parent constructor
	OO.ui.ComboBoxInputWidget.super.call( this, config );

	// Properties
	this.$overlay = ( config.$overlay === true ?
		OO.ui.getDefaultOverlay() : config.$overlay ) || this.$element;
	this.dropdownButton = new OO.ui.ButtonWidget( {
		classes: [ 'oo-ui-comboBoxInputWidget-dropdownButton' ],
		label: OO.ui.msg( 'ooui-combobox-button-label' ),
		indicator: 'down',
		invisibleLabel: true,
		disabled: this.disabled
	} );
	this.menu = new OO.ui.MenuSelectWidget( Object.assign(
		{
			widget: this,
			input: this,
			$floatableContainer: this.$element,
			disabled: this.isDisabled()
		},
		config.menu
	) );

	// Events
	this.connect( this, {
		change: 'onInputChange',
		enter: 'onInputEnter'
	} );
	this.dropdownButton.connect( this, {
		click: 'onDropdownButtonClick'
	} );
	this.menu.connect( this, {
		choose: 'onMenuChoose',
		add: 'onMenuItemsChange',
		remove: 'onMenuItemsChange',
		toggle: 'onMenuToggle'
	} );

	// Initialization
	this.$input.attr( {
		role: 'combobox',
		'aria-owns': this.menu.getElementId(),
		'aria-autocomplete': 'list'
	} );
	this.dropdownButton.$button.attr( {
		'aria-controls': this.menu.getElementId()
	} );
	// Do not override options set via config.menu.items
	if ( config.options !== undefined ) {
		this.setOptions( config.options );
	}
	this.$field = $( '<div>' )
		.addClass( 'oo-ui-comboBoxInputWidget-field' )
		.append( this.$input, this.dropdownButton.$element );
	this.$element
		.addClass( 'oo-ui-comboBoxInputWidget' )
		.append( this.$field );
	this.$overlay.append( this.menu.$element );
	this.onMenuItemsChange();
};

/* Setup */

OO.inheritClass( OO.ui.ComboBoxInputWidget, OO.ui.TextInputWidget );

/* Methods */

/**
 * Get the combobox's menu.
 *
 * @return {OO.ui.MenuSelectWidget} Menu widget
 */
OO.ui.ComboBoxInputWidget.prototype.getMenu = function () {
	return this.menu;
};

/**
 * Get the combobox's text input widget.
 *
 * @return {OO.ui.TextInputWidget} Text input widget
 */
OO.ui.ComboBoxInputWidget.prototype.getInput = function () {
	return this;
};

/**
 * @inheritdoc
 */
OO.ui.ComboBoxInputWidget.prototype.onEdit = function ( event ) {
	// Parent method
	OO.ui.ComboBoxInputWidget.super.prototype.onEdit.apply( this, arguments );

	if ( this.menu.isVisible() || this.isDisabled() || !this.isVisible() ) {
		return;
	}

	if ( event.type === 'input' || event.type === 'mouseup' || ( event.type === 'keydown' && (
		event.keyCode === OO.ui.Keys.ENTER ||
		event.keyCode === OO.ui.Keys.UP ||
		event.keyCode === OO.ui.Keys.DOWN
	) ) ) {
		this.menu.toggle( true );
	}
};

/**
 * Handle input change events.
 *
 * @private
 * @param {string} value New value
 */
OO.ui.ComboBoxInputWidget.prototype.onInputChange = function ( value ) {
	const match = this.menu.findItemFromData( value );

	this.menu.selectItem( match );
	if ( this.menu.findHighlightedItem() ) {
		this.menu.highlightItem( match );
	}
};

/**
 * Handle input enter events.
 *
 * @private
 */
OO.ui.ComboBoxInputWidget.prototype.onInputEnter = function () {
	if ( !this.isDisabled() ) {
		this.menu.toggle( false );
	}
};

/**
 * Handle button click events.
 *
 * @private
 */
OO.ui.ComboBoxInputWidget.prototype.onDropdownButtonClick = function () {
	this.menu.toggle();
	this.focus();
};

/**
 * Handle menu choose events.
 *
 * @private
 * @param {OO.ui.OptionWidget} item Chosen item
 */
OO.ui.ComboBoxInputWidget.prototype.onMenuChoose = function ( item ) {
	this.setValue( item.getData() );
};

/**
 * Handle menu item change events.
 *
 * @private
 */
OO.ui.ComboBoxInputWidget.prototype.onMenuItemsChange = function () {
	const match = this.menu.findItemFromData( this.getValue() );
	this.menu.selectItem( match );
	if ( this.menu.findHighlightedItem() ) {
		this.menu.highlightItem( match );
	}
	this.$element.toggleClass( 'oo-ui-comboBoxInputWidget-empty', this.menu.isEmpty() );
};

/**
 * Handle menu toggle events.
 *
 * @private
 * @param {boolean} isVisible Open state of the menu
 */
OO.ui.ComboBoxInputWidget.prototype.onMenuToggle = function ( isVisible ) {
	this.$element.toggleClass( 'oo-ui-comboBoxInputWidget-open', isVisible );
};

/**
 * Update the disabled state of the controls
 *
 * @chainable
 * @protected
 * @return {OO.ui.ComboBoxInputWidget} The widget, for chaining
 */
OO.ui.ComboBoxInputWidget.prototype.updateControlsDisabled = function () {
	const disabled = this.isDisabled() || this.isReadOnly();
	if ( this.dropdownButton ) {
		this.dropdownButton.setDisabled( disabled );
	}
	if ( this.menu ) {
		this.menu.setDisabled( disabled );
	}
	return this;
};

/**
 * @inheritdoc
 */
OO.ui.ComboBoxInputWidget.prototype.setDisabled = function () {
	// Parent method
	OO.ui.ComboBoxInputWidget.super.prototype.setDisabled.apply( this, arguments );
	this.updateControlsDisabled();
	return this;
};

/**
 * @inheritdoc
 */
OO.ui.ComboBoxInputWidget.prototype.setReadOnly = function () {
	// Parent method
	OO.ui.ComboBoxInputWidget.super.prototype.setReadOnly.apply( this, arguments );
	this.updateControlsDisabled();
	return this;
};

/**
 * Set the options available for this input.
 *
 * @param {Object[]} options Array of menu options in the format `{ data: …, label: … }`
 * @chainable
 * @return {OO.ui.Widget} The widget, for chaining
 */
OO.ui.ComboBoxInputWidget.prototype.setOptions = function ( options ) {
	this.getMenu()
		.clearItems()
		.addItems( options.map( ( opt ) => new OO.ui.MenuOptionWidget( {
			data: opt.data,
			label: opt.label !== undefined ? opt.label : opt.data
		} ) ) );

	return this;
};

/**
 * FieldLayouts are used with OO.ui.FieldsetLayout. Each FieldLayout requires a field-widget,
 * which is a widget that is specified by reference before any optional configuration settings.
 *
 * Field layouts can be configured with help text and/or labels. Labels are aligned in one of
 * four ways:
 *
 * - **left**: The label is placed before the field-widget and aligned with the left margin.
 *   A left-alignment is used for forms with many fields.
 * - **right**: The label is placed before the field-widget and aligned to the right margin.
 *   A right-alignment is used for long but familiar forms which users tab through,
 *   verifying the current field with a quick glance at the label.
 * - **top**: The label is placed above the field-widget. A top-alignment is used for brief forms
 *   that users fill out from top to bottom.
 * - **inline**: The label is placed after the field-widget and aligned to the left.
 *   An inline-alignment is best used with checkboxes or radio buttons.
 *
 * Help text can either be:
 *
 * - accessed via a help icon that appears in the upper right corner of the rendered field layout,
 *   or
 * - shown as a subtle explanation below the label.
 *
 * If the help text is brief, or is essential to always expose it, set `helpInline` to `true`.
 * If it is long or not essential, leave `helpInline` to its default, `false`.
 *
 * Please see the [OOUI documentation on MediaWiki][1] for examples and more information.
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Layouts/Fields_and_Fieldsets
 *
 * @class
 * @extends OO.ui.Layout
 * @mixes OO.ui.mixin.LabelElement
 * @mixes OO.ui.mixin.TitledElement
 *
 * @constructor
 * @param {OO.ui.Widget} fieldWidget Field widget
 * @param {Object} [config] Configuration options
 * @param {string} [config.align='left'] Alignment of the label: 'left', 'right', 'top'
 *  or 'inline'
 * @param {Array} [config.errors] Error messages about the widget, which will be
 *  displayed below the widget.
 * @param {Array} [config.warnings] Warning messages about the widget, which will be
 *  displayed below the widget.
 * @param {Array} [config.successMessages] Success messages on user interactions with the widget,
 *  which will be displayed below the widget.
 *  The array may contain strings or OO.ui.HtmlSnippet instances.
 * @param {Array} [config.notices] Notices about the widget, which will be displayed
 *  below the widget.
 *  The array may contain strings or OO.ui.HtmlSnippet instances.
 *  These are more visible than `help` messages when `helpInline` is set, and so
 *  might be good for transient messages.
 * @param {string|OO.ui.HtmlSnippet} [config.help] Help text. When help text is specified
 *  and `helpInline` is `false`, a "help" icon will appear in the upper-right
 *  corner of the rendered field; clicking it will display the text in a popup.
 *  If `helpInline` is `true`, then a subtle description will be shown after the
 *  label.
 * @param {boolean} [config.helpInline=false] Whether or not the help should be inline,
 *  or shown when the "help" icon is clicked.
 * @param {jQuery} [config.$overlay] Passed to OO.ui.PopupButtonWidget for help popup, if
 * `help` is given.
 *  See <https://www.mediawiki.org/wiki/OOUI/Concepts#Overlays>.
 *
 * @throws {Error} An error is thrown if no widget is specified
 *
 * @property {OO.ui.Widget} fieldWidget
 */
OO.ui.FieldLayout = function OoUiFieldLayout( fieldWidget, config ) {
	// Allow passing positional parameters inside the config object
	if ( OO.isPlainObject( fieldWidget ) && config === undefined ) {
		config = fieldWidget;
		fieldWidget = config.fieldWidget;
	}

	// Make sure we have required constructor arguments
	if ( fieldWidget === undefined ) {
		throw new Error( 'Widget not found' );
	}

	// Configuration initialization
	config = Object.assign( { align: 'left', helpInline: false }, config );

	if ( config.help && !config.label ) {
		// Add an empty label. For some combinations of 'helpInline' and 'align'
		// there would be no space in the interface to display the help text otherwise.
		config.label = ' ';
	}

	// Parent constructor
	OO.ui.FieldLayout.super.call( this, config );

	// Mixin constructors
	OO.ui.mixin.LabelElement.call( this, Object.assign( {
		$label: $( '<label>' )
	}, config ) );
	OO.ui.mixin.TitledElement.call( this, Object.assign( { $titled: this.$label }, config ) );

	// Properties
	this.fieldWidget = fieldWidget;
	this.errors = [];
	this.warnings = [];
	this.successMessages = [];
	this.notices = [];
	this.$field = this.isFieldInline() ? $( '<span>' ) : $( '<div>' );
	this.$messages = $( '<div>' );
	this.$header = $( '<span>' );
	this.$body = $( '<div>' );
	this.align = null;
	this.helpInline = config.helpInline;

	// Events
	this.fieldWidget.connect( this, {
		disable: 'onFieldDisable'
	} );

	// Initialization
	this.$help = config.help ?
		this.createHelpElement( config.help, config.$overlay ) :
		$( [] );
	if ( this.fieldWidget.getInputId() ) {
		this.$label.attr( 'for', this.fieldWidget.getInputId() );
		if ( this.helpInline ) {
			this.$help.attr( 'for', this.fieldWidget.getInputId() );
		}
	} else {
		// We can't use `label for` with non-form elements, use `aria-labelledby` instead
		const id = OO.ui.generateElementId();
		this.$label.attr( 'id', id );
		this.fieldWidget.setLabelledBy( id );

		// Forward clicks on the label to the widget, like `label for` would do
		this.$label.on( 'click', this.onLabelClick.bind( this ) );
		if ( this.helpInline ) {
			this.$help.on( 'click', this.onLabelClick.bind( this ) );
		}
	}
	this.$element
		.addClass( 'oo-ui-fieldLayout' )
		.toggleClass( 'oo-ui-fieldLayout-disabled', this.fieldWidget.isDisabled() )
		.append( this.$body );
	this.$body.addClass( 'oo-ui-fieldLayout-body' );
	this.$header.addClass( 'oo-ui-fieldLayout-header' );
	this.$messages.addClass( 'oo-ui-fieldLayout-messages' );
	this.$field
		.addClass( 'oo-ui-fieldLayout-field' )
		.append( this.fieldWidget.$element );

	this.setErrors( config.errors || [] );
	this.setWarnings( config.warnings || [] );
	this.setSuccess( config.successMessages || [] );
	this.setNotices( config.notices || [] );
	this.setAlignment( config.align );
	// Call this again to take into account the widget's accessKey
	this.updateTitle();
};

/* Setup */

OO.inheritClass( OO.ui.FieldLayout, OO.ui.Layout );
OO.mixinClass( OO.ui.FieldLayout, OO.ui.mixin.LabelElement );
OO.mixinClass( OO.ui.FieldLayout, OO.ui.mixin.TitledElement );

/* Methods */

/**
 * Handle field disable events.
 *
 * @private
 * @param {boolean} value Field is disabled
 */
OO.ui.FieldLayout.prototype.onFieldDisable = function ( value ) {
	this.$element.toggleClass( 'oo-ui-fieldLayout-disabled', value );
};

/**
 * Handle click events on the field label, or inline help
 *
 * @param {jQuery.Event} event
 */
OO.ui.FieldLayout.prototype.onLabelClick = function () {
	this.fieldWidget.simulateLabelClick();
};

/**
 * Get the widget contained by the field.
 *
 * @return {OO.ui.Widget} Field widget
 */
OO.ui.FieldLayout.prototype.getField = function () {
	return this.fieldWidget;
};

/**
 * Return `true` if the given field widget can be used with `'inline'` alignment (see
 * #setAlignment). Return `false` if it can't or if this can't be determined.
 *
 * @return {boolean}
 */
OO.ui.FieldLayout.prototype.isFieldInline = function () {
	// This is very simplistic, but should be good enough.
	return this.getField().$element.prop( 'tagName' ).toLowerCase() === 'span';
};

/**
 * @protected
 * @param {string} kind 'error' or 'notice'
 * @param {string|OO.ui.HtmlSnippet} text
 * @return {jQuery}
 */
OO.ui.FieldLayout.prototype.makeMessage = function ( kind, text ) {
	return new OO.ui.MessageWidget( {
		type: kind,
		inline: true,
		label: text
	} ).$element;
};

/**
 * Set the field alignment mode.
 *
 * @private
 * @param {string} value Alignment mode, either 'left', 'right', 'top' or 'inline'
 * @chainable
 * @return {OO.ui.BookletLayout} The layout, for chaining
 */
OO.ui.FieldLayout.prototype.setAlignment = function ( value ) {
	if ( value !== this.align ) {
		// Default to 'left'
		if ( [ 'left', 'right', 'top', 'inline' ].indexOf( value ) === -1 ) {
			value = 'left';
		}
		// Validate
		if ( value === 'inline' && !this.isFieldInline() ) {
			value = 'top';
		}
		// Reorder elements

		if ( this.helpInline ) {
			if ( value === 'top' ) {
				this.$header.append( this.$label );
				this.$body.append( this.$header, this.$field, this.$help );
			} else if ( value === 'inline' ) {
				this.$header.append( this.$label, this.$help );
				this.$body.append( this.$field, this.$header );
			} else {
				this.$header.append( this.$label, this.$help );
				this.$body.append( this.$header, this.$field );
			}
		} else {
			if ( value === 'top' ) {
				this.$header.append( this.$help, this.$label );
				this.$body.append( this.$header, this.$field );
			} else if ( value === 'inline' ) {
				this.$header.append( this.$help, this.$label );
				this.$body.append( this.$field, this.$header );
			} else {
				this.$header.append( this.$label );
				this.$body.append( this.$header, this.$help, this.$field );
			}
		}
		// Set classes. The following classes can be used here:
		// * oo-ui-fieldLayout-align-left
		// * oo-ui-fieldLayout-align-right
		// * oo-ui-fieldLayout-align-top
		// * oo-ui-fieldLayout-align-inline
		if ( this.align ) {
			this.$element.removeClass( 'oo-ui-fieldLayout-align-' + this.align );
		}
		this.$element.addClass( 'oo-ui-fieldLayout-align-' + value );
		this.align = value;
	}

	return this;
};

/**
 * Set the list of error messages.
 *
 * @param {Array} errors Error messages about the widget, which will be displayed below the widget.
 *  The array may contain strings or OO.ui.HtmlSnippet instances.
 * @chainable
 * @return {OO.ui.BookletLayout} The layout, for chaining
 */
OO.ui.FieldLayout.prototype.setErrors = function ( errors ) {
	this.errors = errors.slice();
	this.updateMessages();
	return this;
};

/**
 * Set the list of warning messages.
 *
 * @param {Array} warnings Warning messages about the widget, which will be displayed below
 *  the widget.
 *  The array may contain strings or OO.ui.HtmlSnippet instances.
 * @chainable
 * @return {OO.ui.BookletLayout} The layout, for chaining
 */
OO.ui.FieldLayout.prototype.setWarnings = function ( warnings ) {
	this.warnings = warnings.slice();
	this.updateMessages();
	return this;
};

/**
 * Set the list of success messages.
 *
 * @param {Array} successMessages Success messages about the widget, which will be displayed below
 *  the widget.
 *  The array may contain strings or OO.ui.HtmlSnippet instances.
 * @chainable
 * @return {OO.ui.BookletLayout} The layout, for chaining
 */
OO.ui.FieldLayout.prototype.setSuccess = function ( successMessages ) {
	this.successMessages = successMessages.slice();
	this.updateMessages();
	return this;
};

/**
 * Set the list of notice messages.
 *
 * @param {Array} notices Notices about the widget, which will be displayed below the widget.
 *  The array may contain strings or OO.ui.HtmlSnippet instances.
 * @chainable
 * @return {OO.ui.BookletLayout} The layout, for chaining
 */
OO.ui.FieldLayout.prototype.setNotices = function ( notices ) {
	this.notices = notices.slice();
	this.updateMessages();
	return this;
};

/**
 * Update the rendering of error, warning, success and notice messages.
 *
 * @private
 */
OO.ui.FieldLayout.prototype.updateMessages = function () {
	this.$messages.empty();

	if (
		this.errors.length ||
		this.warnings.length ||
		this.successMessages.length ||
		this.notices.length
	) {
		this.$body.after( this.$messages );
	} else {
		this.$messages.remove();
		return;
	}

	let i;
	for ( i = 0; i < this.errors.length; i++ ) {
		this.$messages.append( this.makeMessage( 'error', this.errors[ i ] ) );
	}
	for ( i = 0; i < this.warnings.length; i++ ) {
		this.$messages.append( this.makeMessage( 'warning', this.warnings[ i ] ) );
	}
	for ( i = 0; i < this.successMessages.length; i++ ) {
		this.$messages.append( this.makeMessage( 'success', this.successMessages[ i ] ) );
	}
	for ( i = 0; i < this.notices.length; i++ ) {
		this.$messages.append( this.makeMessage( 'notice', this.notices[ i ] ) );
	}
};

/**
 * Include information about the widget's accessKey in our title. TitledElement calls this method.
 * (This is a bit of a hack.)
 *
 * @protected
 * @param {string} title Tooltip label for 'title' attribute
 * @return {string}
 */
OO.ui.FieldLayout.prototype.formatTitleWithAccessKey = function ( title ) {
	if ( this.fieldWidget && this.fieldWidget.formatTitleWithAccessKey ) {
		return this.fieldWidget.formatTitleWithAccessKey( title );
	}
	return title;
};

/**
 * Creates and returns the help element. Also sets the `aria-describedby`
 * attribute on the main element of the `fieldWidget`.
 *
 * @private
 * @param {string|OO.ui.HtmlSnippet} [help] Help text.
 * @param {jQuery} [$overlay] Passed to OO.ui.PopupButtonWidget for help popup.
 * @return {jQuery} The element that should become `this.$help`.
 */
OO.ui.FieldLayout.prototype.createHelpElement = function ( help, $overlay ) {
	let helpId, helpWidget;

	if ( this.helpInline ) {
		helpWidget = new OO.ui.LabelWidget( {
			label: help,
			classes: [ 'oo-ui-inline-help' ]
		} );

		helpId = helpWidget.getElementId();
	} else {
		helpWidget = new OO.ui.PopupButtonWidget( {
			$overlay: $overlay,
			popup: {
				padded: true
			},
			classes: [ 'oo-ui-fieldLayout-help' ],
			framed: false,
			icon: 'info',
			label: OO.ui.msg( 'ooui-field-help' ),
			invisibleLabel: true
		} );

		helpWidget.popup.on( 'ready', () => {
			const $popupElement = helpWidget.popup.$element;
			$popupElement.attr( 'tabindex', 0 );
			$popupElement.trigger( 'focus' );
		} );

		helpWidget.popup.on( 'closing', () => {
			helpWidget.$button.trigger( 'focus' );
		} );

		if ( help instanceof OO.ui.HtmlSnippet ) {
			helpWidget.getPopup().$body.html( help.toString() );
		} else {
			helpWidget.getPopup().$body.text( help );
		}

		helpId = helpWidget.getPopup().getBodyId();
	}

	// Set the 'aria-describedby' attribute on the fieldWidget
	// Preference given to an input or a button
	(
		this.fieldWidget.$input ||
		( this.fieldWidget.input && this.fieldWidget.input.$input ) ||
		this.fieldWidget.$button ||
		this.fieldWidget.$element
	).attr( 'aria-describedby', helpId );

	return helpWidget.$element;
};

/**
 * ActionFieldLayouts are used with OO.ui.FieldsetLayout. The layout consists of a field-widget,
 * a button, and an optional label and/or help text. The field-widget (e.g., a
 * {@link OO.ui.TextInputWidget TextInputWidget}), is required and is specified before any optional
 * configuration settings.
 *
 * Labels can be aligned in one of four ways:
 *
 * - **left**: The label is placed before the field-widget and aligned with the left margin.
 *   A left-alignment is used for forms with many fields.
 * - **right**: The label is placed before the field-widget and aligned to the right margin.
 *   A right-alignment is used for long but familiar forms which users tab through,
 *   verifying the current field with a quick glance at the label.
 * - **top**: The label is placed above the field-widget. A top-alignment is used for brief forms
 *   that users fill out from top to bottom.
 * - **inline**: The label is placed after the field-widget and aligned to the left.
 *   An inline-alignment is best used with checkboxes or radio buttons.
 *
 * Help text is accessed via a help icon that appears in the upper right corner of the rendered
 * field layout when help text is specified.
 *
 *     @example
 *     // Example of an ActionFieldLayout
 *     const actionFieldLayout = new OO.ui.ActionFieldLayout(
 *         new OO.ui.TextInputWidget( {
 *             placeholder: 'Field widget'
 *         } ),
 *         new OO.ui.ButtonWidget( {
 *             label: 'Button'
 *         } ),
 *         {
 *             label: 'An ActionFieldLayout. This label is aligned top',
 *             align: 'top',
 *             help: 'This is help text'
 *         }
 *     );
 *
 *     $( document.body ).append( actionFieldLayout.$element );
 *
 * @class
 * @extends OO.ui.FieldLayout
 *
 * @constructor
 * @param {OO.ui.Widget} fieldWidget Field widget
 * @param {OO.ui.ButtonWidget} buttonWidget Button widget
 * @param {Object} config
 */
OO.ui.ActionFieldLayout = function OoUiActionFieldLayout( fieldWidget, buttonWidget, config ) {
	// Allow passing positional parameters inside the config object
	if ( OO.isPlainObject( fieldWidget ) && config === undefined ) {
		config = fieldWidget;
		fieldWidget = config.fieldWidget;
		buttonWidget = config.buttonWidget;
	}

	// Parent constructor
	OO.ui.ActionFieldLayout.super.call( this, fieldWidget, config );

	// Properties
	this.buttonWidget = buttonWidget;
	this.$button = $( '<span>' );
	this.$input = this.isFieldInline() ? $( '<span>' ) : $( '<div>' );

	// Initialization
	this.$element.addClass( 'oo-ui-actionFieldLayout' );
	this.$button
		.addClass( 'oo-ui-actionFieldLayout-button' )
		.append( this.buttonWidget.$element );
	this.$input
		.addClass( 'oo-ui-actionFieldLayout-input' )
		.append( this.fieldWidget.$element );
	this.$field.append( this.$input, this.$button );
};

/* Setup */

OO.inheritClass( OO.ui.ActionFieldLayout, OO.ui.FieldLayout );

/**
 * FieldsetLayouts are composed of one or more {@link OO.ui.FieldLayout FieldLayouts},
 * which each contain an individual widget and, optionally, a label. Each Fieldset can be
 * configured with a label as well. For more information and examples,
 * please see the [OOUI documentation on MediaWiki][1].
 *
 *     @example
 *     // Example of a fieldset layout
 *     const input1 = new OO.ui.TextInputWidget( {
 *         placeholder: 'A text input field'
 *     } );
 *
 *     const input2 = new OO.ui.TextInputWidget( {
 *         placeholder: 'A text input field'
 *     } );
 *
 *     const fieldset = new OO.ui.FieldsetLayout( {
 *         label: 'Example of a fieldset layout'
 *     } );
 *
 *     fieldset.addItems( [
 *         new OO.ui.FieldLayout( input1, {
 *             label: 'Field One'
 *         } ),
 *         new OO.ui.FieldLayout( input2, {
 *             label: 'Field Two'
 *         } )
 *     ] );
 *     $( document.body ).append( fieldset.$element );
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Layouts/Fields_and_Fieldsets
 *
 * @class
 * @extends OO.ui.Layout
 * @mixes OO.ui.mixin.IconElement
 * @mixes OO.ui.mixin.LabelElement
 * @mixes OO.ui.mixin.GroupElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {OO.ui.FieldLayout[]} [config.items] An array of fields to add to the fieldset.
 *  See OO.ui.FieldLayout for more information about fields.
 * @param {string|OO.ui.HtmlSnippet} [config.help] Help text. When help text is specified
 *  and `helpInline` is `false`, a "help" icon will appear in the upper-right
 *  corner of the rendered field; clicking it will display the text in a popup.
 *  If `helpInline` is `true`, then a subtle description will be shown after the
 *  label.
 *  For feedback messages, you are advised to use `notices`.
 * @param {boolean} [config.helpInline=false] Whether or not the help should be inline,
 *  or shown when the "help" icon is clicked.
 * @param {jQuery} [config.$overlay] Passed to OO.ui.PopupButtonWidget for help popup, if `help` is given.
 *  See <https://www.mediawiki.org/wiki/OOUI/Concepts#Overlays>.
 */
OO.ui.FieldsetLayout = function OoUiFieldsetLayout( config ) {
	// Configuration initialization
	config = config || {};

	// Parent constructor
	OO.ui.FieldsetLayout.super.call( this, config );

	// Mixin constructors
	OO.ui.mixin.IconElement.call( this, config );
	OO.ui.mixin.LabelElement.call( this, config );
	OO.ui.mixin.GroupElement.call( this, config );

	// Properties
	this.$header = $( '<legend>' );

	// Initialization
	this.$header
		.addClass( 'oo-ui-fieldsetLayout-header' )
		.append( this.$icon, this.$label );
	this.$group.addClass( 'oo-ui-fieldsetLayout-group' );
	this.$element
		.addClass( 'oo-ui-fieldsetLayout' )
		.prepend( this.$header, this.$group );

	// Help
	if ( config.help ) {
		if ( config.helpInline ) {
			const inlineHelpWidget = new OO.ui.LabelWidget( {
				label: config.help,
				classes: [ 'oo-ui-inline-help' ]
			} );
			this.$element.prepend( this.$header, inlineHelpWidget.$element, this.$group );
		} else {
			const helpWidget = new OO.ui.PopupButtonWidget( {
				$overlay: config.$overlay,
				popup: {
					padded: true
				},
				classes: [ 'oo-ui-fieldsetLayout-help' ],
				framed: false,
				icon: 'info',
				label: OO.ui.msg( 'ooui-field-help' ),
				invisibleLabel: true
			} );
			if ( config.help instanceof OO.ui.HtmlSnippet ) {
				helpWidget.getPopup().$body.html( config.help.toString() );
			} else {
				helpWidget.getPopup().$body.text( config.help );
			}
			this.$header.append( helpWidget.$element );
		}
	}
	this.addItems( config.items || [] );
};

/* Setup */

OO.inheritClass( OO.ui.FieldsetLayout, OO.ui.Layout );
OO.mixinClass( OO.ui.FieldsetLayout, OO.ui.mixin.IconElement );
OO.mixinClass( OO.ui.FieldsetLayout, OO.ui.mixin.LabelElement );
OO.mixinClass( OO.ui.FieldsetLayout, OO.ui.mixin.GroupElement );

/* Static Properties */

/**
 * @static
 * @inheritdoc
 */
OO.ui.FieldsetLayout.static.tagName = 'fieldset';

/**
 * FormLayouts are used to wrap {@link OO.ui.FieldsetLayout FieldsetLayouts} when you intend to use
 * browser-based form submission for the fields instead of handling them in JavaScript. Form layouts
 * can be configured with an HTML form action, an encoding type, and a method using the #action,
 * #enctype, and #method configs, respectively.
 * See the [OOUI documentation on MediaWiki][1] for more information and examples.
 *
 * Only widgets from the {@link OO.ui.InputWidget InputWidget} family support form submission. It
 * includes standard form elements like {@link OO.ui.CheckboxInputWidget checkboxes}, {@link
 * OO.ui.RadioInputWidget radio buttons} and {@link OO.ui.TextInputWidget text fields}, as well as
 * some fancier controls. Some controls have both regular and InputWidget variants, for example
 * OO.ui.DropdownWidget and OO.ui.DropdownInputWidget – only the latter support form submission and
 * often have simplified APIs to match the capabilities of HTML forms.
 * See the [OOUI documentation on MediaWiki][2] for more information about InputWidgets.
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Layouts/Forms
 * [2]: https://www.mediawiki.org/wiki/OOUI/Widgets/Inputs
 *
 *     @example
 *     // Example of a form layout that wraps a fieldset layout.
 *     const input1 = new OO.ui.TextInputWidget( {
 *             placeholder: 'Username'
 *         } ),
 *         input2 = new OO.ui.TextInputWidget( {
 *             placeholder: 'Password',
 *             type: 'password'
 *         } ),
 *         submit = new OO.ui.ButtonInputWidget( {
 *             label: 'Submit'
 *         } ),
 *         fieldset = new OO.ui.FieldsetLayout( {
 *             label: 'A form layout'
 *         } );
 *
 *     fieldset.addItems( [
 *         new OO.ui.FieldLayout( input1, {
 *             label: 'Username',
 *             align: 'top'
 *         } ),
 *         new OO.ui.FieldLayout( input2, {
 *             label: 'Password',
 *             align: 'top'
 *         } ),
 *         new OO.ui.FieldLayout( submit )
 *     ] );
 *     const form = new OO.ui.FormLayout( {
 *         items: [ fieldset ],
 *         action: '/api/formhandler',
 *         method: 'get'
 *     } )
 *     $( document.body ).append( form.$element );
 *
 * @class
 * @extends OO.ui.Layout
 * @mixes OO.ui.mixin.GroupElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {string} [config.method] HTML form `method` attribute
 * @param {string} [config.action] HTML form `action` attribute
 * @param {string} [config.enctype] HTML form `enctype` attribute
 * @param {OO.ui.FieldsetLayout[]} [config.items] Fieldset layouts to add to the form layout.
 */
OO.ui.FormLayout = function OoUiFormLayout( config ) {
	// Configuration initialization
	config = config || {};

	// Parent constructor
	OO.ui.FormLayout.super.call( this, config );

	// Mixin constructors
	OO.ui.mixin.GroupElement.call( this, Object.assign( { $group: this.$element }, config ) );

	// Events
	this.$element.on( 'submit', this.onFormSubmit.bind( this ) );

	// Make sure the action is safe
	let action = config.action;
	if ( action !== undefined && !OO.ui.isSafeUrl( action ) ) {
		action = './' + action;
	}

	// Initialization
	this.$element
		.addClass( 'oo-ui-formLayout' )
		.attr( {
			method: config.method,
			action: action,
			enctype: config.enctype
		} );
	this.addItems( config.items || [] );
};

/* Setup */

OO.inheritClass( OO.ui.FormLayout, OO.ui.Layout );
OO.mixinClass( OO.ui.FormLayout, OO.ui.mixin.GroupElement );

/* Events */

/**
 * A 'submit' event is emitted when the form is submitted.
 *
 * @event OO.ui.FormLayout#submit
 */

/* Static Properties */

/**
 * @static
 * @inheritdoc
 */
OO.ui.FormLayout.static.tagName = 'form';

/* Methods */

/**
 * Handle form submit events.
 *
 * @private
 * @param {jQuery.Event} e Submit event
 * @fires OO.ui.FormLayout#submit
 * @return {OO.ui.FormLayout} The layout, for chaining
 */
OO.ui.FormLayout.prototype.onFormSubmit = function () {
	if ( this.emit( 'submit' ) ) {
		return false;
	}
};

/**
 * PanelLayouts expand to cover the entire area of their parent. They can be configured with
 * scrolling, padding, and a frame, and are often used together with
 * {@link OO.ui.StackLayout StackLayouts}.
 *
 *     @example
 *     // Example of a panel layout
 *     const panel = new OO.ui.PanelLayout( {
 *         expanded: false,
 *         framed: true,
 *         padded: true,
 *         $content: $( '<p>A panel layout with padding and a frame.</p>' )
 *     } );
 *     $( document.body ).append( panel.$element );
 *
 * @class
 * @extends OO.ui.Layout
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {boolean} [config.scrollable=false] Allow vertical scrolling
 * @param {boolean} [config.padded=false] Add padding between the content and the edges of the panel.
 * @param {boolean} [config.expanded=true] Expand the panel to fill the entire parent element.
 * @param {boolean} [config.framed=false] Render the panel with a frame to visually separate it from outside
 *  content.
 */
OO.ui.PanelLayout = function OoUiPanelLayout( config ) {
	// Configuration initialization
	config = Object.assign( {
		scrollable: false,
		padded: false,
		expanded: true,
		framed: false
	}, config );

	// Parent constructor
	OO.ui.PanelLayout.super.call( this, config );

	// Initialization
	this.$element.addClass( 'oo-ui-panelLayout' );
	if ( config.scrollable ) {
		this.$element.addClass( 'oo-ui-panelLayout-scrollable' );
	}
	if ( config.padded ) {
		this.$element.addClass( 'oo-ui-panelLayout-padded' );
	}
	if ( config.expanded ) {
		this.$element.addClass( 'oo-ui-panelLayout-expanded' );
	}
	if ( config.framed ) {
		this.$element.addClass( 'oo-ui-panelLayout-framed' );
	}
};

/* Setup */

OO.inheritClass( OO.ui.PanelLayout, OO.ui.Layout );

/* Static Methods */

/**
 * @inheritdoc
 */
OO.ui.PanelLayout.static.reusePreInfuseDOM = function ( node, config ) {
	config = OO.ui.PanelLayout.super.static.reusePreInfuseDOM( node, config );
	if ( config.preserveContent !== false ) {
		config.$content = $( node ).contents();
	}
	return config;
};

/* Methods */

/**
 * Focus the panel layout
 *
 * The default implementation just focuses the first focusable element in the panel
 */
OO.ui.PanelLayout.prototype.focus = function () {
	OO.ui.findFocusable( this.$element ).focus();
};

/**
 * HorizontalLayout arranges its contents in a single line (using `display: inline-block` for its
 * items), with small margins between them. Convenient when you need to put a number of block-level
 * widgets on a single line next to each other.
 *
 * Note that inline elements, such as OO.ui.ButtonWidgets, do not need this wrapper.
 *
 *     @example
 *     // HorizontalLayout with a text input and a label.
 *     const layout = new OO.ui.HorizontalLayout( {
 *       items: [
 *         new OO.ui.LabelWidget( { label: 'Label' } ),
 *         new OO.ui.TextInputWidget( { value: 'Text' } )
 *       ]
 *     } );
 *     $( document.body ).append( layout.$element );
 *
 * @class
 * @extends OO.ui.Layout
 * @mixes OO.ui.mixin.GroupElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {OO.ui.Widget[]|OO.ui.Layout[]} [config.items] Widgets or other layouts to add to the layout.
 */
OO.ui.HorizontalLayout = function OoUiHorizontalLayout( config ) {
	// Configuration initialization
	config = config || {};

	// Parent constructor
	OO.ui.HorizontalLayout.super.call( this, config );

	// Mixin constructors
	OO.ui.mixin.GroupElement.call( this, Object.assign( { $group: this.$element }, config ) );

	// Initialization
	this.$element.addClass( 'oo-ui-horizontalLayout' );
	this.addItems( config.items || [] );
};

/* Setup */

OO.inheritClass( OO.ui.HorizontalLayout, OO.ui.Layout );
OO.mixinClass( OO.ui.HorizontalLayout, OO.ui.mixin.GroupElement );

/**
 * NumberInputWidgets combine a {@link OO.ui.TextInputWidget text input} (where a value
 * can be entered manually) and two {@link OO.ui.ButtonWidget button widgets}
 * (to adjust the value in increments) to allow the user to enter a number.
 *
 *     @example
 *     // A NumberInputWidget.
 *     const numberInput = new OO.ui.NumberInputWidget( {
 *         label: 'NumberInputWidget',
 *         input: { value: 5 },
 *         min: 1,
 *         max: 10
 *     } );
 *     $( document.body ).append( numberInput.$element );
 *
 * @class
 * @extends OO.ui.TextInputWidget
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {Object} [config.minusButton] Configuration options to pass to the
 *  {@link OO.ui.ButtonWidget decrementing button widget}.
 * @param {Object} [config.plusButton] Configuration options to pass to the
 *  {@link OO.ui.ButtonWidget incrementing button widget}.
 * @param {number} [config.min=-Infinity] Minimum allowed value
 * @param {number} [config.max=Infinity] Maximum allowed value
 * @param {number|null} [config.step] If specified, the field only accepts values that are multiples of this.
 * @param {number} [config.buttonStep=step||1] Delta when using the buttons or Up/Down arrow keys.
 *  Defaults to `step` if specified, otherwise `1`.
 * @param {number} [config.pageStep=10*buttonStep] Delta when using the Page-up/Page-down keys.
 *  Defaults to 10 times `buttonStep`.
 * @param {boolean} [config.showButtons=true] Whether to show the plus and minus buttons.
 */
OO.ui.NumberInputWidget = function OoUiNumberInputWidget( config ) {
	const $field = $( '<div>' ).addClass( 'oo-ui-numberInputWidget-field' );

	// Configuration initialization
	config = Object.assign( {
		min: -Infinity,
		max: Infinity,
		showButtons: true
	}, config );

	// For backward compatibility
	Object.assign( config, config.input );
	this.input = this;

	// Parent constructor
	OO.ui.NumberInputWidget.super.call( this, Object.assign( config, {
		type: 'number'
	} ) );

	if ( config.showButtons ) {
		this.minusButton = new OO.ui.ButtonWidget( Object.assign(
			{
				disabled: this.isDisabled(),
				tabIndex: -1,
				classes: [ 'oo-ui-numberInputWidget-minusButton' ],
				icon: 'subtract'
			},
			config.minusButton
		) );
		this.minusButton.$element.attr( 'aria-hidden', 'true' );
		this.plusButton = new OO.ui.ButtonWidget( Object.assign(
			{
				disabled: this.isDisabled(),
				tabIndex: -1,
				classes: [ 'oo-ui-numberInputWidget-plusButton' ],
				icon: 'add'
			},
			config.plusButton
		) );
		this.plusButton.$element.attr( 'aria-hidden', 'true' );
	}

	// Events
	this.$input.on( {
		keydown: this.onKeyDown.bind( this ),
		'wheel mousewheel DOMMouseScroll': this.onWheel.bind( this )
	} );
	if ( config.showButtons ) {
		this.plusButton.connect( this, {
			click: [ 'onButtonClick', +1 ]
		} );
		this.minusButton.connect( this, {
			click: [ 'onButtonClick', -1 ]
		} );
	}

	// Build the field
	$field.append( this.$input );
	if ( config.showButtons ) {
		$field
			.prepend( this.minusButton.$element )
			.append( this.plusButton.$element );
	}

	// Initialization
	if ( config.allowInteger || config.isInteger ) {
		// Backward compatibility
		config.step = 1;
	}
	this.setRange( config.min, config.max );
	this.setStep( config.buttonStep, config.pageStep, config.step );
	// Set the validation method after we set step and range
	// so that it doesn't immediately call setValidityFlag
	this.setValidation( this.validateNumber.bind( this ) );

	this.$element
		.addClass( 'oo-ui-numberInputWidget' )
		.toggleClass( 'oo-ui-numberInputWidget-buttoned', config.showButtons )
		.append( $field );
};

/* Setup */

OO.inheritClass( OO.ui.NumberInputWidget, OO.ui.TextInputWidget );

/* Methods */

// Backward compatibility
OO.ui.NumberInputWidget.prototype.setAllowInteger = function ( flag ) {
	this.setStep( flag ? 1 : null );
};
// Backward compatibility
OO.ui.NumberInputWidget.prototype.setIsInteger = OO.ui.NumberInputWidget.prototype.setAllowInteger;

// Backward compatibility
OO.ui.NumberInputWidget.prototype.getAllowInteger = function () {
	return this.step === 1;
};
// Backward compatibility
OO.ui.NumberInputWidget.prototype.getIsInteger = OO.ui.NumberInputWidget.prototype.getAllowInteger;

/**
 * Set the range of allowed values
 *
 * @param {number} min Minimum allowed value
 * @param {number} max Maximum allowed value
 */
OO.ui.NumberInputWidget.prototype.setRange = function ( min, max ) {
	if ( min > max ) {
		throw new Error( 'Minimum (' + min + ') must not be greater than maximum (' + max + ')' );
	}
	this.min = min;
	this.max = max;
	this.$input.attr( { min: this.min, max: this.max } );
	this.setValidityFlag();
};

/**
 * Get the current range
 *
 * @return {number[]} Minimum and maximum values
 */
OO.ui.NumberInputWidget.prototype.getRange = function () {
	return [ this.min, this.max ];
};

/**
 * Set the stepping deltas
 *
 * @param {number} [buttonStep=step||1] Delta when using the buttons or up/down arrow keys.
 *  Defaults to `step` if specified, otherwise `1`.
 * @param {number} [pageStep=10*buttonStep] Delta when using the page-up/page-down keys.
 *  Defaults to 10 times `buttonStep`.
 * @param {number|null} [step] If specified, the field only accepts values that are multiples
 *  of this.
 */
OO.ui.NumberInputWidget.prototype.setStep = function ( buttonStep, pageStep, step ) {
	if ( buttonStep === undefined ) {
		buttonStep = step || 1;
	}
	if ( pageStep === undefined ) {
		pageStep = 10 * buttonStep;
	}
	if ( step !== null && step <= 0 ) {
		throw new Error( 'Step value, if given, must be positive' );
	}
	if ( buttonStep <= 0 ) {
		throw new Error( 'Button step value must be positive' );
	}
	if ( pageStep <= 0 ) {
		throw new Error( 'Page step value must be positive' );
	}
	this.step = step;
	this.buttonStep = buttonStep;
	this.pageStep = pageStep;
	this.$input.attr( 'step', this.step || 'any' );
	this.setValidityFlag();
};

/**
 * @inheritdoc
 */
OO.ui.NumberInputWidget.prototype.setValue = function ( value ) {
	if ( value === '' ) {
		// Some browsers allow a value in the input even if there isn't one reported by $input.val()
		// so here we make sure an 'empty' value is actually displayed as such.
		this.$input.val( '' );
	}
	return OO.ui.NumberInputWidget.super.prototype.setValue.call( this, value );
};

/**
 * Get the current stepping values
 *
 * @return {number[]} Button step, page step, and validity step
 */
OO.ui.NumberInputWidget.prototype.getStep = function () {
	return [ this.buttonStep, this.pageStep, this.step ];
};

/**
 * Get the current value of the widget as a number
 *
 * @return {number} May be NaN, or an invalid number
 */
OO.ui.NumberInputWidget.prototype.getNumericValue = function () {
	return +this.getValue();
};

/**
 * Adjust the value of the widget
 *
 * @param {number} delta Adjustment amount
 */
OO.ui.NumberInputWidget.prototype.adjustValue = function ( delta ) {
	const v = this.getNumericValue();

	delta = +delta;
	if ( isNaN( delta ) || !isFinite( delta ) ) {
		throw new Error( 'Delta must be a finite number' );
	}

	let n;
	if ( isNaN( v ) ) {
		n = 0;
	} else {
		n = v + delta;
		n = Math.max( Math.min( n, this.max ), this.min );
		if ( this.step ) {
			n = Math.round( n / this.step ) * this.step;
		}
	}

	if ( n !== v ) {
		this.setValue( n );
	}
};
/**
 * Validate input
 *
 * @private
 * @param {string} value Field value
 * @return {boolean}
 */
OO.ui.NumberInputWidget.prototype.validateNumber = function ( value ) {
	const n = +value;
	if ( value === '' ) {
		return !this.isRequired();
	}

	if ( isNaN( n ) || !isFinite( n ) ) {
		return false;
	}

	if ( this.step && Math.floor( n / this.step ) !== n / this.step ) {
		return false;
	}

	if ( n < this.min || n > this.max ) {
		return false;
	}

	return true;
};

/**
 * Handle mouse click events.
 *
 * @private
 * @param {number} dir +1 or -1
 */
OO.ui.NumberInputWidget.prototype.onButtonClick = function ( dir ) {
	this.adjustValue( dir * this.buttonStep );
};

/**
 * Handle mouse wheel events.
 *
 * @private
 * @param {jQuery.Event} event
 * @return {undefined|boolean} False to prevent default if event is handled
 */
OO.ui.NumberInputWidget.prototype.onWheel = function ( event ) {
	let delta = 0;

	if ( this.isDisabled() || this.isReadOnly() ) {
		return;
	}

	if ( this.$input.is( ':focus' ) ) {
		// Standard 'wheel' event
		if ( event.originalEvent.deltaMode !== undefined ) {
			this.sawWheelEvent = true;
		}
		if ( event.originalEvent.deltaY ) {
			delta = -event.originalEvent.deltaY;
		} else if ( event.originalEvent.deltaX ) {
			delta = event.originalEvent.deltaX;
		}

		// Non-standard events
		if ( !this.sawWheelEvent ) {
			if ( event.originalEvent.wheelDeltaX ) {
				delta = -event.originalEvent.wheelDeltaX;
			} else if ( event.originalEvent.wheelDeltaY ) {
				delta = event.originalEvent.wheelDeltaY;
			} else if ( event.originalEvent.wheelDelta ) {
				delta = event.originalEvent.wheelDelta;
			} else if ( event.originalEvent.detail ) {
				delta = -event.originalEvent.detail;
			}
		}

		if ( delta ) {
			delta = delta < 0 ? -1 : 1;
			this.adjustValue( delta * this.buttonStep );
		}

		return false;
	}
};

/**
 * Handle key down events.
 *
 * @private
 * @param {jQuery.Event} e Key down event
 * @return {undefined|boolean} False to prevent default if event is handled
 */
OO.ui.NumberInputWidget.prototype.onKeyDown = function ( e ) {
	if ( this.isDisabled() || this.isReadOnly() ) {
		return;
	}

	switch ( e.which ) {
		case OO.ui.Keys.UP:
			this.adjustValue( this.buttonStep );
			return false;
		case OO.ui.Keys.DOWN:
			this.adjustValue( -this.buttonStep );
			return false;
		case OO.ui.Keys.PAGEUP:
			this.adjustValue( this.pageStep );
			return false;
		case OO.ui.Keys.PAGEDOWN:
			this.adjustValue( -this.pageStep );
			return false;
	}
};

/**
 * Update the disabled state of the controls
 *
 * @chainable
 * @protected
 * @return {OO.ui.NumberInputWidget} The widget, for chaining
 */
OO.ui.NumberInputWidget.prototype.updateControlsDisabled = function () {
	const disabled = this.isDisabled() || this.isReadOnly();
	if ( this.minusButton ) {
		this.minusButton.setDisabled( disabled );
	}
	if ( this.plusButton ) {
		this.plusButton.setDisabled( disabled );
	}
	return this;
};

/**
 * @inheritdoc
 */
OO.ui.NumberInputWidget.prototype.setDisabled = function ( disabled ) {
	// Parent method
	OO.ui.NumberInputWidget.super.prototype.setDisabled.call( this, disabled );
	this.updateControlsDisabled();
	return this;
};

/**
 * @inheritdoc
 */
OO.ui.NumberInputWidget.prototype.setReadOnly = function () {
	// Parent method
	OO.ui.NumberInputWidget.super.prototype.setReadOnly.apply( this, arguments );
	this.updateControlsDisabled();
	return this;
};

/**
 * SelectFileInputWidgets allow for selecting files, using <input type="file">. These
 * widgets can be configured with {@link OO.ui.mixin.IconElement icons}, {@link
 * OO.ui.mixin.IndicatorElement indicators} and {@link OO.ui.mixin.TitledElement titles}.
 * Please see the [OOUI documentation on MediaWiki][1] for more information and examples.
 *
 * SelectFileInputWidgets must be used in HTML forms, as getValue only returns the filename.
 *
 * [1]: https://www.mediawiki.org/wiki/OOUI/Widgets
 *
 *     @example
 *     // A file select input widget.
 *     const selectFile = new OO.ui.SelectFileInputWidget();
 *     $( document.body ).append( selectFile.$element );
 *
 * @class
 * @extends OO.ui.InputWidget
 * @mixes OO.ui.mixin.RequiredElement
 * @mixes OO.ui.mixin.PendingElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @param {string[]|null} [config.accept=null] MIME types to accept. null accepts all types.
 * @param {boolean} [config.multiple=false] Allow multiple files to be selected.
 * @param {string} [config.placeholder] Text to display when no file is selected.
 * @param {Object} [config.button] Config to pass to select file button.
 * @param {Object|string|null} [config.icon=null] Icon to show next to file info
 * @param {boolean} [config.droppable=true] Whether to accept files by drag and drop.
 * @param {boolean} [config.buttonOnly=false] Show only the select file button, no info field.
 *  Requires showDropTarget to be false.
 * @param {boolean} [config.showDropTarget=false] Whether to show a drop target. Requires droppable
 *  to be true.
 * @param {number} [config.thumbnailSizeLimit=20] File size limit in MiB above which to not try and
 *  show a preview (for performance).
 */
OO.ui.SelectFileInputWidget = function OoUiSelectFileInputWidget( config ) {
	config = config || {};

	// Construct buttons before parent method is called (calling setDisabled)
	this.selectButton = new OO.ui.ButtonWidget( Object.assign( {
		$element: $( '<label>' ),
		classes: [ 'oo-ui-selectFileInputWidget-selectButton' ],
		label: OO.ui.msg(
			config.multiple ?
				'ooui-selectfile-button-select-multiple' :
				'ooui-selectfile-button-select'
		)
	}, config.button ) );

	// Configuration initialization
	config = Object.assign( {
		accept: null,
		placeholder: OO.ui.msg( 'ooui-selectfile-placeholder' ),
		$tabIndexed: this.selectButton.$tabIndexed,
		droppable: true,
		buttonOnly: false,
		showDropTarget: false,
		thumbnailSizeLimit: 20
	}, config );

	this.canSetFiles = true;
	// Support: Safari < 14
	try {
		// eslint-disable-next-line no-new
		new DataTransfer();
	} catch ( e ) {
		this.canSetFiles = false;
		config.droppable = false;
	}

	this.info = new OO.ui.SearchInputWidget( {
		classes: [ 'oo-ui-selectFileInputWidget-info' ],
		placeholder: config.placeholder,
		// Pass an empty collection so that .focus() always does nothing
		$tabIndexed: $( [] )
	} ).setIcon( config.icon );
	// Set tabindex manually on $input as $tabIndexed has been overridden.
	// Prevents field from becoming focused while tabbing.
	// We will also set the disabled attribute on $input, but that is done in #setDisabled.
	this.info.$input.attr( 'tabindex', -1 );
	// This indicator serves as the only way to clear the file, so it must be keyboard-accessible
	this.info.$indicator.attr( 'tabindex', 0 );

	// Parent constructor
	OO.ui.SelectFileInputWidget.super.call( this, config );

	// Mixin constructors
	OO.ui.mixin.RequiredElement.call( this, Object.assign( {}, {
		// TODO: Display the required indicator somewhere
		indicatorElement: null
	}, config ) );
	OO.ui.mixin.PendingElement.call( this );

	// Properties
	this.currentFiles = this.filterFiles( this.$input[ 0 ].files || [] );
	if ( Array.isArray( config.accept ) ) {
		this.accept = config.accept;
	} else {
		this.accept = null;
	}
	this.multiple = !!config.multiple;
	this.showDropTarget = config.droppable && config.showDropTarget;
	this.thumbnailSizeLimit = config.thumbnailSizeLimit;

	// Initialization
	this.fieldLayout = new OO.ui.ActionFieldLayout( this.info, this.selectButton, { align: 'top' } );

	this.$input
		.attr( {
			type: 'file',
			// this.selectButton is tabindexed
			tabindex: -1,
			// Infused input may have previously by
			// TabIndexed, so remove aria-disabled attr.
			'aria-disabled': null
		} );

	if ( this.accept ) {
		this.$input.attr( 'accept', this.accept.join( ', ' ) );
	}
	if ( this.multiple ) {
		this.$input.attr( 'multiple', '' );
	}
	this.selectButton.$button.append( this.$input );

	this.$element
		.addClass( 'oo-ui-selectFileInputWidget oo-ui-selectFileWidget' )
		.append( this.fieldLayout.$element );

	if ( this.showDropTarget ) {
		this.selectButton.setIcon( 'upload' );
		this.$element
			.addClass( 'oo-ui-selectFileInputWidget-dropTarget oo-ui-selectFileWidget-dropTarget' )
			.on( {
				click: this.onDropTargetClick.bind( this )
			} )
			.append(
				this.info.$element,
				this.selectButton.$element,
				$( '<span>' )
					.addClass( 'oo-ui-selectFileInputWidget-dropLabel oo-ui-selectFileWidget-dropLabel' )
					.text( OO.ui.msg(
						this.multiple ?
							'ooui-selectfile-dragdrop-placeholder-multiple' :
							'ooui-selectfile-dragdrop-placeholder'
					) )
			);
		if ( !this.multiple ) {
			this.$thumbnail = $( '<div>' ).addClass( 'oo-ui-selectFileInputWidget-thumbnail oo-ui-selectFileWidget-thumbnail' );
			this.setPendingElement( this.$thumbnail );
			this.$element
				.addClass( 'oo-ui-selectFileInputWidget-withThumbnail oo-ui-selectFileWidget-withThumbnail' )
				.prepend( this.$thumbnail );
		}
		this.fieldLayout.$element.remove();
	} else if ( config.buttonOnly ) {
		// Copy over any classes that may have been added already.
		// Ensure no events are bound to this.$element before here.
		this.selectButton.$element
			.addClass( this.$element.attr( 'class' ) )
			.addClass( 'oo-ui-selectFileInputWidget-buttonOnly oo-ui-selectFileWidget-buttonOnly' );
		// Set this.$element to just be the button
		this.$element = this.selectButton.$element;
	}

	// Events
	this.info.connect( this, { change: 'onInfoChange' } );
	this.selectButton.$button.on( {
		keypress: this.onKeyPress.bind( this )
	} );
	this.$input.on( {
		change: this.onFileSelected.bind( this ),
		click: function ( e ) {
			// Prevents dropTarget getting clicked which calls
			// a click on this input
			e.stopPropagation();
		}
	} );

	this.connect( this, { change: 'updateUI' } );
	if ( config.droppable ) {
		const dragHandler = this.onDragEnterOrOver.bind( this );
		this.$element.on( {
			dragenter: dragHandler,
			dragover: dragHandler,
			dragleave: this.onDragLeave.bind( this ),
			drop: this.onDrop.bind( this )
		} );
	}

	this.updateUI();
};

/* Setup */

OO.inheritClass( OO.ui.SelectFileInputWidget, OO.ui.InputWidget );
OO.mixinClass( OO.ui.SelectFileInputWidget, OO.ui.mixin.RequiredElement );
OO.mixinClass( OO.ui.SelectFileInputWidget, OO.ui.mixin.PendingElement );

/* Events */

/**
 * A change event is emitted when the currently selected files change
 *
 * @event OO.ui.SelectFileInputWidget#change
 * @param {File[]} currentFiles Current file list
 */

/* Static Properties */

// Set empty title so that browser default tooltips like "No file chosen" don't appear.
OO.ui.SelectFileInputWidget.static.title = '';

/* Methods */

/**
 * Get the current value of the field
 *
 * For single file widgets returns a File or null.
 * For multiple file widgets returns a list of Files.
 *
 * @return {File|File[]|null}
 */
OO.ui.SelectFileInputWidget.prototype.getValue = function () {
	return this.multiple ? this.currentFiles : this.currentFiles[ 0 ];
};

/**
 * Set the current file list
 *
 * Can only be set to a non-null/non-empty value if this.canSetFiles is true,
 * or if the widget has been set natively and we are just updating the internal
 * state.
 *
 * @param {File[]|null} files Files to select
 * @chainable
 * @return {OO.ui.SelectFileInputWidget} The widget, for chaining
 */
OO.ui.SelectFileInputWidget.prototype.setValue = function ( files ) {
	if ( files === undefined || typeof files === 'string' ) {
		// Called during init, don't replace value if just infusing.
		return this;
	}

	if ( files && !this.multiple ) {
		files = files.slice( 0, 1 );
	}

	function comparableFile( file ) {
		// Use extend to convert to plain objects so they can be compared.
		// File objects contains name, size, timestamp and mime type which
		// should be unique.
		return Object.assign( {}, file );
	}

	if ( !OO.compare(
		files && files.map( comparableFile ),
		this.currentFiles && this.currentFiles.map( comparableFile )
	) ) {
		this.currentFiles = files || [];
		this.emit( 'change', this.currentFiles );
	}

	if ( this.canSetFiles ) {
		// Convert File[] array back to FileList for setting DOM value
		const dataTransfer = new DataTransfer();
		Array.prototype.forEach.call( this.currentFiles || [], ( file ) => {
			dataTransfer.items.add( file );
		} );
		this.$input[ 0 ].files = dataTransfer.files;
	} else {
		if ( !files || !files.length ) {
			// We're allowed to set the input value to empty string
			// to clear.
			OO.ui.SelectFileInputWidget.super.prototype.setValue.call( this, '' );
		}
		// Otherwise we assume the caller was just calling setValue with the
		// current state of .files in the DOM.
	}

	return this;
};

/**
 * Get the filename of the currently selected file.
 *
 * @return {string} Filename
 */
OO.ui.SelectFileInputWidget.prototype.getFilename = function () {
	return this.currentFiles.map( ( file ) => file.name ).join( ', ' );
};

/**
 * Handle file selection from the input.
 *
 * @protected
 * @param {jQuery.Event} e
 */
OO.ui.SelectFileInputWidget.prototype.onFileSelected = function ( e ) {
	const files = this.filterFiles( e.target.files || [] );
	this.setValue( files );
};

/**
 * Disable InputWidget#onEdit listener, onFileSelected is used instead.
 *
 * @inheritdoc
 */
OO.ui.SelectFileInputWidget.prototype.onEdit = function () {};

/**
 * Update the user interface when a file is selected or unselected.
 *
 * @protected
 */
OO.ui.SelectFileInputWidget.prototype.updateUI = function () {
	// Too early
	if ( !this.selectButton ) {
		return;
	}

	this.info.setValue( this.getFilename() );

	if ( this.currentFiles.length ) {
		this.$element.removeClass( 'oo-ui-selectFileInputWidget-empty' );

		if ( this.showDropTarget ) {
			if ( !this.multiple ) {
				this.pushPending();
				this.loadAndGetImageUrl( this.currentFiles[ 0 ] ).done( ( url ) => {
					this.$thumbnail.css( 'background-image', 'url( ' + url + ' )' );
				} ).fail( () => {
					this.$thumbnail.append(
						new OO.ui.IconWidget( {
							icon: 'attachment',
							classes: [ 'oo-ui-selectFileInputWidget-noThumbnail-icon oo-ui-selectFileWidget-noThumbnail-icon' ]
						} ).$element
					);
				} ).always( () => {
					this.popPending();
				} );
			}
			this.$element.off( 'click' );
		}
	} else {
		if ( this.showDropTarget ) {
			this.$element.off( 'click' );
			this.$element.on( {
				click: this.onDropTargetClick.bind( this )
			} );
			if ( !this.multiple ) {
				this.$thumbnail
					.empty()
					.css( 'background-image', '' );
			}
		}
		this.$element.addClass( 'oo-ui-selectFileInputWidget-empty' );
	}
};

/**
 * If the selected file is an image, get its URL and load it.
 *
 * @param {File} file File
 * @return {jQuery.Promise} Promise resolves with the image URL after it has loaded
 */
OO.ui.SelectFileInputWidget.prototype.loadAndGetImageUrl = function ( file ) {
	const deferred = $.Deferred(),
		reader = new FileReader();

	if (
		( OO.getProp( file, 'type' ) || '' ).indexOf( 'image/' ) === 0 &&
		file.size < this.thumbnailSizeLimit * 1024 * 1024
	) {
		reader.onload = function ( event ) {
			const img = document.createElement( 'img' );
			img.addEventListener( 'load', () => {
				if (
					img.naturalWidth === 0 ||
					img.naturalHeight === 0 ||
					img.complete === false
				) {
					deferred.reject();
				} else {
					deferred.resolve( event.target.result );
				}
			} );
			img.src = event.target.result;
		};
		reader.readAsDataURL( file );
	} else {
		deferred.reject();
	}

	return deferred.promise();
};

/**
 * Determine if we should accept this file.
 *
 * @private
 * @param {FileList|File[]} files Files to filter
 * @return {File[]} Filter files
 */
OO.ui.SelectFileInputWidget.prototype.filterFiles = function ( files ) {
	const accept = this.accept;

	function mimeAllowed( file ) {
		const mimeType = file.type;

		if ( !accept || !mimeType ) {
			return true;
		}

		for ( let i = 0; i < accept.length; i++ ) {
			let mimeTest = accept[ i ];
			if ( mimeTest === mimeType ) {
				return true;
			} else if ( mimeTest.slice( -2 ) === '/*' ) {
				mimeTest = mimeTest.slice( 0, mimeTest.length - 1 );
				if ( mimeType.slice( 0, mimeTest.length ) === mimeTest ) {
					return true;
				}
			}
		}
		return false;
	}

	return Array.prototype.filter.call( files, mimeAllowed );
};

/**
 * Handle info input change events
 *
 * The info widget can only be changed by the user
 * with the clear button.
 *
 * @private
 * @param {string} value
 */
OO.ui.SelectFileInputWidget.prototype.onInfoChange = function ( value ) {
	if ( value === '' ) {
		this.setValue( null );
	}
};

/**
 * Handle key press events.
 *
 * @private
 * @param {jQuery.Event} e Key press event
 * @return {undefined|boolean} False to prevent default if event is handled
 */
OO.ui.SelectFileInputWidget.prototype.onKeyPress = function ( e ) {
	if ( !this.isDisabled() && this.$input &&
		( e.which === OO.ui.Keys.SPACE || e.which === OO.ui.Keys.ENTER )
	) {
		// Emit a click to open the file selector.
		this.$input.trigger( 'click' );
		// Taking focus from the selectButton means keyUp isn't fired, so fire it manually.
		this.selectButton.onDocumentKeyUp( e );
		return false;
	}
};

/**
 * @inheritdoc
 */
OO.ui.SelectFileInputWidget.prototype.setDisabled = function ( disabled ) {
	// Parent method
	OO.ui.SelectFileInputWidget.super.prototype.setDisabled.call( this, disabled );

	this.selectButton.setDisabled( disabled );
	this.info.setDisabled( disabled );

	// Always make the input element disabled, so that it can't be found and focused,
	// e.g. by OO.ui.findFocusable.
	// The SearchInputWidget can otherwise be enabled normally.
	this.info.$input.attr( 'disabled', true );

	return this;
};

/**
 * Handle drop target click events.
 *
 * @private
 * @param {jQuery.Event} e Key press event
 * @return {undefined|boolean} False to prevent default if event is handled
 */
OO.ui.SelectFileInputWidget.prototype.onDropTargetClick = function () {
	if ( !this.isDisabled() && this.$input ) {
		this.$input.trigger( 'click' );
		return false;
	}
};

/**
 * Handle drag enter and over events
 *
 * @private
 * @param {jQuery.Event} e Drag event
 * @return {undefined|boolean} False to prevent default if event is handled
 */
OO.ui.SelectFileInputWidget.prototype.onDragEnterOrOver = function ( e ) {
	let hasDroppableFile = false;

	const dt = e.originalEvent.dataTransfer;

	e.preventDefault();
	e.stopPropagation();

	if ( this.isDisabled() ) {
		this.$element.removeClass( [
			'oo-ui-selectFileInputWidget-canDrop',
			'oo-ui-selectFileWidget-canDrop',
			'oo-ui-selectFileInputWidget-cantDrop'
		] );
		dt.dropEffect = 'none';
		return false;
	}

	// DataTransferItem and File both have a type property, but in Chrome files
	// have no information at this point.
	const itemsOrFiles = dt.items || dt.files;
	const hasFiles = !!( itemsOrFiles && itemsOrFiles.length );
	if ( hasFiles ) {
		if ( this.filterFiles( itemsOrFiles ).length ) {
			hasDroppableFile = true;
		}
	// dt.types is Array-like, but not an Array
	} else if ( Array.prototype.indexOf.call( OO.getProp( dt, 'types' ) || [], 'Files' ) !== -1 ) {
		// File information is not available at this point for security so just assume
		// it is acceptable for now.
		// https://bugzilla.mozilla.org/show_bug.cgi?id=640534
		hasDroppableFile = true;
	}

	this.$element.toggleClass( 'oo-ui-selectFileInputWidget-canDrop oo-ui-selectFileWidget-canDrop', hasDroppableFile );
	this.$element.toggleClass( 'oo-ui-selectFileInputWidget-cantDrop', !hasDroppableFile && hasFiles );
	if ( !hasDroppableFile ) {
		dt.dropEffect = 'none';
	}

	return false;
};

/**
 * Handle drag leave events
 *
 * @private
 * @param {jQuery.Event} e Drag event
 */
OO.ui.SelectFileInputWidget.prototype.onDragLeave = function () {
	this.$element.removeClass( [
		'oo-ui-selectFileInputWidget-canDrop',
		'oo-ui-selectFileWidget-canDrop',
		'oo-ui-selectFileInputWidget-cantDrop'
	] );
};

/**
 * Handle drop events
 *
 * @private
 * @param {jQuery.Event} e Drop event
 * @return {undefined|boolean} False to prevent default if event is handled
 */
OO.ui.SelectFileInputWidget.prototype.onDrop = function ( e ) {
	const dt = e.originalEvent.dataTransfer;

	e.preventDefault();
	e.stopPropagation();
	this.$element.removeClass( [
		'oo-ui-selectFileInputWidget-canDrop',
		'oo-ui-selectFileWidget-canDrop',
		'oo-ui-selectFileInputWidget-cantDrop'
	] );

	if ( this.isDisabled() ) {
		return false;
	}

	const files = this.filterFiles( dt.files || [] );
	this.setValue( files );

	return false;
};

// Deprecated alias
OO.ui.SelectFileWidget = function OoUiSelectFileWidget() {
	OO.ui.warnDeprecation( 'SelectFileWidget: Deprecated alias, use SelectFileInputWidget instead.' );
	OO.ui.SelectFileWidget.super.apply( this, arguments );
};

OO.inheritClass( OO.ui.SelectFileWidget, OO.ui.SelectFileInputWidget );

}( OO ) );

//# sourceMappingURL=oojs-ui-core.js.map.json