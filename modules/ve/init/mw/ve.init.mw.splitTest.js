/*global mediaWiki */
( function ( mw, $ ) {
	'use strict';

	if ( !mw.config.get( 'wgVisualEditorConfig', {} ).enableEventLogging ) {
		return;
	}

	function log( action ) {
		var dfd = $.Deferred();
		setTimeout( dfd.reject, 1000 );
		mw.loader.using( 'schema.Edit', function () {
			mw.eventLog.logEvent( 'Edit', {
				version: 0,
				action: action,
				editor: 'wikitext',
				pageId: mw.config.get( 'wgArticleId' ),
				pageNs: mw.config.get( 'wgNamespaceNumber' ),
				pageName: mw.config.get( 'wgPageName' ),
				pageViewSessionId: mw.user.generateRandomSessionId(),
				revId: mw.config.get( 'wgCurRevisionId' ),
				userId: +mw.config.get( 'wgUserId' )
			} ).always( dfd.resolve );
		} );
		return dfd;
	}

	mw.hook( 'postEdit' ).add( function () {
		log( 'page-save-success' );
	} );

	if ( mw.config.get('wgAction') === 'edit' ) {
		log( 'page-edit-impression' );
	}

	// Log clicks on page edit and section edit links
	$( '#ca-edit a, .mw-editsection a' ).on( 'click', function ( e ) {
		var href = this.href,
			action = /section=/.test( href ) ? 'section-edit-link-click' : 'edit-link-click';
		log( action ).always( function () {
			window.location = href;
		} );
		e.preventDefault();
	} );

	// Log edit submit
	$( '#wpSave' ).one( 'click', function ( e ) {
		var $save = $( this );
		log( 'page-save-attempt' ).always( function () {
			$save.trigger( 'click' );
		} );
		e.preventDefault();
	} );

} ( mediaWiki, jQuery ) );
