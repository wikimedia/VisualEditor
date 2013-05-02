/*!
 * VisualEditor UserInterface MWLinkTargetInputWidget class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/*global mw*/

/**
 * Creates an ve.ui.MWLinkTargetInputWidget object.
 *
 * @class
 * @extends ve.ui.LinkTargetInputWidget
 * @mixins ve.ui.PendingInputWidget
 * @mixins ve.ui.LookupInputWidget
 *
 * @constructor
 * @param {Object} [config] Config options
 * @cfg {jQuery} [$overlay=this.$$( 'body' )] Element to append menu to
 */
ve.ui.MWLinkTargetInputWidget = function VeUiMWLinkTargetInputWidget( config ) {
	// Config intialization
	config = config || {};

	// Parent constructor
	ve.ui.LinkTargetInputWidget.call( this, config );

	// Mixin constructors
	ve.ui.PendingInputWidget.call( this );
	ve.ui.LookupInputWidget.call( this, this, config );

	// Events
	this.lookupMenu.connect( this, { 'select': 'onLookupMenuItemSelect' } );

	// Initialization
	this.$.addClass( 've-ui-mwLinkTargetInputWidget' );
	this.lookupMenu.$.addClass( 've-ui-mwLinkTargetInputWidget-menu' );
};

/* Inheritance */

ve.inheritClass( ve.ui.MWLinkTargetInputWidget, ve.ui.LinkTargetInputWidget );

ve.mixinClass( ve.ui.MWLinkTargetInputWidget, ve.ui.PendingInputWidget );
ve.mixinClass( ve.ui.MWLinkTargetInputWidget, ve.ui.LookupInputWidget );

/* Methods */

/**
 * Handle menu item select event.
 *
 * @method
 * @param {ve.ui.MenuItemWidget} item Selected item
 */
ve.ui.MWLinkTargetInputWidget.prototype.onLookupMenuItemSelect = function ( item ) {
	if ( item ) {
		this.setAnnotation( item.getData() );
	}
};

/**
 * Gets a new request object of the current lookup query value.
 *
 * @method
 * @returns {jQuery.Deferred} Deferred object with success and fail handlers already attached
 */
ve.ui.MWLinkTargetInputWidget.prototype.getLookupRequest = function () {
	return $.ajax( {
		'url': mw.util.wikiScript( 'api' ),
		'data': {
			'format': 'json',
			'action': 'opensearch',
			'search': this.value,
			'namespace': 0,
			'suggest': ''
		},
		'dataType': 'json'
	} );
};

/**
 * Get lookup cache item from server response data.
 *
 * @method
 * @param {Mixed} data Response from server
 */
ve.ui.MWLinkTargetInputWidget.prototype.getLookupCacheItemFromData = function ( data ) {
	return ve.isArray( data ) && data.length ? data[1] : [];
};

/**
 * Get list of menu items from a server response.
 *
 * @param {Object} data Query result
 * @returns {ve.ui.MenuItemWidget[]} Menu items
 */
ve.ui.MWLinkTargetInputWidget.prototype.getLookupMenuItemsFromData = function ( data ) {
	var i, len,
		menu$$ = this.lookupMenu.$$,
		items = [],
		matchingPages = data,
		pageExists = this.value in matchingPages;

	// External link
	if ( ve.init.platform.getExternalLinkUrlProtocolsRegExp().test( this.value ) ) {
		items.push( new ve.ui.MenuSectionItemWidget(
			'externalLink',
			{ '$$': menu$$, 'label': ve.msg( 'visualeditor-linkinspector-suggest-external-link' ) }
		) );
		items.push( new ve.ui.MenuItemWidget(
			this.getExternalLinkAnnotationFromUrl( this.value ),
			{ '$$': menu$$, 'rel': 'externalLink', 'label': this.value }
		) );
	}

	// Internal link
	if ( !pageExists && ( !matchingPages || matchingPages.indexOf( this.value ) === -1 ) ) {
		items.push( new ve.ui.MenuSectionItemWidget(
			'newPage',
			{ '$$': menu$$, 'label': ve.msg( 'visualeditor-linkinspector-suggest-new-page' ) }
		) );
		items.push( new ve.ui.MenuItemWidget(
			this.getInternalLinkAnnotationFromTitle( this.value ),
			{ '$$': menu$$, 'rel': 'newPage', 'label': this.value }
		) );
	}

	// Matching pages
	if ( matchingPages && matchingPages.length ) {
		items.push( new ve.ui.MenuSectionItemWidget(
			'matchingPages',
			{ '$$': menu$$, 'label': ve.msg( 'visualeditor-linkinspector-suggest-matching-page' ) }
		) );
		for ( i = 0, len = matchingPages.length; i < len; i++ ) {
			items.push( new ve.ui.MenuItemWidget(
				this.getInternalLinkAnnotationFromTitle( matchingPages[i] ),
				{ '$$': menu$$, 'rel': 'matchingPage', 'label': matchingPages[i] }
			) );
		}
	}

	return items;
};

/**
 * Set selection in the lookup menu with current information.
 *
 * @method
 * @chainable
 */
ve.ui.MWLinkTargetInputWidget.prototype.initializeLookupMenuSelection = function () {
	// Attempt to maintain selection on current annotation
	this.lookupMenu.selectItem( this.lookupMenu.getItemFromData( this.annotation ), true );
	// Parent method
	ve.ui.LookupInputWidget.prototype.initializeLookupMenuSelection.call( this );
};

/**
 * Set the value of the input.
 *
 * Overrides setValue to keep annotations in sync.
 *
 * @method
 * @param {string} value New value
 */
ve.ui.MWLinkTargetInputWidget.prototype.setValue = function ( value ) {
	// Keep annotation in sync with value, call parent method.
	ve.ui.TextInputWidget.prototype.setValue.call( this, value );
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
	return new ve.dm.MWInternalLinkAnnotation( {
		'type': 'link/MWinternal',
		'attributes': {
			'title': target
		}
	} );
};

/**
 * Gets an external link annotation.
 *
 * @method
 * @param {string} target Web address
 * @returns {ve.dm.MWExternalLinkAnnotation}
 */
ve.ui.MWLinkTargetInputWidget.prototype.getExternalLinkAnnotationFromUrl = function ( target ) {
	return new ve.dm.MWExternalLinkAnnotation( {
		'type': 'link/MWexternal',
		'attributes': {
			'href': target
		}
	} );
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
		return annotation.getAttribute( 'href' );
	} else if ( annotation instanceof ve.dm.MWInternalLinkAnnotation ) {
		return annotation.getAttribute( 'title' );
	}
	return '';
};
