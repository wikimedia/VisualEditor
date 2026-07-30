/*!
 * VisualEditor UserInterface Actions WindowAction tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.ui.WindowAction' );

/* Tests */

QUnit.test( 'Basic open/close', ( assert ) => {
	const surface = ve.test.utils.createSurfaceFromHtml( '' ),
		windowAction = ve.ui.actionFactory.create( 'window', surface ),
		dialogs = surface.getDialogs(),
		done = assert.async( 2 );

	dialogs.once( 'opening', ( win, opening ) => {
		opening.then( () => {
			assert.true( true, 'Window opened' );

			windowAction.close( 'message' );
			done();
		} );
	} );

	dialogs.once( 'closing', () => {
		assert.true( true, 'Window closed' );
		done();
	} );

	windowAction.open( 'message' );
} );

QUnit.test( 'open() settles when the fragment cannot be prepared', ( assert ) => {
	// A regression here means the promise never settles, which without a timeout would
	// hang the whole run rather than fail this test. The test itself takes ~27ms.
	assert.timeout( 500 );
	const done = assert.async();

	function TestFragmentDialog() {
		TestFragmentDialog.super.apply( this, arguments );
	}
	OO.inheritClass( TestFragmentDialog, ve.ui.FragmentDialog );
	TestFragmentDialog.static.name = 'veTestFragmentDialog';
	ve.ui.windowFactory.register( TestFragmentDialog );

	const surface = ve.test.utils.createSurfaceFromHtml( '', { mode: 'source' } ),
		windowAction = ve.ui.actionFactory.create( 'window', surface ),
		fragment = surface.getModel().getFragment();

	// In source mode a fragment window converts the selection before opening. That
	// conversion can fail, in which case the window never opens, so the promise has to
	// settle rather than leave callers waiting on it.
	fragment.convertFromSource = () => ve.createDeferred().reject( 'conversion failed' ).promise();

	windowAction.open( 'veTestFragmentDialog', { fragment } ).then(
		() => {
			assert.true( false, 'open() should not resolve' );
		},
		( error ) => {
			assert.strictEqual( error, 'conversion failed', 'open() rejects with the conversion error' );
		}
	).always( () => {
		ve.ui.windowFactory.unregister( TestFragmentDialog );
		done();
	} );
} );
