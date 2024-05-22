/*!
 * VisualEditor Scheduler tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.Scheduler' );

/* Stubs */

ve.TestScheduler = function VeTestScheduler() {
	// Parent constructor
	ve.TestScheduler.super.apply( this, arguments );

	this.nowCounter = 0;
};

OO.inheritClass( ve.TestScheduler, ve.Scheduler );

ve.TestScheduler.static.maxDelay = 5;

ve.TestScheduler.prototype.now = function () {
	return this.nowCounter++;
};

/* Tests */

QUnit.test( 'Call with no real async', ( assert ) => {
	const scheduler = new ve.TestScheduler(),
		begun = assert.async(),
		done = assert.async();

	scheduler.schedule(
		() => {
			assert.true( true, 'initial action was called' );
			begun();
		},
		() => true
	).done( () => {
		assert.true( true, 'promise was resolved' );
		done();
	} );
} );

QUnit.test( 'Call with delay', ( assert ) => {
	const scheduler = new ve.TestScheduler(),
		begun = assert.async(),
		done = assert.async();

	let delayed = false;
	scheduler.schedule(
		() => {
			assert.true( true, 'initial action was called' );
			setTimeout( () => {
				delayed = true;
				assert.true( true, 'setTimeout delay occurred' );
			} );
			begun();
		},
		() => delayed
	).done( () => {
		assert.true( true, 'promise was resolved' );
		done();
	} );
} );

QUnit.test( 'Test that throws an exception', ( assert ) => {
	const scheduler = new ve.TestScheduler(),
		begun = assert.async(),
		done = assert.async();

	scheduler.schedule(
		() => {
			assert.true( true, 'initial action was called' );
			begun();
		},
		() => {
			throw new Error();
		}
	).done( () => {
		assert.true( false, 'promise was wrongly resolved as successful' );
	} ).fail( () => {
		assert.true( true, 'promise was rejected' );
		done();
	} );
} );

QUnit.test( 'Test that never succeeds', ( assert ) => {
	const scheduler = new ve.TestScheduler(),
		begun = assert.async(),
		done = assert.async();

	scheduler.schedule(
		() => {
			assert.true( true, 'initial action was called' );
			begun();
		},
		() => false
	).done( () => {
		assert.true( false, 'promise was wrongly resolved as successful' );
		done();
	} ).fail( () => {
		assert.true( true, 'promise was rejected' );
		done();
	} );
} );
