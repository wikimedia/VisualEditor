( function( $, mw, undefined ) {

	$(document).ready( setupSpecial );

	function setupSpecial() {
	
		var api = new mw.Api( {
			url: mw.config.get( 'wgServer' ) + mw.config.get( 'wgScriptPath' ) + '/api.php'
		} );

		var title = new mw.Title( 'Visual editor/Feedback' );

		var feedback = new mw.Feedback( 
			api, 
			title, 
			'visualeditor-feedback-dialog-title' 
		);

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
