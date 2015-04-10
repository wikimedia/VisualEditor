/*!
 * VisualEditor minimal demo
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

// Wait for i18n messages to load
ve.init.platform.initialize().done( function () {

	// Create the target
	var target = new ve.init.sa.Target();

	// Create a document model for a new surface
	target.addSurface(
		ve.dm.converter.getModelFromDom(
			ve.createDocumentFromHtml( '<p><b>Hello,</b> <i>World!</i></p>' )
			// Optional: Document language, directionality (ltr/rtl)
		)
	);

	// Append the target to the document
	$( '.ve-instance' ).append( target.$element );

	$( '.ve-demo-convert' ).on( 'click', function () {
		// Get the current HTML from the surface and display
		$( '.ve-demo-html' ).val( target.getSurface().getHtml() );
	} );
} );
