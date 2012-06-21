/**
 * Edit page target.
 *
 * @class
 * @constructor
 * @extends {ve.init.Target}
 * @param {String} title Page title of target
 */
ve.init.ViewPageTarget = function() {
	// Inheritance
	ve.init.Target.call( this, mw.config.get( 'wgRelevantPageName' ) );

	// Properties
	this.$surface = $( '<div class="ve-surface"></div>' );
	this.$document = null;
	this.$spinner = $( '<div class="ve-init-viewPageTarget-loadingSpinner"></div>' );
	this.$toolbarSaveButton = $( '<div class="ve-init-viewPageTarget-toolbar-saveButton"></div>' );
	this.$saveDialog = $( '<div class="es-inspector ve-init-viewPageTarget-saveDialog"></div>' );
	this.$saveDialogSaveButton = null;
	this.surface = null;
	this.active = false;
	this.edited = false;
	this.activating = false;
	this.deactivating = false;
	this.scrollTop = null;
	this.proxiedOnSurfaceModelTransact = ve.proxy( this.onSurfaceModelTransact, this );
	this.surfaceOptions = { 'toolbars': { 'top': { 'float': !this.isMobileDevice } } };
	this.currentUri = new mw.Uri( window.location.toString() );
	this.section = this.currentUri.query.vesection || null;
	this.namespaceName = mw.config.get( 'wgCanonicalNamespace' );
	this.viewUri = new mw.Uri( mw.util.wikiGetlink( this.pageName ) );
	this.editUri = new mw.Uri( this.viewUri.toString() );
	this.editUri.extend( { 'action': 'edit' } );
	this.veEditUri = new mw.Uri( this.viewUri.toString() );
	this.veEditUri.extend( { 'veaction': 'edit' } );
	this.isViewPage = (
		this.namespaceName === 'VisualEditor' &&
		mw.config.get( 'wgAction' ) === 'view' &&
		this.currentUri.query.diff === undefined
	);
	this.canBeActivated = (
		this.namespaceName === 'VisualEditor' ||
		this.pageName.substr( 0, 13 ) === 'VisualEditor:'
	);

	// Events
	this.addListenerMethods( this, {
		'load': 'onLoad',
		'save': 'onSave',
		'loadError': 'onLoadError',
		'saveError': 'onSaveError'
	} );

	// Initialization
	if ( this.canBeActivated ) {
		this.setupSkinTabs();
		this.setupSectionEditLinks();
		if ( this.isViewPage ) {
			this.setupToolbarSaveButton();
			this.setupSaveDialog();
			if ( this.currentUri.query.veaction === 'edit' ) {
				this.activate();
			}
		}
	}
};

/* Static Members */

/*jshint multistr: true*/
ve.init.ViewPageTarget.saveDialogTemplate = '\
	<div class="es-inspector-title ve-init-viewPageTarget-saveDialog-title"></div>\
	<div class="es-inspector-button ve-init-viewPageTarget-saveDialog-closeButton"></div>\
	<div class="ve-init-viewPageTarget-saveDialog-body">\
		<div class="ve-init-viewPageTarget-saveDialog-editSummary-label"></div>\
		<input name="editSummary" id="ve-init-viewPageTarget-saveDialog-editSummary" type="text">\
		<div class="clear:both"></div>\
		<div class="ve-init-viewPageTarget-saveDialog-options">\
			<input type="checkbox" name="minorEdit" \
				id="ve-init-viewPageTarget-saveDialog-minorEdit">\
			<label class="ve-init-viewPageTarget-saveDialog-minorEdit-label" \
				for="ve-init-viewPageTarget-saveDialog-minorEdit"></label>\
			<div style="clear:both"></div>\
			<input type="checkbox" name="watchList" \
				id="ve-init-viewPageTarget-saveDialog-watchList">\
			<label class="ve-init-viewPageTarget-saveDialog-watchList-label" \
				for="ve-init-viewPageTarget-saveDialog-watchList"></label>\
		</div>\
		<div class="ve-init-viewPageTarget-saveDialog-saveButton">\
			<span class="ve-init-viewPageTarget-saveDialog-saveButton-label"></span>\
			<div class="ve-init-viewPageTarget-saveDialog-saveButton-icon"></div>\
		</div>\
		<div style="clear:both"></div>\
	</div>\
	<div class="ve-init-viewPageTarget-saveDialog-foot">\
		<p class="ve-init-viewPageTarget-saveDialog-license"></p>\
	</div>';

/* Methods */

/**
 * Switches to edit mode.
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.activate = function() {
	if ( !this.active && !this.activating ) {
		this.activating = true;
		// User interface changes
		this.transformSkinTabs();
		this.showSpinner();
		this.hideTableOfContents();
		this.mutePageContent();
		this.mutePageTitle();
		this.saveScrollPosition();
		this.load();
	}
};

/**
 * Switches to view mode.
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.deactivate = function( override ) {
	if ( this.active && !this.deactivating ) {
		if (
			override ||
			!this.surface.getModel().getHistory().length ||
			confirm( ve.msg( 'visualeditor-viewpage-savewarning' ) )
		) {
			this.deactivating = true;
			// User interface changes
			this.restoreSkinTabs();
			this.hideSpinner();
			this.detachToolbarSaveButton();
			this.detachSaveDialog();
			this.tearDownSurface();
			this.showTableOfContents();
			this.deactivating = false;
		}
	}
};

/**
 * Handles successful DOM load event.
 *
 * @method
 * @param {HTMLElement} dom Parsed DOM from server
 */
ve.init.ViewPageTarget.prototype.onLoad = function( dom ) {
	this.edited = false;
	this.setUpSurface( dom );
	this.attachToolbarSaveButton();
	this.attachSaveDialog();
	this.restoreScrollPosition();
	this.restoreEditSection();
	this.$document.focus();
	this.activating = false;
};

/**
 * Handles failed DOM load event.
 *
 * @method
 * @param {Object} data HTTP Response object
 * @param {String} status Text status message
 * @param {Mixed} error Thrown exception or HTTP error string
 */
ve.init.ViewPageTarget.prototype.onLoadError = function( response, status, error ) {
	if ( confirm( ve.msg( 'visualeditor-loadwarning', status ) ) ) {
		this.load();
	} else {
		this.activating = false;
		this.restoreSkinTabs();
		this.hideSpinner();
		this.showTableOfContents();
		this.showPageContent();
		this.restorePageTitle();
	}
};

/**
 * Handles successful DOM save event.
 *
 * @method
 * @param {HTMLElement} html Rendered HTML from server
 */
ve.init.ViewPageTarget.prototype.onSave = function( html ) {
	if ( Number( mw.config.get( 'wgArticleId', 0 ) ) === 0 ) {
		// This is a page creation, refresh the page
		window.location.href = this.viewUri;
	} else {
		// Update watch link to match 'watch checkbox' in save dialog.
		// User logged in if module loaded.
		if ( mw.page.hasOwnProperty( 'watch' ) ) {
			var watchPage = this.$saveDialog
				.find( '#ve-init-viewPageTarget-saveDialog-watchList')
				.prop( 'checked' );
			mw.page.watch.updateWatchLink(
				$('#ca-watch a, #ca-unwatch a'),
				watchPage === true ? 'unwatch': 'watch'
			);
		}
		this.hideSaveDialog();
		this.resetSaveDialog();
		this.replacePageContent( html );
		this.deactivate( true );
	}
};

/**
 * Handles failed DOM save event.
 *
 * @method
 * @param {Object} data HTTP Response object
 * @param {String} status Text status message
 * @param {Mixed} error Thrown exception or HTTP error string
 */
ve.init.ViewPageTarget.prototype.onSaveError = function( response, status, error ) {
	alert( ve.msg( 'visualeditor-saveerror', status ) );
};

/**
 * Handles clicks on the edit tab.
 *
 * @method
 * @param {Event} e DOM event
 */
ve.init.ViewPageTarget.prototype.onEditTabClick = function( event ) {
	this.activate();
	// Prevent the edit tab's normal behavior
	event.preventDefault();
	return false;
};

/**
 * Handles clicks on a section edit link.
 *
 * @method
 * @param {Event} event DOM event
 */
ve.init.ViewPageTarget.prototype.onEditSectionLinkClick = function( event ) {
	this.saveEditSection( $( event.target ).closest( 'h1, h2, h3, h4, h5, h6' )[0] );
	this.activate();
	// Prevent the edit tab's normal behavior
	event.preventDefault();
	return false;
};

/**
 * Handles clicks on the view tab.
 *
 * @method
 * @param {Event} event DOM event
 */
ve.init.ViewPageTarget.prototype.onViewTabClick = function( event ) {
	if ( this.active ) {
		this.deactivate();
		// Prevent the edit tab's normal behavior
		event.preventDefault();
		return false;
	}
};

/**
 * Handles clicks on the save button in the toolbar.
 *
 * @method
 * @param {Event} event DOM event
 */
ve.init.ViewPageTarget.prototype.onToolbarSaveButtonClick = function( event ) {
	if ( this.edited ) {
		this.showSaveDialog();
	}
};

/**
 * Handles the first transaction in the surface model.
 *
 * This handler is removed the first time it's used, but added each time the surface is setup.
 *
 * @method
 * @param {ve.Transaction} tx Processed transaction
 */
ve.init.ViewPageTarget.prototype.onSurfaceModelTransact = function( tx ) {
	this.edited = true;
	this.enableToolbarSaveButton();
	this.surface.getModel().removeListener( 'transact', this.proxiedOnSurfaceModelTransact );
};

/**
 * Handles clicks on the save button in the save dialog.
 *
 * @method
 * @param {Event} event DOM event
 */
ve.init.ViewPageTarget.prototype.onSaveDialogSaveButtonClick = function( event ) {
	this.lockSaveDialogSaveButton();
	this.save(
		ve.dm.converter.getDomFromData( this.surface.getDocumentModel().getData() ),
		{
			'summary': $( '#ve-init-viewPageTarget-saveDialog-editSummary' ).val(),
			'minor': $( '#ve-init-viewPageTarget-saveDialog-minorEdit' ).prop( 'checked' ),
			'watch': $( '#ve-init-viewPageTarget-saveDialog-watchList' ).prop( 'checked' )
		},
		ve.proxy( this.onSave, this )
	);
};

/**
 * Handles clicks on the close button in the save dialog.
 *
 * @method
 * @param {Event} event DOM event
 */
ve.init.ViewPageTarget.prototype.onSaveDialogCloseButtonClick = function( event ) {
	this.hideSaveDialog();
};

/**
 * Switches to editing mode.
 *
 * @method
 * @param {HTMLElement} dom HTML DOM to edit
 */
ve.init.ViewPageTarget.prototype.setUpSurface = function( dom ) {
	// Initialize surface
	this.attachSurface();
	this.surface = new ve.Surface( this.$surface, dom, this.surfaceOptions );
	this.$document = this.$surface.find( '.ve-ce-documentNode' );
	this.surface.getModel().on( 'transact', this.proxiedOnSurfaceModelTransact );
	// Transplant the toolbar
	this.attachToolbar();
	this.transformPageTitle();
	// Update UI
	this.hidePageContent();
	this.hideSpinner();
	this.disableToolbarSaveButton();
	this.active = true;
};

/**
 * Switches to viewing mode.
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.tearDownSurface = function() {
	// Reset tabs
	this.restoreSkinTabs();
	// Update UI
	this.$document.blur();
	this.$document = null;
	this.$surface.empty().detach();
	$( '.es-contextView' ).remove();
	this.detachToolbar();
	this.hideSpinner();
	this.showPageContent();
	this.restorePageTitle();
	this.showTableOfContents();
	// Remove handler if it's still active
	this.surface.getModel().removeListener( 'transact', this.proxiedOnSurfaceModelTransact );
	// Destroy editor
	this.surface = null;
	this.active = false;
};

/**
 * Modifies tabs in the skin to support in-place editing.
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.setupSkinTabs = function() {
	// Only sysop users will have an edit tab in this namespace, so we might need to add one
	if ( $( '#ca-edit' ).length === 0 ) {
		// Add edit tab
		var action = Number( mw.config.get( 'wgArticleId', 0 ) ) === 0 ?
			'create' : 'edit';
		mw.util.addPortletLink(
			'p-views',
			'#',
			ve.msg( action ), // 'edit' or 'create'
			'ca-edit',
			ve.msg( 'tooltip-ca-edit' ),
			ve.msg( 'accesskey-ca-edit' ),
			'#ca-history'
		);
		// If there isn't an edit tab, there's a view source tab we need to replace with edit source
		var $viewSource = $( '#ca-viewsource' );
		if ( $viewSource.length > 0 ) {
			// "Move" the view source link to p-actions
			mw.util.addPortletLink(
				'p-cactions',
				$viewSource.find( 'a' ).attr( 'href' ),
				$viewSource.find( 'a' ).text(),
				$viewSource.attr( 'id' )
			);
			// Remove the view original source link
			$viewSource.remove();
		}
	} else {
		// Sysop users will need a new edit source tab since we are highjacking the edit tab
		mw.util.addPortletLink(
			'p-cactions',
			this.editUri,
			ve.msg( 'visualeditor-ca-editsource' ),
			'ca-editsource'
		);
	}
	if ( this.isViewPage ) {
		// Allow instant-editing
		$( '#ca-edit a' ).click( ve.proxy( this.onEditTabClick, this ) );
		$( '#ca-view a, #ca-nstab-visualeditor a' ).click( ve.proxy( this.onViewTabClick, this ) );
	} else {
		// Route edits through the view page
		$( '#ca-edit a' ).attr( 'href', this.veEditUri );
	}
	// Source editing shouldn't highlight the edit tab
	if ( mw.config.get( 'wgAction' ) === 'edit' ) {
		$( '#p-views' ).find( 'li.selected' ).removeClass( 'selected' );
	}
	// Fix the URL if there was a veaction param in it
	if ( this.currentUri.query.veaction === 'edit' && window.history.replaceState ) {
		var title = $( 'head title' ).text();
		window.history.replaceState( null, title, this.viewUri );
	}
};

/**
 * Modifies page content to make section edit links activate the editor.
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.setupSectionEditLinks = function() {
	var $links = $( '#mw-content-text .editsection a' );
	if ( this.isViewPage ) {
		$links.click( ve.proxy( this.onEditSectionLinkClick, this ) );
	} else {
		var veEditUri = this.veEditUri;
		$links.each( function() {
			var veSectionEditUri = new mw.Uri( veEditUri.toString() ),
				sectionEditUri = new mw.Uri( $(this).attr( 'href' ) );
			veSectionEditUri.extend( { 'vesection': sectionEditUri.query.section } );
			$(this).attr( 'href', veSectionEditUri );
		} );
	}
};

/**
 * Adds content and event bindings to the save button.
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.setupToolbarSaveButton = function() {
	this.$toolbarSaveButton
		.append(
			$( '<span class="ve-init-viewPageTarget-toolbar-saveButton-label"></span>' )
				.text( ve.msg( 'savearticle' ) )
		)
		.append( $( '<span class="ve-init-viewPageTarget-toolbar-saveButton-icon"></span>' ) )
		.bind( {
			'mousedown': function( event ) {
				$(this).addClass( 've-init-viewPageTarget-toolbar-saveButton-down' );
				event.preventDefault();
				return false;
			},
			'mouseleave mouseup': function( event ) {
				$(this).removeClass( 've-init-viewPageTarget-toolbar-saveButton-down' );
				event.preventDefault();
				return false;
			},
			'click': ve.proxy( this.onToolbarSaveButtonClick, this )
		} );
};

/**
 * Adds the save button to the user interface.
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.attachToolbarSaveButton = function() {
	$( '.es-toolbar .es-modes' ).append( this.$toolbarSaveButton );
	this.disableToolbarSaveButton();
};

/**
 * Removes the save button from the user interface.
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.detachToolbarSaveButton = function() {
	this.$toolbarSaveButton.detach();
};

/**
 * Adds content and event bindings to the save dialog.
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.setupSaveDialog = function() {
	this.$saveDialog
		.html( ve.init.ViewPageTarget.saveDialogTemplate )
		.find( '.ve-init-viewPageTarget-saveDialog-title' )
			.text( ve.msg( 'tooltip-save' ) )
			.end()
		.find( '.ve-init-viewPageTarget-saveDialog-closeButton' )
			.click( ve.proxy( this.onSaveDialogCloseButtonClick, this ) )
			.end()
		.find( '.ve-init-viewPageTarget-saveDialog-editSummary-label' )
			.text( ve.msg( 'summary' ) )
			.end()
		.find( '.ve-init-viewPageTarget-saveDialog-minorEdit-label' )
			.text( ve.msg( 'minoredit' ) )
			.end()
		.find( '#ve-init-viewPageTarget-saveDialog-watchList' )
			.prop( 'checked', mw.config.get( 'wgVisualEditor' ).isPageWatched )
			.end()
		.find( '.ve-init-viewPageTarget-saveDialog-watchList-label' )
			.text( ve.msg( 'watchthis' ) )
			.end()
		.find( '.ve-init-viewPageTarget-saveDialog-saveButton' )
			.bind( {
				'mousedown': function() {
					$(this).addClass( 've-init-viewPageTarget-saveDialog-saveButton-down' );
				},
				'mouseleave mouseup': function() {
					$(this).removeClass( 've-init-viewPageTarget-saveDialog-saveButton-down' );
				},
				'click': ve.proxy( this.onSaveDialogSaveButtonClick, this )
			} )
			.end()
		.find( '.ve-init-viewPageTarget-saveDialog-saveButton-label' )
			.text( ve.msg( 'savearticle' ) )
			.end()
		.find( '.ve-init-viewPageTarget-saveDialog-license' )
			// FIXME license text is hardcoded English
			.html(
				"By editing this page, you agree to irrevocably release your \
				contributions under the CC-BY-SA 3.0 License.  If you don't want your \
				writing to be edited mercilessly and redistrubuted at will, then \
				don't submit it here.<br /><br />You are also confirming that you \
				wrote this yourself, or copied it from a public domain or similar free \
				resource.  See Project:Copyright for full details of the licenses \
				used on this site.\
				<b>DO NOT SUBMIT COPYRIGHTED WORK WITHOUT PERMISSION!</b>"
			);
	this.$saveDialogSaveButton = this.$saveDialog
		.find( '.ve-init-viewPageTarget-saveDialog-saveButton' );

	/* Hook onto the 'watch' event on by mediawiki.page.watch.ajax.js
	 * Triggered when mw.page.watch.updateWatchLink(link, action) is called.
	 */
	$( '#ca-watch, #ca-unwatch' ).on( 'watch.mw',
		ve.proxy( function( e, action ){
			this.$saveDialog
				.find( '#ve-init-viewPageTarget-saveDialog-watchList')
				.prop( 'checked', ( action === 'watch') );
		}, this )
	);
};

/**
 * Adds the save dialog to the user interface.
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.attachSaveDialog = function() {
	this.$saveDialog.insertAfter( this.$toolbarSaveButton );
};

/**
 * Removes the save dialog from the user interface.
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.detachSaveDialog = function() {
	this.$saveDialog.detach();
};

/**
 * Remembers the window's scroll position.
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.saveScrollPosition = function() {
	this.scrollTop = $( window ).scrollTop();
};

/**
 * Restores the window's scroll position.
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.restoreScrollPosition = function() {
	if ( this.scrollTop ) {
		$( window ).scrollTop( this.scrollTop );
		this.scrollTop = null;
	}
};

/**
 * Shows the loading spinner.
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.showSpinner = function() {
	this.$spinner.prependTo( $( '#firstHeading' ) );
};

/**
 * Hides the loading spinner.
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.hideSpinner = function() {
	this.$spinner.detach();
};

/**
 * Shows the page content.
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.showPageContent = function() {
	$( '#bodyContent .ve-init-viewPageTarget-content:not(#siteSub)' )
		.removeClass( 've-init-viewPageTarget-content' )
		.show()
		.fadeTo( 0, 1 );
};

/**
 * Mutes the page content.
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.mutePageContent = function() {
	$( '#bodyContent :visible:not(#siteSub)' )
		.addClass( 've-init-viewPageTarget-content' )
		.fadeTo( 'fast', 0.6 );
};

/**
 * Hides the page content.
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.hidePageContent = function() {
	$( '#bodyContent :visible:not(#siteSub)' )
		.addClass( 've-init-viewPageTarget-content' )
		.hide();
};

/**
 * Shows the table of contents in the view mode.
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.showTableOfContents = function() {
	$( '#toc' ).slideDown( 'fast', function() {
		$(this).removeClass( 've-init-viewPageTarget-pageToc' );
	} );
};

/**
 * Hides the table of contents in the view mode.
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.hideTableOfContents = function() {
	$( '#toc' ).addClass( 've-init-viewPageTarget-pageToc' ).slideUp( 'fast' );
};

/**
 * Shows the save dialog.
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.showSaveDialog = function() {
	this.unlockSaveDialogSaveButton();
	this.$saveDialog.fadeIn( 'fast' ).find( 'input:first' ).focus();
};

/**
 * Hides the save dialog
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.hideSaveDialog = function() {
	this.$saveDialog.fadeOut( 'fast' );
	this.$document.focus();
};

/**
 * Resets the fields of the save dialog
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.resetSaveDialog = function() {
	this.$saveDialog
		.find( '#ve-init-viewPageTarget-saveDialog-editSummary' )
			.val( '' )
			.end()
		.find( '#ve-init-viewPageTarget-saveDialog-minorEdit' )
			.prop( 'checked', false );
};

/**
 * Enables the toolbar save button.
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.enableToolbarSaveButton = function() {
	this.$toolbarSaveButton.removeClass( 've-init-viewPageTarget-toolbar-saveButton-disabled' );
};

/**
 * Disables the toolbar save button.
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.disableToolbarSaveButton = function() {
	this.$toolbarSaveButton.addClass( 've-init-viewPageTarget-toolbar-saveButton-disabled' );
};

/**
 * Enables the save dialog save button.
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.unlockSaveDialogSaveButton = function() {
	this.$saveDialogSaveButton.removeClass( 've-init-viewPageTarget-saveDialog-saveButton-saving' );
};

/**
 * Disables the save dialog save button.
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.lockSaveDialogSaveButton = function() {
	this.$saveDialogSaveButton.addClass( 've-init-viewPageTarget-saveDialog-saveButton-saving' );
};

/**
 * Shows the toolbar.
 *
 * This also transplants the toolbar to a new location.
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.attachToolbar = function() {
	$( '.es-toolbar-wrapper' )
		.insertBefore( $( '#firstHeading' ) )
		.find( '.es-toolbar' )
			.slideDown( 'fast' );
};

/**
 * Hides the toolbar.
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.detachToolbar = function() {
	$( '.es-toolbar' ).slideUp( 'fast', function() {
		$(this).parent().remove();
	} );
};

/**
 * Enables the toolbar save button.
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.transformPageTitle = function() {
	$( '#firstHeading' ).addClass( 've-init-viewPageTarget-pageTitle' );
};

/**
 * Enables the toolbar save button.
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.mutePageTitle = function() {
	$( '#firstHeading, #siteSub' ).fadeTo( 'fast', 0.6 );
};

/**
 * Disables the toolbar save button.
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.restorePageTitle = function() {
	$( '#firstHeading, #siteSub' ).fadeTo( 'fast', 1 );
	setTimeout( function() {
		$( '#firstHeading' ).removeClass( 've-init-viewPageTarget-pageTitle' );
	}, 1000 );
};

/**
 * Modifies page tabs to show that editing is taking place.
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.transformSkinTabs = function() {
	$( '#p-views' ).find( 'li.selected' ).removeClass( 'selected' );
	$( '#ca-edit' ).addClass( 'selected' );
};

/**
 * Modifies page tabs to show that viewing is taking place.
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.restoreSkinTabs = function() {
	$( '#p-views' ).find( 'li.selected' ).removeClass( 'selected' );
	$( '#ca-view' ).addClass( 'selected' );
};

/**
 * Replaces the page content with new HTML.
 *
 * @method
 * @param {HTMLElement} html Rendered HTML from server
 */
ve.init.ViewPageTarget.prototype.replacePageContent = function( html ) {
	$( '#mw-content-text' ).html( html );
};

/**
 * Attaches the surface to the page.
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.attachSurface = function() {
	$( '#content' ).append( this.$surface );
};

/**
 * Attaches the surface to the page.
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.detachSurface = function() {
	this.$surface.detach();
	$( '.es-contextView' ).remove();
};

/**
 * Gets the numeric index of a section in the page.
 *
 * @method
 * @param {HTMLElement} heading Heading element of section
 */
ve.init.ViewPageTarget.prototype.getEditSection = function( heading ) {
	var $page = $( '#mw-content-text' ),
		section = 0;
	$page.find( 'h1, h2, h3, h4, h5, h6' ).not( '#toc h2' ).each( function() {
		section++;
		if ( this === heading ) {
			return false;
		}
	} );
	return section;
};

/**
 * Gets the numeric index of a section in the page.
 *
 * @method
 * @param {HTMLElement} heading Heading element of section
 */
ve.init.ViewPageTarget.prototype.saveEditSection = function( heading ) {
	this.section = this.getEditSection( heading );
};

/**
 * Moves the cursor in the editor to a given section.
 *
 * @method
 * @param {Number} section Section to move cursor to
 */
ve.init.ViewPageTarget.prototype.restoreEditSection = function() {
	if ( this.section !== null ) {
		var surfaceView = this.surface.getView(),
			surfaceModel = surfaceView.getModel();
		this.$document.find( 'h1, h2, h3, h4, h5, h6' ).eq( this.section - 1 ).each( function() {
			var headingNode = $(this).data( 'node' );
			if ( headingNode ) {
				var offset = surfaceModel.getDocument().getNearestContentOffset(
					headingNode.getModel().getOffset()
				);
				surfaceModel.change( null, new ve.Range( offset, offset ) );
				surfaceView.showSelection( surfaceModel.getSelection() );
			}
		} );
		this.section = null;
	}
};

/* Inheritance */

ve.extendClass( ve.init.ViewPageTarget, ve.init.Target );

/* Initialization */

ve.init.viewPageTarget = new ve.init.ViewPageTarget();
