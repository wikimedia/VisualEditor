/*global mw, confirm, alert */

/**
 * VisualEditor MediaWiki initialization ViewPageTarget class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * MediaWiki Edit page target.
 *
 * @class
 * @constructor
 * @extends {ve.init.mw.Target}
 */
ve.init.mw.ViewPageTarget = function VeInitMwViewPageTarget() {
	var currentUri = new mw.Uri( window.location.toString() );

	// Parent constructor
	ve.init.mw.Target.call( this, mw.config.get( 'wgRelevantPageName' ), currentUri.query.oldid );

	// Properties
	this.$document = null;
	this.$spinner = $( '<div class="ve-init-mw-viewPageTarget-loading"></div>' );
	this.$toolbarCancelButton = $( '<div>' ).addClass(
		've-init-mw-viewPageTarget-button ve-init-mw-viewPageTarget-toolbar-cancelButton'
	);
	this.$toolbarSaveButton = $( '<div>' ).addClass(
		've-init-mw-viewPageTarget-button ve-init-mw-viewPageTarget-button-constructive ' +
		've-init-mw-viewPageTarget-toolbar-saveButton'
	);
	this.$toolbarEditNotices = $( '<div>' ).addClass(
		've-init-mw-viewPageTarget-toolbar-editNotices'
	);
	this.$toolbarEditNoticesTool = $( '<div>' ).addClass(
		've-init-mw-viewPageTarget-tool'
	);
	this.$toolbarFeedbackTool = $( '<div>' ).addClass(
		've-init-mw-viewPageTarget-tool'
	);
	this.$saveDialog = $( '<div>' ).addClass( 've-init-mw-viewPageTarget-saveDialog' );
	this.$saveDialogSaveButton = null;
	this.$saveDialogDiffButton = null;
	this.onBeforeUnloadFallback = null;
	this.proxiedOnBeforeUnload = null;
	this.surface = null;
	this.active = false;
	this.edited = false;
	this.activating = false;
	this.deactivating = false;
	this.scrollTop = null;
	this.proxiedOnSurfaceModelTransact = ve.bind( this.onSurfaceModelTransact, this );
	this.surfaceOptions = {
		'toolbars': {
			'top': {
				'float': !this.isMobileDevice
			}
		}
	};
	this.currentUri = currentUri;
	this.restoring = !!this.oldid;
	this.section = currentUri.query.vesection || null;
	this.namespaceName = mw.config.get( 'wgCanonicalNamespace' );
	this.viewUri = new mw.Uri( mw.util.wikiGetlink( this.pageName ) );
	this.veEditUri = this.viewUri.clone().extend( { 'veaction': 'edit' } );
	this.isViewPage = (
		mw.config.get( 'wgAction' ) === 'view' &&
		currentUri.query.diff === undefined
	);
	this.canBeActivated = (
		$.client.test( ve.init.mw.ViewPageTarget.compatibility ) ||
		'vewhitelist' in currentUri.query
	);
	this.editSummaryByteLimit = 255;
	// Tab layout.
	// * add: Adds #ca-ve-edit.
	// * replace: Re-creates #ca-edit for VisualEditor and adds #ca-editsource.
	this.tabLayout = 'add';
	this.feedback = new mw.Feedback( {
		'title': new mw.Title( 'Project:VisualEditor/Feedback' ),
		'bugsLink': new mw.Uri( 'https://bugzilla.wikimedia.org/enter_bug.cgi?product=VisualEditor&component=General' ),
		'bugsListLink': new mw.Uri( 'https://bugzilla.wikimedia.org/buglist.cgi?query_format=advanced&resolution=---&resolution=LATER&resolution=DUPLICATE&product=VisualEditor&list_id=166234' )
	} );

	// Events
	this.addListenerMethods( this, {
		'load': 'onLoad',
		'save': 'onSave',
		'loadError': 'onLoadError',
		'saveError': 'onSaveError',
		'editConflict': 'onEditConflict',
		'showChanges': 'onShowChanges',
		'showChangesError': 'onShowChangesError'
	} );

	// Initialization
	if ( this.canBeActivated ) {
		if ( currentUri.query.venotify ) {
			// The following messages can be used here:
			// visualeditor-notification-saved
			// visualeditor-notification-created
			// visualeditor-notification-restored
			mw.notify(
				ve.msg( 'visualeditor-notification-' + currentUri.query.venotify,
					new mw.Title( this.pageName ).toText()
				)
			);
			if ( window.history.replaceState ) {
				delete currentUri.query.venotify;
				window.history.replaceState( null, document.title, currentUri );
			}
		}
		this.setupSkinTabs();
		this.setupSectionEditLinks();
		if ( this.isViewPage ) {
			if ( currentUri.query.veaction === 'edit' ) {
				this.activate();
			}
		}
	}
};

/* Inheritance */

ve.inheritClass( ve.init.mw.ViewPageTarget, ve.init.mw.Target );

/* Static Members */

/**
 * Compatibility map used with jQuery.client to black-list incompatible browsers.
 *
 * @static
 * @member
 */
ve.init.mw.ViewPageTarget.compatibility = {
	// Left-to-right languages
	ltr: {
		msie: false, // FIXME: Bug 42335 (temporarily added IE to blacklist for December release)
		// msie: [['>=', 9]],
		firefox: [['>=', 11]],
		safari: [['>=', 5]],
		chrome: [['>=', 19]],
		opera: false,
		netscape: false,
		blackberry: false
	},
	// Right-to-left languages
	rtl: {
		msie: false, // FIXME: Bug 42335 (temporarily added IE to blacklist for December release)
		// msie: [['>=', 9]],
		firefox: [['>=', 11]],
		safari: [['>=', 5]],
		chrome: [['>=', 19]],
		opera: false,
		netscape: false,
		blackberry: false
	}
};

// TODO: Accessibility tooltips and logical tab order for prevButton and closeButton.
ve.init.mw.ViewPageTarget.saveDialogTemplate = '\
	<div class="ve-init-mw-viewPageTarget-saveDialog-head">\
		<div class="ve-init-mw-viewPageTarget-saveDialog-prevButton"></div>\
		<div class="ve-init-mw-viewPageTarget-saveDialog-closeButton"></div>\
		<div class="ve-init-mw-viewPageTarget-saveDialog-title"></div>\
	</div>\
	<div class="ve-init-mw-viewPageTarget-saveDialog-body">\
		<div class="ve-init-mw-viewPageTarget-saveDialog-slide ve-init-mw-viewPageTarget-saveDialog-slide-save">\
			<div class="ve-init-mw-viewPageTarget-saveDialog-summary">\
				<label class="ve-init-mw-viewPageTarget-saveDialog-editSummary-label"\
					for="ve-init-mw-viewPageTarget-saveDialog-editSummary"></label>\
				<textarea name="editSummary" class="ve-init-mw-viewPageTarget-saveDialog-editSummary"\
					id="ve-init-mw-viewPageTarget-saveDialog-editSummary" type="text"\
					rows="4"></textarea>\
			</div>\
			<div class="ve-init-mw-viewPageTarget-saveDialog-options">\
				<input type="checkbox" name="minorEdit" \
					id="ve-init-mw-viewPageTarget-saveDialog-minorEdit">\
				<label class="ve-init-mw-viewPageTarget-saveDialog-minorEdit-label"\
					for="ve-init-mw-viewPageTarget-saveDialog-minorEdit"></label>\
				<input type="checkbox" name="watchList"\
					id="ve-init-mw-viewPageTarget-saveDialog-watchList">\
				<label class="ve-init-mw-viewPageTarget-saveDialog-watchList-label"\
					for="ve-init-mw-viewPageTarget-saveDialog-watchList"></label>\
				<label class="ve-init-mw-viewPageTarget-saveDialog-editSummaryCount"></label>\
			</div>\
			<div class="ve-init-mw-viewPageTarget-saveDialog-actions">\
			<div class="ve-init-mw-viewPageTarget-button ve-init-mw-viewPageTarget-button-constructive ve-init-mw-viewPageTarget-saveDialog-saveButton">\
				<span class="ve-init-mw-viewPageTarget-button-label"></span>\
			</div>\
			<div class="ve-init-mw-viewPageTarget-button ve-init-mw-viewPageTarget-button-primary ve-init-mw-viewPageTarget-saveDialog-diffButton">\
				<span class="ve-init-mw-viewPageTarget-button-label"></span>\
			</div>\
			<div class="ve-init-mw-viewPageTarget-saveDialog-working"></div>\
			</div>\
			<div style="clear: both;"></div>\
			<div class="ve-init-mw-viewPageTarget-saveDialog-foot">\
				<p class="ve-init-mw-viewPageTarget-saveDialog-license"></p>\
			</div>\
		</div>\
	</div>';

/* Methods */

/**
 * Switches to edit mode.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.activate = function () {
	if ( !this.active && !this.activating ) {
		this.activating = true;
		// User interface changes
		this.transformSkinTabs();
		this.hideSiteNotice();
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
ve.init.mw.ViewPageTarget.prototype.deactivate = function ( override ) {
	if ( override || ( this.active && !this.deactivating ) ) {
		if (
			override ||
			!this.surface.getModel().getHistory().length ||
			confirm( ve.msg( 'visualeditor-viewpage-savewarning' ) )
		) {
			this.deactivating = true;
			// User interface changes
			this.restoreSkinTabs();
			this.restoreSiteNotice();
			this.hideSpinner();
			this.tearDownToolbarButtons();
			this.detachToolbarButtons();
			this.resetSaveDialog();
			this.hideSaveDialog();
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
ve.init.mw.ViewPageTarget.prototype.onLoad = function ( dom ) {
	this.edited = false;
	this.setUpSurface( dom );
	this.setupToolbarEditNotices();
	this.setupToolbarButtons();
	this.setupSaveDialog();
	this.attachToolbarButtons();
	this.attachSaveDialog();
	this.restoreScrollPosition();
	this.restoreEditSection();
	this.setupBeforeUnloadHandler();
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
ve.init.mw.ViewPageTarget.prototype.onLoadError = function ( response, status ) {
	if ( confirm( ve.msg( 'visualeditor-loadwarning', status ) ) ) {
		this.load();
	} else {
		this.activating = false;
		// User interface changes
		this.deactivate( true );
	}
};

/**
 * Handles successful DOM save event.
 *
 * @method
 * @param {HTMLElement} html Rendered HTML from server
 */
ve.init.mw.ViewPageTarget.prototype.onSave = function ( html ) {
	if ( !this.pageExists || this.restoring ) {
		// This is a page creation or restoration, refresh the page
		this.tearDownBeforeUnloadHandler();
		window.location.href = this.viewUri.extend( {
			'venotify': this.restoring ? 'restored' : 'created'
		} );
	} else {
		// Update watch link to match 'watch checkbox' in save dialog.
		// User logged in if module loaded.
		// Just checking for mw.page.watch is not enough because in Firefox
		// there is Object.prototype.watch...
		if ( mw.page.watch && mw.page.watch.updateWatchLink ) {
			var watchChecked = this.$saveDialog
				.find( '#ve-init-mw-viewPageTarget-saveDialog-watchList')
				.prop( 'checked' );
			mw.page.watch.updateWatchLink(
				$( '#ca-watch a, #ca-unwatch a' ),
				watchChecked ? 'unwatch': 'watch'
			);
		}
		this.hideSaveDialog();
		this.resetSaveDialog();
		this.replacePageContent( html );
		this.tearDownBeforeUnloadHandler();
		this.deactivate( true );
		mw.util.jsMessage(
			ve.msg( 'visualeditor-notification-saved',
				new mw.Title( this.pageName ).toText()
			)
		);
	}
};

/**
 * Handles failed DOM save event.
 *
 * @method
 * @param {Object} jqXHR
 * @param {String} status Text status message
 * @param {Mixed} error Thrown exception or HTTP error string
 */
ve.init.mw.ViewPageTarget.prototype.onSaveError = function ( jqXHR, status ) {
	// TODO: Don't use alert.
	alert( ve.msg( 'visualeditor-saveerror', status ) );
	this.enableSaveDialogSaveButton();
	this.$saveDialogLoadingIcon.hide();
};

/**
 * Handles Show changes event.
 *
 * @method
 * @param {string} diffHtml
 */
ve.init.mw.ViewPageTarget.prototype.onShowChanges = function ( diffHtml ) {
	// Store the diff for reporting purposes
	this.diffHtml = diffHtml;
	mw.loader.using( 'mediawiki.action.history.diff', ve.bind( function () {
		var $slide = this.$saveDialog.find( '.ve-init-mw-viewPageTarget-saveDialog-slide-diff' );
		if ( !$slide.length ) {
			$slide = $( '<div class="ve-init-mw-viewPageTarget-saveDialog-slide ve-init-mw-viewPageTarget-saveDialog-slide-diff"><p>&nbsp;</p></div>' )
				.appendTo( this.$saveDialog.find( '.ve-init-mw-viewPageTarget-saveDialog-body' ) );
		}

		$slide.hide().empty().append( diffHtml );

		this.$saveDialog
			.find( '.ve-init-mw-viewPageTarget-saveDialog-prevButton' )
				.show()
				.end()
			.find( '.ve-init-mw-viewPageTarget-saveDialog-slide-save' )
				.not( $slide )
					.hide()
					.end()
				.end()
			.find( '.ve-init-mw-viewPageTarget-saveDialog-title' )
				.text( ve.msg( 'visualeditor-showchanges-title' ) )
				.end()
			.css( 'width', 'auto' );

		$slide.show();

		this.enableSaveDialogDiffButton();
		this.$saveDialogLoadingIcon.hide();
	}, this ), ve.bind( function () {
		this.onSaveError( null, 'Module load failed' );
	}, this ) );
};

/**
 * Handles failed Show changes event.
 *
 * @method
 * @param {Object} jqXHR
 * @param {String} status Text status message
 * @param {Mixed} error Thrown exception or HTTP error string
 */
ve.init.mw.ViewPageTarget.prototype.onShowChangesError = function ( jqXHR, status ) {
	alert( ve.msg( 'visualeditor-differror', status ) );
	this.enableSaveDialogDiffButton();
	this.$saveDialogLoadingIcon.hide();
};

/**
 * Handles edit conflict event.
 *
 * TODO: Don't use an operating system confirm box. Parsing may take quite some time and we should
 * be showing the user some sort of progress indicator. Ideally this would be integrated into the
 * save dialog.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.onEditConflict = function () {
	if ( confirm( ve.msg( 'visualeditor-editconflict', status ) ) ) {
		// Get Wikitext from the DOM, and setup a submit call when it's done
		this.serialize(
			ve.dm.converter.getDomFromData( this.surface.getDocumentModel().getFullData() ),
			ve.bind( function ( wikitext ) {
				this.submit( wikitext, this.getSaveOptions() );
			}, this )
		);
	} else {
		// Return to editing
		this.hideSaveDialog();
		this.resetSaveDialog();
	}
};

/**
 * Handles clicks on the edit tab.
 *
 * @method
 * @param {jQuery.Event} e
 */
ve.init.mw.ViewPageTarget.prototype.onEditTabClick = function ( e ) {
	this.activate();
	// Prevent the edit tab's normal behavior
	e.preventDefault();
};

/**
 * Handles clicks on a section edit link.
 *
 * @method
 * @param {jQuery.Event} e
 */
ve.init.mw.ViewPageTarget.prototype.onEditSectionLinkClick = function ( e ) {
	this.saveEditSection( $( e.target ).closest( 'h1, h2, h3, h4, h5, h6' ).get( 0 ) );
	this.activate();
	// Prevent the edit tab's normal behavior
	e.preventDefault();
};

/**
 * Handles clicks on the view tab.
 *
 * @method
 * @param {jQuery.Event} e
 */
ve.init.mw.ViewPageTarget.prototype.onViewTabClick = function ( e ) {
	if ( this.active ) {
		this.deactivate();
		// Prevent the edit tab's normal behavior
		e.preventDefault();
	}
};

/**
 * Handles clicks on the save button in the toolbar.
 *
 * @method
 * @param {jQuery.Event} e
 */
ve.init.mw.ViewPageTarget.prototype.onToolbarSaveButtonClick = function () {
	if ( this.edited || this.restoring ) {
		this.showSaveDialog();
	}
};

/**
 * Handles clicks on the save button in the toolbar.
 *
 * @method
 * @param {jQuery.Event} e
 */
ve.init.mw.ViewPageTarget.prototype.onToolbarCancelButtonClick = function () {
	this.deactivate();
};

/**
 * Handles clicks on the edit notices tool in the toolbar.
 *
 * @method
 * @param {jQuery.Event} e
 */
ve.init.mw.ViewPageTarget.prototype.onToolbarEditNoticesToolClick = function () {
	this.$toolbarEditNotices.fadeToggle( 'fast' );
	this.$document.focus();
};

/**
 * Handles clicks on the feedback tool in the toolbar.
 *
 * @method
 * @param {jQuery.Event} e
 */
ve.init.mw.ViewPageTarget.prototype.onToolbarFeedbackToolClick = function () {
	this.$toolbarEditNotices.fadeOut( 'fast' );
	this.feedback.launch();
};

/**
 * Handles the first transaction in the surface model.
 *
 * This handler is removed the first time it's used, but added each time the surface is setup.
 *
 * @method
 * @param {ve.Transaction} tx Processed transaction
 */
ve.init.mw.ViewPageTarget.prototype.onSurfaceModelTransact = function () {
	this.edited = true;
	this.enableToolbarSaveButton();
	this.surface.getModel().removeListener( 'transact', this.proxiedOnSurfaceModelTransact );
};

/**
 * Handles clicks on the save button in the save dialog.
 *
 * @method
 * @param {jQuery.Event} e
 */
ve.init.mw.ViewPageTarget.prototype.onSaveDialogSaveButtonClick = function ( e ) {
	// If button was already disabled, ignore this event.
	if ( $.data( e.currentTarget, 'disabled' ) ) {
		return;
	}

	this.disableSaveDialogSaveButton();
	this.$saveDialogLoadingIcon.show();
	this.save(
		ve.dm.converter.getDomFromData( this.surface.getDocumentModel().getFullData() ),
		this.getSaveOptions()
	);
};

/**
 * Handles clicks on the show changes button in the save dialog.
 *
 * @method
 * @param {jQuery.Event} e
 */
ve.init.mw.ViewPageTarget.prototype.onSaveDialogDiffButtonClick = function ( e ) {
	// If button was already disabled, ignore this event.
	if ( $.data( e.currentTarget, 'disabled' ) ) {
		return;
	}

	this.disableSaveDialogDiffButton();
	this.$saveDialogLoadingIcon.show();
	// TODO ?:
	//  Abort Show changes if Save page is pressed
	//  Abort Save page if Show chnages is pressed
	//  Or lock/unlock them in pairs, but that means pressing Show changes makes
	//  it impossible to save, requires waiting for diff to complete. Maybe an abort button
	//  in the loader icon?
	this.showChanges(
		ve.dm.converter.getDomFromData( this.surface.getDocumentModel().getFullData() )
	);
};

/**
 * Gets save options from the save dialog form.
 *
 * @method
 * @returns {Object} Save options, including summary, minor and watch properties
 */
ve.init.mw.ViewPageTarget.prototype.getSaveOptions = function () {
	return {
		'summary': $( '#ve-init-mw-viewPageTarget-saveDialog-editSummary' ).val(),
		'minor': $( '#ve-init-mw-viewPageTarget-saveDialog-minorEdit' ).prop( 'checked' ),
		'watch': $( '#ve-init-mw-viewPageTarget-saveDialog-watchList' ).prop( 'checked' )
	};
};

/**
 * Handles clicks on the close button in the save dialog.
 *
 * @method
 * @param {jQuery.Event} e
 */
ve.init.mw.ViewPageTarget.prototype.onSaveDialogCloseButtonClick = function () {
	this.hideSaveDialog();
};

ve.init.mw.ViewPageTarget.prototype.onSaveDialogPrevButtonClick = function () {
	this.showSaveDialog();
};

/**
 * Gets a list of edit notices.
 *
 * @method
 * @returns {String[]} HTML strings for each edit notice
 */
ve.init.mw.ViewPageTarget.prototype.setupToolbarEditNotices = function () {
	var key;
	this.$toolbarEditNotices.empty();
	for ( key in this.editNotices ) {
		this.$toolbarEditNotices.append(
			$( '<div>' )
				.addClass( 've-init-mw-viewPageTarget-toolbar-editNotices-notice' )
				.attr( 'rel', key ).html( this.editNotices[key] )
		);
	}
};

/**
 * Switches to editing mode.
 *
 * @method
 * @param {HTMLElement} dom HTML DOM to edit
 */
ve.init.mw.ViewPageTarget.prototype.setUpSurface = function ( dom ) {
	var $contentText = $( '#mw-content-text' );

	// Initialize surface
	this.surface = new ve.Surface( $( '#content' ), dom, this.surfaceOptions );
	this.surface.getContext().hide();
	this.$document = this.surface.$.find( '.ve-ce-documentNode' );
	this.surface.getModel().on( 'transact', this.proxiedOnSurfaceModelTransact );
	// Store the HTML for reporting purposes
	this.originalHtml = dom.innerHTML;
	// Transplant the toolbar
	this.attachToolbar();
	this.transformPageTitle();
	// Update UI
	this.hidePageContent();
	this.hideSpinner();
	if ( !this.restoring ) {
		this.disableToolbarSaveButton();
	}
	this.active = true;
	this.$document.attr( {
		'lang': $contentText.attr( 'lang' ),
		'dir': $contentText.attr( 'dir' )
	} );
};

/**
 * Switches to viewing mode.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.tearDownSurface = function () {
	// Reset tabs
	this.restoreSkinTabs();
	// Update UI
	if ( this.$document ) {
		this.$document.blur();
		this.$document = null;
	}
	this.detachToolbar();
	this.hideSpinner();
	this.showPageContent();
	this.restorePageTitle();
	this.showTableOfContents();
	// Destroy editor
	if ( this.surface ) {
		this.surface.destroy();
		this.surface = null;
	}
	this.active = false;
};

/**
 * Modifies tabs in the skin to support in-place editing.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.setupSkinTabs = function () {
	var action, pTabsId, $caSource, $caEdit, caVeEdit, caVeEditNextnode, uriClone;
	$caEdit = $( '#ca-edit' );
	$caSource = $( '#ca-viewsource' );
	caVeEditNextnode = $caEdit.next().get( 0 );

	if ( !$caEdit.length || $caSource.length ) {
		// If there is no edit tab or a view-source tab,
		// the user doesn't have permission to edit.
		return;
	}

	action = this.pageExists ? 'edit' : 'create';
	pTabsId = $( '#p-views' ).length ? 'p-views' : 'p-cactions';

	// Add independent ve-edit tab.
	if ( this.tabLayout === 'add' ) {
		// Create "Edit" tab.
		caVeEdit = mw.util.addPortletLink(
			pTabsId,
			// Use url instead of '#'.
			// So that 1) one can always open it in a new tab, even when
			// onEditTabClick is bound.
			// 2) when onEditTabClick is not bound (!isViewPage) it will
			// just work.
			this.veEditUri,
			// Message: 'visualeditor-ca-ve-edit' or 'visualeditor-ca-ve-create'
			ve.msg( 'visualeditor-ca-ve-' + action ),
			'ca-ve-edit',
			ve.msg( 'tooltip-ca-ve-edit' ),
			ve.msg( 'accesskey-ca-ve-edit' ),
			caVeEditNextnode
		);

	// Replace edit with ve version, add editsource link.
	} else {
		// Create "Edit source" link.
		// Re-create instead of convert ca-edit since we don't want to copy over accesskey etc.
		mw.util.addPortletLink(
			'p-cactions',
			// Use original href to preserve oldid etc. (bug 38125)
			$caEdit.find( 'a' ).attr( 'href' ),
			ve.msg( 'visualeditor-ca-editsource' ),
			'ca-editsource'
		);
		$caEdit.remove();

		// Create "Edit" tab.
		caVeEdit = mw.util.addPortletLink(
			pTabsId ,
			// Use url instead of '#'.
			// So that 1) one can always open it in a new tab, even when
			// onEditTabClick is bound.
			// 2) when onEditTabClick is not bound (!isViewPage) it will
			// just work.
			this.veEditUri,
			// Message: 'edit' or 'create'
			ve.msg( action ),
			'ca-edit',
			ve.msg( 'tooltip-ca-edit' ),
			ve.msg( 'accesskey-ca-edit' ),
			caVeEditNextnode
		);
	}

	if ( this.isViewPage ) {
		// Allow instant switching to edit mode, without refresh
		$( caVeEdit ).click( ve.bind( this.onEditTabClick, this ) );
		// Allow instant switching back to view mode, without refresh
		$( '#ca-view a, #ca-nstab-visualeditor a' )
			.click( ve.bind( this.onViewTabClick, this ) );
	}

	// If there got here via veaction=edit, hide it from the URL.
	if ( this.currentUri.query.veaction === 'edit' && window.history.replaceState ) {
		// Remove the veaction query parameter, but don't affect the original mw.Uri instance
		uriClone = this.currentUri.clone();
		delete uriClone.query.veaction;

		// If there are other query parameters, set the url to the current one
		// (with veaction removed). Otherwise use the canonical style view url (bug 42553).
		if ( ve.getObjectValues( uriClone.query ).length ) {
			window.history.replaceState( null, document.title, uriClone );
		} else {
			window.history.replaceState( null, document.title, this.viewUri );
		}
	}
};

/**
 * Modifies page content to make section edit links activate the editor.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.setupSectionEditLinks = function () {
	var veEditUri = this.veEditUri,
		$links = $( '#mw-content-text .editsection a' );
	if ( this.isViewPage ) {
		$links.click( ve.bind( this.onEditSectionLinkClick, this ) );
	} else {
		$links.each( function () {
			var veSectionEditUri = new mw.Uri( veEditUri.toString() ),
				sectionEditUri = new mw.Uri( $(this).attr( 'href' ) );
			veSectionEditUri.extend( { 'vesection': sectionEditUri.query.section } );
			$(this).attr( 'href', veSectionEditUri );
		} );
	}
};

/**
 * Adds content and event bindings to toolbar buttons.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.setupToolbarButtons = function () {
	var editNoticeCount = ve.getObjectKeys( this.editNotices ).length;
	this.$toolbarCancelButton
		.append(
			$( '<span class="ve-init-mw-viewPageTarget-button-label"></span>' )
				.text( ve.msg( 'cancel' ) )
		)
		.click( ve.bind( this.onToolbarCancelButtonClick, this ) );
	this.$toolbarSaveButton
		.append(
			$( '<span class="ve-init-mw-viewPageTarget-button-label"></span>' )
				.text( ve.msg(
					this.restoring ? 'visualeditor-restore-page': (
						this.pageExists ? 'savearticle' : 'visualeditor-create-page'
					)
				) )
		)
		.click( ve.bind( this.onToolbarSaveButtonClick, this ) );
	if ( editNoticeCount ) {
		this.$toolbarEditNoticesTool
			.addClass( 've-ui-icon-alert' )
			.append(
				$( '<span>' )
					.addClass( 've-init-mw-viewPageTarget-tool-label' )
					.text( ve.msg( 'visualeditor-editnotices-tool', editNoticeCount ) )
			)
			.append( this.$toolbarEditNotices )
			.click( ve.bind( this.onToolbarEditNoticesToolClick, this ) );
		this.$toolbarEditNotices.fadeIn( 'fast' );
	}
	this.$toolbarFeedbackTool
		.addClass( 've-ui-icon-comment' )
		.append(
			$( '<span>' )
				.addClass( 've-init-mw-viewPageTarget-tool-label' )
				.text( ve.msg( 'visualeditor-feedback-tool' ) )
		)
		.click( ve.bind( this.onToolbarFeedbackToolClick, this ) );
};

/**
 * Removes content and event bindings from toolbar buttons.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.tearDownToolbarButtons = function () {
	this.$toolbarCancelButton.empty().off( 'click' );
	this.$toolbarSaveButton.empty().off( 'click' );
	this.$toolbarEditNoticesTool.empty().off( 'click' );
	this.$toolbarFeedbackTool.empty().off( 'click' );
};

/**
 * Adds the save button to the user interface.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.attachToolbarButtons = function () {
	var $target = $( '.ve-ui-toolbar .ve-ui-actions' );
	$target.append( this.$toolbarFeedbackTool );
	if ( !ve.isEmptyObject( this.editNotices ) ) {
		$target.append( this.$toolbarEditNoticesTool );
	}
	$target.append( this.$toolbarCancelButton, this.$toolbarSaveButton );
};

/**
 * Removes the save button from the user interface.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.detachToolbarButtons = function () {
	this.$toolbarCancelButton.detach();
	this.$toolbarSaveButton.detach();
	this.$toolbarEditNoticesTool.detach();
	this.$toolbarFeedbackTool.detach();
};

/**
 * Asynchronously provides the template for the save dialog wrapped in a
 * plain <div> jQuery collection.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.getSaveDialogHtml = function ( callback ) {
	var viewPage = this,
		$wrap = $( '<div>' ).html( this.constructor.saveDialogTemplate );

	// Based on EditPage::getCheckboxes and EditPage::initialiseForm

	mw.user.getRights( function ( rights ) {
		// MediaWiki only allows usage of minor flag when editing an existing page
		// and the user has the right to use the feature.
		// If either is not the case, remove it from the form.
		if ( !viewPage.pageExists || ve.indexOf( 'minoredit', rights ) === -1 ) {
			$wrap
				.find( '.ve-init-mw-viewPageTarget-saveDialog-minorEdit-label, #ve-init-mw-viewPageTarget-saveDialog-minorEdit' )
				.remove();
		}

		if ( !viewPage.pageExists ) {
			$wrap.find( '.ve-init-mw-viewPageTarget-saveDialog-diffButton' ).remove();
		}

		if ( mw.user.isAnon() ) {
			$wrap
				.find( '.ve-init-mw-viewPageTarget-saveDialog-watchList-label, #ve-init-mw-viewPageTarget-saveDialog-watchList' )
				.remove();
		} else if (
			mw.user.options.get( 'watchdefault' ) ||
			( mw.user.options.get( 'watchcreations' ) && !viewPage.pageExists ) ||
			mw.config.get( 'wgVisualEditor' ).isPageWatched
		) {
			$wrap
				.find( '#ve-init-mw-viewPageTarget-saveDialog-watchList' )
				.prop( 'checked', true );
		}

		callback( $wrap );
	} );
};

/**
 * Adds content and event bindings to the save dialog.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.setupSaveDialog = function () {
	var viewPage = this;
	viewPage.getSaveDialogHtml( function ( $wrap ) {
		viewPage.$saveDialog
			// Must not use replaceWith because that can't be used on fragement roots,
			// plus, we want to preserve the reference and class names of the wrapper.
			.empty().append( $wrap.contents() )
			.find( '.ve-init-mw-viewPageTarget-saveDialog-closeButton' )
				.click( ve.bind( viewPage.onSaveDialogCloseButtonClick, viewPage ) )
				.end()
			.find( '.ve-init-mw-viewPageTarget-saveDialog-prevButton' )
				.click( ve.bind( viewPage.onSaveDialogPrevButtonClick, viewPage ) )
				.end()
			.find( '#ve-init-mw-viewPageTarget-saveDialog-editSummary' )
				.attr( {
					'placeholder': ve.msg( 'visualeditor-editsummary' )
				} )
				.placeholder()
				.byteLimit( viewPage.editSummaryByteLimit )
				.on( {
					'focus': function () {
						$(this).parent().addClass(
							've-init-mw-viewPageTarget-saveDialog-summary-focused'
						);
					},
					'blur': function () {
						$(this).parent().removeClass(
							've-init-mw-viewPageTarget-saveDialog-summary-focused'
						);
					},
					'keydown mouseup cut paste change focus blur': function () {
						var $textarea = $(this),
							$editSummaryCount = $textarea
								.closest( '.ve-init-mw-viewPageTarget-saveDialog-slide-save' )
									.find( '.ve-init-mw-viewPageTarget-saveDialog-editSummaryCount' );
						// TODO: This looks a bit weird, there is no unit in the UI, just numbers
						// Users likely assume characters but then it seems to count down quicker
						// than expected. Facing users with the word "byte" is bad? (bug 40035)
						setTimeout( function () {
							$editSummaryCount.text(
								viewPage.editSummaryByteLimit - $.byteLength( $textarea.val() )
							);
						}, 0 );
					}
				} )
				.end()
			.find( '.ve-init-mw-viewPageTarget-saveDialog-editSummaryCount' )
				.text( viewPage.editSummaryByteLimit )
				.end()
			.find( '.ve-init-mw-viewPageTarget-saveDialog-minorEdit-label' )
				.html( ve.init.platform.getParsedMessage( 'minoredit' ) )
				.find( 'a' )
					.attr( 'target', '_blank' )
					.end()
				.end()
			.find( '.ve-init-mw-viewPageTarget-saveDialog-watchList-label' )
				.html( ve.init.platform.getParsedMessage( 'watchthis' ) )
				.end()
			.find( '.ve-init-mw-viewPageTarget-saveDialog-saveButton' )
				.click( ve.bind( viewPage.onSaveDialogSaveButtonClick, viewPage ) )
				.end()
			.find( '.ve-init-mw-viewPageTarget-saveDialog-saveButton > span' )
				.text( ve.msg( viewPage.restoring ? 'visualeditor-restore-page' : 'savearticle' ) )
				.end()
			.find( '.ve-init-mw-viewPageTarget-saveDialog-diffButton > span' )
				.text( ve.msg( 'showdiff' ) )
				.end()
			.find( '.ve-init-mw-viewPageTarget-saveDialog-diffButton' )
				.click( ve.bind( viewPage.onSaveDialogDiffButtonClick, viewPage ) )
				.end()
			.find( '.ve-init-mw-viewPageTarget-saveDialog-license' )
				.html( ve.init.platform.getParsedMessage( 'copyrightwarning' ) );
		viewPage.$saveDialogSaveButton = viewPage.$saveDialog
			.find( '.ve-init-mw-viewPageTarget-saveDialog-saveButton' );
		viewPage.$saveDialogDiffButton = viewPage.$saveDialog
			.find( '.ve-init-mw-viewPageTarget-saveDialog-diffButton' );
		viewPage.$saveDialogLoadingIcon = viewPage.$saveDialog
			.find( '.ve-init-mw-viewPageTarget-saveDialog-working' );
	} );
	// Hook onto the 'watch' event on by mediawiki.page.watch.ajax.js
	// Triggered when mw.page.watch.updateWatchLink(link, action) is called
	$( '#ca-watch, #ca-unwatch' )
		.on(
			'watchpage.mw',
			function ( e, action ) {
				viewPage.$saveDialog
					.find( '#ve-init-mw-viewPageTarget-saveDialog-watchList' )
					.prop( 'checked', ( action === 'watch' ) );
			}
		);
};

/**
 * Adds the save dialog to the user interface.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.attachSaveDialog = function () {
	this.$toolbarWrapper.find( '.ve-ui-toolbar' ).append( this.$saveDialog );
};

/**
 * Removes the save dialog from the user interface.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.detachSaveDialog = function () {
	this.$saveDialog.detach();
};

/**
 * Remembers the window's scroll position.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.saveScrollPosition = function () {
	this.scrollTop = $( window ).scrollTop();
};

/**
 * Restores the window's scroll position.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.restoreScrollPosition = function () {
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
ve.init.mw.ViewPageTarget.prototype.showSpinner = function () {
	$( '#firstHeading' ).prepend( this.$spinner );
};

/**
 * Hides the loading spinner.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.hideSpinner = function () {
	this.$spinner.detach();
};

/**
 * Shows the page content.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.showPageContent = function () {
	$( '#bodyContent > .ve-init-mw-viewPageTarget-content' )
		.removeClass( 've-init-mw-viewPageTarget-content' )
		.show()
		.fadeTo( 0, 1 );
};

/**
 * Mutes the page content.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.mutePageContent = function () {
	$( '#bodyContent > :visible:not(#siteSub, #contentSub)' )
		.addClass( 've-init-mw-viewPageTarget-content' )
		.fadeTo( 'fast', 0.6 );
};

/**
 * Hides the page content.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.hidePageContent = function () {
	$( '#bodyContent > :visible:not(#siteSub, #contentSub)' )
		.addClass( 've-init-mw-viewPageTarget-content' )
		.hide();
};

/**
 * Shows the table of contents in the view mode.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.showTableOfContents = function () {
	var $toc = $( '#toc' ),
		$wrap = $toc.parent();
	if ( $wrap.data( 've.hideTableOfContents' ) ) {
		$wrap.slideDown(function () {
			$toc.unwrap();
		});
	}
};

/**
 * Hides the table of contents in the view mode.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.hideTableOfContents = function () {
	$( '#toc' )
		.wrap( '<div>' )
		.parent()
			.data( 've.hideTableOfContents', true )
			.slideUp();
};

/**
 * Shows the save dialog.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.showSaveDialog = function () {
	var viewPage = this;
	viewPage.$toolbarEditNotices.fadeOut( 'fast' );
	viewPage.enableSaveDialogSaveButton();
	viewPage.$saveDialogLoadingIcon.hide();
	viewPage.$saveDialog
		// Reset width
		.css( 'width', '' )
		// Reset title
		.find( '.ve-init-mw-viewPageTarget-saveDialog-title' )
			.text( ve.msg( 'visualeditor-save-title' ) )
			.end()
		// Reset slide to main
		.find( '.ve-init-mw-viewPageTarget-saveDialog-slide-save' )
			.show()
			.end()
		.find( '.ve-init-mw-viewPageTarget-saveDialog-slide:not(.ve-init-mw-viewPageTarget-saveDialog-slide-save)' )
			.hide()
			.end()
		// Hide back button
		.find ( '.ve-init-mw-viewPageTarget-saveDialog-prevButton' )
			.hide()
			.end()
		.fadeIn( 'fast', function () {
			// Initial size
			viewPage.onResizeSaveDialog();
		});

	$( document ).on( 'keydown.ve-savedialog', function ( e ) {
		// Escape
		if ( e.which === 27 ) {
			viewPage.onSaveDialogCloseButtonClick();
		}
	});
	$( window ).on( 'resize.ve-savedialog', ve.bind( viewPage.onResizeSaveDialog, viewPage ) );
	// Change focus
	setTimeout( function() {
		viewPage.$saveDialog.find( 'textarea:first' ).focus();
	}, 0 );
};

/**
 * Update window-size related aspects of the save dialog
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.onResizeSaveDialog = function () {
	var $d = this.$saveDialog, $w = $( window );

	// Available space for css-height is window height,
	// without the space between the dialog and the window top,
	// without the space above/below between css-height and outerHeight.
	$d.css( 'max-height',
		$w.height() -
			( $d.offset().top - $w.scrollTop() ) -
			( $d.outerHeight( true ) - $d.height() ) -
			20 // shadow
	);
};

/**
 * Hides the save dialog
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.hideSaveDialog = function () {
	this.$saveDialog.fadeOut( 'fast' );
	if ( this.$document ) {
		this.$document.focus();
	}
	$( document ).off( 'keydown.ve-savedialog' );
	$( window ).off( 'resize', this.onResizeSaveDialog );
};

/**
 * Resets the fields of the save dialog
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.resetSaveDialog = function () {
	this.$saveDialog
		.find( '#ve-init-mw-viewPageTarget-saveDialog-editSummary' )
			.val( '' )
			.end()
		.find( '#ve-init-mw-viewPageTarget-saveDialog-minorEdit' )
			.prop( 'checked', false );
};

/**
 * Enables the toolbar save button.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.enableToolbarSaveButton = function () {
	this.$toolbarSaveButton
		.data( 'disabled', false )
		.removeClass( 've-init-mw-viewPageTarget-button-disabled' );
};

/**
 * Disables the toolbar save button.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.disableToolbarSaveButton = function () {
	this.$toolbarSaveButton
		.data( 'disabled', true )
		.addClass( 've-init-mw-viewPageTarget-button-disabled' );
};

/**
 * Enables the save dialog save button.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.enableSaveDialogSaveButton = function () {
	this.$saveDialogSaveButton
		.data( 'disabled', false )
		.removeClass( 've-init-mw-viewPageTarget-button-disabled' );
};

/**
 * Disables the save dialog save button.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.disableSaveDialogSaveButton = function () {
	this.$saveDialogSaveButton
		.data( 'disabled', true )
		.addClass( 've-init-mw-viewPageTarget-button-disabled' );
};

/**
 * Enables the save dialog diff button.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.enableSaveDialogDiffButton = function () {
	this.$saveDialogDiffButton
		.data( 'disabled', false )
		.removeClass( 've-init-mw-viewPageTarget-button-disabled' );
};

/**
 * Disables the save dialog diff button.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.disableSaveDialogDiffButton = function () {
	this.$saveDialogDiffButton
		.data( 'disabled', true )
		.addClass( 've-init-mw-viewPageTarget-button-disabled' );
};

/**
 * Shows the toolbar.
 *
 * This also transplants the toolbar to a new location.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.attachToolbar = function () {
	this.$toolbarWrapper = $( '.ve-ui-toolbar-wrapper' )
		.insertBefore( $( '#firstHeading' ) )
		.find( '.ve-ui-toolbar' )
			.slideDown( 'fast', ve.bind( function() {
				this.surface.getContext().update();
			}, this ) )
			.end();
};

/**
 * Hides the toolbar.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.detachToolbar = function () {
	$( '.ve-ui-toolbar' ).slideUp( 'fast', function () {
		$(this).parent().remove();
	} );
};

/**
 * Enables the toolbar save button.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.transformPageTitle = function () {
	$( '#firstHeading' ).addClass( 've-init-mw-viewPageTarget-pageTitle' );
};

/**
 * Enables the toolbar save button.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.mutePageTitle = function () {
	$( '#firstHeading, #siteSub:visible, #contentSub:visible' ).fadeTo( 'fast', 0.6 );
};

/**
 * Disables the toolbar save button.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.restorePageTitle = function () {
	$( '#firstHeading, #siteSub:visible, #contentSub:visible' ).fadeTo( 'fast', 1 );
	setTimeout( function () {
		$( '#firstHeading' ).removeClass( 've-init-mw-viewPageTarget-pageTitle' );
	}, 1000 );
};

/**
 * Modifies page tabs to show that editing is taking place.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.transformSkinTabs = function () {
	$( $( '#p-views' ).length ? '#p-views' : '#p-cactions' )
		.find( 'li.selected' ).removeClass( 'selected' );
	$( this.tabLayout === 'add' ? '#ca-ve-edit' : '#ca-edit' )
		.addClass( 'selected' );
};

/**
 * Modifies page tabs to show that viewing is taking place.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.restoreSkinTabs = function () {
	$( $( '#p-views' ).length ? '#p-views' : '#p-cactions' )
		.find( 'li.selected' ).removeClass( 'selected' );
	$( '#ca-view' ).addClass( 'selected' );
};

/**
 * Hides site notice on page if present.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.hideSiteNotice = function () {
	$( '#siteNotice:visible' )
		.addClass( 've-hide' )
		.slideUp( 'fast' );
};

/**
 * Show site notice on page if present.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.restoreSiteNotice = function () {
	$(' #siteNotice.ve-hide' )
		.slideDown( 'fast' );
};

/**
 * Replaces the page content with new HTML.
 *
 * @method
 * @param {HTMLElement} html Rendered HTML from server
 */
ve.init.mw.ViewPageTarget.prototype.replacePageContent = function ( html ) {
	$( '#mw-content-text' ).html( html );
};

/**
 * Gets the numeric index of a section in the page.
 *
 * @method
 * @param {HTMLElement} heading Heading element of section
 */
ve.init.mw.ViewPageTarget.prototype.getEditSection = function ( heading ) {
	var $page = $( '#mw-content-text' ),
		section = 0;
	$page.find( 'h1, h2, h3, h4, h5, h6' ).not( '#toc h2' ).each( function () {
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
ve.init.mw.ViewPageTarget.prototype.saveEditSection = function ( heading ) {
	this.section = this.getEditSection( heading );
};

/**
 * Moves the cursor in the editor to a given section.
 *
 * @method
 * @param {Number} section Section to move cursor to
 */
ve.init.mw.ViewPageTarget.prototype.restoreEditSection = function () {
	if ( this.section !== null ) {
		var offset,
			surfaceView = this.surface.getView(),
			surfaceModel = surfaceView.getModel();
		this.$document.find( 'h1, h2, h3, h4, h5, h6' ).eq( this.section - 1 ).each( function () {
			var headingNode = $(this).data( 'node' );
			if ( headingNode ) {
				offset = surfaceModel.getDocument().getNearestContentOffset(
					headingNode.getModel().getOffset()
				);
				surfaceModel.change( null, new ve.Range( offset, offset ) );
				surfaceView.showSelection( surfaceModel.getSelection() );
			}
		} );
		this.section = null;
	}
};

/**
 * Adds onbeforunload handler.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.setupBeforeUnloadHandler = function () {
	// Remember any already set on before unload handler
	this.onBeforeUnloadFallback = window.onbeforeunload;
	// Attach before unload handler
	window.onbeforeunload = this.proxiedOnBeforeUnload = ve.bind( this.onBeforeUnload, this );
	// Attach page show handlers
	if ( window.addEventListener ) {
		window.addEventListener( 'pageshow', ve.bind( this.onPageShow, this ), false );
	} else if ( window.attachEvent ) {
		window.attachEvent( 'pageshow', ve.bind( this.onPageShow, this ) );
	}
};

/**
 * Removes onbeforunload handler.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.tearDownBeforeUnloadHandler = function () {
	// Restore whatever previous onbeforeload hook existed
	window.onbeforeunload = this.onBeforeUnloadFallback;
};

/**
 * Responds to page show event.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.onPageShow = function () {
	// Re-add onbeforeunload handler
	window.onbeforeunload = this.proxiedOnBeforeUnload;
};

/**
 * Responds to before unload event.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.onBeforeUnload = function () {
	var fallbackResult,
		message,
		proxiedOnBeforeUnload = this.proxiedOnBeforeUnload;
	// Check if someone already set on onbeforeunload hook
	if ( this.onBeforeUnloadFallback ) {
		// Get the result of their onbeforeunload hook
		fallbackResult = this.onBeforeUnloadFallback();
	}
	// Check if their onbeforeunload hook returned something
	if ( fallbackResult !== undefined ) {
		// Exit here, returning their message
		message = fallbackResult;
	} else {
		// Override if submitting
		if ( this.submitting ) {
			return null;
		}
		// Check if there's been an edit
		if ( this.surface && this.surface.getModel().getHistory().length ) {
			// Return our message
			message = ve.msg( 'visualeditor-viewpage-savewarning' );
		}
	}
	// Unset the onbeforeunload handler so we don't break page caching in Firefox
	window.onbeforeunload = null;
	if ( message !== undefined ) {
		// ...but if the user chooses not to leave the page, we need to rebind it
		setTimeout( function () {
			window.onbeforeunload = proxiedOnBeforeUnload;
		}, 1 );
		return message;
	}
};

ve.init.mw.ViewPageTarget.prototype.reportProblem = function ( message ) {
	// Gather reporting information
	var now = new Date(),
		editedData = this.surface.getDocumentModel().getFullData(),
		report = {
			'title': this.pageName,
			'oldid': this.oldid,
			'timestamp': now.getTime() + 60000 * now.getTimezoneOffset(),
			'message': message,
			'diff': this.diffHtml,
			'originalHtml': this.originalHtml,
			'originalData': ve.dm.converter.getDataFromDom( $( '<div>' ).html( this.originalHtml )[0] ),
			'editedData': editedData,
			'editedHtml': ve.dm.converter.getDomFromData( editedData ).innerHTML
		};
	$.post( 'http://parsoid.wmflabs.org/_bugs/', { 'data': $.toJSON( report ) }, function () {}, 'text' );
};

/* Initialization */

ve.init.mw.targets.push( new ve.init.mw.ViewPageTarget() );
