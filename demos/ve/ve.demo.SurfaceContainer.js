/**
 * Demo surface container
 *
 * @class
 * @extends OO.ui.Element
 * @mixes OO.EventEmitter
 *
 * @constructor
 * @param {ve.init.Target} target
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

	const pageDropdown = new OO.ui.DropdownWidget( {
		menu: {
			items: this.getPageMenuItems()
		}
	} );
	const pageLabel = new OO.ui.LabelWidget( {
		label: 'Page',
		input: pageDropdown
	} );
	const removeButton = new OO.ui.ButtonWidget( {
		icon: 'trash',
		label: 'Remove surface'
	} );
	this.autosaveToggle = new OO.ui.ToggleButtonWidget( {
		label: 'Auto-save',
		value: !!ve.init.platform.sessionStorage.getObject( 've-docstate' )
	} );
	const saveButton = new OO.ui.ButtonWidget( {
		label: 'Save HTML'
	} );
	const diffButton = new OO.ui.ButtonWidget( {
		label: 'Show changes'
	} );
	this.readOnlyToggle = new OO.ui.ToggleButtonWidget( {
		label: 'Read-only'
	} );
	this.nullSelectionOnBlurToggle = new OO.ui.ToggleButtonWidget( {
		label: 'Null selection on blur',
		value: true
	} );
	const $exitReadButton = $( '<a>' ).attr( 'href', '#' ).text( 'Back to editor' ).on( 'click', () => {
		this.modeSelect.selectItemByData( 'visual' );
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
	this.surfaceWrapper = new OO.ui.PanelLayout( {
		classes: [ 've-demo-surfaceWrapper' ],
		expanded: false,
		framed: true
	} );
	this.mode = null;
	this.pageMenu = pageDropdown.getMenu();
	this.readView = new OO.ui.PanelLayout( {
		classes: [ 've-demo-read' ],
		expanded: false,
		framed: true
	} );

	// Events
	this.pageMenu.on( 'select', ( item ) => {
		this.change( 'visual', item.getData() );
		this.modeSelect.selectItemByData( 'visual' );
	} );
	this.modeSelect.on( 'select', ( item ) => {
		this.change( item.getData() );
	} );
	removeButton.on( 'click', this.destroy.bind( this ) );
	saveButton.on( 'click', this.save.bind( this ) );
	diffButton.on( 'click', () => {
		const windowAction = ve.ui.actionFactory.create( 'window', this.surface );
		windowAction.open( 'diff', {
			oldDoc: this.oldDoc,
			newDoc: this.surface.model.documentModel
		} );
	} );
	this.readOnlyToggle.on( 'change', ( val ) => {
		this.surface.setReadOnly( val );
	} );
	this.nullSelectionOnBlurToggle.on( 'change', ( val ) => {
		this.surface.nullSelectionOnBlur = val;
	} );

	const $divider = $( '<span>' ).addClass( 've-demo-toolbar-divider' ).text( '\u00a0' );
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
				diffButton.$element,
				$divider.clone(),
				this.readOnlyToggle.$element,
				$divider.clone(),
				this.nullSelectionOnBlurToggle.$element
			)
		),
		$( '<div>' ).addClass( 've-demo-toolbar-commands ve-demo-surfaceToolbar-read' ).append(
			$exitReadButton
		),
		this.surfaceWrapper.$element,
		this.readView.$element.css( 'display', 'none' )
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
	const items = ve.demoPages.map( ( name ) => new OO.ui.MenuOptionWidget( {
		data: name,
		label: name
	} ) );
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
	if ( mode === this.mode && !page ) {
		return ve.createDeferred().resolve().promise();
	}

	let currentDir = 'ltr';

	let closePromise, html;
	switch ( this.mode ) {
		case 'visual':
		case 'source':
			// eslint-disable-next-line no-jquery/no-slide
			closePromise = this.surface.$element.slideUp().promise();
			if ( !page ) {
				html = this.surface.getHtml();
				currentDir = this.surface.getModel().getDocument().getDir();
			}
			break;

		case 'read':
			// eslint-disable-next-line no-jquery/no-slide
			closePromise = this.readView.$element.slideUp().promise();
			if ( !page ) {
				html = ve.properInnerHtml( this.readView.$element[ 0 ] );
			}
			break;

		default:
			closePromise = ve.createDeferred().resolve().promise();
			break;
	}

	return closePromise.done( () => {
		const isRead = mode === 'read',
			otherDir = currentDir === 'ltr' ? 'rtl' : 'ltr',
			$editStylesheets = $( 'link[rel~=stylesheet]:not(.stylesheet-read):not(.stylesheet-' + otherDir + ')' );

		if ( this.surface ) {
			this.surface.destroy();
			this.surface = null;
		}

		// eslint-disable-next-line no-jquery/no-global-selector
		$( '.ve-demo-targetToolbar' ).toggleClass( 'oo-ui-element-hidden', isRead );
		this.$element.find( '.ve-demo-surfaceToolbar-edit' ).toggleClass( 'oo-ui-element-hidden', isRead );
		this.$element.find( '.ve-demo-surfaceToolbar-read' ).toggleClass( 'oo-ui-element-hidden', !isRead );
		$editStylesheets.prop( 'disabled', isRead );

		switch ( mode ) {
			case 'visual':
			case 'source':
				this.surfaceWrapper.toggle( true );
				if ( page ) {
					this.loadPage( page, mode );
				} else if ( html !== undefined ) {
					this.loadHtml( html, mode );
				}
				break;

			case 'read':
				this.surfaceWrapper.toggle( false );
				// eslint-disable-next-line no-jquery/no-slide
				this.readView.$element.html( html ).css( 'direction', currentDir ).slideDown();
				break;
		}
		this.mode = mode;
	} );
};

/**
 * Load a page into the editor
 *
 * @param {string} page Page to load
 * @param {string} mode Edit mode
 */
ve.demo.SurfaceContainer.prototype.loadPage = function ( page, mode ) {
	this.page = page;

	this.emit( 'changePage' );

	ve.init.platform.getInitializedPromise().done( () => {
		// eslint-disable-next-line no-jquery/no-slide
		( this.surface ? this.surface.$element.slideUp().promise() : ve.createDeferred().resolve().promise() ).done( () => {
			const localMatch = page.match( /^localStorage\/(.+)$/ );
			if ( localMatch ) {
				this.loadHtml( localStorage.getItem( localMatch[ 1 ] ), mode );
				return;
			}
			$.ajax( {
				url: 'pages/' + page + '.html',
				dataType: 'text'
			} ).always( ( result, status ) => {
				let pageHtml;

				if ( status === 'error' ) {
					pageHtml = '<p><i>Failed loading page ' + $( '<span>' ).text( page ).html() + '</i></p>';
				} else {
					pageHtml = result;
				}

				this.loadHtml( pageHtml, mode );
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
	let restored = false;

	if ( this.surface ) {
		this.surface.destroy();
	}

	if ( this.autosaveToggle.getValue() ) {
		const state = ve.init.platform.sessionStorage.getObject( 've-docstate' );

		if ( state && state.page === this.page ) {
			pageHtml = ve.init.platform.sessionStorage.get( 've-dochtml' );
			restored = true;
		}
	}

	this.surface = this.target.addSurface(
		this.target.constructor.static.createModelFromDom(
			this.target.constructor.static.parseDocument( pageHtml, mode ),
			mode,
			{ lang: this.lang, dir: this.dir }
		),
		{ placeholder: 'Start your document', mode: mode }
	);

	this.target.setSurface( this.surface );

	this.surface.setReadOnly( this.readOnlyToggle.getValue() );
	this.surface.nullSelectionOnBlur = this.nullSelectionOnBlurToggle.getValue();

	const surfaceModel = this.surface.getModel();
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
	this.autosaveToggle.on( 'change', ( val ) => {
		if ( val ) {
			surfaceModel.storeDocState( { page: this.page } );
			surfaceModel.startStoringChanges();
		} else {
			surfaceModel.stopStoringChanges();
			surfaceModel.removeDocStateAndChanges();
		}
	} );

	this.surfaceWrapper.$element.empty().append( this.surface.$element.parent() );
	// eslint-disable-next-line no-jquery/no-slide
	this.surface.$element.css( 'display', 'none' ).slideDown().promise().done( () => {
		// Check surface still exists
		if ( this.surface ) {
			this.surface.getView().emit( 'position' );
			this.surface.getView().focus();
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
	this.lang = lang;
	this.dir = dir;

	this.change( 'visual' ).done( () => {
		this.loadHtml( this.surface.getHtml(), 'visual' );
	} );
};

/**
 * Destroy the container
 */
ve.demo.SurfaceContainer.prototype.destroy = function () {
	// eslint-disable-next-line no-jquery/no-slide
	this.$element.slideUp().promise().done( () => {
		if ( this.surface ) {
			this.surface.destroy();
		}
		this.$element.remove();
	} );
	ve.demo.surfaceContainers.splice( ve.demo.surfaceContainers.indexOf( this ), 1 );
	this.emit( 'changePage' );
};

/**
 * Save the current contents of the surface for later reloading
 */
ve.demo.SurfaceContainer.prototype.save = function () {
	let html;
	switch ( this.mode ) {
		case 'visual':
		case 'source':
			html = this.surface.getHtml();
			break;
		case 'read':
			html = ve.properInnerHtml( this.readView.$element[ 0 ] );
			break;
		default:
			return;
	}
	localStorage.setItem( 've-demo-saved-markup', html );
	this.pageMenu.selectItemByData( 'localStorage/ve-demo-saved-markup' );
	this.pageMenu.findSelectedItem().setDisabled( false );
};
