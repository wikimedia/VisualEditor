/**
 * VisualEditor user interface Context class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.ui.Context object.
 *
 * @class
 * @constructor
 * @param {jQuery} $overlay DOM selection to add nodes to
 */
ve.ui.Context = function ( surfaceView, $overlay ) {
	// Inheritance
	if ( !surfaceView ) {
		return;
	}

	// Properties
	this.surfaceView = surfaceView;
	this.inspectors = {};
	this.inspector = null;
	this.position = null;
	this.clicking = false;
	this.$ = $( '<div class="es-contextView"></div>' ).appendTo( $overlay || $( 'body' ) );
	this.$toolbar = $( '<div class="es-contextView-toolbar"></div>' );

	// Create iframe which will contain context inspectors.
	this.setupInspectorFrame();

	this.$icon = $( '<div class="es-contextView-icon"></div>' ).appendTo( this.$ );
	this.toolbarView = new ve.ui.Toolbar(
		this.$toolbar,
		this.surfaceView,
		[{ 'name': 'textStyle', 'items' : [ 'bold', 'italic', 'link', 'clear' ] }]
	);
	this.menuView = new ve.ui.Menu( [
			// Example menu items
			{ 'name': 'tools', '$': this.$toolbar }
		],
		null,
		this.$
	);
	
	// Events
	this.$icon.on( {
		'mousedown': ve.proxy( this.onMouseDown, this ),
		'mouseup': ve.proxy( this.onMouseUp, this )
	} );
	this.surfaceView.getDocument().getDocumentNode().$.on( {
		'focus': ve.proxy( this.onDocumentFocus, this ),
		'blur': ve.proxy( this.onDocumentBlur, this )
	} );

	// Intitialize link inspector
	this.addInspector( 'link', new ve.ui.LinkInspector( this.toolbarView, this ) );
};

/* Methods */

ve.ui.Context.prototype.setupInspectorFrame = function () {
	// Create and append an iframe for inspectors.
	// Use of iframe is required to retain selection while inspector controls are focused.
	this.$inspectors =
		$( '<iframe class="es-contextView-inspectors"></iframe>' )
			.attr({
				'frameborder': '0'
			})
			.appendTo( this.$ );

	// Stash iframe document reference to properly create & append elements.
	this.inspectorDoc = this.$inspectors.prop( 'contentWindow' ).document;

	// Cross browser trick to append content to an iframe
	// Write a containing element to the iframe
	this.inspectorDoc.write( '<div class="ve-inspector-wrapper"></div>' );
	this.inspectorDoc.close();
	this.$inspectorWrapper = $( this.inspectorDoc ).find( '.ve-inspector-wrapper' );

	// Create style element in iframe document scope
	var $styleLink =
		$( '<link>', this.inspectorDoc )
			.attr( {
				'rel': 'stylesheet',
				'type': 'text/css',
				'media': 'screen',
				'href': ve.init.platform.getModulesUrl() + '/ve/ui/styles/ve.ui.Inspector.css'
			} );

	// Append inspector styles to iframe head
	$( 'head', this.inspectorDoc ).append( $styleLink );

	// Adjust iframe body styles.
	$( 'body', this.inspectorDoc ).css( {
		'padding': '0px 5px 10px 5px',
		'margin': 0
	} );

	this.hideInspectorFrame();
};

ve.ui.Context.prototype.onDocumentFocus = function ( e ) {
	$( window ).on( 'resize.ve-ui-context scroll.ve-ui-context', ve.proxy( this.set, this ) );
};

ve.ui.Context.prototype.onDocumentBlur = function ( e ) {
	$( window ).off( 'resize.ve-ui-context scroll.ve-ui-context' );
};

ve.ui.Context.prototype.onMouseDown = function ( e ) {
	this.clicking = true;
	e.preventDefault();
	return false;
};

ve.ui.Context.prototype.onMouseUp = function ( e ) {
	if ( this.clicking && e.which === 1 ) {
		if ( this.inspector ) {
			this.closeInspector();
		} else {
			if ( this.isMenuOpen() ) {
				this.closeMenu();
			} else {
				this.openMenu();
			}
		}
	}
	this.clicking = false;
};

ve.ui.Context.prototype.getSurfaceView = function () {
	return this.surfaceView;
};

ve.ui.Context.prototype.openMenu = function () {
	this.menuView.open();
};

ve.ui.Context.prototype.closeMenu = function () {
	this.menuView.close();
};

ve.ui.Context.prototype.isMenuOpen = function () {
	return this.menuView.isOpen();
};

ve.ui.Context.prototype.areChildrenCurrentlyVisible = function () {
	return this.inspector !== null || this.menuView.isOpen();
};

ve.ui.Context.prototype.set = function () {
	if ( this.surfaceView.getModel().getSelection().getLength() > 0 ) {
		this.positionIcon();
		if ( this.position ) {
			this.positionOverlay( this.menuView.$ );
			if ( this.inspector ) {
				this.positionOverlay ( this.$inspectors );
			}
		}
	}
};

ve.ui.Context.prototype.positionIcon = function () {
	this.$.removeClass( 'es-contextView-position-start es-contextView-position-end' );

	var selection = this.surfaceView.model.getSelection(),
		selectionRect = this.surfaceView.getSelectionRect();

	if( selection.to > selection.from ) {
		this.position = new ve.Position( selectionRect.end.x, selectionRect.end.y );
		this.$.addClass( 'es-contextView-position-end' );
	} else {
		this.position = new ve.Position( selectionRect.start.x, selectionRect.start.y );
		this.$.addClass( 'es-contextView-position-start' );
	}

	this.$.css( { 'left': this.position.left, 'top': this.position.top } );
	this.$icon.fadeIn( 'fast' );
};

ve.ui.Context.prototype.positionOverlay = function ( $overlay ) {
	var overlayMargin = 5,
		overlayWidth = $overlay.outerWidth(),
		overlayHeight = $overlay.outerHeight(),
		$window = $( window ),
		windowWidth = $window.width(),
		windowHeight = $window.height(),
		windowScrollTop = $window.scrollTop(),
		selection = this.surfaceView.model.getSelection(),
		// Center align overlay
		overlayLeft = -Math.round( overlayWidth / 2 );

	// Adjust overlay left or right depending on viewport
	if ( ( this.position.left - overlayMargin ) + overlayLeft < 0 ) {
		// Move right a bit past center
		overlayLeft -= this.position.left + overlayLeft - overlayMargin;
	} else if ( ( overlayMargin + this.position.left ) - overlayLeft > windowWidth ) {
		// Move left a bit past center
		overlayLeft += windowWidth - overlayMargin - ( this.position.left - overlayLeft );
	}

	$overlay.css( 'left', overlayLeft );

	// Position overlay on top or bottom depending on viewport
	this.$.removeClass( 'es-contextView-position-below es-contextView-position-above' );
	if (
		selection.from < selection.to &&
		this.position.top + overlayHeight + ( overlayMargin * 2 ) < windowHeight + windowScrollTop
	) {
		this.$.addClass( 'es-contextView-position-below' );
	} else {
		this.$.addClass( 'es-contextView-position-above' );
	}

};

ve.ui.Context.prototype.clear = function () {
	if ( this.inspector ) {
		this.closeInspector();
	}
	this.$icon.hide();
	this.menuView.close();
};

ve.ui.Context.prototype.openInspector = function ( name ) {
	if ( !( name in this.inspectors ) ) {
		throw new ve.Error( 'Missing inspector error. Can not open nonexistent inspector: ' + name );
	}
	this.inspectors[name].open();
	this.resizeInspectorFrame( this.inspectors[name] );
	this.positionOverlay( this.$inspectors );
	this.inspector = name;
};

ve.ui.Context.prototype.closeInspector = function ( accept ) {
	if ( this.inspector ) {
		this.inspectors[this.inspector].close( accept );
		this.hideInspectorFrame();
		this.inspector = null;
	}
};

ve.ui.Context.prototype.getInspector = function ( name ) {
	if ( name in this.inspectors ) {
		return this.inspectors[name];
	}
	return null;
};

ve.ui.Context.prototype.addInspector = function ( name, inspector ) {
	if ( name in this.inspectors ) {
		throw new ve.Error( 'Duplicate inspector error. Previous registration with the same name: ' + name );
	}
	inspector.$.hide();
	this.inspectors[name] = inspector;
	this.$inspectorWrapper.append( inspector.$ );
};

ve.ui.Context.prototype.hideInspectorFrame = function ( inspector ) {
	this.$inspectors.css({
		'width': 0,
		'height': 0,
		'visibility': 'hidden'
	});
};

ve.ui.Context.prototype.resizeInspectorFrame = function ( inspector ) {
	this.$inspectors.css( {
		'width': inspector.$.outerWidth( true ) + 10,
		'height': inspector.$.outerHeight( true ) + 10,
		'visibility': 'visible'
	} );
};

ve.ui.Context.prototype.removeInspector = function ( name ) {
	if ( name in this.inspectors ) {
		throw new ve.Error( 'Missing inspector error. Can not remove nonexistent inspector: ' + name );
	}
	this.inspectors[name].detach();
	delete this.inspectors[name];
	this.inspector = null;
};
