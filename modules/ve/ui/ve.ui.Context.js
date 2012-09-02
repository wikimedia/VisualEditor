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
	if ( !surfaceView ) {
		return;
	}

	// Properties
	this.surfaceView = surfaceView;
	this.inspectors = {};
	this.inspector = null;
	this.position = null;
	this.clicking = false;
	this.$ = $( '<div class="ve-ui-context"></div>' );
	this.$icon = $( '<div class="ve-ui-context-icon"></div>' );
	this.$toolbar = $( '<div class="ve-ui-context-toolbar"></div>' );
	this.toolbarView = new ve.ui.Toolbar(
		this.$toolbar,
		this.surfaceView,
		[{ 'name': 'textStyle', 'items' : [ 'bold', 'italic', 'link', 'clear' ] }]
	);
	this.menuView = new ve.ui.Menu( [ { 'name': 'tools', '$': this.$toolbar } ], null, this.$ );

	// DOM Changes
	this.$.append( this.$icon );
	( $overlay || $( 'body' ) ).append( this.$ );

	// Events
	this.$icon.on( {
		'mousedown': ve.bind( this.onMouseDown, this ),
		'mouseup': ve.bind( this.onMouseUp, this )
	} );
	this.surfaceView.getDocument().getDocumentNode().$.on( {
		'focus': ve.bind( this.onDocumentFocus, this ),
		'blur': ve.bind( this.onDocumentBlur, this )
	} );

	// Initialization
	this.setupInspectorSpace();
};

/* Methods */

ve.ui.Context.prototype.setupInspectorSpace = function () {
	var $styleLink;

	// Inspector container
	this.$inspectors = $( '<div class="ve-ui-context-inspectors"></div>' );

	// Overlay in main document scope for positioning elements over iframe.
	this.$iframeOverlay = $( '<div class="ve-ui-context-overlay"></div>' );

	// Create and append an iframe to contain inspectors.
	// NOTE: Inspectors are required to be inside the iframe to prevent loss of content selection.
	this.$inspectorFrame = $( '<iframe frameborder="0"></iframe>' );

	// Attach inspectors and overlays
	this.$.append( this.$inspectors.append( this.$iframeOverlay, this.$inspectorFrame ) );

	// Iframe document reference.
	this.inspectorDoc = this.$inspectorFrame.prop( 'contentWindow' ).document;

	// Write a container element to the iframe.
	// NOTE: This is required for cross browser appending.
	this.inspectorDoc.write( '<div class="ve-ui-context-overlay-wrapper"></div>' );
	this.inspectorDoc.close();
	this.$inspectorWrapper = $( this.inspectorDoc ).find( '.ve-ui-context-overlay-wrapper' );

	// Create iframe style element.
	$styleLink =
		$( '<link>', this.inspectorDoc )
			.attr( {
				'rel': 'stylesheet',
				'type': 'text/css',
				'media': 'screen',
				'href': ve.init.platform.getModulesUrl() + '/ve/ui/styles/ve.ui.Inspector.css'
			} );

	// Append style element to head.
	$( this.inspectorDoc ).find( 'head' ).append( $styleLink );

	// Set iframe body styles.
	$( 'body', this.inspectorDoc ).css( {
		'padding': '0px 5px',
		'margin': 0
	} );

	// Intitialize link inspector.
	this.addInspector( 'link', new ve.ui.LinkInspector( this.toolbarView, this ) );
};

ve.ui.Context.prototype.onDocumentFocus = function () {
	$( window ).on( 'resize.ve-ui-context scroll.ve-ui-context', ve.bind( this.set, this ) );
};

ve.ui.Context.prototype.onDocumentBlur = function () {
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
	this.$icon.addClass( 've-ui-context-icon-active' );
};

ve.ui.Context.prototype.closeMenu = function () {
	this.menuView.close();
	this.$icon.removeClass( 've-ui-context-icon-active' );
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
	this.$.removeClass( 've-ui-context-position-start ve-ui-context-position-end' );

	var selection = this.surfaceView.model.getSelection(),
		selectionRect = this.surfaceView.getSelectionRect();

	if ( selection.to > selection.from ) {
		this.position = new ve.Position( selectionRect.end.x, selectionRect.end.y );
		this.$.addClass( 've-ui-context-position-end' );
	} else {
		this.position = new ve.Position( selectionRect.start.x, selectionRect.start.y );
		this.$.addClass( 've-ui-context-position-start' );
	}

	this.$.css( {
		'left': this.position.left,
		'top': this.position.top
	} );
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
	this.$.removeClass( 've-ui-context-position-below ve-ui-context-position-above' );
	if (
		selection.from < selection.to &&
		this.position.top + overlayHeight + ( overlayMargin * 2 ) < windowHeight + windowScrollTop
	) {
		this.$.addClass( 've-ui-context-position-below' );
	} else {
		this.$.addClass( 've-ui-context-position-above' );
	}

};

// Method to position iframe overlay above or below an element.
ve.ui.Context.prototype.positionIframeOverlay = function ( config ) {
	var left, top;
	if (
		config === undefined ||
		! ( 'overlay' in config )
	) {
		return;
	}
	// Set iframe overlay below element.
	if ( 'below' in config ) {
		left = config.below.offset().left;
		top = config.below.offset().top + config.below.outerHeight();
	// Set iframe overlay above element.
	} else if ( 'above' in config ) {
		left = config.above.offset().left;
		top = config.above.offset().top;
	}
	// Set position.
	config.overlay.css( {
		'left': left,
		'top': top,
		// RTL position fix.
		'width': config.overlay.children().outerWidth( true )
	} );
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
		throw new Error( 'Missing inspector error. Can not open nonexistent inspector: ' + name );
	}
	this.inspectors[name].open();
	this.resizeInspectorFrame( this.inspectors[name] );
	// Setting this to auto makes position overlay work correctly.
	this.$inspectors.css({
		'height': 'auto',
		'width': 'auto',
		'visibility': 'visible'
	});
	this.positionOverlay( this.$inspectors );
	this.inspector = name;
};

ve.ui.Context.prototype.closeInspector = function ( accept ) {
	if ( this.inspector ) {
		this.inspectors[this.inspector].close( accept );
		this.inspector = null;
	}
	this.$inspectors.css( {
		'visibility': 'hidden',
		'width': 0,
		'height': 0
	} );
};

ve.ui.Context.prototype.getInspector = function ( name ) {
	if ( name in this.inspectors ) {
		return this.inspectors[name];
	}
	return null;
};

ve.ui.Context.prototype.addInspector = function ( name, inspector ) {
	if ( name in this.inspectors ) {
		throw new Error( 'Duplicate inspector error. Previous registration with the same name: ' + name );
	}
	inspector.$.hide();
	this.inspectors[name] = inspector;
	this.$inspectorWrapper.append( inspector.$ );
};

//TODO: need better iframe resizing. Currently sizes to dimensions of specified inspector.
ve.ui.Context.prototype.resizeInspectorFrame = function ( inspector ) {
	var width = inspector.$.outerWidth(),
		height = inspector.$.outerHeight();
	this.$inspectorFrame.css( {
		'width': width + 10,
		'height': height + 10
	} );
};

ve.ui.Context.prototype.removeInspector = function ( name ) {
	if ( name in this.inspectors ) {
		throw new Error( 'Missing inspector error. Can not remove nonexistent inspector: ' + name );
	}
	this.inspectors[name].detach();
	delete this.inspectors[name];
	this.inspector = null;
};
