/*!
 * VisualEditor UserInterface Trigger tests.
 *
 * @copyright 2011-2020 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.ui.Trigger' );

/* Tests */

QUnit.test( 'constructor', function ( assert ) {
	function event( options ) {
		return $.Event( 'keydown', options );
	}

	var cases = [
		{
			trigger: 'ctrl+b',
			event: event( { ctrlKey: true, which: 66 } )
		}
	];

	cases.forEach( function ( caseItem ) {
		assert.strictEqual(
			new ve.ui.Trigger( caseItem.trigger ).toString(),
			caseItem.trigger,
			'trigger is parsed correctly'
		);
		assert.strictEqual(
			new ve.ui.Trigger( caseItem.event ).toString(),
			caseItem.trigger,
			'event is parsed correctly'
		);
	} );
} );
