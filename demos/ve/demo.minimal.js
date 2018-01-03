/*!
 * VisualEditor minimal demo
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

// Set up the platform and wait for i18n messages to load
new ve.init.sa.Platform( ve.messagePaths ).getInitializedPromise()
	.fail( function () {
		$( '.ve-instance' ).text( 'Sorry, this browser is not supported.' );
	} )
	.done( function () {
		var convertButton, convertText,
			// Create the target
			target = new ve.init.sa.Target();

		// Append the target to the document
		$( '.ve-instance' ).append( target.$element );

		// Create a document model for a new surface
		target.addSurface(
			ve.dm.converter.getModelFromDom(
				ve.createDocumentFromHtml( '<p><b>Hello,</b> <i>World!</i></p>' ),
				// Optional: Document language, directionality (ltr/rtl)
				{ lang: $.i18n().locale, dir: $( 'body' ).css( 'direction' ) }
			)
		);

		// Button and textarea for showing HTML output
		convertButton = new OO.ui.ButtonWidget( { label: 'Convert to HTML', icon: 'expand' } ).on( 'click', function () {
			// Get the current HTML from the surface and display
			convertText.setValue( target.getSurface().getHtml() );
		} );

		convertText = new OO.ui.MultilineTextInputWidget( { autosize: true, classes: [ 've-demo-html' ] } );

		$( '.ve-demo-output' ).append(
			convertButton.$element,
			convertText.$element
		);
	} );
