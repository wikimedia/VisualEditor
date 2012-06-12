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
	ve.init.Target.call( this, mw.config.get( 'wgPageName' ) );

	// Properties
	this.$content = $( '#content' );
	this.$view = this.$content.find( '#mw-content-text, #bodyContent' );
	this.$heading = $( '#firstHeading' );
	this.$surface = $( '<div class="ve-surface"></div>' );
	this.$toolbar = null;
	this.surface = null;
	this.active = false;
	this.edited = false;
	this.proxiedOnSurfaceModelTransact = ve.proxy( this.onSurfaceModelTransact, this );
	this.surfaceOptions = {
		'toolbars': {
			'top': {
				// If mobile device, float false
				'float': !this.isMobileDevice,
				// Toolbar modes
				'modes': ['wikitext']
			}
		}
	};

	// Initialization
	if ( mw.config.get('wgCanonicalNamespace') === 'VisualEditor' ) {
		// Clicking the edit tab is the only way any other code gets run, and this sets that up
		this.setupTabs();
	}
};

/* Static Members */

/*jshint multistr: true*/
ve.init.ViewPageTarget.saveDialogTemplate = '\
<div class="es-inspector ve-init-viewPageTarget-saveDialog">\
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
				for="ve-init-viewPageTarget-saveDialog-minorEdit">This is a minor edit</label>\
			<div style="clear:both"></div>\
			<input type="checkbox" name="watchList" \
				id="ve-init-viewPageTarget-saveDialog-watchList">\
			<label class="ve-init-viewPageTarget-saveDialog-watchList-label" \
				for="ve-init-viewPageTarget-saveDialog-watchList">Watch this page</label>\
		</div>\
		<div class="ve-init-viewPageTarget-button ve-init-viewPageTarget-saveDialog-saveButton">\
			<span class="ve-init-viewPageTarget-saveDialog-saveButton-label"></span>\
			<div class="ve-init-viewPageTarget-saveDialog-saveButton-icon"></div>\
		</div>\
		<div style="clear:both"></div>\
	</div>\
	<div class="ve-init-viewPageTarget-saveDialog-foot">\
		<p class="ve-init-viewPageTarget-saveDialog-license"></p>\
	</div>\
</div>';

/* Methods */

/**
 * ...
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.onEditTabClick = function( e ) {
	// Ignore multiple clicks while editor is active
	if ( !this.active ) {
		// UI updates
		this.setSelectedTab( 'ca-edit' );
		this.showSpinner();
		// Asynchronous initialization - load ve modules at the same time as the content
		this.load( ve.proxy( this.onLoad, this ) );
	}
	// Prevent the edit tab's normal behavior
	e.preventDefault();
	return false;
};

/**
 * ...
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.onViewTabClick = function( e ) {
	// Don't do anything special unless we are in editing mode
	if ( this.active ) {
		if (
			!this.surface.getModel().getHistory().length ||
			confirm( 'Are you sure you want to go back to view mode without saving first?' )
		) {
			this.tearDownSurface();
		}
		// Prevent the edit tab's normal behavior
		e.preventDefault();
		return false;
	}
};

/**
 * ...
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.onSaveDialogSaveButtonClick = function( e ) {
	this.showSpinner();
	// Save
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
 * ...
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.onSurfaceModelTransact = function() {
	if ( !this.edited ) {
		this.edited = true;
		this.$toolbar.find( '.ve-init-viewPageTarget-saveButton ' )
			.removeClass( 've-init-viewPageTarget-button-disabled' );
		this.surface.getModel().removeListener( 'transact', this.proxiedOnSurfaceModelTransact );
	}
};

/**
 * ...
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.onSaveButtonClick = function( e ) {
	if ( this.edited ) {
		this.$dialog.fadeIn( 'fast' );
		this.$dialog.find( 'input:first' ).focus();
	}
};

/**
 * ...
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.onSaveDialogCloseButtonClick = function( e ) {
	this.$dialog.fadeOut( 'fast' );
	this.$surface.find( '.ve-ce-documentNode' ).focus();
};

/**
 * ...
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.onLoad = function( error, dom ) {
	if ( error ) {
		// TODO: Error handling in the UI
	} else {
		this.edited = false;
		this.setUpSurface( dom );
		this.$surface.find( '.ve-ce-documentNode' ).focus();
	}
};

/**
 * ...
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.onSave = function( error, content ) {
	if ( error ) {
		// TODO: Handle error in UI
	} else {
		// Hide the save dialog
		this.$dialog.fadeOut();
		// Refresh page with changed content
		this.$content.find( '#mw-content-text' ).html( content );
		// Restore the page to how it used to be
		this.tearDownSurface();
	}
};

/**
 * ...
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.setUpSurface = function( dom ) {
	// Initialize surface
	this.$surface.appendTo( this.$content );
	this.surface = new ve.Surface( this.$surface, dom, this.surfaceOptions );
	this.surface.getModel().on( 'transact', this.proxiedOnSurfaceModelTransact );
	// Transplant the toolbar
	this.$toolbar = this.$surface.find( '.es-toolbar-wrapper' );
	this.$heading
		.before( this.$toolbar )
		.addClass( 've-init-viewPageTarget-pageTitle' )
		.css( { 'margin-top': this.$toolbar.outerHeight(), 'opacity': 0.5 } );
	// Update UI
	this.$view.hide();
	this.$spinner.remove();
	this.$dialog = $( ve.init.ViewPageTarget.saveDialogTemplate );
	// Add save and close buttons
	this.$toolbar
		.find( '.es-modes' )
			.append(
				$( '<div></div>' )
					.addClass(
						've-init-viewPageTarget-button ' +
						've-init-viewPageTarget-button-disabled ' +
						've-init-viewPageTarget-saveButton'
					)
					.append(
						$( '<span class="ve-init-viewPageTarget-saveButton-label"></span>' )
							.text( mw.msg( 'savearticle' ) )
					)
					.append( $( '<span class="ve-init-viewPageTarget-saveButton-icon"></span>' ) )
					.mousedown( function( e ) {
						e.preventDefault();
						return false;
					} )
					.click( ve.proxy( this.onSaveButtonClick, this ) )
			);
	// Set up save dialog
	this.$dialog
		.find( '.ve-init-viewPageTarget-saveDialog-title' )
			.text( mw.msg( 'tooltip-save' ) )
			.end()
		.find( '.ve-init-viewPageTarget-saveDialog-closeButton' )
			.click( ve.proxy( this.onSaveDialogCloseButtonClick, this ) )
			.end()
		.find( '.ve-init-viewPageTarget-saveDialog-editSummary-label' )
			.text( mw.msg( 'summary' ) )
			.end()
		.find( '.ve-init-viewPageTarget-saveDialog-minorEdit-label' )
			.text( mw.msg( 'minoredit' ) )
			.end()
		.find( '.ve-init-viewPageTarget-saveDialog-watchList' )
			.prop( 'checked', ve.config.isPageWatched )
			.end()
		.find( '.ve-init-viewPageTarget-saveDialog-watchList-label' )
			.text( mw.msg( 'watchthis' ) )
			.end()
		.find( '.ve-init-viewPageTarget-saveDialog-saveButton' )
			.click( ve.proxy( this.onSaveDialogSaveButtonClick, this ) )
			.end()
		.find( '.ve-init-viewPageTarget-saveDialog-saveButton-label' )
			.text( mw.msg( 'savearticle' ) )
			.end()
		.find( '.ve-init-viewPageTarget-saveDialog-license' )
			.html(
				"By editing this page, you agree to irrevocably release your \
				contributions under the CC-By-SA 3.0 License.  If you don't want your \
				writing to be editied  mercilessly and redistrubuted at will, then \
				don't submit it here.<br /><br />You  are also confirming that you \
				wrote this yourself, or copied it from a public domain or similar free \
				resource.  See Project:Copyright for full details of the  licenses \
				used on this site.\
				<b>DO NOT SUBMIT COPYRIGHTED WORK WITHOUT PERMISSION!</b>"
			)
			.end()
		.insertAfter( this.$toolbar.find( '.ve-init-viewPageTarget-saveButton' ) );
	this.active = true;
};

ve.init.ViewPageTarget.prototype.tearDownSurface = function( content ) {
	// Reset tabs
	this.setSelectedTab( 'ca-view' );
	// Update UI
	this.$surface.empty().detach();
	this.$toolbar.remove();
	this.$spinner.remove();
	this.$view.show().fadeTo( 'fast', 1 );
	this.$heading.css( { 'margin-top': 'auto', 'opacity': 1 } );
	setTimeout( ve.proxy( function() {
		$(this).removeClass( 've-init-viewPageTarget-pageTitle' );
	}, this.$heading ), 1000 );
	// Destroy editor
	this.surface = null;
	this.active = false;
};

ve.init.ViewPageTarget.prototype.setupTabs = function(){
	// Only sysop users will have an edit tab in this namespace, so we might need to add one
	if ( $( '#ca-edit' ).length === 0 ) {
		// Add edit tab
		mw.util.addPortletLink(
			'p-views',
			'#',
			mw.msg( 'edit' ),
			'ca-edit',
			mw.msg( 'tooltip-ca-edit' ),
			mw.msg( 'accesskey-ca-edit' ),
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
			mw.util.wikiGetlink() + '?action=edit',
			'Edit Source', // TODO: i18n
			'ca-editsource'
		);
	}
	$( '#ca-edit > span > a' ).click( ve.proxy( this.onEditTabClick, this ) );
	$( '#ca-view > span > a' ).click( ve.proxy( this.onViewTabClick, this ) );
};

/**
 * Shows a loading spinner.
 *
 * @method
 */
ve.init.ViewPageTarget.prototype.showSpinner = function() {
	this.$spinner = $( '<div></div>' )
		.addClass( 've-init-viewPageTarget-loadingSpinner' )
		.prependTo( this.$heading );
};

/**
 * Resets all tabs in the UI and selects a specific one.
 *
 * If no ID is given, or no ID matches the given ID, all tabs will be unselected.
 *
 * @method
 * @param {String} id HTML ID of tab to select
 */
ve.init.ViewPageTarget.prototype.setSelectedTab = function( id ) {
	$( '#p-views' ).find( 'li.selected' ).removeClass( 'selected' );
	$( '#' + id ).addClass( 'selected' );
};

/* Inheritance */

ve.extendClass( ve.init.ViewPageTarget, ve.init.Target );

/* Initialization */

// TODO: Clean this stuff up

ve.config = mw.config.get( 'wgVisualEditor' );
ve.init.current = new ve.init.ViewPageTarget();
