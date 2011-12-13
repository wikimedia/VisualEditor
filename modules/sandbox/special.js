( function( $, mw, undefined ) {

	$(document).ready( setupSpecial );

	function setupSpecial() {

		var feedback = new mw.Feedback( {
			'title': new mw.Title( 'Visual editor/Feedback' ),
			'dialogTitleMessageKey': 'visualeditor-feedback-dialog-title' 
		} );

		$feedbackLink = $( '<a></a>' )
			.attr( { 'href': '#' } )
			.text( mw.msg( 'visualeditor-feedback-prompt' ) )	
			.click( function() { feedback.launch(); } );

		// Right before the line with the test "documents" we prepend a float-right
		// div, which puts it on the same line as the documents at right.
		$( '#es-docs' ).before( 
			$( '<div></div>' ).css( { 'float': 'right' } ).append( $feedbackLink )
		);
	}

} )( jQuery, window.mediaWiki );
