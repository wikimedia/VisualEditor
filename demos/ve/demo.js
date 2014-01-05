/*!
 * VisualEditor standalone demo
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/*global console, alert */
$( function () {

	var currentTarget,
		$targetContainer = $( '.ve-demo-editor' ).eq( 0 ),
		$errorbox = $( '.ve-demo-error' ),

		// Widgets
		startTextInput = new OO.ui.TextInputWidget( { 'readOnly': true } ),
		endTextInput = new OO.ui.TextInputWidget( { 'readOnly': true } ),
		startTextInputLabel = new OO.ui.InputLabelWidget(
			{ 'label': 'Start', 'input': startTextInput }
		),
		endTextInputLabel = new OO.ui.InputLabelWidget(
			{ 'label': 'End', 'input': endTextInput }
		),
		getRangeButton = new OO.ui.PushButtonWidget( { 'label': 'Get selected range' } ),
		logRangeButton = new OO.ui.PushButtonWidget(
			{ 'label': 'Log to console', 'disabled': true }
		),
		dumpModelButton = new OO.ui.PushButtonWidget( { 'label': 'Dump model' } ),
		validateButton = new OO.ui.PushButtonWidget( { 'label': 'Validate view and model' } );

	// Initialization

	$( '.ve-demo-utilities-commands' ).append(
		getRangeButton.$element,
		startTextInputLabel.$element,
		startTextInput.$element,
		endTextInputLabel.$element,
		endTextInput.$element,
		logRangeButton.$element,
		$( '<span class="ve-demo-utilities-commands-divider">&nbsp;</span>' ),
		dumpModelButton.$element,
		validateButton.$element
	);

	function loadPage( src ) {
		$errorbox.empty();
		$.ajax( {
			url: src,
			dataType: 'text'
		} ).done( function ( pageHtml ) {
			location.hash = '#!/src/' + src;

			$targetContainer.slideUp();

			var target = new ve.init.sa.Target(
				$( '<div>' ),
				ve.createDocumentFromHtml( pageHtml )
			);

			target.on( 'surfaceReady', function () {
				// TODO: Target should have a way to tear itself down (should include removing
				// elements outside target.$element, such as global overlays).
				$targetContainer.promise().done( function () {
					if ( currentTarget ) {
						currentTarget.$element.remove();
					}
					$targetContainer
						.append( target.$element )
						.slideDown()
						.promise().done( function () {
							target.$document[0].focus();
							currentTarget = target;
						} );
				} );

			} );

		} ).fail( function () {
			$errorbox.text( 'Failed loading page ' + src );
		} );
	}

	// Open initial page

	if ( /^#!\/src\/.+$/.test( location.hash ) ) {
		loadPage( location.hash.slice( 7 ) );
	} else {
		loadPage( $( '.ve-demo-menu li a' ).data( 'pageSrc' ) );
	}

	$( '.ve-demo-menu' ).on( 'click', 'li a', function ( e ) {
		loadPage( $( this ).data( 'pageSrc' ) );
		e.preventDefault();
	} );

	// Events

	getRangeButton.on( 'click', function () {
		var range = ve.instances[0].view.model.getSelection();
		startTextInput.setValue( range.start );
		endTextInput.setValue( range.end );
		logRangeButton.setDisabled( false );
	} );

	logRangeButton.on( 'click', function () {
		var	start = startTextInput.getValue(),
			end = endTextInput.getValue();
		// TODO: Validate input
		console.dir( ve.instances[0].view.documentView.model.data.slice( start, end ) );
	} );

	dumpModelButton.on( 'click', function () {
		/*jshint loopfunc:true */
		// linear model dump
		var i, $li, $label, element, text, annotations, getKids,
			$ol = $( '<ol start="0"></ol>' );

		for ( i = 0; i < ve.instances[0].model.documentModel.data.getLength(); i++ ) {
			$li = $( '<li>' );
			$label = $( '<span>' );
			element = ve.instances[0].model.documentModel.data.getData( i );
			if ( element.type ) {
				$label.addClass( 've-demo-dump-element' );
				text = element.type;
				annotations = element.annotations;
			} else if ( ve.isArray( element ) ){
				$label.addClass( 've-demo-dump-achar' );
				text = element[0];
				annotations = element[1];
			} else {
				$label.addClass( 've-demo-dump-char' );
				text = element;
				annotations = undefined;
			}
			$label.html( ( text.match( /\S/ ) ? text : '&nbsp;' ) + ' ' );
			if ( annotations ) {
				$label.append(
					$( '<span>' ).text(
						'[' + ve.instances[0].model.documentModel.store.values( annotations ).map( function ( ann ) {
							return ann.name;
						} ).join( ', ' ) + ']'
					)
				);
			}

			$li.append( $label );
			$ol.append( $li );
		}
		$( '#ve-linear-model-dump' ).html( $ol );

		// tree dump
		getKids = function ( obj ) {
			var $li, i,
				$ol = $( '<ol start="0"></ol>' );
			for ( i = 0; i < obj.children.length; i++ ) {
				$li = $( '<li>' );
				$label = $( '<span>' ).addClass( 've-demo-dump-element' );
				if ( obj.children[i].length !== undefined ) {
					$li.append(
						$label
							.text( obj.children[i].type )
							.append(
								$( '<span>' ).text( ' (' + obj.children[i].length + ')' )
							)
					);
				} else {
					$li.append( $label.text( obj.children[i].type ) );
				}

				if ( obj.children[i].children ) {
					$li.append( getKids( obj.children[i] ) );
				}

				$ol.append( $li );
			}
			return $ol;
		};
		$( '#ve-model-tree-dump' ).html(
			getKids( ve.instances[0].model.documentModel.getDocumentNode() )
		);
		$( '#ve-view-tree-dump' ).html(
			getKids( ve.instances[0].view.documentView.getDocumentNode() )
		);
		$( '#ve-dump' ).show();
	} );

	validateButton.on( 'click', function () {
		var failed = false;
		$( '.ve-ce-branchNode' ).each( function ( index, element ) {
			var nodeRange, textModel, textDom,
				$element = $( element ),
				view = $element.data( 'view' );
			if ( view.canContainContent() ) {
				nodeRange = view.model.getRange();
				textModel = ve.instances[0].view.model.getDocument().getText( nodeRange );
				textDom = ve.ce.getDomText( view.$element[0] );
				if ( textModel !== textDom ) {
					failed = true;
					console.log( 'Inconsistent data', {
						'textModel': textModel,
						'textDom': textDom,
						'element': element
					} );
				}
			}
		} );
		if ( failed ) {
			alert( 'Not valid - check JS console for details' );
		} else {
			alert( 'Valid' );
		}
	} );
} );
