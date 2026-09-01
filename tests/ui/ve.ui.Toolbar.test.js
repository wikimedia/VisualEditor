/*!
 * VisualEditor UserInterface Toolbar tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.ui.Toolbar', {
	beforeEach: function () {
		ve.init.platform.localStorage.remove( ve.ui.Toolbar.static.expandedStorageKey );

		this.toolNames = [ 'testAlpha', 'testBeta', 'testGamma', 'testDelta' ];
		this.toolNames.forEach( ( name ) => {
			function TestTool() {
				TestTool.super.apply( this, arguments );
			}
			OO.inheritClass( TestTool, OO.ui.Tool );
			TestTool.static.name = name;
			TestTool.static.title = name;
			TestTool.prototype.onSelect = function () {};
			TestTool.prototype.onUpdateState = function () {};
			ve.ui.toolFactory.register( TestTool );
		} );

		// Build a toolbar with two collapsible groups, as a page load would.
		// ve.ui.Toolbar#setup needs a surface, thus drive the tool group part alone.
		this.buildToolbar = () => {
			const toolbar = new ve.ui.Toolbar();
			OO.ui.Toolbar.prototype.setup.call( toolbar, [
				{
					name: 'style',
					type: 'list',
					include: [ 'testAlpha', 'testBeta', 'testGamma' ],
					forceExpand: [ 'testAlpha' ]
				},
				{
					name: 'insert',
					type: 'list',
					include: [ 'testDelta', 'testGamma' ],
					forceExpand: [ 'testDelta' ]
				}
			] );
			// eslint-disable-next-line no-jquery/no-global-selector
			$( '#qunit-fixture' ).append( toolbar.$element );
			toolbar.initialize();
			toolbar.setupToolGroupExpansion();
			return toolbar;
		};
	},
	afterEach: function () {
		this.toolNames.forEach( ( name ) => {
			ve.ui.toolFactory.unregister( name );
		} );
		ve.init.platform.localStorage.remove( ve.ui.Toolbar.static.expandedStorageKey );
	}
} );

QUnit.test( 'stores the expanded state of each tool group separately', function ( assert ) {
	let toolbar = this.buildToolbar();
	const style = toolbar.getToolGroupByName( 'style' );
	const insert = toolbar.getToolGroupByName( 'insert' );

	assert.strictEqual( style.expanded, false, 'group starts collapsed' );
	assert.strictEqual(
		ve.init.platform.localStorage.get( ve.ui.Toolbar.static.expandedStorageKey ),
		null,
		'nothing is stored before the user acts'
	);

	style.getExpandCollapseTool().onSelect();

	assert.strictEqual( style.expanded, true, 'the tool expands the group' );
	assert.strictEqual( insert.expanded, false, 'the other group does not change' );

	// Build the toolbar again, as a page reload would
	toolbar = this.buildToolbar();

	assert.strictEqual(
		toolbar.getToolGroupByName( 'style' ).expanded, true,
		'the expanded group stays expanded'
	);
	assert.strictEqual(
		toolbar.getToolGroupByName( 'insert' ).expanded, false,
		'the other group stays collapsed'
	);
} );

QUnit.test( 'shows and hides the collapsible tools of a restored group', function ( assert ) {
	ve.ui.Toolbar.static.setStoredExpanded( 'style', true );

	const toolbar = this.buildToolbar();
	const style = toolbar.getToolGroupByName( 'style' );

	assert.strictEqual( style.collapsibleTools.length, 2, 'group has collapsible tools' );
	assert.true(
		style.collapsibleTools.every( ( tool ) => tool.isVisible() ),
		'collapsible tools are shown'
	);
	assert.strictEqual(
		style.getExpandCollapseTool().getIcon(), 'collapse',
		'the tool offers to show fewer tools'
	);

	style.getExpandCollapseTool().onSelect();

	assert.true(
		style.collapsibleTools.every( ( tool ) => !tool.isVisible() ),
		'collapsible tools are hidden again'
	);
	assert.strictEqual(
		ve.ui.Toolbar.static.getStoredExpanded( 'style' ), false,
		'the new state is stored'
	);
} );

QUnit.test( 'restoring a group does not store it again', function ( assert ) {
	ve.ui.Toolbar.static.setStoredExpanded( 'style', true );
	ve.ui.Toolbar.static.setStoredExpanded( 'insert', false );
	const before = ve.init.platform.localStorage.get( ve.ui.Toolbar.static.expandedStorageKey );

	this.buildToolbar();

	assert.strictEqual(
		ve.init.platform.localStorage.get( ve.ui.Toolbar.static.expandedStorageKey ),
		before,
		'the store is untouched'
	);
} );

QUnit.test( 'ignores tool groups that cannot collapse', ( assert ) => {
	const toolbar = new ve.ui.Toolbar();
	OO.ui.Toolbar.prototype.setup.call( toolbar, [
		{ name: 'history', include: [ 'testAlpha' ] }
	] );
	toolbar.setupToolGroupExpansion();

	assert.false(
		toolbar.getToolGroupByName( 'history' ) instanceof OO.ui.ListToolGroup,
		'a bar tool group is not a list tool group'
	);
	assert.strictEqual(
		ve.init.platform.localStorage.get( ve.ui.Toolbar.static.expandedStorageKey ),
		null,
		'nothing is stored for it'
	);
} );
