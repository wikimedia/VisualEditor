/*!
 * VisualEditor UserInterface Trigger tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.ui.Trigger' );

/* Tests */

QUnit.test( 'constructor', ( assert ) => {
	function event( options ) {
		return $.Event( 'keydown', options );
	}

	const cases = [
		{
			trigger: 'ctrl+b',
			event: event( { ctrlKey: true, which: 66 } )
		}
	];

	cases.forEach( ( caseItem ) => {
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
