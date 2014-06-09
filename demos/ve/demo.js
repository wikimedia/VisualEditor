/*!
 * VisualEditor standalone demo
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

$( function () {

	var currentTarget,
		initialPage,

		debugBar,

		$targetContainer = $( '.ve-demo-editor' ).eq( 0 ),
		lang = $.i18n().locale,
		dir = $targetContainer.css( 'direction' ) || 'ltr',

		// Widgets
		convertButton = new OO.ui.ButtonWidget( { 'label': 'Log converted HTML' } ),
		languageTextInput = new OO.ui.TextInputWidget( { 'value': lang } ),
		languageDirectionButton = new OO.ui.ButtonWidget( { 'label': 'Set language & direction' } ),
		directionSelect = new OO.ui.ButtonSelectWidget().addItems( [
			new OO.ui.ButtonOptionWidget( 'rtl', { '$': this.$, 'icon': 'text-dir-rtl' } ),
			new OO.ui.ButtonOptionWidget( 'ltr', { '$': this.$, 'icon': 'text-dir-ltr' } )
		] );

	// Initialization

	convertButton.on( 'click', function () {
		var doc = ve.dm.converter.getDomFromModel( currentTarget.surface.getModel().getDocument() );
		ve.log( ve.properOuterHtml( doc.documentElement ) );
		ve.log( doc.documentElement );
	} );

	directionSelect.selectItem( directionSelect.getItemFromData( dir ) );

	if ( ve.debug ) {
		debugBar = new ve.init.DebugBar();
		debugBar.$commands.append(
			$( ve.init.DebugBar.static.dividerTemplate ),
			convertButton.$element,
			$( ve.init.DebugBar.static.dividerTemplate ),
			languageTextInput.$element,
			directionSelect.$element,
			languageDirectionButton.$element
		);
		$( '.ve-demo-debugBar' ).append( debugBar.$element );
	} else {
		$( '.ve-demo-debugBar' ).remove();
	}

	/**
	 * Load a page into the editor
	 *
	 * @private
	 * @param {string} src Path of html to load
	 * @param {boolean} [forceDir] Force directionality to its current value, otherwise guess from src
	 */
	function loadPage( src, forceDir ) {
		if ( !forceDir ) {
			dir = src.match( /rtl\.html$/ ) ? 'rtl' : 'ltr';
			directionSelect.selectItem( directionSelect.getItemFromData( dir ) );
		}
		$.ajax( {
			url: src,
			dataType: 'text'
		} ).always( function ( result, status ) {
			var target, pageHtml, $container = $( '<div>' );

			if ( status === 'error' ) {
				pageHtml = '<p><i>Failed loading page ' + $( '<span>' ).text( src ).html() + '</i></p>';
			} else {
				pageHtml = result;
			}

			$targetContainer.slideUp().promise().done( function () {
				if ( currentTarget ) {
					currentTarget.destroy();
				}

				// Container needs to be visually hidden, but not display:none
				// so that the toolbar can be measured
				$targetContainer.empty().show().css( {
					'height': 0,
					'overflow': 'hidden'
				} );

				$targetContainer.css( 'direction', dir );

				// The container must be attached to the DOM before
				// the target is initialised
				$targetContainer.append( $container );

				$targetContainer.show();
				target = new ve.init.sa.Target(
					$container,
					ve.dm.converter.getModelFromDom(
						ve.createDocumentFromHtml( pageHtml ),
						$targetContainer.ownerDocument,
						lang,
						dir
					)
				);

				target.on( 'surfaceReady', function () {
					// Container must be properly hidden before slideDown animation
					$targetContainer.removeAttr( 'style' ).hide()
						// Restore directionality
						.css( 'direction', dir );

					$targetContainer.slideDown().promise().done( function () {
						target.$document[0].focus();
						currentTarget = target;
						if ( ve.debug ) {
							debugBar.attachToSurface( currentTarget.surface );
						}
					} );
				} );
			} );

		} );
	}

	// Open initial page

	if ( /^#!\/src\/.+$/.test( location.hash ) ) {
		loadPage( location.hash.slice( 7 ) );
	} else {
		initialPage = $( '.ve-demo-menu li a' ).data( 'pageSrc' );
		if ( window.history.replaceState ) {
			window.history.replaceState( null, document.title, '#!/src/' + initialPage );
		}
		// Per W3 spec, history.replaceState does not fire hashchange
		loadPage( initialPage );
	}

	window.addEventListener( 'hashchange', function () {
		if ( /^#!\/src\/.+$/.test( location.hash ) ) {
			loadPage( location.hash.slice( 7 ) );
		}
	} );

	// Events

	languageDirectionButton.on( 'click', function () {
		$.i18n().locale = lang = languageTextInput.getValue();
		dir = directionSelect.getSelectedItem().getData();

		// HACK: Override/restore message functions for qqx mode
		if ( lang === 'qqx' ) {
			ve.init.platform.getMessage = function ( key ) { return key; };
		} else {
			ve.init.platform.getMessage = ve.init.sa.Platform.prototype.getMessage;
		}

		// Re-bind as getMessage may have changed
		OO.ui.msg = ve.bind( ve.init.platform.getMessage, ve.init.platform );

		// HACK: Re-initialize page to load message files
		ve.init.platform.initialize().done( function () {
			loadPage( location.hash.slice( 7 ), true );
		} );

	} );

} );
