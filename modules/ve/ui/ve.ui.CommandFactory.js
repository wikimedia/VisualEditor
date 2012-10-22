/**
 * VisualEditor user interface CommandFactory class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */
( function ( ve ) {

	/* Private static */

	var
		i,

		/**
		 * @var {Object}
		 * Mapping of special keycodes to the internal symolic names we use for binding.
		 *
		 * Everything in this map cannot use keypress events
		 * so it has to be here to map to the correct keycodes for
		 * keyup/keydown events (???).
		 */
		mapSpecialFromCode,

		/**
		 * @var {undefined|Object}
		 * Inversed version of mapSpecialFromCode.
		 * Lazy-loaded, use getSpecialFromNameMap()
		 */
		mapSpecialFromName,

		/**
		 * @var {Object}
		 * This is a map to allow usage of lesser common or cross-platform
		 * varying names of special keys. These are used to normalize
		 * commands for detection through mapSpecialFromCode.
		 */
		mapSpecialAliases,

		/**
		 * @var {Object}
		 * Mapping of special characters (only used for binding in a
		 * keyup or keydown event to one of these keys).
		 */

		mapSpecialChars,

		/**
		 * @var {Object}
		 * Mapping from keys that require shift on a US keypad
		 * back to the non shift equivalents.
		 *
		 * This is so you can use keyup events with these keys.
		 */
		mapShiftChars;

	mapSpecialFromCode = {
		8: 'backspace',
		9: 'tab',
		13: 'enter',
		16: 'shift',
		17: 'ctrl',
		18: 'alt',
		20: 'capslock',
		27: 'esc',
		32: 'space',
		33: 'pageup',
		34: 'pagedown',
		35: 'end',
		36: 'home',
		37: 'left',
		38: 'up',
		39: 'right',
		40: 'down',
		45: 'ins',
		46: 'del',
		91: 'meta',
		93: 'meta',
		224: 'meta'
	};

	// Add F1 to F19 programatically
	for ( i = 1; i <= 19; i++ ) {
		mapSpecialFromCode[111 + i] = 'f' + i;
	}

	// Add numbers from the numeric keypad
	for ( i = 0; i <= 9; i++ ) {
		mapSpecialFromCode[96 + i] = i;
	}

	mapSpecialAliases = {
		'option': 'alt',
		'delete': 'del',
		'return': 'enter',
		'escape': 'esc',
		'apple': 'meta',
		'cmd': 'meta',
		'command': 'meta'
	};

	mapSpecialChars = {
		106: '*',
		107: '+',
		109: '-',
		110: '.',
		111 : '/',
		186: ';',
		187: '=',
		188: ',',
		189: '-',
		190: '.',
		191: '/',
		192: '`',
		219: '[',
		220: '\\',
		221: ']',
		222: '\''
	};

	mapShiftChars = {
		'~': '`',
		'!': '1',
		'@': '2',
		'#': '3',
		'$': '4',
		'%': '5',
		'^': '6',
		'&': '7',
		'*': '8',
		'(': '9',
		')': '0',
		'_': '-',
		'+': '=',
		':': ';',
		'\"': '\'',
		'<': ',',
		'>': '.',
		'?': '/',
		'|': '\\'
	};

	/**
	 * @return {Object}
	 */
	function getSpecialFromNameMap() {
		if ( !mapSpecialFromName ) {
			mapSpecialFromName = {};
			for ( var key in mapSpecialFromCode ) {

				// Pull out the numeric keypad from here because keypress should
				// be able to detect the keys from the character.
				if ( key > 95 && key < 112 ) {
					continue;
				}

				if (mapSpecialFromCode.hasOwnProperty(key)) {
					mapSpecialFromName[mapSpecialFromCode[key]] = key;
				}
			}
		}
		return mapSpecialFromName;
	}

	/**
	 * Extract the key character (as a string) from the event.
	 *
	 * @param {jQuery.Event} e
	 * @return {String}
	 */
	function characterFromEvent( e ) {
		var char;

		// Keypress play nice and set e.which correctly.
		if ( e.type === 'keypress' ) {
			return String.fromCharCode( e.which );
		}

		// For non-keypress events we need the special maps.
		char = mapSpecialFromCode[ e.which ];
		if ( char !== undefined ) {
			return char;
		}

		char = mapSpecialChars[ e.which ];
		if ( char !== undefined ) {
			return char;
		}

		// Fallback for non-keypress events for non-special stuff.
		return String.fromCharCode( e.which ).toLowerCase();
	}

	/**
	 * Asserts that two arrays have equal values
	 * (non-recursive, uses toString to assert equality).
	 *
	 * @param {Array} a
	 * @param {Array} b
	 * @returns {boolean}
	 */
	function arrayEqual( a, b ) {
		return a.sort().join( ',' ) === b.sort().join( ',' );
	}

	/**
	 * Get a list of names of any modifier keys pressed during this key event.
	 *
	 * @param {jQuery.Event} e
	 * @returns {Array}
	 */
	function getModifiersFromEvent( e ) {
		var modifiers = [];

		if ( e.shiftKey ) {
			modifiers.push('shift');
		}

		if ( e.altKey ) {
			modifiers.push('alt');
		}

		if ( e.ctrlKey ) {
			modifiers.push('ctrl');
		}

		if ( e.metaKey ) {
			modifiers.push('meta');
		}

		return modifiers;
	}

	/**
	 * Determine if the key is a modifier key or not.
	 *
	 * @param {string} key Name of key (lower case).
	 * @returns {boolean}
	 */
	function isModifier( key ) {
		return key === 'shift' || key === 'ctrl' || key === 'alt' || key === 'meta';
	}

	/**
	 * Guess the best action based on the key combo.
	 * This is used for the binding if `register()` is called without a specific action.
	 *
	 * @param {number} key Code for key.
	 * @param {Array} modifiers
	 * @param {string=} action passed in
	 */
	function guessAction( key, modifiers, action ) {

		// if no action was picked in we should try to pick the one
		// that we think would work best for this key
		if ( !action ) {
			action = getSpecialFromNameMap()[ key ] ? 'keydown' : 'keypress';
		}

		// modifier keys don't work as expected with keypress,
		// switch to keydown
		if ( action === 'keypress' && modifiers.length ) {
			action = 'keydown';
		}

		return action;
	}


	/**
	 * Creates a command factory.
	 *
	 * @class
	 * @constructor
	 */
	ve.ui.CommandFactory = function VeUiCommandFactory() {
		var cf = this;

		/* Private properties */

		/**
		 * @var {Object}
		 * List of callbacks keyed by character.
		 */
		cf.callbackList = {},

		/**
		 * @var {undefined|number}
		 * ID of the setTimeout for the sequence detection.
		 */
		cf.sequenceTimer = undefined;

		/**
		 * @var {Object}
		 *
		 * Keep track of what level each sequence is at since multiple
		 * sequences can start out with the same sequence.
		 */
		cf.sequenceTracker = {};

		/**
		 * @var {Boolean}
		 * Whether we are currently witnissing a sequence being entered.
		 */
		cf.isInsideSequence = false;

		/**
		 * @var {Boolean|String}
		 * Temporary state where we will ignore the next keyup (???).
		 */
		cf.ignoreNextKeyup = false;

		/**
		 * Handler for the character from a (valid) key event.
		 *
		 * @param {string} character A single character
		 * @param {jQuery.Event} e
		 */
		function handleCharacter( character, e ) {
			var callbacks = cf.getMatches( character, getModifiersFromEvent( e ), e ),
				i,
				doNotReset = {},
				processedSequenceCallback = false;

			// loop through matching callbacks for this key event
			for ( i = 0; i < callbacks.length; i++ ) {

				// fire for all sequence callbacks
				// this is because if for example you have multiple sequences
				// bound such as "g i" and "g t" they both need to fire the
				// callback for matching g cause otherwise you can only ever
				// match the first one
				if ( callbacks[i].seq ) {
					processedSequenceCallback = true;

					// keep a list of which sequences were matches for later
					doNotReset[callbacks[i].seq] = 1;
					cf.fireCallback( callbacks[i].callback, e, callbacks[i].combo );
					continue;
				}

				// if there were no sequence matches but we are still here
				// that means this is a regular match so we should fire that
				if ( !processedSequenceCallback && !cf.isInsideSequence ) {
					cf.fireCallback( callbacks[i].callback, e, callbacks[i].combo );
				}
			}

			// if you are inside of a sequence and the key you are pressing
			// is not a modifier key then we should reset all sequences
			// that were not matched by this key event
			if ( e.type === cf.isInsideSequence && !isModifier( character ) ) {
				cf.resetSequences(doNotReset);
			}
		}

		/**
		 * Wrapper handler for key events.
		 *
		 * @context {HTMLElement}
		 * @param {jQuery.Event} e
		 */
		function handleKey( e ) {
			var char = characterFromEvent( e );

			// Stop if this key event is for a character we can't detect.
			if ( !char ) {
				return;
			}

			if ( e.type === 'keyup' && cf.ignoreNextKeyup === char ) {
				cf.ignoreNextKeyup = false;
				return;
			}

			handleCharacter( char, e );
		}

		$( 'body' )
			.off( '.ve-commandfactory' )
			.on( 'keypress.ve-commandfactory keydown.ve-commandfactory keyup.ve-commandfactory', handleKey );
	};

	/* Methods */

	/**
	 * Reset all sequence counters except for the ones passed in.
	 *
	 * @private
	 * @method
	 * @param {Object} [doNotReset]
	 */
	ve.ui.CommandFactory.prototype.resetSequences = function ( doNotReset ) {
		var key, activeSequences;

		doNotReset = doNotReset || {};
		activeSequences = false;
		for ( key in this.sequenceTracker ) {
			if (doNotReset[key]) {
				activeSequences = true;
				continue;
			}
			this.sequenceTracker[key] = 0;
		}

		if ( !activeSequences ) {
			this.isInsideSequence = false;
		}
	};

	/**
	 * Set a 1 second timeout on the specified sequence.
	 *
	 * This is so after each key press in the sequence you have 1 second
	 * to press the next key before you have to start over.
	 *
	 * @private
	 * @method
	 */
	ve.ui.CommandFactory.prototype.resetSequenceTimer = function () {
		clearTimeout( this.sequenceTimer );
		this.sequenceTimer = setTimeout( ve.bind( this.resetSequences, this ), 1000 );
	};

	/**
	 * Find all callbacks that match based on the keycode, modifiers,
	 * and action.
	 *
	 * @private
	 * @method
	 * @param {string} character
	 * @param {Array} modifiers
	 * @param {jQuery.Event|Object} e
	 * @param {boolean=} remove - should we remove any matches
	 * @param {string=} combo
	 * @returns {Array}
	 */
	ve.ui.CommandFactory.prototype.getMatches = function ( character, modifiers, e, remove, combo ) {
		var i,
			callback,
			matches = [],
			action = e.type;

		// if there are no events related to this keycode
		if ( !this.callbackList[character] ) {
			return [];
		}

		// if a modifier key is coming up on its own we should allow it
		if ( action === 'keyup' && isModifier( character ) ) {
			modifiers = [ character ];
		}

		// loop through all callbacks for the key that was pressed
		// and see if any of them match
		for ( i = 0; i < this.callbackList[character].length; i++ ) {
			callback = this.callbackList[character][i];

			// if this is a sequence but it is not at the right level
			// then move onto the next match
			if ( callback.seq && this.sequenceTracker[callback.seq] !== callback.level ) {
				continue;
			}

			// if the action we are looking for doesn't match the action we got
			// then we should keep going
			if ( action !== callback.action ) {
				continue;
			}

			// if this is a keypress event and the meta key and control key
			// are not pressed that means that we need to only look at the
			// character, otherwise check the modifiers as well
			//
			// chrome will not fire a keypress if meta or control is down
			// safari will fire a keypress if meta or meta+shift is down
			// firefox will fire a keypress if meta or control is down
			if ((action === 'keypress' && !e.metaKey && !e.ctrlKey) || arrayEqual( modifiers, callback.modifiers )) {

				// remove is used so if you change your mind and call bind a
				// second time with a new function the first one is overwritten
				if ( remove && callback.combo === combo ) {
					this.callbackList[ character ].splice( i, 1 );
				}

				matches.push(callback);
			}
		}

		return matches;
	};

	/**
	 * Internal helper for binding a callback to a key sequence.
	 * Uses `bindSingle` underneath to track progress on the sequence.
	 *
	 * @private
	 * @method
	 * @param {string} combo The sequence as passed to `register()`.
	 * @param {Array} keys The individual characters in the sequence, in order.
	 * @param {Function} callback See `register()`.
	 * @param {string=guessAction()} action [optional] See `register()`.
	 */
	ve.ui.CommandFactory.prototype.bindSequence = function ( combo, keys, callback, action ) {
		var i,
			cf = this;

		/**
		 * callback to increase the sequence level for this sequence and reset
		 * all other sequences that were active
		 *
		 * @param {jQuery.Event} e
		 */
		function increaseSequence() {
			cf.isInsideSequence = action;
			cf.sequenceTracker[combo]++;
			cf.resetSequenceTimer();
		}

		/**
		 * wraps the specified callback inside of another function in order
		 * to reset all sequence counters as soon as this sequence is done
		 *
		 * @param {jQuery.Event} e
		 */
		function callbackAndReset( e ) {
			cf.fireCallback( callback, e, combo );

			// we should ignore the next key up if the action is key down
			// or keypress.  this is so if you finish a sequence and
			// release the key the final key will not trigger a keyup
			if ( action !== 'keyup' ) {
				cf.ignoreNextKeyup = characterFromEvent( e );
			}

			// weird race condition if a sequence ends with the key
			// another sequence begins with
			setTimeout( cf.resetSequences, 10 );
		}

		// start off by adding a sequence level record for this combo
		// and setting the level to 0
		cf.sequenceTracker[combo] = 0;

		// if there is no action guess the best one for the first key
		// in the sequence
		if ( !action ) {
			action = guessAction( keys[0], [] );
		}

		// loop through keys one at a time and bind the appropriate callback
		// function.  for any key leading up to the final one it should
		// increase the sequence. after the final, it should reset all sequences
		for ( i = 0; i < keys.length; i++ ) {
			cf.bindSingle(
				keys[i],
				i < keys.length - 1 ? increaseSequence : callbackAndReset,
				action,
				combo,
				i
			);
		}
	};

	/**
	 * Internal helper for binding a (single) key command.
	 *
	 * @private
	 * @method
	 * @param {string} combo
	 * @param {Function} callback
	 * @param {string} action [optional]
	 * @param {string} sequenceName [optional] (internal) Name of sequence if part of sequence.
	 * @param {number} level [optional] (internal) What part of the sequence the command is.
	 */
	ve.ui.CommandFactory.prototype.bindSingle = function ( combo, callback, action, sequenceName, level ) {
		// Normalize: Make sure multiple spaces in a row become a single space.
		combo = combo.replace( /\s+/g, ' ' );

		var i,
			key,
			keys,
			cf = this,
			sequence = combo.split( ' ' ),
			modifiers = [];

		// if this pattern is a sequence of keys then run through this method
		// to reprocess each pattern one key at a time.
		if ( sequence.length > 1 ) {
			// bindSequence will call bindSingle again to track progress on each
			// individual key in the sequence.
			this.bindSequence( combo, sequence, callback, action );
			return;
		}

		// take the keys from this pattern and figure out what the actual
		// pattern is all about
		keys = combo === '+' ? [ '+' ] : combo.split( '+' );

		// More normalization
		for ( i = 0; i < keys.length; i++ ) {
			key = keys[ i ];

			// Aliases for certain names
			if ( mapSpecialAliases[ key ] ) {
				key = mapSpecialAliases[ key ];
			}

			// If this is not a keypress event then we should be smart about using shift keys.
			// E.g. "shift+1" will never match browers will give keycode for "!" instead.
			// This will only work for US keyboards however.
			if (action && action !== 'keypress' && mapShiftChars[key]) {
				key = mapShiftChars[ key ];
				modifiers.push( 'shift' );
			}

			// if this key is a modifier then add it to the list of modifiers
			if ( isModifier( key ) ) {
				modifiers.push( key );
			}
		}

		// depending on what the key combo is
		// we will try to pick the best event for it
		action = guessAction( key, modifiers, action );

		// make sure to initialize array if this is the first time
		// a callback is added for this key
		if ( !cf.callbackList[ key ] ) {
			cf.callbackList[ key ] = [];
		}

		// remove an existing match if there is one
		cf.getMatches( key, modifiers, { type: action }, !sequenceName, combo );

		// add this call back to the array
		// if it is a sequence put it at the beginning
		// if not put it at the end
		//
		// this is important because the way these are processed expects
		// the sequence ones to come first
		cf.callbackList[ key ][ sequenceName ? 'unshift' : 'push' ]( {
			callback: callback,
			modifiers: modifiers,
			action: action,
			seq: sequenceName,
			level: level,
			combo: combo
		} );
	};

	/*
	 * Whether this event should be rejected before further processing and
	 * (eventually) firing off callbacks.
	 *
	 * @method
	 * @param {jQuery.Event} e
	 * @param {HTMLElement} element
	 * @param {string} combo
	 * @return {boolean} Return false to reject, true to keep. For
	 *  compatibility with Mousetrap's isRejected and Mousetrap.stopCallback,
	 *  returning undefined will trigger the 'keep' behavior. Only strict false
	 *  will reject it.
	 */
	ve.ui.CommandFactory.prototype.filter = function ( e, element ) {
		var tag;

		// if the element has the class "mousetrap" then no need to stop
		if ( $( element ).hasClass( 'mousetrap' ) ) {
			return true;
		}

		tag = element.nodeName && element.nodeName.toLowerCase();
		if (
			// Reject key events from input contexts.
			tag === 'input' || tag === 'select' || tag === 'textarea' ||
			( element.contentEditable && element.contentEditable === 'true' )
		) {
			return false;
		}

		return true;
    };

	/**
	 * Register a command. This is the main method to be used from the outside.
	 *
	 * @example
	 * <code>
	 *     ve.ui.commandFactory.register( 'ctrl+b', fn );
	 *     ve.ui.commandFactory.register( ['a b c', '1 2 3'], fn );
	 *     ve.ui.commandFactory.register( 'a ctrl+b c', fn );
	 * </code>
	 *
	 * @method
	 * @param {String|String[]} commands Keyboard command or array of keyboard commands.
	 *  A command is either a combo (keys separated by plus sign) or a sequence of keys
	 *  (separated by a space).
	 *
	 *  NB: Do *NOT* add superfluous spaces around the plus sign, as it will trigger a
	 *  sequence instead of a combination (e.g. 'a + b' will normalize to 'a b', or
	 *  something else unexpected).
	 *
	 *  NB: Don't use uppercase characters except for single characters like 'A' or 'A B'.
	 *  (e.g. 'ctrl+B' will not work as expected, instead use 'ctrl+b' or 'ctrl+shift+b').
	 * @param {Function} callback.
	 * @param {String} action One of 'keypress', 'keydown' or 'keyup'. Default determined
	 *  by `guessAction()`.
	 */
	ve.ui.CommandFactory.prototype.register = function ( commands, callback, action ) {
		if ( commands ) {
			if ( !$.isArray( commands ) ) {
				commands = [commands];
			}
			for ( var i = 0; i < commands.length; i++ ) {
				this.bindSingle( commands[i], callback, action );
			}
		}
	};

	/**
	 * Internal method for firing a callback function from the callback list.
	 *
	 * If your callback function returns false this will apply the same
	 * behavior as jQuery does: prevent default and stop propogation.
	 *
	 * @private
	 * @method
	 * @param {Function} callback
	 * @param {jQuery.Event} e
	 * @param {string} combo
	 */
	ve.ui.CommandFactory.prototype.fireCallback = function ( callback, e, combo ) {
		// If this event should not happen, stop here.
		if ( this.filter( e, e.target, combo ) === false ) {
			return;
		}

		if ( callback( e, combo ) === false ) {
			e.preventDefault();
			e.stopPropagation();
		}
	};

	/* Initialization */

	// TODO: Move instantiation to a different file
	ve.ui.commandFactory = new ve.ui.CommandFactory();

}( ve ) );
