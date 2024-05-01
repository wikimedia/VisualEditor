/*!
 * VisualEditor UserInterface FindAndReplaceDialog tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.ui.FindAndReplaceDialog' );

/* Tests */

QUnit.test( 'find fragments', ( assert ) => {
	const done = assert.async(),
		surface = ve.test.utils.createSurfaceFromHtml( '<p>Foo bar fooq.</p><p>baz foob</p>' ),
		cases = [
			{
				msg: 'Simple case insensitive',
				find: 'Foo',
				ranges: [
					new ve.Range( 1, 4 ),
					new ve.Range( 9, 12 ),
					new ve.Range( 20, 23 )
				]
			},
			{
				msg: 'Simple case sensitive',
				find: 'Foo',
				matchCase: true,
				ranges: [
					new ve.Range( 1, 4 )
				]
			},
			{
				msg: 'Case insensitive regex',
				find: 'fo[^ ]+',
				regex: true,
				ranges: [
					new ve.Range( 1, 4 ),
					new ve.Range( 9, 14 ),
					new ve.Range( 20, 24 )
				]
			},
			{
				msg: 'Case sensitive regex',
				find: 'fo[^ ]+',
				regex: true,
				matchCase: true,
				ranges: [
					new ve.Range( 9, 14 ),
					new ve.Range( 20, 24 )
				]
			},
			{
				msg: 'Regex to end of line',
				find: 'q.*',
				regex: true,
				ranges: [
					new ve.Range( 12, 14 )
				]
			},
			{
				msg: 'Overlapping regex',
				find: '.*',
				regex: true,
				ranges: [
					new ve.Range( 1, 14 ),
					new ve.Range( 16, 24 )
				]
			},
			{
				msg: 'Invalid regex',
				find: '(.*',
				regex: true,
				ranges: []
			}
		];

	surface.getToolbarDialogs( 'above' ).getWindow( 'findAndReplace' ).then( ( dialog ) => {
		dialog.open( {
			surface: surface,
			fragment: surface.getModel().getFragment()
		} ).opening.then( () => {
			cases.forEach( ( caseItem ) => {
				dialog.matchCaseToggle.setValue( !!caseItem.matchCase );
				dialog.regexToggle.setValue( !!caseItem.regex );
				dialog.findText.setValue( caseItem.find );
				const ranges = dialog.fragments.map( ( fragment ) => fragment.getSelection().getRange() );
				assert.deepEqual( ranges, caseItem.ranges, caseItem.msg );
				dialog.findText.setValue( '' );
			} );
			done();
		} );
	} );

} );

QUnit.test( 'replace all', ( assert ) => {
	const done = assert.async(),
		surface = ve.test.utils.createSurfaceFromHtml( '<p>Foo bar fooq.</p><p>baz foob</p>' ),
		cases = [
			{
				msg: 'Simple case insensitive',
				find: 'Foo',
				replace: 'baz',
				expected: 'baz bar bazq.baz bazb'
			},
			{
				msg: 'Recursive',
				find: 'baz',
				replace: 'foofoo',
				expected: 'foofoo bar foofooq.foofoo foofoob'
			},
			{
				msg: 'Regex',
				find: '(foo)+',
				replace: 'X',
				regex: true,
				expected: 'X bar Xq.X Xb'
			}
		];

	surface.getToolbarDialogs( 'above' ).getWindow( 'findAndReplace' ).done( ( dialog ) => {
		dialog.open( {
			surface: surface,
			fragment: surface.getModel().getFragment()
		} ).opening.then( () => {
			cases.forEach( ( caseItem ) => {
				dialog.matchCaseToggle.setValue( !!caseItem.matchCase );
				dialog.regexToggle.setValue( !!caseItem.regex );
				dialog.findText.setValue( caseItem.find );
				dialog.replaceText.setValue( caseItem.replace );
				dialog.onReplaceAllButtonClick();
				assert.strictEqual( surface.getModel().getDocument().data.getText(), caseItem.expected, caseItem.msg );
				dialog.findText.setValue( '' );
				dialog.replaceText.setValue( '' );
			} );
			done();
		} ).fail( ( ex ) => {
			assert.true( false, 'Error thrown: ' + ex.stack );
			done();
		} );
	} );

} );
