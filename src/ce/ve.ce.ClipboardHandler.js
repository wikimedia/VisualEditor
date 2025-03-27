/*!
 * VisualEditor ContentEditable ClipboardHandler class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * Clipboard handler
 *
 * Handles copy and paste events on the surface.
 *
 * @param {ve.ce.Surface} surface
 */
ve.ce.ClipboardHandler = function VeCeClipboardHandler( surface ) {
	// Parent constructor
	ve.ce.ClipboardHandler.super.call( this );

	this.surface = surface;

	this.clipboard = null;
	this.clipboardId = ve.init.platform.generateUniqueId();
	this.clipboardIndex = 0;
	this.pasting = false;
	this.beforePasteAnnotationsAtFocus = [];
	this.copying = false;
	this.pasteSpecial = false;
	this.middleClickPasting = false;
	this.middleClickTargetOffset = false;

	this.$element
		.add( this.getSurface().$highlights )
		.add( this.getSurface().$attachedRootNode )
		.on( {
			cut: this.onCut.bind( this ),
			copy: this.onCopy.bind( this ),
			paste: this.onPaste.bind( this )
		} );

	this.$element
		.addClass( 've-ce-surface-clipboardHandler' )
		// T283853
		.attr( 'aria-hidden', true )
		.prop( {
			tabIndex: -1,
			contentEditable: 'true'
		} );
};

/* Inheritance */

OO.inheritClass( ve.ce.ClipboardHandler, OO.ui.Element );

/* Static properties */

/**
 * Attributes considered 'unsafe' for copy/paste
 *
 * These attributes may be dropped by the browser during copy/paste, so
 * any element containing these attributes will have them JSON encoded into
 * data-ve-attributes on copy.
 *
 * @type {string[]}
 */
ve.ce.ClipboardHandler.static.unsafeAttributes = [
	// Support: Firefox
	// RDFa: Firefox ignores these
	'about',
	'content',
	'datatype',
	'property',
	'rel',
	'resource',
	'rev',
	'typeof',
	// CSS: Values are often added or modified
	'style'
];

/**
 * Private (x), vendor-specific (vnd) MIME type for clipboard key data
 *
 * @type {string}
 */
ve.ce.ClipboardHandler.static.clipboardKeyMimeType = 'application/x-vnd.wikimedia.visualeditor.clipboardkey';

/**
 * Paste source detectors examine a clipboardData DataTransfer object
 * and identify the source of the copied data.
 *
 * @type {Object}
 */
ve.ce.ClipboardHandler.static.pasteSourceDetectors = {
	googleDocs: ( clipboardData ) => clipboardData.types.some( ( type ) => type.startsWith( 'application/x-vnd.google-docs' ) ) ||
		clipboardData.getData( 'text/html' ).match( /id=['"]?docs-internal-guid/i ),
	libreOffice: ( clipboardData ) => clipboardData.getData( 'text/html' ).match( /content=['"]?LibreOffice/i ),
	microsoftOffice: ( clipboardData ) => {
		const html = clipboardData.getData( 'text/html' );
		// Word365 (Desktop)
		return html.match( /content=Word.Document/i ) ||
		// Word365 (web)

			( html.match( /data-contrast=["']/i ) && html.includes( 'TextRun' ) );
	},
	plainText: ( clipboardData ) => clipboardData.types.length === 1 && clipboardData.types[ 0 ] === 'text/plain'
};

/* Static methods */

/**
 * When pasting, browsers normalize HTML to varying degrees.
 * This hash creates a comparable string for validating clipboard contents.
 *
 * @param {jQuery} $elements Clipboard HTML
 * @param {Object} [beforePasteData] Paste information, including leftText and rightText to strip
 * @return {string} Hash
 */
ve.ce.ClipboardHandler.static.getClipboardHash = function ( $elements, beforePasteData ) {
	beforePasteData = beforePasteData || {};
	return $elements.text()
		.slice(
			beforePasteData.leftText ? beforePasteData.leftText.length : 0,
			beforePasteData.rightText ? -beforePasteData.rightText.length : undefined
		)
		// Whitespace may be modified (e.g. ' ' to '&nbsp;'), so strip it all
		.replace( /\s/gm, '' );
};

/* Methods */

/**
 * Get the handled surface
 *
 * @return {ve.ce.Surface}
 */
ve.ce.ClipboardHandler.prototype.getSurface = function () {
	return this.surface;
};

/**
 * Handle cut events.
 *
 * @param {jQuery.Event} e Cut event
 */
ve.ce.ClipboardHandler.prototype.onCut = function ( e ) {
	const selection = this.getSurface().getModel().getSelection();

	if ( selection.isCollapsed() ) {
		return;
	}

	this.onCopy( e );
	// setTimeout: postpone until after the setTimeout in onCopy
	setTimeout( () => {
		// Trigger a fake backspace to remove the content: this behaves differently based on the selection,
		// e.g. in a TableSelection.
		ve.ce.keyDownHandlerFactory.executeHandlersForKey( OO.ui.Keys.BACKSPACE, selection.getName(), this.getSurface(), e );
	} );
};

/**
 * Handle copy (including cut) and dragstart events.
 *
 * @param {jQuery.Event} e Copy event
 * @param {ve.dm.Selection} selection Optional selection to simulate a copy on
 */
ve.ce.ClipboardHandler.prototype.onCopy = function ( e, selection ) {
	// Copy or cut, but not dragstart
	const isClipboard = e.type === 'copy' || e.type === 'cut',
		htmlDoc = this.getSurface().getModel().getDocument().getHtmlDocument(),
		clipboardData = isClipboard ? e.originalEvent.clipboardData : e.originalEvent.dataTransfer;

	selection = selection || this.getSurface().getModel().getSelection();

	this.$element.empty();

	if ( selection.isCollapsed() ) {
		return;
	}

	const slice = this.getSurface().getModel().getDocument().shallowCloneFromSelection( selection );

	// Clone the elements in the slice
	slice.data.cloneElements( true );

	ve.dm.converter.getDomSubtreeFromModel( slice, this.$element[ 0 ], ve.dm.Converter.static.CLIPBOARD_MODE );

	// Some browsers strip out spans when they match the styling of the
	// clipboard handler element (e.g. plain spans) so we must protect against this
	// by adding a dummy class, which we can remove after paste.
	this.$element.find( 'span' ).addClass( 've-pasteProtect' );

	// When paste has no text content browsers do extreme normalization…
	if ( this.$element.text() === '' ) {
		// …so put nbsp's in empty leaves
		// eslint-disable-next-line no-jquery/no-sizzle
		this.$element.find( '*:not( :has( * ) )' ).text( '\u00a0' );
	}

	// Resolve attributes (in particular, expand 'href' and 'src' using the right base)
	ve.resolveAttributes(
		this.$element[ 0 ],
		htmlDoc,
		ve.dm.Converter.static.computedAttributes
	);

	// Support: Firefox
	// Some attributes (e.g RDFa attributes in Firefox) aren't preserved by copy
	const unsafeSelector = '[' + this.constructor.static.unsafeAttributes.join( '],[' ) + ']';
	this.$element.find( unsafeSelector ).each( ( n, element ) => {
		const attrs = {},
			ua = this.constructor.static.unsafeAttributes;

		let i = ua.length;
		while ( i-- ) {
			const val = element.getAttribute( ua[ i ] );
			if ( val !== null ) {
				attrs[ ua[ i ] ] = val;
			}
		}
		element.setAttribute( 'data-ve-attributes', JSON.stringify( attrs ) );
	} );

	this.clipboardIndex++;
	const clipboardKey = this.clipboardId + '-' + this.clipboardIndex;
	this.clipboard = { slice: slice, hash: null };
	// Support: Firefox<48
	// Writing a custom clipboard key won't work in Firefox<48, so write
	// it to the HTML instead
	if ( isClipboard && !ve.isClipboardDataFormatsSupported( e ) ) {
		this.$element.prepend(
			$( '<span>' ).attr( 'data-ve-clipboard-key', clipboardKey ).text( '\u00a0' )
		);
		// To ensure the contents with the clipboardKey isn't modified in an external editor,
		// store a hash of the contents for later validation.
		this.clipboard.hash = this.constructor.static.getClipboardHash( this.$element.contents() );
	}

	if ( isClipboard ) {
		// Disable the default event so we can override the data
		e.preventDefault();
	}

	// Only write a custom mime type if we think the browser supports it, otherwise
	// we will have already written a key to the HTML above.
	if ( isClipboard && ve.isClipboardDataFormatsSupported( e, true ) ) {
		clipboardData.setData( this.constructor.static.clipboardKeyMimeType, clipboardKey );
	}
	clipboardData.setData( 'text/html', this.$element.html() );
	// innerText "approximates the text the user would get if they highlighted the
	// contents of the element with the cursor and then copied to the clipboard." - MDN
	// Use $.text as a fallback for Firefox <= 44
	clipboardData.setData( 'text/plain', this.$element[ 0 ].innerText || this.$element.text() || ' ' );

	ve.track( 'activity.clipboard', { action: e.type } );
};

/**
 * Get the annotation set that was a the user focus before a paste started
 *
 * @return {ve.dm.AnnotationSet} Annotation set
 */
ve.ce.ClipboardHandler.prototype.getBeforePasteAnnotationSet = function () {
	const store = this.getSurface().getModel().getDocument().getStore();
	const dmAnnotations = this.beforePasteAnnotationsAtFocus.map( ( view ) => view.getModel() );
	return new ve.dm.AnnotationSet( store, store.hashAll( dmAnnotations ) );
};

/**
 * Handle native paste event
 *
 * @param {jQuery.Event} e Paste event
 * @return {boolean|undefined} False if the event is cancelled
 */
ve.ce.ClipboardHandler.prototype.onPaste = function ( e ) {
	// Prevent pasting until after we are done
	if ( this.pasting || this.getSurface().isReadOnly() ) {
		return false;
	}
	this.beforePaste( e );
	this.getSurface().surfaceObserver.disable();
	this.pasting = true;
	// setTimeout: postpone until after the default paste action
	setTimeout( () => {
		let afterPastePromise = ve.createDeferred().resolve().promise();
		try {
			if ( !e.isDefaultPrevented() || e.type === 'drop' ) {
				afterPastePromise = this.afterPaste( e );
			}
		} finally {
			afterPastePromise.always( () => {
				this.getSurface().surfaceObserver.clear();
				this.getSurface().surfaceObserver.enable();

				// Allow pasting again
				this.pasting = false;
				this.pasteSpecial = false;
				this.beforePasteData = null;

				// Restore original clipboard metadata if requred (was overridden by middle-click
				// paste logic in beforePaste)
				if ( this.originalClipboardMetdata ) {
					this.clipboardIndex = this.originalClipboardMetdata.clipboardIndex;
					this.clipboard = this.originalClipboardMetdata.clipboard;
				}

				ve.track( 'activity.clipboard', { action: 'paste' } );
			} );
		}
	} );
};

/**
 * Handle pre-paste events.
 *
 * @param {jQuery.Event} e Paste event
 */
ve.ce.ClipboardHandler.prototype.beforePaste = function ( e ) {
	const surface = this.getSurface(),
		selection = surface.getModel().getSelection(),
		clipboardData = e.originalEvent.clipboardData || e.originalEvent.dataTransfer,
		surfaceModel = surface.getModel(),
		fragment = surfaceModel.getFragment(),
		documentModel = surfaceModel.getDocument();

	let range;
	if ( selection instanceof ve.dm.LinearSelection ) {
		range = fragment.getSelection().getRange();
	} else if ( selection instanceof ve.dm.TableSelection ) {
		range = new ve.Range( selection.getRanges( documentModel )[ 0 ].start );
	} else {
		e.preventDefault();
		return;
	}

	this.beforePasteAnnotationsAtFocus = surface.annotationsAtFocus();
	this.beforePasteData = {
		isPaste: e.type === 'paste'
	};
	this.originalClipboardMetdata = null;
	if ( this.middleClickPasting && !surface.lastNonCollapsedDocumentSelection.isNull() ) {
		// Paste was triggered by middle click, and the last non-collapsed document selection was in
		// this VE surface. Simulate a fake copy to load DM data into the clipboard. If we let the
		// native middle-click paste happen, it would load CE data into the clipboard.
		// Store original clipboard metadata so it can be restored after paste,
		// and we can continue to use internal paste.
		this.originalClipboardMetdata = {
			clipboardIndex: this.clipboardIndex,
			clipboard: this.clipboard
		};
		// Use a fake clipboard index for middle click, will be restored in afterPaste
		this.clipboardIndex = -1;
		this.clipboard = {
			slice: surface.getModel().getDocument().shallowCloneFromSelection( surface.lastNonCollapsedDocumentSelection ),
			hash: null
		};
		this.beforePasteData.clipboardKey = this.clipboardId + '-' + this.clipboardIndex;
	} else if ( clipboardData ) {
		if ( surface.handleDataTransfer( clipboardData, true ) ) {
			e.preventDefault();
			return;
		}
		this.beforePasteData.clipboardKey = clipboardData.getData( this.constructor.static.clipboardKeyMimeType ) ||
			// Backwards compatability with older versions of VE which used text/xcustom
			clipboardData.getData( 'text/xcustom' );
		this.beforePasteData.html = clipboardData.getData( 'text/html' );
		if ( this.beforePasteData.html ) {
			// http://msdn.microsoft.com/en-US/en-%20us/library/ms649015(VS.85).aspx
			this.beforePasteData.html = this.beforePasteData.html
				.replace( /^[\s\S]*<!-- *StartFragment *-->/, '' )
				.replace( /<!-- *EndFragment *-->[\s\S]*$/, '' );
		}
	}

	let source = null;
	if ( !this.beforePasteData.clipboardKey ) {
		const pasteSourceDetectors = this.constructor.static.pasteSourceDetectors;
		for ( const s in pasteSourceDetectors ) {
			if ( pasteSourceDetectors[ s ]( clipboardData ) ) {
				source = s;
				break;
			}
		}
	} else {
		source = 'visualEditor';
	}
	this.beforePasteData.source = source;

	// Save scroll position before changing focus to "offscreen" clipboard handler element
	this.beforePasteData.scrollTop = surface.getSurface().$scrollContainer.scrollTop();

	this.$element.empty();

	// Get node from cursor position
	const startNode = documentModel.getBranchNodeFromOffset( range.start );
	if ( startNode.canContainContent() ) {
		// If this is a content branch node, then add its DM HTML
		// to the clipboard handler element to give CE some context.
		let textStart = 0, textEnd = 0;
		const contextElement = startNode.getClonedElement();
		// Make sure that context doesn't have any attributes that might confuse
		// the importantElement check in afterPaste.
		$( documentModel.getStore().value( contextElement.originalDomElementsHash ) ).removeAttr( 'id typeof rel' );
		const context = [ contextElement ];
		// If there is content to the left of the cursor, put a placeholder
		// character to the left of the cursor
		let leftText, rightText;
		if ( range.start > startNode.getRange().start ) {
			leftText = '☀';
			context.push( leftText );
			textStart = textEnd = 1;
		}
		// If there is content to the right of the cursor, put a placeholder
		// character to the right of the cursor
		const endNode = documentModel.getBranchNodeFromOffset( range.end );
		if ( range.end < endNode.getRange().end ) {
			rightText = '☂';
			context.push( rightText );
		}
		// If there is no text context, select some text to be replaced
		if ( !leftText && !rightText ) {
			context.push( '☁' );
			textEnd = 1;
			// If we are middle click pasting we can't change the native selection, so
			// just make the text a placeholder to the left. (T311723)
			if ( this.middleClickPasting ) {
				leftText = '☁';
				textStart = 1;
			}
		}
		context.push( { type: '/' + context[ 0 ].type } );

		// Throw away 'internal', specifically inner whitespace,
		// before conversion as it can affect textStart/End offsets.
		delete contextElement.internal;
		ve.dm.converter.getDomSubtreeFromModel(
			documentModel.cloneWithData( context, true ),
			this.$element[ 0 ]
		);

		// Giving the clipboard handler element focus too late can cause problems in FF (!?)
		// so do it up here.
		this.$element[ 0 ].focus();

		const nativeRange = surface.getElementDocument().createRange();
		// Assume that the DM node only generated one child
		const textNode = this.$element.children().contents()[ 0 ];
		// Place the cursor between the placeholder characters
		nativeRange.setStart( textNode, textStart );
		nativeRange.setEnd( textNode, textEnd );
		surface.nativeSelection.removeAllRanges();
		surface.nativeSelection.addRange( nativeRange );

		this.beforePasteData.context = context;
		this.beforePasteData.leftText = leftText;
		this.beforePasteData.rightText = rightText;
	} else {
		// If we're not in a content branch node, don't bother trying to do
		// anything clever with paste context
		this.$element[ 0 ].focus();
	}

	// Restore scroll position after focusing the clipboard handler element
	surface.getSurface().$scrollContainer.scrollTop( this.beforePasteData.scrollTop );
};

/**
 * Handle post-paste events.
 *
 * @param {jQuery.Event} e Paste event
 * @return {jQuery.Promise} Promise which resolves when the content has been pasted
 */
ve.ce.ClipboardHandler.prototype.afterPaste = function () {
	const surface = this.getSurface(),
		surfaceModel = surface.getModel(),
		documentModel = surfaceModel.getDocument(),
		fragment = surfaceModel.getFragment(),
		beforePasteData = this.beforePasteData || {},
		done = ve.createDeferred().resolve().promise();
	let targetFragment = surfaceModel.getFragment( null, true );

	// If the selection doesn't collapse after paste then nothing was inserted
	if ( beforePasteData.isPaste && !surface.nativeSelection.isCollapsed ) {
		return done;
	}

	if ( surface.getModel().getFragment().isNull() ) {
		return done;
	}

	if ( this.middleClickTargetOffset ) {
		targetFragment = targetFragment.clone( new ve.dm.LinearSelection( new ve.Range( this.middleClickTargetOffset ) ) );
	} else if ( this.middleClickPasting ) {
		// Middle click pasting should always collapse the selection before pasting
		targetFragment = targetFragment.collapseToEnd();
	}

	// Immedately remove any <style> tags from the clipboard handler element that might
	// be changing the rendering of the whole page (T235068)
	this.$element.find( 'style' ).remove();

	const pasteData = this.afterPasteExtractClipboardData();

	// Handle pastes into a table
	if ( fragment.getSelection() instanceof ve.dm.TableSelection ) {
		// Internal table-into-table paste can be shortcut
		if ( fragment.getSelection() instanceof ve.dm.TableSelection && pasteData.slice instanceof ve.dm.TableSlice ) {
			const tableAction = new ve.ui.TableAction( surface.getSurface() );
			tableAction.importTable( pasteData.slice.getTableNode( documentModel ) );
			return done;
		}

		// For table selections the target is the first cell
		targetFragment = surfaceModel.getLinearFragment( fragment.getSelection().getRanges( documentModel )[ 0 ], true );
	}

	// Are we pasting into a multiline context?
	const isMultiline = surface.getDocument().getBranchNodeFromOffset(
		targetFragment.getSelection().getCoveringRange().from
	).isMultiline();

	let pending;
	if ( pasteData.slice ) {
		pending = this.afterPasteAddToFragmentFromInternal( pasteData.slice, fragment, targetFragment, isMultiline );
	} else {
		pending = this.afterPasteAddToFragmentFromExternal( pasteData.clipboardKey, pasteData.$clipboardHtml, fragment, targetFragment, isMultiline );
	}
	return pending.then( () => {
		if ( surface.getSelection().isNativeCursor() ) {
			// Restore focus and scroll position
			surface.$attachedRootNode[ 0 ].focus();
			surface.getSurface().$scrollContainer.scrollTop( beforePasteData.scrollTop );
			// setTimeout: Firefox sometimes doesn't change scrollTop immediately when pasting
			// line breaks at the end of a line so do it again later.
			setTimeout( () => {
				surface.getSurface().$scrollContainer.scrollTop( beforePasteData.scrollTop );
			} );
		}

		// If original selection was linear, switch to end of pasted text
		if ( fragment.getSelection() instanceof ve.dm.LinearSelection ) {
			targetFragment.collapseToEnd().select();
			surface.findAndExecuteSequences( /* isPaste */ true );
		}
	} );
};

/**
 * @typedef {Object} ClipboardData
 * @memberof ve.ce
 * @property {string|undefined} clipboardKey Clipboard key, if present
 * @property {jQuery|undefined} $clipboardHtml Clipboard html, if used to extract the clipboard key
 * @property {ve.dm.DocumentSlice|undefined} slice Relevant slice of this document, if the key points to it
 */

/**
 * Extract the clipboard key and other relevant data from beforePasteData / the clipboard handler element
 *
 * @return {ve.ce.ClipboardData} Data
 */
ve.ce.ClipboardHandler.prototype.afterPasteExtractClipboardData = function () {
	const beforePasteData = this.beforePasteData || {};

	let clipboardKey, clipboardHash, $clipboardHtml;
	// Find the clipboard key
	if ( beforePasteData.clipboardKey ) {
		// Clipboard key in custom data was present, and requires no further processing
		clipboardKey = beforePasteData.clipboardKey;
	} else {
		if ( beforePasteData.html ) {
			// text/html was present, so we can check if a key was hidden in it
			$clipboardHtml = $( ve.sanitizeHtml( beforePasteData.html ) ).filter( ( i, element ) => {
				const val = element.getAttribute && element.getAttribute( 'data-ve-clipboard-key' );
				if ( val ) {
					clipboardKey = val;
					// Remove the clipboard key span once read
					return false;
				}
				return true;
			} );
			clipboardHash = this.constructor.static.getClipboardHash( $clipboardHtml );
		} else {
			// Fall back on checking the clipboard handler element

			// HTML in clipboard handler element may get wrapped, so use the recursive $.find to look for the clipboard key
			clipboardKey = this.$element.find( 'span[data-ve-clipboard-key]' ).data( 've-clipboard-key' );
			// Pass beforePasteData so context gets stripped
			clipboardHash = this.constructor.static.getClipboardHash( this.$element, beforePasteData );
		}
	}

	let slice;
	// If we have a clipboard key, validate it and fetch data
	if ( clipboardKey === this.clipboardId + '-' + this.clipboardIndex ) {
		// Hash validation: either custom data was used or the hash must be
		// equal to the hash of the pasted HTML to assert that the HTML
		// hasn't been modified in another editor before being pasted back.
		if ( beforePasteData.clipboardKey || clipboardHash === this.clipboard.hash ) {
			slice = this.clipboard.slice;
			// Clone again. The elements were cloned on copy, but we need to clone
			// on paste too in case the same thing is pasted multiple times.
			slice.data.cloneElements( true );
		}
	}

	if ( !slice && !$clipboardHtml && beforePasteData.html ) {
		$clipboardHtml = $( ve.sanitizeHtml( beforePasteData.html ) );
	}

	return {
		clipboardKey: clipboardKey,
		$clipboardHtml: $clipboardHtml,
		slice: slice
	};
};

/**
 * LinearData sanitize helper, for pasted data
 *
 * @param {ve.dm.LinearData} linearData Data to sanitize
 * @param {boolean} isMultiline Sanitize for a multiline context
 * @param {boolean} isExternal Treat as external content
 */
ve.ce.ClipboardHandler.prototype.afterPasteSanitize = function ( linearData, isMultiline, isExternal ) {
	const importRules = this.afterPasteImportRules( isMultiline );
	if ( isExternal ) {
		linearData.sanitize( importRules.external || {} );
	}
	linearData.sanitize( importRules.all || {} );
};

/**
 * Helper to build import rules for pasted data
 *
 * @param {boolean} isMultiline Get rules for a multiline context
 * @return {Object.<string,Object>} Import rules
 */
ve.ce.ClipboardHandler.prototype.afterPasteImportRules = function ( isMultiline ) {
	let importRules = !this.isPasteSpecial() ? this.getSurface().getSurface().getImportRules() : { all: { plainText: true, keepEmptyContentBranches: true } };
	if ( !isMultiline ) {
		importRules = {
			all: ve.extendObject( {}, importRules.all, { singleLine: true } ),
			external: ve.extendObject( {}, importRules.external, { singleLine: true } )
		};
	}
	return importRules;
};

/**
 * After clipboard handler for pastes from the same document
 *
 * @param {ve.dm.DocumentSlice} slice Slice of document to paste
 * @param {ve.dm.SurfaceFragment} fragment Current fragment
 * @param {ve.dm.SurfaceFragment} targetFragment Fragment to insert into
 * @param {boolean} isMultiline Pasting to a multiline context
 * @return {jQuery.Promise} Promise which resolves when the content has been inserted
 */
ve.ce.ClipboardHandler.prototype.afterPasteAddToFragmentFromInternal = function ( slice, fragment, targetFragment, isMultiline ) {
	// Pasting non-table content into table: just replace the first cell with the pasted content
	if ( fragment.getSelection() instanceof ve.dm.TableSelection ) {
		// Cell was not deleted in beforePaste to prevent flicker when table-into-table paste is
		// about to be triggered.
		targetFragment.removeContent();
	}

	// Temporary tracking for T362358
	const pastedRefs = slice.getNodesByType( 'mwReference' );
	if ( pastedRefs.length > 0 ) {
		const documentRefKeys = fragment.getDocument().getNodesByType( 'mwReference' ).map(
			( ref ) => ref.registeredListGroup + '\n' + ref.registeredListKey
		);
		if ( pastedRefs.some(
			( ref ) => documentRefKeys.includes( ref.registeredListGroup + '\n' + ref.registeredListKey )
		) ) {
			ve.track( 'activity.clipboard', { action: 'paste-ref-internal-reuse' } );
		} else {
			ve.track( 'activity.clipboard', { action: 'paste-ref-internal-new' } );
		}
	}

	// Only try original data in multiline contexts, for single line we must use balanced data

	let linearData, insertionPromise;
	// Original data + fixupInsertion
	if ( isMultiline ) {
		// Take a copy to prevent the data being annotated a second time in the balanced data path
		// and to prevent actions in the data model affecting view.clipboard
		linearData = new ve.dm.ElementLinearData(
			slice.getStore(),
			ve.copy( slice.getOriginalData() )
		);

		if ( this.isPasteSpecial() ) {
			this.afterPasteSanitize( linearData, isMultiline );
		}

		// ve.dm.Document#fixupInsertion may fail, in which case we fall back to balanced data
		try {
			insertionPromise = this.afterPasteInsertInternalData( targetFragment, linearData.getData() );
		} catch ( e ) {}
	}

	// Balanaced data
	if ( !insertionPromise ) {
		// Take a copy to prevent actions in the data model affecting view.clipboard
		linearData = new ve.dm.ElementLinearData(
			slice.getStore(),
			ve.copy( slice.getBalancedData() )
		);

		if ( this.isPasteSpecial() || !isMultiline ) {
			this.afterPasteSanitize( linearData, isMultiline );
		}

		let data = linearData.getData();

		if ( !isMultiline ) {
			// Unwrap single CBN
			if ( data[ 0 ].type ) {
				data = data.slice( 1, -1 );
			}
		}

		insertionPromise = this.afterPasteInsertInternalData( targetFragment, data );
	}

	return insertionPromise;
};

/**
 * Insert some pasted data from an internal source
 *
 * @param {ve.dm.SurfaceFragment} targetFragment Fragment to insert into
 * @param {Array} data Data to insert
 * @return {jQuery.Promise} Promise which resolves when the content has been inserted
 */
ve.ce.ClipboardHandler.prototype.afterPasteInsertInternalData = function ( targetFragment, data ) {
	targetFragment.insertContent( data, this.getBeforePasteAnnotationSet() );
	return targetFragment.getPending();
};

/**
 * After clipboard handler for pastes from the another document
 *
 * @param {string|undefined} clipboardKey Clipboard key for pasted data
 * @param {jQuery|undefined} $clipboardHtml Clipboard HTML, if used to find the key
 * @param {ve.dm.SurfaceFragment} fragment Current fragment
 * @param {ve.dm.SurfaceFragment} targetFragment Fragment to insert into
 * @param {boolean} [isMultiline] Pasting to a multiline context
 * @param {boolean} [forceClipboardData] Ignore the clipboard handler element, and use only clipboard html
 * @return {jQuery.Promise} Promise which resolves when the content has been inserted
 */
ve.ce.ClipboardHandler.prototype.afterPasteAddToFragmentFromExternal = function ( clipboardKey, $clipboardHtml, fragment, targetFragment, isMultiline, forceClipboardData ) {
	const importantElement = '[id],[typeof],[rel],figure',
		items = [],
		surfaceModel = this.getSurface().getModel(),
		documentModel = surfaceModel.getDocument(),
		beforePasteData = this.beforePasteData || {};

	let htmlDoc;
	// There are two potential sources of HTML to choose from:
	// * this.$element where we we let the past happen in a context similar to the surface
	// * beforePasteData.html which is read from the clipboard API
	//
	// If clipboard API data is available, then make sure important elements haven't been dropped.
	//
	// The only reason we don't use clipboard API data unconditionally is that for simpler pastes,
	// the $element method does a good job of merging content, e.g. paragraps into paragraphs.
	//
	// If we could do a better job of mimicking how browsers merge content, the clipboard API data
	// would produce much more consistent results, as the clipboard handler element approach can also re-order
	// and destroy nodes.
	if (
		$clipboardHtml && (
			!beforePasteData.isPaste ||
			forceClipboardData ||
			// FIXME T126045: Allow the test runner to force the use of clipboardData
			clipboardKey === 'useClipboardData-0' ||
			$clipboardHtml.find( importantElement ).addBack( importantElement ).length > this.$element.find( importantElement ).length
		)
	) {
		// CE destroyed an important element, so revert to using clipboard data
		htmlDoc = ve.sanitizeHtmlToDocument( beforePasteData.html );
		$( htmlDoc )
			// Remove the pasteProtect class. See #onCopy.
			.find( 'span' ).removeClass( 've-pasteProtect' ).end()
			// Remove the clipboard key
			.find( 'span[data-ve-clipboard-key]' ).remove().end()
			// Remove ve-attributes, we trust that clipboard data preserved these attributes
			.find( '[data-ve-attributes]' ).removeAttr( 'data-ve-attributes' );
		beforePasteData.context = null;
	}
	if ( !htmlDoc ) {
		// If we're using $element, let CE do its sanitizing as it may
		// contain disruptive metadata (head tags etc.)
		htmlDoc = ve.sanitizeHtmlToDocument( this.$element.html() );
	}

	// Some browsers don't provide pasted image data through the clipboardData API and
	// instead create img tags with data URLs, so detect those here
	const $body = $( htmlDoc.body );
	const $images = $body.children( 'img[src^=data\\:]' );
	// Check the body contained just images.
	// TODO: In the future this may want to trigger image uploads *and* paste the HTML.
	if ( $images.length && $images.length === $body.children().length ) {
		for ( let i = 0; i < $images.length; i++ ) {
			items.push( ve.ui.DataTransferItem.static.newFromDataUri(
				$images.eq( i ).attr( 'src' ),
				$images[ i ].outerHTML
			) );
		}
		if ( this.getSurface().handleDataTransferItems( items, true ) ) {
			return ve.createDeferred().resolve().promise();
		}
	}

	this.afterPasteSanitizeExternal( $( htmlDoc.body ) );

	// HACK: Fix invalid HTML from Google Docs nested lists (T98100).
	// Converts
	// <ul><li>A</li><ul><li>B</li></ul></ul>
	// to
	// <ul><li>A<ul><li>B</li></ul></li></ul>
	$( htmlDoc.body ).find( 'ul > ul, ul > ol, ol > ul, ol > ol' ).each( ( n, element ) => {
		if ( element.previousElementSibling ) {
			element.previousElementSibling.appendChild( element );
		} else {
			// List starts double indented. This is invalid and a semantic nightmare.
			// Just wrap with an extra list item
			$( element ).wrap( '<li>' );
		}
	} );

	// HACK: Fix invalid HTML from copy-pasting `display: inline` lists (T239550).
	$( htmlDoc.body ).find( 'li, dd, dt' ).each( ( n, element ) => {
		const listType = { li: 'ul', dd: 'dl', dt: 'dl' },
			tag = element.tagName.toLowerCase(),
			// Parent node always exists because we're searching inside <body>
			parentTag = element.parentNode.tagName.toLowerCase();

		let list;
		if (
			( tag === 'li' && ( parentTag !== 'ul' && parentTag !== 'ol' ) ) ||
			( ( tag === 'dd' || tag === 'dt' ) && parentTag !== 'dl' )
		) {
			// This list item's parent node is not a list. This breaks expectations in DM code.
			// Wrap this node and its list item siblings in a list node.
			list = htmlDoc.createElement( listType[ tag ] );
			element.parentNode.insertBefore( list, element );

			while (
				list.nextElementSibling &&
				listType[ list.nextElementSibling.tagName.toLowerCase() ] === listType[ tag ]
			) {
				list.appendChild( list.nextElementSibling );
			}
		}
	} );

	// HTML sanitization
	const htmlBlacklist = ve.getProp( this.afterPasteImportRules( isMultiline ), 'external', 'htmlBlacklist' );
	if ( htmlBlacklist && !clipboardKey ) {
		if ( htmlBlacklist.remove ) {
			Object.keys( htmlBlacklist.remove ).forEach( ( selector ) => {
				if ( htmlBlacklist.remove[ selector ] ) {
					$( htmlDoc.body ).find( selector ).remove();
				}
			} );
		}
		if ( htmlBlacklist.unwrap ) {
			Object.keys( htmlBlacklist.unwrap ).forEach( ( selector ) => {
				if ( htmlBlacklist.unwrap[ selector ] ) {
					$( htmlDoc.body ).find( selector ).contents().unwrap();
				}
			} );
		}
	}

	// External paste
	const pastedDocumentModel = ve.dm.converter.getModelFromDom( htmlDoc, {
		targetDoc: documentModel.getHtmlDocument(),
		fromClipboard: true
	} );
	const data = pastedDocumentModel.data;
	// Clone again
	data.cloneElements( true );

	// Sanitize
	this.afterPasteSanitize( data, isMultiline, !clipboardKey );

	data.remapInternalListKeys( documentModel.getInternalList() );

	// Initialize node tree
	pastedDocumentModel.buildNodeTree();

	if ( fragment.getSelection() instanceof ve.dm.TableSelection ) {
		// External table-into-table paste
		if (
			pastedDocumentModel.documentNode.children.length === 2 &&
			pastedDocumentModel.documentNode.children[ 0 ] instanceof ve.dm.TableNode
		) {
			const tableAction = new ve.ui.TableAction( this.getSurface().getSurface() );
			tableAction.importTable( pastedDocumentModel.documentNode.children[ 0 ], true );
			return ve.createDeferred().resolve().promise();
		}

		// Pasting non-table content into table: just replace the first cell with the pasted content
		// Cell was not deleted in beforePaste to prevent flicker when table-into-table paste is about to be triggered.
		targetFragment.removeContent();
	}

	let contextRange;
	if ( beforePasteData.context ) {
		// If the paste was given context, calculate the range of the inserted data
		contextRange = this.afterPasteFromExternalContextRange( pastedDocumentModel, isMultiline, forceClipboardData );
		if ( !contextRange ) {
			return this.afterPasteAddToFragmentFromExternal( clipboardKey, $clipboardHtml, fragment, targetFragment, isMultiline, true );
		}
	} else {
		contextRange = pastedDocumentModel.getDocumentRange();
	}
	const pastedNodes = pastedDocumentModel.selectNodes( contextRange, 'siblings' )
		// Ignore nodes where nothing is selected
		.filter( ( node ) => !( node.range && node.range.isCollapsed() ) );

	// Unwrap single content branch nodes to match internal copy/paste behaviour
	// (which wouldn't put the open and close tags in the clipboard to begin with).
	if (
		pastedNodes.length === 1 &&
		pastedNodes[ 0 ].node.canContainContent()
	) {
		if ( contextRange.containsRange( pastedNodes[ 0 ].nodeRange ) ) {
			contextRange = pastedNodes[ 0 ].nodeRange;
		}
	}

	return this.afterPasteInsertExternalData( targetFragment, pastedDocumentModel, contextRange );
};

/**
 * Insert some pasted data from an external source
 *
 * @param {ve.dm.SurfaceFragment} targetFragment Fragment to insert into
 * @param {ve.dm.Document} pastedDocumentModel Model generated from pasted data
 * @param {ve.Range} contextRange Range of data in generated model to consider
 * @return {jQuery.Promise} Promise which resolves when the content has been inserted
 */
ve.ce.ClipboardHandler.prototype.afterPasteInsertExternalData = function ( targetFragment, pastedDocumentModel, contextRange ) {
	// Temporary tracking for T362358
	if ( pastedDocumentModel.getInternalList().getItemNodeCount() > 0 ) {
		ve.track( 'activity.clipboard', { action: 'paste-ref-external' } );
	}

	let handled;
	// If the external HTML turned out to be plain text after sanitization
	// then run it as a plain text transfer item. In core this will never
	// do anything, but implementations can provide their own handler for
	// conversion actions here.
	if ( pastedDocumentModel.data.isPlainText( contextRange, true, undefined, true ) ) {
		const pastedText = pastedDocumentModel.data.getText( true, contextRange );
		if ( pastedText ) {
			handled = this.getSurface().handleDataTransferItems(
				[ ve.ui.DataTransferItem.static.newFromString( pastedText ) ],
				true,
				targetFragment
			);
		}
	}
	if ( !handled ) {
		const annotations = this.getBeforePasteAnnotationSet();

		const target = this.getSurface().getSurface().getTarget();
		if ( target.constructor.static.annotateImportedData ) {
			annotations.push(
				ve.dm.annotationFactory.createFromElement(
					{
						type: 'meta/importedData',
						attributes: {
							source: this.beforePasteData.source,
							eventId: ve.init.platform.generateUniqueId()
						}
					}
				)
			);
		}

		targetFragment.insertDocument( pastedDocumentModel, contextRange, annotations );
	}
	return targetFragment.getPending();
};

/**
 * Helper to work out the context range for an external paste
 *
 * @param {ve.dm.Document} pastedDocumentModel Model for pasted data
 * @param {boolean} isMultiline Whether pasting to a multiline context
 * @param {boolean} forceClipboardData Whether the current attempted paste is the result of forcing use of clipboard data
 * @return {ve.Range|boolean} Context range, or false if data appeared corrupted
 */
ve.ce.ClipboardHandler.prototype.afterPasteFromExternalContextRange = function ( pastedDocumentModel, isMultiline, forceClipboardData ) {
	const data = pastedDocumentModel.data,
		documentRange = pastedDocumentModel.getDocumentRange(),
		beforePasteData = this.beforePasteData || {},
		context = new ve.dm.ElementLinearData(
			pastedDocumentModel.getStore(),
			ve.copy( beforePasteData.context )
		);
	// Sanitize context to match data
	this.afterPasteSanitize( context, isMultiline );

	let leftText = beforePasteData.leftText;
	let rightText = beforePasteData.rightText;

	// Remove matching context from the left
	let left = 0;
	while (
		context.getLength() &&
		ve.dm.ElementLinearData.static.compareElementsUnannotated(
			data.getData( left ),
			data.isElementData( left ) ? context.getData( 0 ) : leftText
		)
	) {
		if ( !data.isElementData( left ) ) {
			// Text context is removed
			leftText = '';
		}
		left++;
		context.splice( 0, 1 );
	}

	// Remove matching context from the right
	let right = documentRange.end;
	while (
		right > 0 &&
		context.getLength() &&
		ve.dm.ElementLinearData.static.compareElementsUnannotated(
			data.getData( right - 1 ),
			data.isElementData( right - 1 ) ? context.getData( context.getLength() - 1 ) : rightText
		)
	) {
		if ( !data.isElementData( right - 1 ) ) {
			// Text context is removed
			rightText = '';
		}
		right--;
		context.splice( context.getLength() - 1, 1 );
	}
	if ( ( leftText || rightText ) && !forceClipboardData ) {
		// If any text context is left over, assume the clipboard handler element got corrupted
		// so we should start again and try to use clipboardData instead. T193110
		return false;
	}
	// Support: Chrome
	// FIXME T126046: Strip trailing linebreaks probably introduced by Chrome bug
	while ( right > 0 && data.getType( right - 1 ) === 'break' ) {
		right--;
	}
	return new ve.Range( left, right );
};

/**
 * Helper to clean up externally pasted HTML (via clipboard handler element).
 *
 * @param {jQuery} $element Root element containing pasted stuff to sanitize
 */
ve.ce.ClipboardHandler.prototype.afterPasteSanitizeExternal = function ( $element ) {
	const metadataIdRegExp = ve.init.platform.getMetadataIdRegExp();

	// Remove the clipboard key
	$element.find( 'span[data-ve-clipboard-key]' ).remove();
	// Remove style tags (T185532)
	$element.find( 'style' ).remove();
	// If this is from external, run extra sanitization:

	// Do some simple transforms to catch content that is using
	// spans+styles instead of regular tags. This is very much targeted at
	// the output of Google Docs, but should work with anything fairly-
	// similar. This is *fragile*, but more in the sense that small
	// deviations will stop it from working, rather than it being terribly
	// likely to incorrectly over-format things.
	// TODO: This might be cleaner if we could move the sanitization into
	// dm.converter entirely.
	$element.find( 'span' ).each( ( i, node ) => {
		// Later sanitization will replace completely-empty spans with
		// their contents, so we can lazily-wrap here without cleaning
		// up.
		if ( !node.style ) {
			return;
		}
		const $node = $( node );
		if (
			+node.style.fontWeight >= 700 ||
			node.style.fontWeight === 'bold' ||
			node.style.fontWeight === 'bolder'
		) {
			$node.wrap( '<b>' );
		}
		if (
			node.style.fontStyle === 'italic' ||
			// Oblique can also add an angle, e.g. "oblique 40deg"
			node.style.fontStyle.startsWith( 'oblique' )
		) {
			$node.wrap( '<i>' );
		}
		// textDecorationLine can take multiple values, e.g. "underline line-through"
		// so use String.prototype.includes

		if ( node.style.textDecorationLine.includes( 'underline' ) ) {
			$node.wrap( '<u>' );
		}

		if ( node.style.textDecorationLine.includes( 'line-through' ) ) {
			$node.wrap( '<s>' );
		}
		if ( node.style.verticalAlign === 'super' ) {
			$node.wrap( '<sup>' );
		}
		if ( node.style.verticalAlign === 'sub' ) {
			$node.wrap( '<sub>' );
		}
	} );

	// Remove style attributes. Any valid styles will be restored by data-ve-attributes.
	$element.find( '[style]' ).removeAttr( 'style' );

	if ( metadataIdRegExp ) {
		$element.find( '[id]' ).each( ( i, el ) => {
			const $el = $( el );
			if ( metadataIdRegExp.test( $el.attr( 'id' ) ) ) {
				$el.removeAttr( 'id' );
			}
		} );
	}

	// Remove the pasteProtect class (see #onCopy) and unwrap empty spans.
	$element.find( 'span' ).each( ( i, el ) => {
		const $el = $( el );
		$el.removeClass( 've-pasteProtect' );
		if ( $el.attr( 'class' ) === '' ) {
			$el.removeAttr( 'class' );
		}
		// Unwrap empty spans
		if ( !el.attributes.length ) {
			// childNodes is a NodeList
			// eslint-disable-next-line no-jquery/no-append-html
			$el.replaceWith( el.childNodes );
		}
	} );

	// Restore attributes. See #onCopy.
	$element.find( '[data-ve-attributes]' ).each( ( i, el ) => {
		const attrsJSON = el.getAttribute( 'data-ve-attributes' );

		// Always remove the attribute, even if the JSON has been corrupted
		el.removeAttribute( 'data-ve-attributes' );

		let attrs;
		try {
			attrs = JSON.parse( attrsJSON );
		} catch ( err ) {
			// Invalid JSON
			return;
		}
		$( el ).attr( attrs );
	} );
};

/**
 * Place the native selection in the clipboard handler, ready for a copy
 */
ve.ce.ClipboardHandler.prototype.prepareForCopy = function () {
	const focusedNode = this.getSurface().focusedNode;
	this.$element.text( ( focusedNode && focusedNode.$element.text().trim() ) || '☢' );
	ve.selectElement( this.$element[ 0 ] );
	this.$element[ 0 ].focus();
};

/**
 * Prepare the clipboard handler to treat the next paste as "speical" (i.e. plain text)
 */
ve.ce.ClipboardHandler.prototype.prepareForPasteSpecial = function () {
	this.pasteSpecial = true;
};

/**
 * Check if we are in the middle of a special/plain-text paste
 *
 * @return {boolean}
 */
ve.ce.ClipboardHandler.prototype.isPasteSpecial = function () {
	return this.pasteSpecial;
};

ve.ce.ClipboardHandler.prototype.prepareForMiddleClickPaste = function ( e ) {
	// When middle click is also focusing the document, the selection may not end up
	// where you clicked, so record the offset from the click coordinates. (T311733)
	let targetOffset = -1;
	if ( this.getSurface().getModel().getSelection().isNull() ) {
		targetOffset = this.getSurface().getOffsetFromEventCoords( e );
	}
	this.middleClickTargetOffset = targetOffset !== -1 ? targetOffset : null;
	this.middleClickPasting = true;
	this.getSurface().$document.one( 'mouseup', () => {
		// Stay true until other events have run, e.g. paste
		setTimeout( () => {
			this.middleClickPasting = false;
		} );
	} );
};
