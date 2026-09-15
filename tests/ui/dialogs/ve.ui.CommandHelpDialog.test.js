/*!
 * VisualEditor UserInterface CommandHelpDialog tests.
 *
 * @copyright See AUTHORS.txt
 */

QUnit.module( 've.ui.CommandHelpDialog' );

/**
 * Build the shortcut text which the dialog shows for a trigger.
 *
 * The keys are platform-specific. On Mac, Tab is the symbol U+21E5. The dialog puts
 * each key in its own element, then puts '+' between the elements.
 *
 * Allow an invalid primary key, as the dialog does.
 *
 * @param {string} trigger Trigger string
 * @return {string} Shortcut text
 */
function shortcutText( trigger ) {
	return new ve.ui.Trigger( trigger, true ).getMessage( true ).join( '+' );
}

/* Tests */

QUnit.test( 'Command help dialog', ( assert ) => {
	const done = assert.async();

	const surface = ve.test.utils.createSurfaceFromHtml( '', { allowTabFocusChange: false } );

	surface.getDialogs().getWindow( 'commandHelp' ).then(
		( dialog ) => dialog.open( { surface } ).opened.then( () => {
			assert.deepEqual(
				dialog.$body.find( 'h3' ).map( ( i, el ) => $( el ).text() ).get(),
				[
					'visualeditor-shortcuts-text-style',
					'visualeditor-shortcuts-clipboard',
					'visualeditor-shortcuts-formatting',
					'visualeditor-shortcuts-history',
					'visualeditor-shortcuts-dialog',
					'visualeditor-shortcuts-other',
					'visualeditor-shortcuts-insert'
				],
				'Command groups headings'
			);
			const shortcuts = dialog.$body.find( '.ve-ui-commandHelpDialog-shortcut' ).map( ( i, el ) => $( el ).text() ).get();
			assert.true( shortcuts.includes( shortcutText( 'tab' ) ), 'Tab shortcut is included' );
			assert.true( shortcuts.includes( shortcutText( 'shift+tab' ) ), 'Shift+Tab shortcut is included' );

			dialog.close().closed.then( () => {
				surface.destroy();
				done();
			} );
		} )
	);
} );

QUnit.test( 'Command help dialog (allowTabFocusChange=true, excluded commands)', ( assert ) => {
	const done = assert.async();

	const surface = ve.test.utils.createSurfaceFromHtml( '', {
		excludeCommands: [ 'undo', 'redo' ],
		allowTabFocusChange: true
	} );

	surface.getDialogs().getWindow( 'commandHelp' ).then(
		( dialog ) => dialog.open( { surface } ).opened.then( () => {
			assert.deepEqual(
				dialog.$body.find( 'h3' ).map( ( i, el ) => $( el ).text() ).get(),
				[
					'visualeditor-shortcuts-text-style',
					'visualeditor-shortcuts-clipboard',
					'visualeditor-shortcuts-formatting',
					// History section is missing since undo and redo commands are excluded
					// 'visualeditor-shortcuts-history',
					'visualeditor-shortcuts-dialog',
					'visualeditor-shortcuts-other',
					'visualeditor-shortcuts-insert'
				],
				'Command groups headings'
			);
			const shortcuts = dialog.$body.find( '.ve-ui-commandHelpDialog-shortcut' ).map( ( i, el ) => $( el ).text() ).get();
			assert.false( shortcuts.includes( shortcutText( 'tab' ) ), 'Tab shortcut is not included' );
			assert.false( shortcuts.includes( shortcutText( 'shift+tab' ) ), 'Shift+Tab shortcut is not included' );
			// The assertions above also pass if shortcutText stops matching the
			// dialog. This one keeps them honest.
			const boldTrigger = ve.ui.triggerRegistry.lookup( 'bold' )[ 0 ].toString();
			assert.true( shortcuts.includes( shortcutText( boldTrigger ) ), 'Bold shortcut is included' );

			dialog.close().closed.then( () => {
				surface.destroy();
				done();
			} );
		} )
	);
} );
