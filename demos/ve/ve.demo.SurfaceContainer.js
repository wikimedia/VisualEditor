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
	var pageDropdown, pageLabel, removeButton, saveButton, diffButton, $exitReadButton,
		container = this,
		$divider = $( '<span>' ).addClass( 've-demo-toolbar-divider' ).text( '\u00a0' );

	// Parent constructor
	ve.demo.SurfaceContainer.super.call( this );

	// Mixin constructors
	OO.EventEmitter.call( this );

	ve.demo.surfaceContainers.push( this );

	pageDropdown = new OO.ui.DropdownWidget( {
		menu: {
			items: this.getPageMenuItems()
		}
	} );
	pageLabel = new OO.ui.LabelWidget( {
		label: 'Page',
		input: pageDropdown
	} );
	removeButton = new OO.ui.ButtonWidget( {
		icon: 'trash',
		label: 'Remove surface'
	} );
	this.autosaveToggle = new OO.ui.ToggleButtonWidget( {
		label: 'Auto-save',
		value: !!ve.init.platform.getSession( 've-docstate' )
	} );
	saveButton = new OO.ui.ButtonWidget( {
		label: 'Save HTML'
	} );
	diffButton = new OO.ui.ButtonWidget( {
		label: 'Show changes'
	} );
	$exitReadButton = $( '<a>' ).attr( 'href', '#' ).text( 'Back to editor' ).on( 'click', function () {
		container.modeSelect.selectItemByData( 'visual' );
		return false;
	} );

	this.modeSelect = new OO.ui.ButtonSelectWidget().addItems( [
		new OO.ui.ButtonOptionWidget( { data: 'visual', label: 'Visual' } ),
		new OO.ui.ButtonOptionWidget( { data: 'source', label: 'Source' } ),
		new OO.ui.ButtonOptionWidget( { data: 'read', label: 'Read' } )
	] );
	this.modeSelect.selectItemByData( 'visual' );

	this.target = target;
	this.surface = null;
	this.page = '';
	this.lang = lang;
	this.dir = dir;
	this.$surfaceWrapper = $( '<div>' ).addClass( 've-demo-surfaceWrapper' );
	this.mode = null;
	this.pageMenu = pageDropdown.getMenu();
	this.$readView = $( '<div>' ).addClass( 've-demo-read' ).hide();

	// Events
	this.pageMenu.on( 'select', function ( item ) {
		var page = item.getData();
		container.change( 'visual', page );
		container.modeSelect.selectItemByData( 'visual' );
	} );
	this.modeSelect.on( 'select', function ( item ) {
		container.change( item.getData() );
	} );
	removeButton.on( 'click', this.destroy.bind( this ) );
	saveButton.on( 'click', this.save.bind( this ) );
	diffButton.on( 'click', function () {
		var windowAction = ve.ui.actionFactory.create( 'window', container.surface );
		windowAction.open( 'diff', {
			oldDoc: container.oldDoc,
			newDoc: container.surface.model.documentModel
		} );
	} );

	this.$element.addClass( 've-demo-surfaceContainer' ).append(
		$( '<div>' ).addClass( 've-demo-toolbar ve-demo-surfaceToolbar-edit' ).append(
			$( '<div>' ).addClass( 've-demo-toolbar-commands' ).append(
				pageLabel.$element,
				pageDropdown.$element,
				$divider.clone(),
				this.modeSelect.$element,
				$divider.clone(),
				removeButton.$element,
				$divider.clone(),
				this.autosaveToggle.$element,
				saveButton.$element,
				$divider.clone(),
				diffButton.$element
			)
		),
		$( '<div>' ).addClass( 've-demo-toolbar-commands ve-demo-surfaceToolbar-read' ).append(
			$exitReadButton
		),
		this.$surfaceWrapper,
		this.$readView
	);

	this.pageMenu.selectItem(
		this.pageMenu.findItemFromData( page ) ||
		this.pageMenu.findFirstSelectableItem()
	);
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
	for ( name in ve.demoPages ) {
		items.push(
			new OO.ui.MenuOptionWidget( {
				data: ve.demoPages[ name ],
				label: name
			} )
		);
	}
	items.push(
		new OO.ui.MenuOptionWidget( {
			data: 'localStorage/ve-demo-saved-markup',
			label: 'Saved',
			disabled: !localStorage.getItem( 've-demo-saved-markup' )
		} )
	);
	return items;
};

/**
 * Change mode or page
 *
 * @param {string} mode Mode to switch to: 'visual', 'edit or 'read'
 * @param {string} [page] Page to load
 * @return {jQuery.Promise} Promise which resolves when change is complete
 */
ve.demo.SurfaceContainer.prototype.change = function ( mode, page ) {
	var html, closePromise,
		container = this,
		currentDir = 'ltr';

	if ( mode === this.mode && !page ) {
		return $.Deferred().resolve().promise();
	}

	switch ( this.mode ) {
		case 'visual':
		case 'source':
			closePromise = this.surface.$element.slideUp().promise();
			if ( !page ) {
				html = this.surface.getHtml();
				currentDir = this.surface.getModel().getDocument().getDir();
			}
			break;

		case 'read':
			closePromise = this.$readView.slideUp().promise();
			if ( !page ) {
				html = ve.properInnerHtml( this.$readView[ 0 ] );
			}
			break;

		default:
			closePromise = $.Deferred().resolve().promise();
			break;
	}

	return closePromise.done( function () {
		var isRead = mode === 'read',
			otherDir = currentDir === 'ltr' ? 'rtl' : 'ltr',
			$editStylesheets = $( 'link[rel~=stylesheet]:not(.stylesheet-read):not(.stylesheet-' + otherDir + ')' );

		if ( container.surface ) {
			container.surface.destroy();
			container.surface = null;
		}

		$( '.ve-demo-targetToolbar' ).toggle( !isRead );
		container.$element.find( '.ve-demo-surfaceToolbar-edit' ).toggle( !isRead );
		container.$element.find( '.ve-demo-surfaceToolbar-read' ).toggle( isRead );
		$editStylesheets.prop( 'disabled', isRead );

		switch ( mode ) {
			case 'visual':
			case 'source':
				container.$surfaceWrapper.show();
				if ( page ) {
					container.loadPage( page, mode );
				} else if ( html !== undefined ) {
					container.loadHtml( html, mode );
				}
				break;

			case 'read':
				container.$surfaceWrapper.hide();
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
 * @param {string} mode Edit mode
 */
ve.demo.SurfaceContainer.prototype.loadPage = function ( src, mode ) {
	var container = this;

	this.page = src;

	container.emit( 'changePage' );

	ve.init.platform.getInitializedPromise().done( function () {
		( container.surface ? container.surface.$element.slideUp().promise() : $.Deferred().resolve().promise() ).done( function () {
			var localMatch = src.match( /^localStorage\/(.+)$/ );
			if ( localMatch ) {
				container.loadHtml( localStorage.getItem( localMatch[ 1 ] ), mode );
				return;
			}
			$.ajax( {
				url: src,
				dataType: 'text'
			} ).always( function ( result, status ) {
				var pageHtml;

				if ( status === 'error' ) {
					pageHtml = '<p><i>Failed loading page ' + $( '<span>' ).text( src ).html() + '</i></p>';
				} else {
					pageHtml = result;
				}

				container.loadHtml( pageHtml, mode );
			} );
		} );
	} );
};

/**
 * Load HTML into the editor
 *
 * @param {string} pageHtml HTML string
 * @param {string} mode Edit mode
 */
ve.demo.SurfaceContainer.prototype.loadHtml = function ( pageHtml, mode ) {
	var surfaceModel, state, page,
		restored = false,
		container = this;

	if ( this.surface ) {
		this.surface.destroy();
	}

	if ( this.autosaveToggle.getValue() ) {
		state = ve.init.platform.getSession( 've-docstate' );
		try {
			page = JSON.parse( state ).page;
		} catch ( e ) {}
		if ( page === this.page ) {
			pageHtml = ve.init.platform.getSession( 've-dochtml' );
			restored = true;
		}
	}

	this.surface = this.target.addSurface(
		ve.dm.converter.getModelFromDom(
			this.target.constructor.static.parseDocument( pageHtml, mode ),
			{ lang: this.lang, dir: this.dir }
		),
		{ placeholder: 'Start your document', mode: mode }
	);

	this.target.setSurface( this.surface );

	surfaceModel = this.surface.getModel();
	this.oldDoc = surfaceModel.getDocument().cloneFromRange();
	if ( this.autosaveToggle.getValue() ) {
		if ( restored ) {
			surfaceModel.restoreChanges();
		}
		surfaceModel.startStoringChanges();
		if ( !restored ) {
			// storeDocState can call stopStoringChanges if it fails.
			surfaceModel.storeDocState( { page: this.page }, pageHtml );
		}
	}
	this.autosaveToggle.on( 'change', function ( val ) {
		if ( val ) {
			surfaceModel.storeDocState( { page: container.page } );
			surfaceModel.startStoringChanges();
		} else {
			surfaceModel.stopStoringChanges();
			surfaceModel.removeDocStateAndChanges();
		}
	} );

	this.$surfaceWrapper.empty().append( this.surface.$element.parent() );
	this.surface.$element.hide().slideDown().promise().done( function () {
		// Check surface still exists
		if ( container.surface ) {
			container.surface.getView().emit( 'position' );
			container.surface.getView().focus();
		}
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

	this.change( 'visual' ).done( function () {
		container.loadHtml( container.surface.getHtml(), 'visual' );
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

/**
 * Save the current contents of the surface for later reloading
 */
ve.demo.SurfaceContainer.prototype.save = function () {
	var html;
	switch ( this.mode ) {
		case 'visual':
		case 'source':
			html = this.surface.getHtml();
			break;
		case 'read':
			html = ve.properInnerHtml( this.$readView[ 0 ] );
			break;
		default:
			return;
	}
	localStorage.setItem( 've-demo-saved-markup', html );
	this.pageMenu.selectItemByData( 'localStorage/ve-demo-saved-markup' );
	this.pageMenu.findSelectedItem().setDisabled( false );
};
