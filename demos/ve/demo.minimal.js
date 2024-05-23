/*!
 * VisualEditor minimal demo
 *
 * @copyright See AUTHORS.txt
 */

( function () {
	/* eslint-disable no-jquery/no-global-selector */
	const $instance = $( '.ve-instance' ),
		$output = $( '.ve-demo-output' );

	/* eslint-enable no-jquery/no-global-selector */
	// Set up the platform and wait for i18n messages to load
	new ve.init.sa.Platform( ve.messagePaths ).getInitializedPromise()
		.fail( () => {
			$instance.text( 'Sorry, this browser is not supported.' );
		} )
		.done( () => {
			// Create the target
			const target = new ve.init.sa.Target();

			// Append the target to the document
			$instance.append( target.$element );

			function setSurface( html ) {
				// Create a document model for a new surface
				target.clearSurfaces();
				target.addSurface(
					ve.dm.converter.getModelFromDom(
						ve.createDocumentFromHtml( html ),
						// Optional: Document language, directionality (ltr/rtl)
						{ lang: $.i18n().locale, dir: $( document.body ).css( 'direction' ) }
					)
				);
			}

			setSurface( '<p><b>Hello,</b> <i>World!</i></p>' );

			const htmlInput = new OO.ui.MultilineTextInputWidget( {
				autosize: true,
				classes: [ 've-demo-html' ]
			} );

			// Button and textarea for showing HTML output
			const toHtmlButton = new OO.ui.ButtonWidget( { label: 'Convert to HTML', icon: 'expand' } ).on( 'click', () => {
				// Get the current HTML from the surface and display
				htmlInput.setValue( target.getSurface().getHtml() );
			} );
			const fromHtmlButton = new OO.ui.ButtonWidget( { label: 'Convert from HTML', icon: 'collapse' } ).on( 'click', () => {
				setSurface( htmlInput.getValue() );
			} );
			const convertButtons = new OO.ui.ButtonGroupWidget( {
				items: [
					toHtmlButton, fromHtmlButton
				]
			} );

			$output.append(
				convertButtons.$element,
				htmlInput.$element
			);
		} );
}() );
