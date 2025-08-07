$( () => {
	new ve.init.sa.Platform( ve.messagePaths ).initialize().done( () => {
		const documentNameInput = new OO.ui.TextInputWidget( {
				placeholder: ve.msg( 'visualeditor-rebase-client-document-name' )
			} ),
			submitButton = new OO.ui.ButtonWidget( {
				label: ve.msg( 'visualeditor-rebase-client-document-create-edit' ),
				flags: [ 'primary', 'progressive' ]
			} ),
			documentNameField = new OO.ui.ActionFieldLayout( documentNameInput, submitButton, {
				align: 'top'
			} );

		function onSubmit() {
			const docName = documentNameInput.getValue().trim().replace( / /g, '_' ) || ve.init.platform.generateUniqueId();
			if ( docName ) {
				window.location.href = '/doc/edit/' + encodeURIComponent( docName );
			} else {
				documentNameInput.focus();
			}
		}

		submitButton.on( 'click', onSubmit );
		documentNameInput.on( 'enter', onSubmit );

		// eslint-disable-next-line no-jquery/no-global-selector
		$( '.ve-demo-index' ).append( documentNameField.$element );

		documentNameInput.focus();
	} );
} );
