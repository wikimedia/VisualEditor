/*!
 * VisualEditor user interface MWLinkTargetInputWidget class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/*global mw*/

/**
 * Creates an ve.ui.MWLinkTargetInputWidget object.
 *
 * @class
 * @constructor
 * @extends ve.ui.LinkTargetInputWidget
 * @param {Function} $$ jQuery for the frame the widget is in
 * @param {jQuery} $overlay DOM element to add menu to
 * @param {string} [name] Input name, used by HTML forms
 * @param {string} [value] Input value
 */
ve.ui.MWLinkTargetInputWidget = function VeUiMWLinkTargetInputWidget( $$, $overlay, name, value ) {
	// Parent constructor
	ve.ui.LinkTargetInputWidget.call( this, $$, name, value );

	// Properties
	this.menu = new ve.ui.TextInputMenuWidget( $, $overlay );
	this.annotation = null;
	this.existingPages = {};
	this.matchingPages = {};
	this.existingPagesRequest = null;
	this.matchingPagesRequest = null;
	this.waiting = 0;
	this.previousMatches = null;

	// Events
	this.$input.on( {
		'click': ve.bind( this.onClick, this ),
		'focus': ve.bind( this.onFocus, this ),
		'blur': ve.bind( this.onBlur, this ),
		'keydown': ve.bind( this.onKeyDown, this )
	} );
	this.menu.on( 'select', ve.bind( this.onMenuItemSelect, this ) );

	// Initialization
	this.$.addClass( 've-ui-mwLinkTargetInputWidget' );
};

/* Inheritance */

ve.inheritClass( ve.ui.MWLinkTargetInputWidget, ve.ui.LinkTargetInputWidget );

/* Methods */

/**
 * Handles change events.
 *
 * @method
 * @param {string} value New value
 * @param {string} origin Cause of event
 */
ve.ui.MWLinkTargetInputWidget.prototype.onChange = function ( value, origin ) {
	if ( origin !== 'annotation' ) {
		this.annotation = null;
		this.setValue( value );
		this.openMenu();
	}
};

/**
 * Handles click events.
 *
 * @method
 * @param {jQuery.Event} e Event
 */
ve.ui.MWLinkTargetInputWidget.prototype.onClick = function () {
	if ( !this.disabled ) {
		this.openMenu();
	}
};

/**
 * Handles focus events.
 *
 * @method
 * @param {jQuery.Event} e Event
 */
ve.ui.MWLinkTargetInputWidget.prototype.onFocus = function () {
	if ( !this.disabled ) {
		this.openMenu();
	}
};

/**
 * Handles blur events.
 *
 * @method
 * @param {jQuery.Event} e Event
 */
ve.ui.MWLinkTargetInputWidget.prototype.onBlur = function () {
	this.menu.hide();
};

/**
 * Handles key down events.
 *
 * @method
 * @param {jQuery.Event} e Event
 */
ve.ui.MWLinkTargetInputWidget.prototype.onKeyDown = function ( e ) {
	var handled = false;

	if ( !this.disabled ) {
		switch ( e.keyCode ) {
			// Up arrow
			case 38:
				this.menu.selectRelativeItem( -1 );
				handled = true;
				break;
			// Down arrow
			case 40:
				this.menu.selectRelativeItem( 1 );
				handled = true;
				break;
		}
		if ( handled ) {
			e.preventDefault();
		}
	}
};

/**
 * Handles change events.
 *
 * @method
 * @param {ve.dm.LinkAnnotation} annotation Link annotation
 */
ve.ui.MWLinkTargetInputWidget.prototype.onMenuItemSelect = function ( annotation ) {
	this.setAnnotation( annotation );
};

/**
 * Opens the menu.
 *
 * @method
 */
ve.ui.MWLinkTargetInputWidget.prototype.openMenu = function () {
	this.populateMenu();
	this.queryPageExistence();
	this.queryMatchingPages();
	if ( !this.menu.isVisible() ) {
		this.menu.show();
		this.menu.setPosition( this.$input );
	}
};

/**
 * Populates the menu.
 *
 * @method
 */
ve.ui.MWLinkTargetInputWidget.prototype.populateMenu = function () {
	var i, len,
		externalLink = this.getExternalLinkAnnotationFromUrl( this.value ),
		internalLink = this.getInternalLinkAnnotationFromTitle( this.value ),
		pageExists = this.existingPages[this.value],
		matchingPages = this.matchingPages[this.value];

	this.menu.clearItems();

	// Hide on empty target
	if ( !this.value.length ) {
		this.menu.hide();
		return;
	}

	// External links
	this.menu.addGroup( 'externalLink', 'External link' );
	if ( ve.init.platform.getExternalLinkUrlProtocolsRegExp().test( this.value ) ) {
		this.menu.addItem( 'externalLink', this.value, externalLink );
	}

	// Internal links
	this.menu.addGroup( 'newPage', 'New page' );
	this.menu.addGroup( 'existingPage', 'Existing page' );
	this.menu.addGroup( 'matchingPage', 'Matching page' );
	if ( !pageExists && ( !matchingPages || matchingPages.indexOf( this.value ) === -1 ) ) {
		this.menu.addItem( 'newPage', this.value, internalLink );
	}
	if ( matchingPages ) {
		for ( i = 0, len = matchingPages.length; i < len; i++ ) {
			internalLink = new ve.dm.MWInternalLinkAnnotation( { 'title': matchingPages[i] } );
			this.menu.addItem(
				this.value === matchingPages[i] ? 'existingPage' : 'matchingPage',
				matchingPages[i],
				internalLink
			);
		}
		this.previousMatches = matchingPages;
	}

	// Auto-select
	this.menu.selectItemByData( this.annotation );
	if ( !this.menu.getSelectedItem() ) {
		this.menu.selectItemByIndex( 0 );
	}
};

/**
 * Signals that an response is pending.
 *
 * @method
 */
ve.ui.MWLinkTargetInputWidget.prototype.pushPending = function () {
	this.pending++;
	this.$.addClass( 've-ui-mwLinkTargetInputWidget-pending' );
};

/**
 * Signals that an response is complete.
 *
 * @method
 */
ve.ui.MWLinkTargetInputWidget.prototype.popPending = function () {
	this.pending--;
	this.$.removeClass( 've-ui-mwLinkTargetInputWidget-pending' );
};

/**
 * Gets an internal link annotation.
 *
 * File: or Category: links will be prepended with a colon so they are interpreted as a links rather
 * than image inclusions or categorizations.
 *
 * @method
 * @param {string} target Page title
 * @returns {ve.dm.MWInternalLinkAnnotation}
 */
ve.ui.MWLinkTargetInputWidget.prototype.getInternalLinkAnnotationFromTitle = function ( target ) {
	var title;
	try {
		title = new mw.Title( target );
		if ( title.getNamespaceId() === 6 || title.getNamespaceId() === 14 ) {
			target = ':' + target;
		}
	} catch ( e ) { }
	return new ve.dm.MWInternalLinkAnnotation( { 'title': target } );
};

/**
 * Gets an external link annotation.
 *
 * @method
 * @param {string} target Web address
 * @returns {ve.dm.MWExternalLinkAnnotation}
 */
ve.ui.MWLinkTargetInputWidget.prototype.getExternalLinkAnnotationFromUrl = function ( target ) {
	return new ve.dm.MWExternalLinkAnnotation( { 'href': target } );
};

/**
 * Gets a target from an annotation.
 *
 * @method
 * @param {ve.dm.MWExternalLinkAnnotation|ve.dm.MWInternalLinkAnnotation} annotation Annotation
 * @returns {string} Target
 */
ve.ui.MWLinkTargetInputWidget.prototype.getTargetFromAnnotation = function ( annotation ) {
	if ( annotation instanceof ve.dm.MWExternalLinkAnnotation ) {
		return annotation.data.href;
	} else if ( annotation instanceof ve.dm.MWInternalLinkAnnotation ) {
		return annotation.data.title;
	}
	return '';
};

/**
 * Checks page existence for the current value.
 *
 * {ve.ui.MWLinkTargetInputWidget.populateMenu} will be called immediately if the page existence has
 * been cached, or as soon as the API returns a result.
 *
 * @method
 */
ve.ui.MWLinkTargetInputWidget.prototype.queryPageExistence = function () {
	if ( this.existingPagesRequest ) {
		this.existingPagesRequest.abort();
		this.existingPagesRequest = null;
	}
	if ( this.value in this.existingPages ) {
		this.populateMenu();
	} else {
		this.pushPending();
		this.existingPagesRequest = $.ajax( {
			'url': mw.util.wikiScript( 'api' ),
			'data': {
				'format': 'json',
				'action': 'query',
				'indexpageids': '',
				'titles': this.value,
				'converttitles': ''
			},
			'dataType': 'json',
			'success': ve.bind( function ( data ) {
				this.existingPagesRequest = null;
				var page,
					exists = false;
				if ( data.query ) {
					page = data.query.pages[data.query.pageids[0]];
					exists = ( page.missing === undefined && page.invalid === undefined );
					// Cache result for normalized title
					this.existingPages[page.title] = exists;
				}
				// Cache result for original input
				this.existingPages[this.value] = exists;
				this.populateMenu();
			}, this ),
			'complete': ve.bind( function () {
				this.popPending();
			}, this )
		} );
	}
};

/**
 * Checks matching pages for the current value.
 *
 * {ve.ui.MWLinkTargetInputWidget.populateMenu} will be called immediately if matching pages have
 * been cached, or as soon as the API returns a result.
 *
 * @method
 */
ve.ui.MWLinkTargetInputWidget.prototype.queryMatchingPages = function () {
	if ( this.matchingPagesRequest ) {
		this.matchingPagesRequest.abort();
		this.matchingPagesRequest = null;
	}
	if ( this.value in this.matchingPages ) {
		this.populateMenu();
	} else {
		this.pushPending();
		this.matchingPagesRequest = $.ajax( {
			'url': mw.util.wikiScript( 'api' ),
			'data': {
				'format': 'json',
				'action': 'opensearch',
				'search': this.value,
				'namespace': 0,
				'suggest': ''
			},
			'dataType': 'json',
			'success': ve.bind( function ( data ) {
				this.matchingPagesRequest = null;
				if ( ve.isArray( data ) && data.length ) {
					// Cache the matches to the query
					this.matchingPages[this.value] = data[1];
					this.populateMenu();
				}
			}, this ),
			'complete': ve.bind( function () {
				this.popPending();
			}, this )
		} );
	}
};
