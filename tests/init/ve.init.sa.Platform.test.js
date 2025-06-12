/*!
 * VisualEditor tests for ve.init.sa.Platform.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.init.sa.Platform', {
	beforeEach: function () {
		// Ensure that ve.init.platform is not permanently overwritten
		// by creating an sa.Platform
		this.originalPlatform = ve.init.platform;
		this.purgeKeys = function () {
			let i = localStorage.length;
			// Loop backwards since removal affects the key index
			while ( i-- ) {
				const key = localStorage.key( i );
				if ( key.startsWith( 've-test-' ) ) {
					localStorage.removeItem( key );
				}
			}
		};
		this.purgeKeys();
	},
	afterEach: function () {
		ve.init.platform = this.originalPlatform;
		this.purgeKeys();
	}
} );

QUnit.test( 'getUserConfig', ( assert ) => {
	const platform = new ve.init.sa.Platform();

	assert.strictEqual( platform.getUserConfig( 'test-1' ), null, 'unknown key' );
	assert.propEqual(
		platform.getUserConfig( [ 'test-1', 'test-2' ] ),
		{ 'test-1': null, 'test-2': null },
		'multiple unknown keys'
	);

	platform.setUserConfig( { 'test-1': 'a', 'test-2': 'b' } );

	assert.strictEqual( platform.getUserConfig( 'test-1' ), 'a', 'get value' );
	assert.propEqual(
		platform.getUserConfig( [ 'test-1', 'test-2' ] ),
		{ 'test-1': 'a', 'test-2': 'b' },
		'get multiple values'
	);
} );

QUnit.test( 'setUserConfig', ( assert ) => {
	const platform = new ve.init.sa.Platform();

	assert.true( platform.setUserConfig( 'test-1', 'one' ), 'set key' );
	assert.strictEqual( platform.getUserConfig( 'test-1' ), 'one', 'value persists' );

	assert.true(
		platform.setUserConfig( { 'test-1': 'one more', 'test-2': 'two' } ),
		'set multiple keys'
	);
	assert.propEqual(
		platform.getUserConfig( [ 'test-1', 'test-2' ] ),
		{ 'test-1': 'one more', 'test-2': 'two' },
		'multiple values persist'
	);
} );

QUnit.test( 'messages', ( assert ) => {
	const platform = new ve.init.sa.Platform();

	return platform.getInitializedPromise().then( () => {
		assert.true(
			/^<?platformtest-foo>?$/.test( platform.getMessage( 'platformtest-foo' ) ),
			'return plain key as fallback, possibly wrapped in brackets'
		);

		platform.addMessages( {
			'platformtest-foo': 'Foo & Bar <quux action="followed">by</quux>!',
			'platformtest-lorem': 'Lorem <&> Ipsum: $1'
		} );

		assert.strictEqual(
			platform.getMessage( 'platformtest-foo' ),
			'Foo & Bar <quux action="followed">by</quux>!',
			'return plain message'
		);

		assert.strictEqual(
			platform.getMessage( 'platformtest-lorem', 10 ),
			'Lorem <&> Ipsum: 10',
			'return plain message with $# replacements'
		);

		assert.true(
			/^<?platformtest-quux>?$/.test( platform.getMessage( 'platformtest-quux' ) ),
			'return plain key as fallback, possibly wrapped in brackets (after set up)'
		);
	} );
} );

QUnit.test( 'parsedMessage', ( assert ) => {
	const platform = new ve.init.sa.Platform();

	return platform.getInitializedPromise().then( () => {
		assert.true(
			/^(&lt;)?platformtest-quux(&gt;)?$/.test( platform.getParsedMessage( 'platformtest-quux' ) ),
			'any brackets in fallbacks are HTML-escaped'
		);

		platform.addMessages( {
			'platformtest-foo': 'Foo & Bar <quux action="followed">by</quux>!',
			'platformtest-lorem': 'Lorem <&> Ipsum: $1'
		} );

		platform.addParsedMessages( {
			'platformtest-foo': 'Foo <quux>&lt;html&gt;</quux>'
		} );

		assert.strictEqual(
			platform.getParsedMessage( 'platformtest-foo' ),
			'Foo <quux>&lt;html&gt;</quux>',
			'prefer value from parsedMessage store'
		);

		assert.strictEqual(
			platform.getParsedMessage( 'platformtest-lorem', 10 ),
			'Lorem &lt;&amp;&gt; Ipsum: $1',
			'fall back to html-escaped version of plain message, no $# replacements'
		);
	} );
} );
