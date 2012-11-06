/**
 * VisualEditor CommandFactory tests.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

( function () {
	// When runSequence is called multiple times,
	// be sure to keep track of how far in the future we've scheduled,
	// since mixed sequences are (intentionally) invalidated.
	var sequenceSimulatorOffset = 0;

	QUnit.module( 've.ui.CommandFactory', {
		setup: function () {
			// Clear registry after each test
			ve.ui.commandFactory = new ve.ui.CommandFactory();
		},
		teardown: function () {
			// Can't restore because the constructor does .off(), so the
			// old one is destroyed
			ve.ui.commandFactory = new ve.ui.CommandFactory();
		}
	} );

	/**
	 * @param {string|undefined} action
	 * @param {string} char Single character.
	 * @param {Object} props [optional]
	 */
	function runAction( action, char, props ) {
		props = props || {};
		props.which = char.charCodeAt( 0 );

		$( 'body' ).trigger(
			$.Event( action || 'keypress', props )
		);
	}

	/**
	 * @param {string} action
	 * @param {number} interval Time between actions (in milliseconds).
	 * @param {string} chars
	 */
	function runSequence( action, interval, chars ) {
		var i;

		chars = chars.split( ' ' );
		// Add a little time buffer between sequences so adjacent ones don't end up overlapping
		sequenceSimulatorOffset += 100;

		/**
		 * Utility function to avoid making functions
		 * in a loop, causing scope issues with 'i'.
		 */
		function schedule( char, delay ) {
			setTimeout( function () {
				runAction( action, char );
			}, delay );
		}

		for ( i = 0; i < chars.length; i++ ) {
			sequenceSimulatorOffset += interval;
			schedule( chars[i], sequenceSimulatorOffset );
		}
	}

	QUnit.test( 'register: Single characters', 18, function ( assert ) {
		$.each( {
			// Default should work with keypress
			'default': [ undefined, 'keypress' ],
			'keypress': [ 'keypress', 'keypress' ]
		}, function ( action, event ) {
			$.each( '0 9 a Z ! > - +'.split( ' ' ), function ( i, char ) {
				ve.ui.commandFactory.register( char, function () {
					assert.ok( true, action + ': "' + char + '" - ' + event[1] + ' trigger without modifier keys' );
				}, event[0] );

				runAction( event[1], char );

			} );
		} );

		ve.ui.commandFactory.register( 'a', function () {
			assert.ok( false, 'keypress: "a" - trigger A is ignored' );
		}, 'keypress' );
		runAction( 'keypress', 'A' );

		ve.ui.commandFactory.register( 'a', function () {
			assert.ok( false, 'keypress: "a" - trigger A with Shift is ignored' );
		}, 'keypress' );
		runAction( 'keypress', 'A', { shiftKey: true } );

		ve.ui.commandFactory.register( 'Z', function () {
			assert.ok( true, 'keypress: "Z" - trigger Z with Shift' );
		}, 'keypress' );
		runAction( 'keypress', 'Z', { shiftKey: true } );

		ve.ui.commandFactory.register( 'g', function () {
			assert.ok( false, 'keypress: "g" - register removes old callbacks' );
		}, 'keypress' );
		ve.ui.commandFactory.register( 'g', function () {
			// Undocumented behavior, tested so we detect if/when it changes
			assert.ok( true, 'keypress: "g" - register keeps only the last callback' );
		}, 'keypress' );
		runAction( 'keypress', 'g' );

	} );

	QUnit.asyncTest( 'register: Sequences', 3, function ( assert ) {
		ve.ui.commandFactory.register( '1 2 3', function () {
			assert.ok( true, 'Number sequence with 20ms interval' );
		} );
		runSequence( 'keypress', 20, '1 2 3' );

		ve.ui.commandFactory.register( 'a b c Z', function () {
			assert.ok( true, 'Letter sequence with 10ms interval' );
		} );
		runSequence( 'keypress', 10, 'a b c Z' );

		ve.ui.commandFactory.register( 'o r d e r', function () {
			assert.ok( false, 'Out of order is invalid' );
		} );
		runSequence( 'keypress', 10, 'o r d r e' );

		ve.ui.commandFactory.register( 'm i s s', function () {
			assert.ok( false, 'Missing in-between is invalid' );
		} );
		runSequence( 'keypress', 10, 'm s s' );

		ve.ui.commandFactory.register( 'e x t', function () {
			assert.ok( false, 'Extra in-between is invalid' );
		} );
		runSequence( 'keypress', 10, 'e r x t' );

		ve.ui.commandFactory.register( 's l', function () {
			assert.ok( true, 'Total sequence may take over a second (2 * 600ms)' );
		} );
		runSequence( 'keypress', 600, 's l' );

		ve.ui.commandFactory.register( 'g a', function () {
			assert.ok( false, 'Sequences with gaps > 1 second are invalid (2 x 1100ms)' );
		} );
		runSequence( 'keypress', 1100, 'g a' );

		setTimeout( QUnit.start, sequenceSimulatorOffset + 1 );
	} );

	QUnit.test( 'register: Combinations', 2, function ( assert ) {
		ve.ui.commandFactory.register( 'ctrl+i', function ( e, combo ) {
			assert.ok( true, combo );
		} );

		// XXX: Apparently i/ctrl doesn't work, needs to be uppercase I.
		// This is internally normalized back to 'a'.
		// Google Chrome (and others) use keycode for 'A' when typing a + modifier.
		runAction( 'keydown', 'I', { ctrlKey: true } );

		ve.ui.commandFactory.register( 'cmd+b', function ( e, combo ) {
			assert.ok( true, combo );
		} );
		runAction( 'keydown', 'B', { metaKey: true } );
	} );

}() );
