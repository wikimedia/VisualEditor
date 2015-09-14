/*!
 * VisualEditor DataModel Scalable tests.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

QUnit.module( 've.dm.Scalable' );

QUnit.test( 'construction/clone/getters/toggleDefault/clearers', 12, function ( assert ) {
	var currentDimensions = {
			width: 300,
			height: 200
		},
		originalDimensions = {
			width: 600,
			height: 400
		},
		defaultDimensions = {
			width: 150,
			height: 50
		},
		minDimensions = {
			width: 1,
			height: 1
		},
		maxDimensions = {
			width: 1200,
			height: 800
		},
		scalable = new ve.dm.Scalable( {
			currentDimensions: currentDimensions,
			originalDimensions: originalDimensions,
			defaultDimensions: defaultDimensions,
			minDimensions: minDimensions,
			maxDimensions: maxDimensions
		} ),
		clone = scalable.clone();

	assert.deepEqual( scalable, clone, 'Clone is deepEqual' );
	assert.deepEqual( scalable.getCurrentDimensions(), currentDimensions, 'getCurrentDimensions' );
	assert.deepEqual( scalable.getOriginalDimensions(), originalDimensions, 'getOriginalDimensions' );
	assert.deepEqual( scalable.getDefaultDimensions(), defaultDimensions, 'getDefaultDimensions' );
	assert.deepEqual( scalable.getMinDimensions(), minDimensions, 'getMinDimensions' );
	assert.deepEqual( scalable.getMaxDimensions(), maxDimensions, 'getMaxDimensions' );
	assert.strictEqual( scalable.getRatio(), 1.5, 'getRatio' );

	scalable.toggleDefault();
	assert.deepEqual( scalable.getCurrentDimensions(), scalable.getDefaultDimensions(), 'toggleDefault' );

	scalable.clearDefaultDimensions();
	assert.strictEqual( scalable.getDefaultDimensions(), null, 'clearDefaultDimensions' );

	scalable.clearOriginalDimensions();
	assert.strictEqual( scalable.getOriginalDimensions(), null, 'clearOriginalDimensions' );

	scalable.clearMinDimensions();
	assert.strictEqual( scalable.getMinDimensions(), null, 'clearMinDimensions' );

	scalable.clearMaxDimensions();
	assert.strictEqual( scalable.getMaxDimensions(), null, 'clearMaxDimensions' );
} );

QUnit.test( 'getBoundedDimensions/getCurrentScale/isCurrentDimensionsValid/isTooSmall/isTooLarge', 16, function ( assert ) {
	var currentDimensions = {
			width: 300,
			height: 200
		},
		originalDimensions = {
			width: 600,
			height: 400
		},
		minDimensions = {
			width: 150,
			height: 100
		},
		maxDimensions = {
			width: 1200,
			height: 800
		},
		scalable = new ve.dm.Scalable( {
			currentDimensions: currentDimensions,
			originalDimensions: originalDimensions,
			minDimensions: minDimensions,
			maxDimensions: maxDimensions
		} );

	assert.deepEqual( scalable.getBoundedDimensions( { width: 600, height: 600 } ), { width: 600, height: 400 }, 'getBoundedDimensions' );
	assert.deepEqual( scalable.getBoundedDimensions( { width: 2000, height: 2000 } ), { width: 1200, height: 800 }, 'getBoundedDimensions beyond maxDimensions' );
	assert.deepEqual( scalable.getBoundedDimensions( { width: 30, height: 30 } ), { width: 150, height: 100 }, 'getBoundedDimensions beyond minDimensions' );
	assert.deepEqual( scalable.getBoundedDimensions( { width: 448, height: 317 }, 10 ), { width: 450, height: 300 }, 'getBoundedDimensions snapped to 10px grid' );

	scalable.fixedRatio = false;

	assert.strictEqual( scalable.getCurrentScale(), null, 'Scale is null when not fixed ratio' );

	assert.deepEqual( scalable.getBoundedDimensions( { width: 600, height: 600 } ), { width: 600, height: 600 }, 'getBoundedDimensions, no fixed ratio' );
	assert.deepEqual( scalable.getBoundedDimensions( { width: 448, height: 317 }, 10 ), { width: 450, height: 320 }, 'getBoundedDimensions snapped to 10px grid, no fixed ratio' );

	scalable.fixedRatio = true;

	assert.strictEqual( scalable.isCurrentDimensionsValid(), true, '300x200 are valid dimensions' );
	assert.strictEqual( scalable.getCurrentScale(), 0.5, '300x200 is scale of 0.5' );

	scalable.setCurrentDimensions( { width: 1200, height: 800 } );
	assert.strictEqual( scalable.getCurrentScale(), 2, '1200x800 is scale of 2' );

	scalable.setCurrentDimensions( { width: 1300, height: 810 } );
	assert.strictEqual( scalable.isCurrentDimensionsValid(), false, 'Too large dimensions are not valid' );
	assert.strictEqual( scalable.isTooSmall(), false, 'Too large dimensions are not too small' );
	assert.strictEqual( scalable.isTooLarge(), true, 'Too large dimensions are too large' );

	scalable.setCurrentDimensions( { width: 30, height: 20 } );
	assert.strictEqual( scalable.isCurrentDimensionsValid(), false, 'Too small dimensions are not valid' );
	assert.strictEqual( scalable.isTooSmall(), true, 'Too large dimensions are too small' );
	assert.strictEqual( scalable.isTooLarge(), false, 'Too large dimensions are not too large' );
} );

QUnit.test( 'isDimensionsObjectValid', function ( assert ) {
	var i, cases = [
		{ dimensions: null, expected: false, msg: 'Null' },
		{ dimensions: { width: 200 }, expected: true, msg: 'Only width' },
		{ dimensions: { height: 200 }, expected: true, msg: 'Only height' },
		{ dimensions: {}, expected: false, msg: 'Empty object' },
		{ dimensions: { width: undefined, height: undefined }, expected: false, msg: 'Explicity undefined' }
	];

	QUnit.expect( cases.length );

	for ( i = 0; i < cases.length; i++ ) {
		assert.strictEqual( ve.dm.Scalable.static.isDimensionsObjectValid( cases[ i ].dimensions ), cases[ i ].expected, cases[ i ].msg );
	}
} );

QUnit.test( 'getDimensionsFromValue', function ( assert ) {
	var i, cases = [
		{ dimensions: { width: 200 }, ratio: 1, expected: { width: 200, height: 200 }, msg: 'Only width' },
		{ dimensions: { height: 200 }, ratio: 2, expected: { width: 400, height: 200 }, msg: 'Only height' },
		{ dimensions: { width: 200, height: '' }, ratio: 0.5, expected: { width: 200, height: 400 }, msg: 'Empty height' }
	];

	QUnit.expect( cases.length );

	for ( i = 0; i < cases.length; i++ ) {
		assert.deepEqual( ve.dm.Scalable.static.getDimensionsFromValue( cases[ i ].dimensions, cases[ i ].ratio ), cases[ i ].expected, cases[ i ].msg );
	}
} );
