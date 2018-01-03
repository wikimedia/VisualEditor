/*!
 * VisualEditor core-only plugin for QUnit.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

// Extend QUnit.module to provide a fixture element. This used to be in tests/index.html, but
// dynamic test runners like Karma build their own web page.
( function ( QUnit ) {
	var orgModule = QUnit.module;

	QUnit.dump.maxDepth = 10;

	QUnit.module = function ( name, localEnv ) {
		localEnv = localEnv || {};
		orgModule( name, {
			beforeEach: function () {
				this.fixture = document.createElement( 'div' );
				this.fixture.id = 'qunit-fixture';
				document.body.appendChild( this.fixture );

				if ( localEnv.beforeEach ) {
					localEnv.beforeEach.call( this );
				}
			},
			afterEach: function () {
				if ( localEnv.afterEach ) {
					localEnv.afterEach.call( this );
				}

				this.fixture.parentNode.removeChild( this.fixture );
			}
		} );
	};
}( QUnit ) );
