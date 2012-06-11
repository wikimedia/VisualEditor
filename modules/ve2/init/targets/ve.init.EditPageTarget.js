/**
 * Edit page target.
 *
 * @class
 * @constructor
 * @extends {ve.init.Target}
 * @param {String} title Page title of target
 */
ve.init.EditPageTarget = function() {
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
ve.init.EditPageTarget.saveDialogTemplate = '\
<div class="es-inspector ve-init-editPageTarget-saveDialog">\
	<div class="es-inspector-title ve-init-editPageTarget-saveDialog-title"></div>\
	<div class="es-inspector-button ve-init-editPageTarget-saveDialog-closeButton"></div>\
	<div class="ve-init-editPageTarget-saveDialog-body">\
		<div class="ve-init-editPageTarget-saveDialog-editSummary-label"></div>\
		<input name="editSummary" id="ve-init-editPageTarget-saveDialog-editSummary" type="text">\
		<div class="clear:both"></div>\
		<div class="ve-init-editPageTarget-saveDialog-options">\
			<input type="checkbox" name="minorEdit" \
				id="ve-init-editPageTarget-saveDialog-minorEdit">\
			<label class="ve-init-editPageTarget-saveDialog-minorEdit-label" \
				for="ve-init-editPageTarget-saveDialog-minorEdit">This is a minor edit</label>\
			<div style="clear:both"></div>\
			<input type="checkbox" name="watchList" \
				id="ve-init-editPageTarget-saveDialog-watchList">\
			<label class="ve-init-editPageTarget-saveDialog-watchList-label" \
				for="ve-init-editPageTarget-saveDialog-watchList">Watch this page</label>\
		</div>\
		<div class="ve-init-editPageTarget-button ve-init-editPageTarget-saveDialog-saveButton">\
			<span class="ve-init-editPageTarget-saveDialog-saveButton-label"></span>\
			<div class="ve-init-editPageTarget-saveDialog-saveButton-icon"></div>\
		</div>\
		<div style="clear:both"></div>\
	</div>\
	<div class="ve-init-editPageTarget-saveDialog-foot">\
		<p class="ve-init-editPageTarget-saveDialog-license"></p>\
	</div>\
</div>';

/* Methods */

/**
 * ...
 *
 * @method
 */
ve.init.EditPageTarget.prototype.onEditTabClick = function( e ) {
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
ve.init.EditPageTarget.prototype.onSaveDialogSaveButtonClick = function( e ) {
	var _this = this;
	this.showSpinner();
	// Save
	this.save(
		ve.dm.converter.getDomFromData( this.surface.getDocumentModel().getData() ),
		{
			'summary': $( '#ve-init-editPageTarget-saveDialog-editSummary' ).val(),
			'minor': $( '#ve-init-editPageTarget-saveDialog-minorEdit' ).prop( 'checked' ),
			'watch': $( '#ve-init-editPageTarget-saveDialog-watchList' ).prop( 'checked' )
		},
		ve.proxy( this.onSave, this )
	);
};

/**
 * ...
 *
 * @method
 */
ve.init.EditPageTarget.prototype.onLoad = function( error, dom ) {
	if ( error ) {
		// TODO: Error handling in the UI
	} else {
		this.setUpSurface( dom );
	}
};

/**
 * ...
 *
 * @method
 */
ve.init.EditPageTarget.prototype.onSave = function( error, content ) {
	if ( error ) {
		// TODO: Handle error in UI
	} else {
		// Hide the save dialog
		this.$dialog.slideUp();
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
ve.init.EditPageTarget.prototype.setUpSurface = function( dom ) {
	// Initialize surface
	this.$surface.appendTo( this.$content );
	this.surface = new ve.Surface( this.$surface, dom, this.surfaceOptions );
	// Transplant the toolbar
	this.$toolbar = this.$surface.find( '.es-toolbar-wrapper' ).insertBefore( this.$heading );
	this.$heading.css( 'margin-top', this.$toolbar.outerHeight() );
	// Update UI
	this.$spinner.remove();
	this.$view.hide();
	this.$spinner.hide();
	this.$dialog = $( ve.init.EditPageTarget.saveDialogTemplate );
	// Add save and close buttons
	this.$toolbar
		.find( '.es-modes' )
			.append(
				$( '<div></div>' )
					.addClass( 've-init-editPageTarget-button ve-init-editPageTarget-saveButton' )
					.append(
						$( '<span></span>' )
							.text( mw.msg( 'savearticle' ) )
					)
					.click( ve.proxy( this.$dialog.show, this.$dialog ) )
			)
			.append(
				$( '<div></div>' )
					.addClass( 've-init-editPageTarget-button ve-init-editPageTarget-closeButton' )
					.click( ve.proxy( this.tearDownSurface, this ) )
			);
	// Set up save dialog
	this.$dialog
		.find( '.ve-init-editPageTarget-saveDialog-title' )
			.text( mw.msg( 'tooltip-save' ) )
			.end()
		.find( '.ve-init-editPageTarget-saveDialog-closeButton' )
			.click( ve.proxy( this.$dialog.hide, this.$dialog ) )
			.end()
		.find( '.ve-init-editPageTarget-saveDialog-editSummary-label' )
			.text( mw.msg( 'summary' ) )
			.end()
		.find( '.ve-init-editPageTarget-saveDialog-minorEdit-label' )
			.text( mw.msg( 'minoredit' ) )
			.end()
		.find( '.ve-init-editPageTarget-saveDialog-watchList' )
			.prop( 'checked', ve.config.isPageWatched )
			.end()
		.find( '.ve-init-editPageTarget-saveDialog-watchList-label' )
			.text( mw.msg( 'watchthis' ) )
			.end()
		.find( '.ve-init-editPageTarget-saveDialog-saveButton' )
			.click( ve.proxy( this.onSaveDialogSaveButtonClick, this ) )
			.end()
		.find( '.ve-init-editPageTarget-saveDialog-saveButton-label' )
			.text( mw.msg( 'savearticle' ) )
			.end()
		.find( '.ve-init-editPageTarget-saveDialog-license' )
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
		.insertAfter( this.$toolbar.find( '.ve-init-editPageTarget-saveButton' ) );
};

ve.init.EditPageTarget.prototype.tearDownSurface = function( content ) {
	// Reset tabs
	this.setSelectedTab( 'ca-view' );
	// Update UI
	this.$view.show().fadeTo( 1 );
	this.$surface.remove();
	this.$toolbar.remove();
	this.$spinner.remove();
	this.$heading.css( 'margin-top', 0 );
	// Destroy editor
	this.surface = null;
};

ve.init.EditPageTarget.prototype.setupTabs = function(){
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
};

/**
 * Shows a loading spinner.
 *
 * @method
 */
ve.init.EditPageTarget.prototype.showSpinner = function() {
	var $bodyContent = $( '#bodyContent' );
	this.$spinner = $( '<div></div>' )
		.addClass( 've-init-editPageTarget-loadingSpinner mw-ajax-loader' )
		.css( {
			'height': $bodyContent.height() + 'px',
			'width': ( $bodyContent.width() -20 ) + 'px'
		} )
		.appendTo( $bodyContent );
};

/**
 * Resets all tabs in the UI and selects a specific one.
 *
 * If no ID is given, or no ID matches the given ID, all tabs will be unselected.
 *
 * @method
 * @param {String} id HTML ID of tab to select
 */
ve.init.EditPageTarget.prototype.setSelectedTab = function( id ) {
	$( '#p-views' ).find( 'li.selected' ).removeClass( 'selected' );
	$( '#' + id ).addClass( 'selected' );
};

/* Inheritance */

ve.extendClass( ve.init.EditPageTarget, ve.init.Target );

/* Initialization */

// TODO: Clean this stuff up

ve.config = mw.config.get( 'wgVisualEditor' );
ve.init.current = new ve.init.EditPageTarget();
