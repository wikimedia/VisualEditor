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

QUnit.test( 'getMessage', ( assert ) => {
	const cases = [
		{
			platform: 'mac',
			trigger: 'ctrl+shift+b',
			keys: [ '^', '\u21e7', 'B' ],
			message: '^\u21e7B'
		},
		{
			platform: 'pc',
			trigger: 'ctrl+shift+b',
			keys: [ 'visualeditor-key-ctrl', 'visualeditor-key-shift', 'B' ],
			message: 'visualeditor-key-ctrl+visualeditor-key-shift+B'
		},
		{
			platform: 'mac',
			trigger: 'tab',
			keys: [ '\u21e5' ],
			message: '\u21e5'
		},
		{
			platform: 'pc',
			trigger: 'tab',
			keys: [ 'visualeditor-key-tab' ],
			message: 'visualeditor-key-tab'
		}
	];

	const origGetSystemPlatform = ve.getSystemPlatform;
	try {
		cases.forEach( ( caseItem ) => {
			ve.getSystemPlatform = () => caseItem.platform;
			const trigger = new ve.ui.Trigger( caseItem.trigger );
			assert.deepEqual(
				trigger.getMessage( true ),
				caseItem.keys,
				caseItem.trigger + ' on ' + caseItem.platform + ' gives the platform keys'
			);
			assert.strictEqual(
				trigger.getMessage(),
				caseItem.message,
				caseItem.trigger + ' on ' + caseItem.platform + ' joins the keys for the platform'
			);
		} );
	} finally {
		// A failed assertion must not leak the stub into other modules
		ve.getSystemPlatform = origGetSystemPlatform;
	}
} );
