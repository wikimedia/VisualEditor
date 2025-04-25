/*!
 * VisualEditor standalone demo
 *
 * @copyright See AUTHORS.txt
 */

new ve.init.sa.Platform( ve.messagePaths ).getInitializedPromise().then( () => {
	/* eslint-disable no-jquery/no-global-selector */
	const $toolbar = $( '.ve-demo-targetToolbar' ),
		$editor = $( '.ve-demo-editor' ),
		/* eslint-enable no-jquery/no-global-selector */
		// eslint-disable-next-line new-cap
		target = new ve.demo.target(),
		$divider = $( '<span>' ).addClass( 've-demo-toolbar-divider' ).text( '\u00a0' ),

		device = ve.demo.target === ve.init.sa.DesktopTarget ? 'desktop' : 'mobile',
		theme = OO.ui.WikimediaUITheme && OO.ui.theme instanceof OO.ui.WikimediaUITheme ? 'wikimediaui' : 'apex',

		// Menu widgets
		addSurfaceContainerButton = new OO.ui.ButtonWidget( {
			icon: 'add',
			label: 'Add surface'
		} ),

		languageInput = new ve.ui.LanguageInputWidget( {
			dirInput: 'no-auto',
			hideCodeInput: true,
			availableLanguages: ve.availableLanguages,
			dialogManager: new OO.ui.WindowManager( { factory: ve.ui.windowFactory, classes: [ 've-demo-languageSearchDialogManager' ] } )
		} ),
		deviceSelect = new OO.ui.ButtonSelectWidget().addItems( [
			new OO.ui.ButtonOptionWidget( { data: 'desktop', label: 'Desktop' } ),
			new OO.ui.ButtonOptionWidget( { data: 'mobile', label: 'Mobile' } )
		] ),
		themeSelect = new OO.ui.ButtonSelectWidget().addItems( [
			new OO.ui.ButtonOptionWidget( { data: 'wikimediaui', label: 'WikimediaUI' } ),
			new OO.ui.ButtonOptionWidget( { data: 'apex', label: 'Apex' } )
		] ).toggle( !OO.ui.isMobile() ); // Only one theme on mobile ATM
	let hashChanging = false,
		currentLang = ve.init.platform.getUserLanguages()[ 0 ],
		currentDir = target.$element.css( 'direction' ) || 'ltr';

	// HACK: Prepend a qqx/message keys option to the list
	languageInput.dialogs.on( 'opening', ( window, opening ) => {
		opening.then( () => {
			const searchWidget = languageInput.dialogs.currentWindow.searchWidget;
			searchWidget.filteredLanguageResultWidgets.unshift(
				new ve.ui.LanguageResultWidget( {
					data: {
						code: 'qqx',
						name: 'Message keys',
						autonym: 'Message keys'
					}
				} )
			);
			searchWidget.addResults();
		} );
	} );

	function updateStylesFromDir() {
		const oldDir = currentDir === 'ltr' ? 'rtl' : 'ltr';

		$( '.stylesheet-' + currentDir ).prop( 'disabled', false );
		$( '.stylesheet-' + oldDir ).prop( 'disabled', true );

		$( document.body ).css( 'direction', currentDir )
			// The following classes are used here:
			// * ve-demo-dir-ltr
			// * ve-demo-dir-rtl
			.addClass( 've-demo-dir-' + currentDir )
			.removeClass( 've-demo-dir-' + oldDir );
	}

	// Initialization

	deviceSelect.selectItemByData( device );

	deviceSelect.on( 'select', ( item ) => {
		location.href = location.href
			.replace( device, item.getData() )
			.replace( /mobile-(apex|wikimediaui)+/, 'mobile' );
	} );

	themeSelect.selectItemByData( theme );

	themeSelect.on( 'select', ( item ) => {
		if ( item.getData() === 'apex' ) {
			location.href = location.href.replace( '.html', '-apex.html' );
		} else {
			location.href = location.href.replace( '-apex.html', '.html' );
		}
	} );

	languageInput.setLangAndDir( currentLang, currentDir );
	// Dir doesn't change on init but styles need to be set
	updateStylesFromDir();

	languageInput.on( 'change', ( lang, dir ) => {
		if ( dir === currentDir && lang !== 'qqx' && !ve.availableLanguages.includes( lang ) ) {
			return;
		}

		$.i18n().locale = currentLang = lang;
		currentDir = dir;

		updateStylesFromDir();
		target.$element.attr( 'lang', currentLang );

		// HACK: Override/restore message functions for qqx mode
		if ( lang === 'qqx' ) {
			ve.init.platform.getMessage = function ( key ) {
				return key;
			};
		} else {
			ve.init.platform.getMessage = ve.init.sa.Platform.prototype.getMessage;
		}

		// Re-bind as getMessage may have changed
		OO.ui.msg = ve.init.platform.getMessage.bind( ve.init.platform );

		// HACK: Re-initialize page to load message files
		ve.init.target.teardownToolbar();
		ve.init.platform.initialize().done( () => {
			for ( let i = 0; i < ve.demo.surfaceContainers.length; i++ ) {
				ve.demo.surfaceContainers[ i ].reload( currentLang, currentDir );
			}
		} );
	} );

	languageInput.setLangAndDir( currentLang, currentDir );

	$toolbar.append(
		$( '<div>' ).addClass( 've-demo-toolbar-commands' ).append(
			addSurfaceContainerButton.$element,
			$divider.clone(),
			languageInput.$element,
			$divider.clone(),
			deviceSelect.$element,
			themeSelect.$element
		)
	);

	$editor.append( target.$element );

	function updateHash() {
		if ( hashChanging ) {
			return false;
		}
		const pages = [];
		for ( let i = 0; i < ve.demo.surfaceContainers.length; i++ ) {
			pages.push( ve.demo.surfaceContainers[ i ].pageMenu.findSelectedItem().getData() );
		}
		history.replaceState( null, '', '#!' + pages.join( ',' ) );
	}

	function addSurfaceContainer( page ) {
		if ( !page && ve.demo.surfaceContainers.length ) {
			page = ve.demo.surfaceContainers[ ve.demo.surfaceContainers.length - 1 ].pageMenu.findSelectedItem().getData();
		}

		const surfaceContainer = new ve.demo.SurfaceContainer( target, page, currentLang, currentDir );
		surfaceContainer.on( 'changePage', updateHash );
		updateHash();
		target.$element.append( surfaceContainer.$element );
	}

	addSurfaceContainerButton.on( 'click', () => {
		addSurfaceContainer();
	} );

	function createSurfacesFromHash( hash ) {
		let pages = [];
		if ( hash.slice( 0, 2 ) === '#!' ) {
			pages = hash.slice( 2 ).split( ',' ).map( decodeURIComponent );
		}
		if ( pages.length ) {
			for ( let i = 0; i < pages.length; i++ ) {
				addSurfaceContainer( pages[ i ] );
			}
		} else {
			addSurfaceContainer( 'simple' );
		}
	}

	createSurfacesFromHash( location.hash );
	ve.init.target.once( 'surfaceReady', ve.collab.join );

	$( window ).on( 'hashchange', () => {
		if ( hashChanging ) {
			return;
		}
		hashChanging = true;
		ve.demo.surfaceContainers.slice().forEach( ( container ) => {
			container.destroy();
		} );
		createSurfacesFromHash( location.hash );
		hashChanging = false;
	} );
}, () => {
	// eslint-disable-next-line no-jquery/no-global-selector
	$( '.ve-demo-editor' ).text( 'VisualEditor not supported in this browser.' );
} );
