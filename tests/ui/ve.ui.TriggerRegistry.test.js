/*!
 * VisualEditor UserInterface TriggerRegistry tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.ui.TriggerRegistry' );

QUnit.test( 'register, getNameByTrigger, getMessages', ( assert ) => {
	const origGetSystemPlatform = ve.getSystemPlatform;
	ve.getSystemPlatform = () => 'pc';

	const registry = new ve.ui.TriggerRegistry();
	const triggerA = new ve.ui.Trigger( 'ctrl+a' );
	const triggerB = new ve.ui.Trigger( 'ctrl+b' );
	const triggerC = new ve.ui.Trigger( 'ctrl+c' );

	// Register single trigger
	registry.register( 'selectAll', triggerA );
	assert.strictEqual(
		registry.getNameByTrigger( triggerA.toString() ),
		'selectAll',
		'getNameByTrigger returns correct name for single trigger'
	);

	// Register multiple triggers for one name
	registry.register( 'copy', [ triggerB, triggerC ] );
	assert.strictEqual(
		registry.getNameByTrigger( triggerB.toString() ),
		'copy',
		'getNameByTrigger returns correct name for first of multiple triggers'
	);
	assert.strictEqual(
		registry.getNameByTrigger( triggerC.toString() ),
		'copy',
		'getNameByTrigger returns correct name for second of multiple triggers'
	);

	// Register platform-specific triggers
	const triggerByPlatform = {
		mac: 'meta+v',
		pc: 'ctrl+v'
	};
	[ 'mac', 'pc' ].forEach( ( platform ) => {
		ve.getSystemPlatform = () => platform;
		const platformRegistry = new ve.ui.TriggerRegistry();
		platformRegistry.register( 'paste', {
			mac: new ve.ui.Trigger( 'cmd+v' ),
			pc: new ve.ui.Trigger( 'ctrl+v' )
		} );
		assert.strictEqual(
			platformRegistry.getNameByTrigger( triggerByPlatform[ platform ] ),
			'paste',
			'getNameByTrigger returns correct name for ' + platform + ' trigger'
		);
	} );

	// getMessages returns messages for all triggers
	const triggerD = new ve.ui.Trigger( 'ctrl+d' );
	triggerD.getMessage = () => 'Custom message';
	registry.register( 'custom', triggerD );
	assert.deepEqual(
		registry.getMessages( 'custom' ),
		[ 'Custom message' ],
		'getMessages returns custom message for trigger'
	);

	// Not an instance of ve.ui.Trigger
	assert.throws(
		() => registry.register( 'bad', [ {} ] ),
		/Trigger must be an instance of ve\.ui\.Trigger/,
		'Throws if not an instance of ve.ui.Trigger'
	);

	// Incomplete trigger
	const incomplete = new ve.ui.Trigger( 'ctrl+' );
	assert.throws(
		() => registry.register( 'incomplete', incomplete ),
		/Incomplete trigger/,
		'Throws if trigger is incomplete'
	);

	ve.getSystemPlatform = origGetSystemPlatform;
} );
