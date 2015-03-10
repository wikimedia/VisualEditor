/*!
 * VisualEditor standalone demo
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

ve.demo = {
	surfaceContainers: []
};

$( function () {
	ve.init.platform.initialize().done( function () {

		var $toolbar = $( '.ve-demo-targetToolbar' ),
			$editor = $( '.ve-demo-editor' ),
			target = new ve.init.sa.Target(),

			currentLang = $.i18n().locale,
			currentDir = target.$element.css( 'direction' ) || 'ltr',

			// Menu widgets
			addSurfaceContainerButton = new OO.ui.ButtonWidget( {
				icon: 'add',
				label: 'Add surface'
			} ),

			messageKeyButton = new OO.ui.ButtonWidget( {
				icon: 'language',
				label: 'Lang keys'
			} ),
			languageInput = new ve.ui.LanguageInputWidget( {
				requireDir: true,
				availableLanguages: ve.availableLanguages,
				dialogManager: new OO.ui.WindowManager( { factory: ve.ui.windowFactory, classes: ['ve-demo-languageSearchDialogManager'] } )
			} );

		function updateStylesFromDir() {
			var oldDir = currentDir === 'ltr' ? 'rtl' : 'ltr';

			$( '.stylesheet-' + currentDir ).prop( 'disabled', false );
			$( '.stylesheet-' + oldDir ).prop( 'disabled', true );

			$( 'body' ).css( 'direction', currentDir )
				.addClass( 've-demo-dir-' + currentDir )
				.removeClass( 've-demo-dir-' + oldDir );
		}

		// Initialization

		addSurfaceContainerButton.on( 'click', function () {
			addSurfaceContainer();
		} );

		messageKeyButton.on( 'click', function () {
			languageInput.setLangAndDir( 'qqx', currentDir );
		} );

		languageInput.languageCodeField.$element.hide();

		languageInput.setLangAndDir( currentLang, currentDir );
		// Dir doesn't change on init but styles need to be set
		updateStylesFromDir();

		languageInput.on( 'change', function ( lang, dir ) {
			if ( dir === currentDir && lang !== 'qqx' && ve.availableLanguages.indexOf( lang ) === -1 ) {
				return;
			}

			$.i18n().locale = currentLang = lang;
			currentDir = dir;

			updateStylesFromDir();

			// HACK: Override/restore message functions for qqx mode
			if ( lang === 'qqx' ) {
				ve.init.platform.getMessage = function ( key ) { return key; };
			} else {
				ve.init.platform.getMessage = ve.init.sa.Platform.prototype.getMessage;
			}

			// Re-bind as getMessage may have changed
			OO.ui.msg = ve.init.platform.getMessage.bind( ve.init.platform );

			// HACK: Re-initialize page to load message files
			ve.init.platform.initialize().done( function () {
				var i;
				for ( i = 0; i < ve.demo.surfaceContainers.length; i++ ) {
					ve.demo.surfaceContainers[i].reload( currentLang, currentDir );
				}
			} );
		} );

		languageInput.setLangAndDir( currentLang, currentDir );

		$toolbar.append(
			$( '<div>' ).addClass( 've-demo-toolbar-commands' ).append(
				addSurfaceContainerButton.$element,
				$( '<span class="ve-demo-toolbar-divider">&nbsp;</span>' ),
				messageKeyButton.$element,
				languageInput.$element
			)
		);

		$editor.append( target.$element );

		function updateHash() {
			var i, pages = [];
			if ( history.replaceState ) {
				for ( i = 0; i < ve.demo.surfaceContainers.length; i++ ) {
					pages.push( ve.demo.surfaceContainers[i].pageMenu.getSelectedItem().getData() );
				}
				history.replaceState( null, document.title, '#!' + pages.join( ',' ) );
			}
		}

		function addSurfaceContainer( page ) {
			var surfaceContainer;

			if ( !page && ve.demo.surfaceContainers.length ) {
				page = ve.demo.surfaceContainers[ve.demo.surfaceContainers.length - 1].pageMenu.getSelectedItem().getData();
			}

			surfaceContainer = new ve.demo.SurfaceContainer( target, page, currentLang, currentDir );
			surfaceContainer.on( 'changePage', updateHash );
			updateHash();
			target.$element.append( surfaceContainer.$element );
		}

		function createSurfacesFromHash( hash ) {
			var i, pages = [];
			if ( /^#!pages\/.+$/.test( hash ) ) {
				pages = hash.slice( 2 ).split( ',' );
			}
			if ( pages.length ) {
				for ( i = 0; i < pages.length; i++ ) {
					addSurfaceContainer( pages[i] );
				}
			} else {
				addSurfaceContainer();
			}
		}

		createSurfacesFromHash( location.hash );

		// TODO: hashchange handler?
	} );
} );

/**
 * Demo surface container
 *
 * @class
 * @extends OO.ui.Element
 * @mixins OO.EventEmitter
 *
 * @constructor
 * @param {ve.init.Target} target Target
 * @param {string} page Page to load
 * @param {string} lang Language
 * @param {string} dir Directionality
 */
ve.demo.SurfaceContainer = function VeDemoSurfaceContainer( target, page, lang, dir ) {
	// Parent constructor
	ve.demo.SurfaceContainer.super.call( this );

	// Mixin constructors
	OO.EventEmitter.call( this );

	ve.demo.surfaceContainers.push( this );

	var container = this,
		pageDropdown = new OO.ui.DropdownWidget( {
			$: this.$,
			menu: {
				items: this.getPageMenuItems()
			}
		} ),
		pageLabel = new OO.ui.LabelWidget( {
			$: this.$,
			label: 'Page',
			input: pageDropdown
		} ),
		removeButton = new OO.ui.ButtonWidget( {
			$: this.$,
			icon: 'remove',
			label: 'Remove surface'
		} );

	this.modeSelect = new OO.ui.ButtonSelectWidget().addItems( [
		new OO.ui.ButtonOptionWidget( { data: 've', label: 'VE' } ),
		new OO.ui.ButtonOptionWidget( { data: 'edit', label: 'Edit HTML' } ),
		new OO.ui.ButtonOptionWidget( { data: 'read', label: 'Read' } )
	] );
	this.modeSelect.selectItem( this.modeSelect.getItemFromData( 've' ) );

	this.target = target;
	this.surface = null;
	this.lang = lang;
	this.dir = dir;
	this.$surfaceWrapper = this.$( '<div>' );
	this.mode = null;
	this.pageMenu = pageDropdown.getMenu();
	this.sourceTextInput = new OO.ui.TextInputWidget( {
		$: this.$,
		multiline: true,
		autosize: true,
		maxRows: 999,
		classes: ['ve-demo-source']
	} );
	this.$readView = this.$( '<div>' ).addClass( 've-demo-read' ).hide();

	// Events
	this.pageMenu.on( 'select', function ( item ) {
		var page = item.getData();
		container.change( 've', page );
		container.modeSelect.selectItem( container.modeSelect.getItemFromData( 've' ) );
	} );
	this.modeSelect.on( 'select', function ( item ) {
		container.change( item.getData() );
	} );
	removeButton.on( 'click', this.destroy.bind( this ) );

	this.$element.append(
		this.$( '<div>' ).addClass( 've-demo-toolbar ve-demo-surfaceToolbar' ).append(
			this.$( '<div>' ).addClass( 've-demo-toolbar-commands' ).append(
				pageLabel.$element,
				pageDropdown.$element,
				this.$( '<span class="ve-demo-toolbar-divider">&nbsp;</span>' ),
				this.modeSelect.$element,
				this.$( '<span class="ve-demo-toolbar-divider">&nbsp;</span>' ),
				removeButton.$element
			)
		),
		this.$surfaceWrapper,
		this.sourceTextInput.$element.hide(),
		this.$readView
	);

	this.pageMenu.selectItem( this.pageMenu.getItemFromData(
		page || this.pageMenu.getFirstSelectableItem().getData()
	) );
};

/* Inheritance */

OO.inheritClass( ve.demo.SurfaceContainer, OO.ui.Element );

OO.mixinClass( ve.demo.SurfaceContainer, OO.EventEmitter );

/* Methods */

/**
 * Get menu items for the page menu
 *
 * @return {OO.ui.MenuOptionWidget[]} Menu items
 */
ve.demo.SurfaceContainer.prototype.getPageMenuItems = function () {
	var name, items = [];
	for ( name in ve.demo.pages ) {
		items.push(
			new OO.ui.MenuOptionWidget( {
				$: this.$,
				data: ve.demo.pages[name],
				label: name
			} )
		);
	}
	return items;
};

/**
 * Change mode or page
 *
 * @param {string} mode Mode to switch to: 've', 'edit or 'read'
 * @param {string} [page] Page to load
 * @return {jQuery.Promise} Promise which resolves when change is complete
 */
ve.demo.SurfaceContainer.prototype.change = function ( mode, page ) {
	var model, doc, html, closePromise,
		container = this,
		currentDir = 'ltr';

	if ( mode === this.mode && !page ) {
		return $.Deferred().resolve().promise();
	}

	this.modeSelect.selectItem( this.modeSelect.getItemFromData( mode ) );

	switch ( this.mode ) {
		case 've':
			closePromise = this.$surfaceWrapper.slideUp().promise();
			if ( !page ) {
				model = this.surface.getModel().getDocument() ;
				doc = ve.dm.converter.getDomFromModel( model );
				html = ve.properInnerHtml( doc.body );
				currentDir = model.getDir();
			}
			this.surface.destroy();
			this.surface = null;
			break;

		case 'edit':
			closePromise = this.sourceTextInput.$element.slideUp().promise();
			if ( !page ) {
				html = this.sourceTextInput.getValue();
			}
			break;

		case 'read':
			closePromise = this.$readView.slideUp().promise();
			if ( !page ) {
				html = ve.properInnerHtml( this.$readView[0] );
			}
			break;

		default:
			closePromise = $.Deferred().resolve().promise();
			break;
	}

	return closePromise.done( function () {
		$( '.stylesheet-ve' ).prop( 'disabled', mode !== 've' );
		switch ( mode ) {
			case 've':
				if ( page ) {
					container.loadPage( page );
				} else if ( html !== undefined ) {
					container.loadHtml( html );
				}
				break;

			case 'edit':
				container.sourceTextInput.$element.show();
				container.sourceTextInput.setValue( html ).adjustSize();
				container.sourceTextInput.$element.hide().slideDown();
				break;

			case 'read':
				container.$readView.html( html ).css( 'direction', currentDir ).slideDown();
				break;
		}
		container.mode = mode;
	} );
};

/**
 * Load a page into the editor
 *
 * @param {string} src Path of html to load
 */
ve.demo.SurfaceContainer.prototype.loadPage = function ( src ) {
	var container = this;

	container.emit( 'changePage' );

	ve.init.platform.getInitializedPromise().done( function () {
		container.$surfaceWrapper.slideUp().promise().done( function () {
			$.ajax( {
				url: src,
				dataType: 'text'
			} ).always( function ( result, status ) {
				var pageHtml;

				if ( status === 'error' ) {
					pageHtml = '<p><i>Failed loading page ' + this.$( '<span>' ).text( src ).html() + '</i></p>';
				} else {
					pageHtml = result;
				}

				container.loadHtml( pageHtml );
			} );
		} );
	} );
};

/**
 * Load HTML into the editor
 *
 * @param {string} pageHtml HTML string
 */
ve.demo.SurfaceContainer.prototype.loadHtml = function ( pageHtml ) {
	var container = this;

	if ( this.surface ) {
		this.surface.destroy();
	}

	this.surface = this.target.addSurface(
		ve.dm.converter.getModelFromDom(
			ve.createDocumentFromHtml( pageHtml ),
			null,
			this.lang,
			this.dir
		)
	);

	this.target.setSurface( this.surface );

	this.$surfaceWrapper.empty().append( this.surface.$element.parent() )
		.hide().slideDown().promise().done( function () {
			container.surface.getView().focus();
		} );
};

/**
 * Reload the container
 *
 * @param {string} lang Language
 * @param {string} dir Directionality
 */
ve.demo.SurfaceContainer.prototype.reload = function ( lang, dir ) {
	var container = this;

	this.lang = lang;
	this.dir = dir;

	this.change( 've' ).done( function () {
		container.loadHtml( ve.properInnerHtml(
			ve.dm.converter.getDomFromModel(
				container.surface.getModel().getDocument()
			).body
		) );
	} );
};

/**
 * Destroy the container
 */
ve.demo.SurfaceContainer.prototype.destroy = function () {
	var container = this;
	this.$element.slideUp().promise().done( function () {
		if ( container.surface ) {
			container.surface.destroy();
		}
		container.$element.remove();
	} );
	ve.demo.surfaceContainers.splice( ve.demo.surfaceContainers.indexOf( container ), 1 );
	this.emit( 'changePage' );
};
