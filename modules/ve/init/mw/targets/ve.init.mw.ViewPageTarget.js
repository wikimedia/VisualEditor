/*!
 * VisualEditor MediaWiki Initialization ViewPageTarget class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/*global mw, confirm, alert */

/**
 * Initialization MediaWiki view page target.
 *
 * @class
 * @extends ve.init.mw.Target
 *
 * @constructor
 */
ve.init.mw.ViewPageTarget = function VeInitMwViewPageTarget() {
	var currentUri = new mw.Uri( window.location.toString() );

	// Parent constructor
	ve.init.mw.Target.call(
		this, $( '#content' ), mw.config.get( 'wgRelevantPageName' ), currentUri.query.oldid
	);

	// Properties
	this.$document = null;
	this.$spinner = $( '<div class="ve-init-mw-viewPageTarget-loading"></div>' );
	this.toolbarCancelButton = null;
	this.toolbarSaveButton = null;
	this.saveDialogSaveButton = null;
	this.saveDialogReviewWrongButton = null;
	this.saveDialogReviewGoodButton = null;
	this.saveDialogReportButton = null;

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
	this.onBeforeUnloadFallback = null;
	this.onBeforeUnloadHandler = null;
	this.surface = null;
	this.active = false;
	this.edited = false;
	this.activating = false;
	this.deactivating = false;
	this.scrollTop = null;
	this.surfaceOptions = {
		'toolbars': {
			'top': {
				'float': !this.isMobileDevice,
				// HACK: The toolbar configuration isn't very extendable, so this is mostly
				// copy-pasted from ve.Surface except using mwLink for the link tool
				'tools': [
					{ 'name': 'history', 'items' : ['undo', 'redo'] },
					{ 'name': 'textStyle', 'items' : ['mwFormat'] },
					{ 'name': 'textStyle', 'items' : ['bold', 'italic', 'mwLink', 'clear'] },
					{ 'name': 'list', 'items' : ['number', 'bullet', 'outdent', 'indent'] }
				]
			}
		},
		'commands': ['bold', 'italic', 'mwLink', 'undo', 'redo', 'indent', 'outdent']
	};
	this.currentUri = currentUri;
	this.restoring = this.oldid !== mw.config.get( 'wgCurRevisionId' );
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
	this.tabLayout = 'replace';
	this.feedback = new mw.Feedback( {
		'title': new mw.Title( ve.msg( 'visualeditor-feedback-link' ) ),
		'bugsLink': new mw.Uri( 'https://bugzilla.wikimedia.org/enter_bug.cgi?product=VisualEditor&component=General' ),
		'bugsListLink': new mw.Uri( 'https://bugzilla.wikimedia.org/buglist.cgi?query_format=advanced&resolution=---&resolution=LATER&resolution=DUPLICATE&product=VisualEditor&list_id=166234' )
	} );

	// Events
	this.connect( this, {
		'load': 'onLoad',
		'save': 'onSave',
		'loadError': 'onLoadError',
		'saveError': 'onSaveError',
		'editConflict': 'onEditConflict',
		'showChanges': 'onShowChanges',
		'showChangesError': 'onShowChangesError',
		'serializeError': 'onSerializeError'
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
		if ( mw.config.get( 'wgVisualEditorConfig' ).enableSectionEditLinks ) {
			this.setupSectionEditLinks();
		}
		if ( this.isViewPage ) {
			if ( currentUri.query.veaction === 'edit' ) {
				this.activate();
			}
		}
	}
};

/* Inheritance */

ve.inheritClass( ve.init.mw.ViewPageTarget, ve.init.mw.Target );

/* Static Properties */

/**
 * Compatibility map used with jQuery.client to black-list incompatible browsers.
 *
 * @static
 * @property
 */
ve.init.mw.ViewPageTarget.compatibility = {
	// Left-to-right languages
	ltr: {
		msie: [['>=', 9]],
		firefox: [['>=', 11]],
		iceweasel: [['>=', 10]],
		safari: [['>=', 5]],
		chrome: [['>=', 19]],
		opera: false,
		netscape: false,
		blackberry: false
	},
	// Right-to-left languages
	rtl: {
		msie: [['>=', 9]],
		firefox: [['>=', 11]],
		iceweasel: [['>=', 10]],
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
		<div class="ve-init-mw-viewPageTarget-saveDialog-slide ve-init-mw-viewPageTarget-saveDialog-slide-review">\
			<div class="ve-init-mw-viewPageTarget-saveDialog-viewer"></div>\
			<div class="ve-init-mw-viewPageTarget-saveDialog-actions">\
				<div class="ve-init-mw-viewPageTarget-saveDialog-working"></div>\
			</div>\
			<div style="clear: both;"></div>\
		</div>\
		<div class="ve-init-mw-viewPageTarget-saveDialog-slide ve-init-mw-viewPageTarget-saveDialog-slide-report">\
			<div class="ve-init-mw-viewPageTarget-saveDialog-report">\
				<textarea name="problem" class="ve-init-mw-viewPageTarget-saveDialog-problem"\
					id="ve-init-mw-viewPageTarget-saveDialog-problem" type="text"\
					rows="4"></textarea>\
			</div>\
			<div class="ve-init-mw-viewPageTarget-saveDialog-actions">\
				<div class="ve-init-mw-viewPageTarget-saveDialog-working"></div>\
			</div>\
			<div style="clear: both;"></div>\
			<div class="ve-init-mw-viewPageTarget-saveDialog-foot">\
				<p class="ve-init-mw-viewPageTarget-saveDialog-report-notice"></p>\
			</div>\
		</div>\
		<div class="ve-init-mw-viewPageTarget-saveDialog-slide ve-init-mw-viewPageTarget-saveDialog-slide-save">\
			<div class="ve-init-mw-viewPageTarget-saveDialog-summary">\
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
 * Switch to edit mode.
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
 * Switch to view mode.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.deactivate = function ( override ) {
	if ( override || ( this.active && !this.deactivating ) ) {
		if (
			override ||
			!this.edited ||
			confirm( ve.msg( 'visualeditor-viewpage-savewarning' ) )
		) {
			this.deactivating = true;
			// User interface changes
			this.restoreSkinTabs();
			this.restoreSiteNotice();
			this.hideSpinner();

			if ( this.toolbarCancelButton ) {
				// If deactivate is called before a successful load, then
				// setupToolbarButtons has not been called yet and as such tearDownToolbarButtons
				// would throw an error when trying call methods on the button property (bug 46456)
				this.tearDownToolbarButtons();
				this.detachToolbarButtons();
			}

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
 * Handle successful DOM load event.
 *
 * @method
 * @param {HTMLDocument} doc Parsed DOM from server
 */
ve.init.mw.ViewPageTarget.prototype.onLoad = function ( doc ) {
	if ( this.activating ) {
		this.edited = false;
		this.doc = doc;
		this.setUpSurface( doc );
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
	}
};

/**
 * Handle failed DOM load event.
 *
 * @method
 * @param {Object} data HTTP Response object
 * @param {string} status Text status message
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
 * Handle successful DOM save event.
 *
 * @method
 * @param {HTMLElement} html Rendered HTML from server
 * @param {number} [newid] New revision id, undefined if unchanged
 */
ve.init.mw.ViewPageTarget.prototype.onSave = function ( html, newid ) {
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
		if ( newid !== undefined ) {
			this.oldid = newid;
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
 * Handle failed DOM save event.
 *
 * @method
 * @param {Object} jqXHR
 * @param {string} status Text status message
 * @param {Mixed} error Thrown exception or HTTP error string
 */
ve.init.mw.ViewPageTarget.prototype.onSaveError = function ( jqXHR, status ) {
	// TODO: Don't use alert.
	alert( ve.msg( 'visualeditor-saveerror', status ) );
	this.saveDialogSaveButton.setDisabled( false );
	this.$saveDialogLoadingIcon.hide();
};

/**
 * Handle Show changes event.
 *
 * @method
 * @param {string} diffHtml
 */
ve.init.mw.ViewPageTarget.prototype.onShowChanges = function ( diffHtml ) {
	// Invalidate the diff on next change
	this.surface.getModel().connect( this, { 'transact': 'onSurfaceModelTransact' } );

	// Store the diff for reporting purposes
	this.diffHtml = diffHtml;

	mw.loader.using( 'mediawiki.action.history.diff', ve.bind( function () {
		this.$saveDialog
			.find( '.ve-init-mw-viewPageTarget-saveDialog-viewer' )
				.empty().append( diffHtml );

		this.$saveDialogLoadingIcon.hide();
		this.saveDialogReviewGoodButton.setDisabled( false );
		this.saveDialogReviewWrongButton.setDisabled( false );

	}, this ), ve.bind( function () {
		this.onSaveError( null, 'Module load failed' );
	}, this ) );
};

/**
 * Handle failed show changes event.
 *
 * @method
 * @param {Object} jqXHR
 * @param {string} status Text status message
 * @param {Mixed} error Thrown exception or HTTP error string
 */
ve.init.mw.ViewPageTarget.prototype.onShowChangesError = function ( jqXHR, status ) {
	alert( ve.msg( 'visualeditor-differror', status ) );
	this.$saveDialogLoadingIcon.hide();
	this.saveDialogReviewWrongButton.setDisabled( false );
};


/**
 * Called if a call to target.serialize() failed.
 *
 * @method
 * @param {jqXHR|null} jqXHR
 * @param {string} status Text status message
 * @param {Mixed|null} error HTTP status text
 */
ve.init.mw.ViewPageTarget.prototype.onSerializeError = function ( jqXHR, status ) {
	alert( ve.msg( 'visualeditor-serializeerror', status ) );
	this.$saveDialogLoadingIcon.hide();
	this.saveDialogReviewGoodButton.setDisabled( false );
	this.saveDialogReviewWrongButton.setDisabled( false );
};

/**
 * Handle edit conflict event.
 *
 * TODO: Don't use an operating system confirm box. Parsing may take quite some time and we should
 * be showing the user some sort of progress indicator. Ideally this would be integrated into the
 * save dialog.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.onEditConflict = function () {
	var doc = this.surface.getDocumentModel();
	if ( confirm( ve.msg( 'visualeditor-editconflict', status ) ) ) {
		// Get Wikitext from the DOM, and setup a submit call when it's done
		this.serialize(
			ve.dm.converter.getDomFromData( doc.getFullData(), doc.getStore(), doc.getInternalList() ),
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
 * Handle clicks on the edit tab.
 *
 * @method
 * @param {jQuery.Event} e Mouse click event
 */
ve.init.mw.ViewPageTarget.prototype.onEditTabClick = function ( e ) {
	this.activate();
	// Prevent the edit tab's normal behavior
	e.preventDefault();
};

/**
 * Handle clicks on a section edit link.
 *
 * @method
 * @param {jQuery.Event} e Mouse click event
 */
ve.init.mw.ViewPageTarget.prototype.onEditSectionLinkClick = function ( e ) {
	this.saveEditSection( $( e.target ).closest( 'h1, h2, h3, h4, h5, h6' ).get( 0 ) );
	this.activate();
	// Prevent the edit tab's normal behavior
	e.preventDefault();
};

/**
 * Handle clicks on the view tab.
 *
 * @method
 * @param {jQuery.Event} e Mouse click event
 */
ve.init.mw.ViewPageTarget.prototype.onViewTabClick = function ( e ) {
	if ( this.active ) {
		this.deactivate();
		// Prevent the edit tab's normal behavior
		e.preventDefault();
	} else if ( this.activating ) {
		this.deactivate( true );
		this.activating = false;
		e.preventDefault();
	}
};

/**
 * Handle clicks on the save button in the toolbar.
 *
 * @method
 * @param {jQuery.Event} e Mouse click event
 */
ve.init.mw.ViewPageTarget.prototype.onToolbarSaveButtonClick = function () {
	if ( this.edited || this.restoring ) {
		this.showSaveDialog();
	}
};

/**
 * Handle clicks on the save button in the toolbar.
 *
 * @method
 * @param {jQuery.Event} e Mouse click event
 */
ve.init.mw.ViewPageTarget.prototype.onToolbarCancelButtonClick = function () {
	this.deactivate();
};

/**
 * Handle clicks on the edit notices tool in the toolbar.
 *
 * @method
 * @param {jQuery.Event} e Mouse click event
 */
ve.init.mw.ViewPageTarget.prototype.onToolbarEditNoticesToolClick = function () {
	this.$toolbarEditNotices.fadeToggle( 'fast' );
	this.$document.focus();
};

/**
 * Handle clicks on the feedback tool in the toolbar.
 *
 * @method
 * @param {jQuery.Event} e Mouse click event
 */
ve.init.mw.ViewPageTarget.prototype.onToolbarFeedbackToolClick = function () {
	this.$toolbarEditNotices.fadeOut( 'fast' );
	this.feedback.launch();
};

/**
 * Handle the first transaction in the surface model.
 *
 * This handler is removed the first time it's used, but added each time the surface is setup.
 *
 * @method
 * @param {ve.dm.Transaction} tx Processed transaction
 */
ve.init.mw.ViewPageTarget.prototype.onSurfaceModelTransact = function () {
	// Clear the diff
	this.$saveDialog
		.find( '.ve-init-mw-viewPageTarget-saveDialog-slide-review .ve-init-mw-viewPageTarget-saveDialog-viewer' )
			.empty();

	this.surface.getModel().disconnect( this, { 'transact': 'onSurfaceModelTransact' } );
};

/**
 * Handle history events in the surface model.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.onSurfaceModelHistory = function () {
	this.edited = this.surface.getModel().hasPastState();
	// Disable the save button if we have no history
	this.toolbarSaveButton.setDisabled( !this.edited );
};

/**
 * Handle clicks on the save button in the save dialog.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.onSaveDialogSaveButtonClick = function () {
	var doc = this.surface.getDocumentModel();
	this.saveDialogSaveButton.setDisabled( true );
	this.$saveDialogLoadingIcon.show();
	this.save(
		ve.dm.converter.getDomFromData( doc.getFullData(), doc.getStore(), doc.getInternalList() ),
		this.getSaveOptions()
	);
};

/**
 * Handle clicks on the review "Wrong" button in the save dialog.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.onSaveDialogReviewWrongButtonClick = function () {
	this.swapSaveDialog( 'report' );
};

/**
 * Handle clicks on the review "Good" button in the save dialog.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.onSaveDialogReviewGoodButtonClick = function () {
	this.swapSaveDialog( 'save' );
};

/**
 * Handle clicks on the report a problem button in the save dialog.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.onSaveDialogReportButtonClick = function () {
	this.reportProblem( $( '#ve-init-mw-viewPageTarget-saveDialog-problem' ).val() );
	this.resetSaveDialog();
	this.hideSaveDialog();
	mw.notify( ve.msg( 'visualeditor-notification-reported' ) );
};

/**
 * Get save options from the save dialog form.
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
 * Handle clicks on the close button in the save dialog.
 *
 * @method
 * @param {jQuery.Event} e Mouse click event
 */
ve.init.mw.ViewPageTarget.prototype.onSaveDialogCloseButtonClick = function () {
	this.hideSaveDialog();
};

/**
 * Handle clicks on the previous view button in the save dialog.
 *
 * @method
 * @param {jQuery.Event} e Mouse click event
 */
ve.init.mw.ViewPageTarget.prototype.onSaveDialogPrevButtonClick = function () {
	// Hard code "review" for now.
	// Although we have more than 2 slides, slide "report" and "save" are both
	// branches of "review". Later this could terminate the path based on an
	// array or object, or keep a .history array even...
	this.swapSaveDialog( 'review' );
};

/**
 * Get a list of edit notices.
 *
 * @method
 * @returns {string[]} HTML strings for each edit notice
 */
ve.init.mw.ViewPageTarget.prototype.setupToolbarEditNotices = function () {
	var key;
	this.$toolbarEditNotices.empty();
	for ( key in this.editNotices ) {
		this.$toolbarEditNotices.append( this.editNotices[key] );
	}
};

/**
 * Switch to editing mode.
 *
 * @method
 * @param {HTMLDocument} doc HTML DOM to edit
 */
ve.init.mw.ViewPageTarget.prototype.setUpSurface = function ( doc ) {
	var $contentText = $( '#mw-content-text' );

	// Initialize surface
	this.surface = new ve.Surface( this, doc, this.surfaceOptions );
	this.surface.getContext().hide();
	this.$document = this.surface.$.find( '.ve-ce-documentNode' );
	this.surface.getModel().connect( this, { 'transact': 'onSurfaceModelTransact' } );
	this.surface.getModel().connect( this, { 'history': 'onSurfaceModelHistory' } );
	// Transplant the toolbar
	this.attachToolbar();
	this.transformPageTitle();
	// Update UI
	this.hidePageContent();
	this.hideSpinner();
	this.active = true;
	this.$document.attr( {
		'lang': $contentText.attr( 'lang' ),
		'dir': $contentText.attr( 'dir' )
	} );
};

/**
 * Switch to viewing mode.
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
 * Modify tabs in the skin to support in-place editing.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.setupSkinTabs = function () {
	var action, pTabsId, $caSource, $caEdit, $caEditLink, caVeEdit, caVeEditSource, caVeEditNextnode, uriClone;
	$caEdit = $( '#ca-edit' );
	$caEditLink = $caEdit.find( 'a' );
	$caSource = $( '#ca-viewsource' );
	caVeEditNextnode = $caEdit.next().get( 0 );

	if ( !$caEdit.length || $caSource.length ) {
		// If there is no edit tab or a view-source tab,
		// the user doesn't have permission to edit.
		return;
	}

	action = this.pageExists ? 'edit' : 'create';
	pTabsId = $( '#p-views' ).length ? 'p-views' : 'p-cactions';

	// Add independent "VisualEditor"  tab (#ca-ve-edit).
	if ( this.tabLayout === 'add' ) {

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

	// Replace "Edit" tab with a veEditUri version, add "Edit source" tab.
	} else {
		// Create "Edit source" link.
		// Re-create instead of convert ca-edit since we don't want to copy over accesskey etc.
		caVeEditSource = mw.util.addPortletLink(
			pTabsId,
			// Use original href to preserve oldid etc. (bug 38125)
			$caEditLink.attr( 'href' ),
			ve.msg( 'visualeditor-ca-editsource' ),
			'ca-editsource',
			ve.msg( 'tooltip-ca-editsource' ),
			ve.msg( 'accesskey-ca-editsource' ),
			caVeEditNextnode
		);
		// Copy over classes (e.g. 'selected')
		$( caVeEditSource ).addClass( $caEdit.attr( 'class' ) );

		// Create "Edit" tab.
		$caEdit.remove();
		caVeEdit = mw.util.addPortletLink(
			pTabsId,
			// Use url instead of '#'.
			// So that 1) one can always open it in a new tab, even when
			// onEditTabClick is bound.
			// 2) when onEditTabClick is not bound (!isViewPage) it will
			// just work.
			this.veEditUri,
			$caEditLink.text(),
			$caEdit.attr( 'id' ),
			$caEditLink.attr( 'title' ),
			$caEditLink.attr( 'accesskey' ),
			caVeEditSource
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
 * Modify page content to make section edit links activate the editor.
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
 * Add content and event bindings to toolbar buttons.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.setupToolbarButtons = function () {
	var editNoticeCount = ve.getObjectKeys( this.editNotices ).length;

	this.toolbarCancelButton = new ve.ui.ButtonWidget( { 'label': ve.msg( 'cancel' ) } );
	this.toolbarSaveButton = new ve.ui.ButtonWidget( {
		'label': ve.msg( 'visualeditor-toolbar-savedialog' ),
		'flags': ['constructive'],
		'disabled': !this.restoring
	} );

	this.toolbarCancelButton.connect( this, { 'click': 'onToolbarCancelButtonClick' } );
	this.toolbarSaveButton.connect( this, { 'click': 'onToolbarSaveButtonClick' } );

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
 * Remove content and event bindings from toolbar buttons.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.tearDownToolbarButtons = function () {
	this.toolbarCancelButton.disconnect( this );
	this.toolbarSaveButton.disconnect( this );
	this.$toolbarEditNoticesTool.empty().off( 'click' );
	this.$toolbarFeedbackTool.empty().off( 'click' );
};

/**
 * Add the save button to the user interface.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.attachToolbarButtons = function () {
	var $target = $( '.ve-ui-toolbar .ve-ui-actions' );
	$target.append( this.$toolbarFeedbackTool );
	if ( !ve.isEmptyObject( this.editNotices ) ) {
		$target.append( this.$toolbarEditNoticesTool );
	}
	$target.append( this.toolbarCancelButton.$, this.toolbarSaveButton.$ );
};

/**
 * Remove the save button from the user interface.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.detachToolbarButtons = function () {
	this.toolbarCancelButton.$.detach();
	this.toolbarSaveButton.$.detach();
	this.$toolbarEditNoticesTool.detach();
	this.$toolbarFeedbackTool.detach();
};

/**
 * Get a template for the save dialog.
 *
 * The result of this function depends on an API call, so the result it provided asynchronously.
 * The template will be wrapped in a plain `<div>` jQuery collection.
 *
 * @method
 * @param {Function} callback
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
 * Add content and event bindings to the save dialog.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.setupSaveDialog = function () {
	var viewPage = this;

	this.saveDialogSaveButton = new ve.ui.ButtonWidget( {
		'label': ve.msg(
			'visualeditor-savedialog-label-' + ( viewPage.restoring ? 'restore' : 'save' )
		),
		'flags': ['constructive']
	} );
	this.saveDialogSaveButton.connect( this, { 'click': 'onSaveDialogSaveButtonClick' } );

	this.saveDialogReviewWrongButton = new ve.ui.ButtonWidget( {
		'label': ve.msg( 'visualeditor-savedialog-label-review-wrong' ),
		'flags': ['primary']
	} );
	this.saveDialogReviewWrongButton.connect(
		this, { 'click': 'onSaveDialogReviewWrongButtonClick' }
	);

	this.saveDialogReviewGoodButton = new ve.ui.ButtonWidget( {
		'label': ve.msg( 'visualeditor-savedialog-label-review-good' ),
		'flags': ['constructive']
	} );
	this.saveDialogReviewGoodButton.connect(
		this, { 'click': 'onSaveDialogReviewGoodButtonClick' }
	);

	this.saveDialogReportButton = new ve.ui.ButtonWidget( {
		'label': ve.msg( 'visualeditor-savedialog-label-report' ),
		'flags': ['constructive']
	} );
	this.saveDialogReportButton.connect( this, { 'click': 'onSaveDialogReportButtonClick' } );

	this.getSaveDialogHtml( function ( $wrap ) {
		viewPage.$saveDialog
			// Must not use replaceWith because that can't be used on fragement roots,
			// plus, we want to preserve the reference and class names of the wrapper.
			.empty().append( $wrap.contents() )
			// Attach buttons
			.find( '.ve-init-mw-viewPageTarget-saveDialog-slide-save' )
				.find( '.ve-init-mw-viewPageTarget-saveDialog-actions' )
					.prepend( viewPage.saveDialogSaveButton.$ )
					.end()
			.end()
			.find( '.ve-init-mw-viewPageTarget-saveDialog-slide-review' )
				.find( '.ve-init-mw-viewPageTarget-saveDialog-actions' )
					.prepend(
						viewPage.saveDialogReviewGoodButton.$,
						viewPage.saveDialogReviewWrongButton.$
					)
					.end()
			.end()
			.find( '.ve-init-mw-viewPageTarget-saveDialog-slide-report' )
				.find( '.ve-init-mw-viewPageTarget-saveDialog-actions' )
					.prepend( viewPage.saveDialogReportButton.$ )
					.end()
			.end()
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
						} );
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
			.find( '#ve-init-mw-viewPageTarget-saveDialog-problem' )
				.attr( {
					'placeholder': ve.msg( 'visualeditor-problem' )
				} )
				.placeholder()
				.on( {
					'focus': function () {
						$(this).parent().addClass(
							've-init-mw-viewPageTarget-saveDialog-report-focused'
						);
					},
					'blur': function () {
						$(this).parent().removeClass(
							've-init-mw-viewPageTarget-saveDialog-report-focused'
						);
					}
				} )
				.end()
			.find( '.ve-init-mw-viewPageTarget-saveDialog-report-notice' )
				.html( ve.init.platform.getParsedMessage( 'visualeditor-report-notice' ) )
				.end()
			.find( '.ve-init-mw-viewPageTarget-saveDialog-license' )
				.html( ve.init.platform.getParsedMessage( 'copyrightwarning' ) );
		// Get reference to loading icon
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
 * Show the save dialog.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.showSaveDialog = function () {
	var viewPage = this;

	viewPage.surface.disable();

	viewPage.$toolbarEditNotices.fadeOut( 'fast' );

	viewPage.swapSaveDialog( 'review' );

	viewPage.$saveDialog.fadeIn( 'fast', function () {
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
 * Hide the save dialog
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

	if ( this.surface ) {
		this.surface.enable();
	}
};

/**
 * Reset the fields of the save dialog.
 *
 * TODO: Maybe call this more cleverly only when the document changes, so that closing and
 * re-opening the saveDialog doesn't remove the user input and the diff cache.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.resetSaveDialog = function () {
	this.$saveDialog
		.find( '#ve-init-mw-viewPageTarget-saveDialog-editSummary' )
			.val( '' )
			.end()
		.find( '#ve-init-mw-viewPageTarget-saveDialog-problem' )
			.val( '' )
			.end()
		.find( '#ve-init-mw-viewPageTarget-saveDialog-minorEdit' )
			.prop( 'checked', false )
			.end()
		// Clear the diff
		.find( '.ve-init-mw-viewPageTarget-saveDialog-viewer' )
			.empty();
};

/**
 * Swap state in the save dialog (forwards or backwards).
 *
 * @method
 * @param {string} slide One of 'review', 'report' or 'save'
 * @return {jQuery} The now active slide.
 * @throws {Error} Unknown saveDialog slide
 */
ve.init.mw.ViewPageTarget.prototype.swapSaveDialog = function ( slide ) {
	var $slide, $viewer, doc = this.surface.getDocumentModel();
	if ( ve.indexOf( slide, [ 'review', 'report', 'save'] ) === -1 ) {
		throw new Error( 'Unknown saveDialog slide: ' + slide );
	}

	$slide = this.$saveDialog.find( '.ve-init-mw-viewPageTarget-saveDialog-slide-' + slide );

	this.$saveDialog
		// Hide prev button on the first slide
		.find( '.ve-init-mw-viewPageTarget-saveDialog-prevButton' )
			.toggle( slide !== 'review' )
			.end()
		// Update title
		// Give grep a chance to find the usages:
		// visualeditor-savedialog-title-review, visualeditor-savedialog-title-report,
		// visualeditor-savedialog-title-save
		.find( '.ve-init-mw-viewPageTarget-saveDialog-title' )
			.text( ve.msg( 'visualeditor-savedialog-title-' + slide ) )
			.end()
		// Hide other slides
		.find( '.ve-init-mw-viewPageTarget-saveDialog-slide' )
			.not( $slide )
				.hide();

	if ( slide === 'review' ) {
		$viewer = $slide.find( '.ve-init-mw-viewPageTarget-saveDialog-viewer' );
		if ( !$viewer.find( 'table, pre' ).length ) {
			this.saveDialogReviewGoodButton.setDisabled( true );
			this.saveDialogReviewWrongButton.setDisabled( true );
			this.$saveDialogLoadingIcon.show();
			if ( this.pageExists ) {
				// Has no callback, handled via viewPage.onShowChanges
				this.showChanges(
					ve.dm.converter.getDomFromData( doc.getFullData(), doc.getStore(), doc.getInternalList() )
				);
			} else {
				this.serialize(
					ve.dm.converter.getDomFromData( doc.getFullData(), doc.getStore(), doc.getInternalList() ),
					function ( wikitext ) {
						$viewer.empty().append( $( '<pre>' ).text( wikitext ) );

						this.saveDialogReviewGoodButton.setDisabled( false );
						this.saveDialogReviewWrongButton.setDisabled( false );
						this.$saveDialogLoadingIcon.hide();
					}
				);
			}
		}
		this.$saveDialog.css( 'width', '100%' );
	} else {
		this.$saveDialog.css( 'width', '' );
	}

	// Show the target slide
	$slide.show();

	if ( slide === 'save' || slide === 'report' ) {
		setTimeout( function () {
			$slide.find( 'textarea' ).eq( 0 ).focus();
		} );
	}

	return $slide;
};

/**
 * Add the save dialog to the user interface.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.attachSaveDialog = function () {
	this.$toolbarWrapper.find( '.ve-ui-toolbar' ).append( this.$saveDialog );
};

/**
 * Remove the save dialog from the user interface.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.detachSaveDialog = function () {
	this.$saveDialog.detach();
};

/**
 * Remember the window's scroll position.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.saveScrollPosition = function () {
	this.scrollTop = $( window ).scrollTop();
};

/**
 * Restore the window's scroll position.
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
 * Show the loading spinner.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.showSpinner = function () {
	$( '#firstHeading' ).prepend( this.$spinner );
};

/**
 * Hide the loading spinner.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.hideSpinner = function () {
	this.$spinner.detach();
};

/**
 * Show the page content.
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
 * Mute the page content.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.mutePageContent = function () {
	$( '#bodyContent > :visible:not(#siteSub, #contentSub)' )
		.addClass( 've-init-mw-viewPageTarget-content' )
		.fadeTo( 'fast', 0.6 );
};

/**
 * Hide the page content.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.hidePageContent = function () {
	$( '#bodyContent > :visible:not(#siteSub, #contentSub)' )
		.addClass( 've-init-mw-viewPageTarget-content' )
		.hide();
};

/**
 * Show the table of contents in the view mode.
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
 * Hide the table of contents in the view mode.
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
 * Show the toolbar.
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
 * Hide the toolbar.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.detachToolbar = function () {
	$( '.ve-ui-toolbar' ).slideUp( 'fast', function () {
		$(this).parent().remove();
	} );
};

/**
 * Enable the toolbar save button.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.transformPageTitle = function () {
	$( '#firstHeading' ).addClass( 've-init-mw-viewPageTarget-pageTitle' );
};

/**
 * Enable the toolbar save button.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.mutePageTitle = function () {
	$( '#firstHeading, #siteSub:visible, #contentSub:visible' ).fadeTo( 'fast', 0.6 );
};

/**
 * Disable the toolbar save button.
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
 * Modify page tabs to show that editing is taking place.
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
 * Modify page tabs to show that viewing is taking place.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.restoreSkinTabs = function () {
	$( $( '#p-views' ).length ? '#p-views' : '#p-cactions' )
		.find( 'li.selected' ).removeClass( 'selected' );
	$( '#ca-view' ).addClass( 'selected' );
};

/**
 * Hide site notice on page if present.
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
 * Replace the page content with new HTML.
 *
 * @method
 * @param {HTMLElement} html Rendered HTML from server
 */
ve.init.mw.ViewPageTarget.prototype.replacePageContent = function ( html ) {
	$( '#mw-content-text' ).html( html );
};

/**
 * Get the numeric index of a section in the page.
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
 * Get the numeric index of a section in the page.
 *
 * @method
 * @param {HTMLElement} heading Heading element of section
 */
ve.init.mw.ViewPageTarget.prototype.saveEditSection = function ( heading ) {
	this.section = this.getEditSection( heading );
};

/**
 * Move the cursor in the editor to a given section.
 *
 * @method
 * @param {number} section Section to move cursor to
 */
ve.init.mw.ViewPageTarget.prototype.restoreEditSection = function () {
	if ( this.section !== null ) {
		var offset,
			surfaceView = this.surface.getView(),
			surfaceModel = surfaceView.getModel();
		this.$document.find( 'h1, h2, h3, h4, h5, h6' ).eq( this.section - 1 ).each( function () {
			var headingNode = $(this).data( 'view' );
			if ( headingNode ) {
				offset = surfaceModel.getDocument().data.getNearestContentOffset(
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
 * Add onbeforunload handler.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.setupBeforeUnloadHandler = function () {
	// Remember any already set on before unload handler
	this.onBeforeUnloadFallback = window.onbeforeunload;
	// Attach before unload handler
	window.onbeforeunload = this.onBeforeUnloadHandler = ve.bind( this.onBeforeUnload, this );
	// Attach page show handlers
	if ( window.addEventListener ) {
		window.addEventListener( 'pageshow', ve.bind( this.onPageShow, this ), false );
	} else if ( window.attachEvent ) {
		window.attachEvent( 'pageshow', ve.bind( this.onPageShow, this ) );
	}
};

/**
 * Remove onbeforunload handler.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.tearDownBeforeUnloadHandler = function () {
	// Restore whatever previous onbeforeload hook existed
	window.onbeforeunload = this.onBeforeUnloadFallback;
};

/**
 * Handle page show event.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.onPageShow = function () {
	// Re-add onbeforeunload handler
	window.onbeforeunload = this.onBeforeUnloadHandler;
};

/**
 * Handle before unload event.
 *
 * @method
 */
ve.init.mw.ViewPageTarget.prototype.onBeforeUnload = function () {
	var fallbackResult,
		message,
		onBeforeUnloadHandler = this.onBeforeUnloadHandler;
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
		if ( this.surface && this.edited ) {
			// Return our message
			message = ve.msg( 'visualeditor-viewpage-savewarning' );
		}
	}
	// Unset the onbeforeunload handler so we don't break page caching in Firefox
	window.onbeforeunload = null;
	if ( message !== undefined ) {
		// ...but if the user chooses not to leave the page, we need to rebind it
		setTimeout( function () {
			window.onbeforeunload = onBeforeUnloadHandler;
		} );
		return message;
	}
};

/* Initialization */

ve.init.mw.targets.push( new ve.init.mw.ViewPageTarget() );
