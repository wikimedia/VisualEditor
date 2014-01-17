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
		initialPage,

		// Widgets
		startTextInput = new OO.ui.TextInputWidget( { 'readOnly': true } ),
		endTextInput = new OO.ui.TextInputWidget( { 'readOnly': true } ),
		startTextInputLabel = new OO.ui.InputLabelWidget(
			{ 'label': 'Range', 'input': startTextInput }
		),
		endTextInputLabel = new OO.ui.InputLabelWidget(
			{ 'label': '-', 'input': endTextInput }
		),
		getRangeButton = new OO.ui.ButtonWidget( { 'label': 'Get range' } ),
		getRangeChangeToggle = new OO.ui.ToggleButtonWidget( { 'label': 'Get range on change' } ),
		logRangeButton = new OO.ui.ButtonWidget(
			{ 'label': 'Log to console', 'disabled': true }
		),
		dumpModelButton = new OO.ui.ButtonWidget( { 'label': 'Dump model' } ),
		dumpModelChangeToggle = new OO.ui.ToggleButtonWidget( { 'label': 'Dump model on change' } ),
		validateButton = new OO.ui.ButtonWidget( { 'label': 'Validate view and model' } );

	// Initialization

	$( '.ve-demo-utilities-commands' ).append(
		getRangeButton.$element,
		getRangeChangeToggle.$element,
		startTextInputLabel.$element,
		startTextInput.$element,
		endTextInputLabel.$element,
		endTextInput.$element,
		logRangeButton.$element,
		$( '<span class="ve-demo-utilities-commands-divider">&nbsp;</span>' ),
		dumpModelButton.$element,
		dumpModelChangeToggle.$element,
		validateButton.$element
	);

	function loadPage( src ) {
		$errorbox.empty();
		$.ajax( {
			url: src,
			dataType: 'text'
		} ).done( function ( pageHtml ) {
			$targetContainer.slideUp();

			var target = new ve.init.sa.Target(
				$( '<div>' ),
				ve.createDocumentFromHtml( pageHtml )
			);

			target.on( 'surfaceReady', function () {
				$targetContainer.promise().done( function () {
					if ( currentTarget ) {
						currentTarget.destroy();
					}
					$targetContainer
						.append( target.$element )
						.slideDown()
						.promise().done( function () {
							target.$document[0].focus();
							currentTarget = target;
							getRangeChangeToggle.emit( 'click' );
							dumpModelChangeToggle.emit( 'click' );
						} );
				} );

			} );

		} ).fail( function () {
			$errorbox.text( 'Failed loading page ' + src );
		} );
	}

	function dumpModel() {
		/*jshint loopfunc:true */
		// linear model dump
		var i, $li, $label, element, text, annotations, getKids,
			$ol = $( '<ol start="0"></ol>' );

		for ( i = 0; i < currentTarget.surface.model.documentModel.data.getLength(); i++ ) {
			$li = $( '<li>' );
			$label = $( '<span>' );
			element = currentTarget.surface.model.documentModel.data.getData( i );
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
						'[' + currentTarget.surface.model.documentModel.store.values( annotations ).map( function ( ann ) {
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
			getKids( currentTarget.surface.model.documentModel.getDocumentNode() )
		);
		$( '#ve-view-tree-dump' ).html(
			getKids( currentTarget.surface.view.documentView.getDocumentNode() )
		);
		$( '#ve-dump' ).show();
	}

	function getRange() {
		var range = currentTarget.surface.view.model.getSelection();
		startTextInput.setValue( range.start );
		endTextInput.setValue( range.end );
		logRangeButton.setDisabled( false );
	}

	// Open initial page

	if ( /^#!\/src\/.+$/.test( location.hash ) ) {
		loadPage( location.hash.slice( 7 ) );
	} else {
		initialPage = $( '.ve-demo-menu li a' ).data( 'pageSrc' );
		window.history.replaceState( null, document.title, '#!/src/' + initialPage );
		// Per W3 spec, history.replaceState does not fire hashchange
		loadPage( initialPage );
	}

	window.addEventListener( 'hashchange', function () {
		if ( /^#!\/src\/.+$/.test( location.hash ) ) {
			loadPage( location.hash.slice( 7 ) );
		}
	} );

	// Events

	getRangeButton.on( 'click', getRange );
	getRangeChangeToggle.on( 'click', function () {
		if ( getRangeChangeToggle.getValue() ) {
			getRange();
			currentTarget.surface.model.on( 'select', getRange );
		} else {
			currentTarget.surface.model.off( 'select', getRange );
		}
	} );

	logRangeButton.on( 'click', function () {
		var start = startTextInput.getValue(),
			end = endTextInput.getValue();
		// TODO: Validate input
		console.dir( currentTarget.surface.view.documentView.model.data.slice( start, end ) );
	} );

	dumpModelButton.on( 'click', dumpModel );
	dumpModelChangeToggle.on( 'click', function () {
		if ( dumpModelChangeToggle.getValue() ) {
			dumpModel();
			currentTarget.surface.model.on( 'documentUpdate', dumpModel );
		} else {
			currentTarget.surface.model.off( 'documentUpdate', dumpModel );
		}
	} );

	validateButton.on( 'click', function () {
		var failed = false;
		$( '.ve-ce-branchNode' ).each( function ( index, element ) {
			var nodeRange, textModel, textDom,
				$element = $( element ),
				view = $element.data( 'view' );
			if ( view.canContainContent() ) {
				nodeRange = view.model.getRange();
				textModel = currentTarget.surface.view.model.getDocument().getText( nodeRange );
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
