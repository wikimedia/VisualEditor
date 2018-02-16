$( function () {
	new ve.init.sa.Platform( ve.messagePaths ).initialize().done( function () {
		var documentNameInput = new OO.ui.TextInputWidget( {
				placeholder: OO.ui.msg( 'visualeditor-rebase-client-document-name' )
			} ),
			submitButton = new OO.ui.ButtonWidget( {
				label: OO.ui.msg( 'visualeditor-rebase-client-document-create-edit' )
			} ),
			documentNameField = new OO.ui.ActionFieldLayout( documentNameInput, submitButton, {
				align: 'top'
			} );

		function onSubmit() {
			var docName = documentNameInput.getValue().trim().replace( / /g, '_' ) || Math.random().toString( 36 ).slice( 2 );
			if ( docName ) {
				window.location.href = '/doc/edit/' + encodeURIComponent( docName );
			} else {
				documentNameInput.focus();
			}
		}

		submitButton.on( 'click', onSubmit );
		documentNameInput.on( 'enter', onSubmit );

		$( '.ve-demo-index' ).append( documentNameField.$element );

		documentNameInput.focus();
	} );
} );
