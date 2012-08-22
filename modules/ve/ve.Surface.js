/**
 * VisualEditor Surface class.
 *
 * @copyright 2011-2012 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Creates an ve.Surface object.
 *
 * A surface is a top-level object which contains both a surface model and a surface view.
 *
 * @class
 * @constructor
 * @param {String} parent Selector of element to attach to
 * @param {HTMLElement} html Document html
 * @param {Object} options Configuration options
 */
ve.Surface = function ( parent, dom, options ) {
	// Create linear model from HTML5 DOM
	var data = ve.dm.converter.getDataFromDom( dom );
	// Properties
	this.parent = parent;
	this.currentMode = null;
	/* Extend VE configuration recursively */
	this.options = ve.extendObject( true, {
		// Default options
		toolbars: {
			top: {
				tools: [{ 'name': 'history', 'items' : ['undo', 'redo'] },
						{ 'name': 'textStyle', 'items' : ['format'] },
						{ 'name': 'textStyle', 'items' : ['bold', 'italic', 'link', 'clear'] },
						{ 'name': 'list', 'items' : ['number', 'bullet', 'outdent', 'indent'] }]
			}
		}
	}, options );

	// A place to store element references
	this.$base = null;
	this.$surface = null;
	this.toolbarWrapper = {};

	// Create document model object with the linear model
	this.documentModel = new ve.dm.Document( data );
	this.model = new ve.dm.Surface( this.documentModel );

	// Setup VE DOM Skeleton
	this.setupBaseElements();

	this.$surface = $( '<div>' ).addClass( 'es-editor' );
	this.$base.find( '.es-visual' ).append( this.$surface );

	/* Instantiate surface layer */
	this.view = new ve.ce.Surface( $( '.es-editor' ), this.model );

	// Setup toolbars based on this.options
	this.setupToolbars();

	// Registration
	ve.instances.push( this );

	// Start tracking changes
	this.model.startHistoryTracking();
};

/* Methods */

ve.Surface.prototype.getModel = function () {
	return this.model;
};

ve.Surface.prototype.getDocumentModel = function () {
	return this.documentModel;
};

ve.Surface.prototype.getView = function () {
	return this.view;
};

ve.Surface.prototype.getContext = function () {
	return this.context;
};

ve.Surface.prototype.getParent = function () {
	return this.parent;
};

ve.Surface.prototype.setupBaseElements = function () {
	// Make new base element
	this.$base = $( '<div>' )
		.addClass( 'es-base' )
		.append(
			$( '<div>' ).addClass( 'es-panes' )
				.append( $( '<div>' ).addClass( 'es-visual' ) )
				.append( $( '<div>' ).addClass( 'es-panels' ) )
				.append( $( '<div>' ).css( 'clear', 'both' ) )
		)
		.append(
			$( '<div>' ).attr( {
				// TODO: make 'paste' in surface stateful and remove this attrib
				'id': 'paste',
				'class': 'paste',
				'contenteditable': 'true'
			} )
		);
	// Attach the base the the parent
	$( this.getParent() ).append( this.$base );
};

ve.Surface.prototype.setupToolbars = function () {
	var surface = this;

	// Build each toolbar
	$.each( this.options.toolbars, function ( name, config ) {
		if ( config !== null ) {
			if( name === 'top' ) {
				// Append toolbar wrapper at the top, just above .es-panes
				surface.toolbarWrapper[name] = $( '<div>' )
					.addClass( 'es-toolbar-wrapper' )
					.append(
						$( '<div>' ).addClass( 'es-toolbar' )
							.append(
								$( '<div>' ).addClass( 'es-modes' )
							).append(
								$( '<div>' ).css( 'clear', 'both' )
							).append(
								$( '<div>' ).addClass( 'es-toolbar-shadow' )
							)
				);

				surface.$base.find( '.es-panes' ).before( surface.toolbarWrapper[name] );

				if ( 'float' in config && config.float === true ) {
					// Float top toolbar
					surface.floatTopToolbar();
				}
			}
			// Instantiate the toolbar
			surface['toolbar-' + name] = new ve.ui.Toolbar(
				surface.$base.find( '.es-toolbar' ),
				surface.view,
				config.tools
			);
		}
	} );
};

/*
 * This code is responsible for switching toolbar into floating mode when scrolling ( with
 * keyboard or mouse ).
 * TODO: Determine if this would be better in ui.toolbar vs here.
 * TODO: This needs to be refactored so that it only works on the main editor top tool bar.
 */
ve.Surface.prototype.floatTopToolbar = function () {
	if ( !this.toolbarWrapper.top ) {
		return;
	}
	var $toolbarWrapper = this.toolbarWrapper.top,
		$toolbar = $toolbarWrapper.find( '.es-toolbar' ),
		$window = $( window );

	$window.on( {
		'resize': function () {
			if ( $toolbarWrapper.hasClass( 'es-toolbar-wrapper-floating' ) ) {
				var toolbarWrapperOffset = $toolbarWrapper.offset(),
					left = toolbarWrapperOffset.left,
					right = $window.width() - $toolbarWrapper.outerWidth() - left;
				$toolbar.css( {
					'left': left,
					'right': right
				} );
			}
		},
		'scroll': function () {
			var left, right,
				toolbarWrapperOffset = $toolbarWrapper.offset(),
				$editorDocument = $toolbarWrapper.parent().find('.ve-surface .ve-ce-documentNode'),
				$lastBranch = $editorDocument.children( '.ve-ce-branchNode:last' );

			if ( $window.scrollTop() > toolbarWrapperOffset.top ) {
				left = toolbarWrapperOffset.left;
				right = $window.width() - $toolbarWrapper.outerWidth() - left;
				// If not floating, set float
				if ( !$toolbarWrapper.hasClass( 'es-toolbar-wrapper-floating' ) ) {
					$toolbarWrapper
						.css( 'height', $toolbarWrapper.height() )
						.addClass( 'es-toolbar-wrapper-floating' );
					$toolbar.css( {
						'left': left,
						'right': right
					} );
				} else {
					// Toolbar is floated
					if (
						// There's at least one branch
						$lastBranch.length &&
						// Toolbar is at or below the top of last node in the document
						$window.scrollTop() + $toolbar.height() >= $lastBranch.offset().top
					) {
						if ( !$toolbarWrapper.hasClass( 'es-toolbar-wrapper-bottom' ) ) {
							$toolbarWrapper
								.removeClass( 'es-toolbar-wrapper-floating' )
								.addClass( 'es-toolbar-wrapper-bottom' );
							$toolbar.css({
								'top': $window.scrollTop() + 'px',
								'left': left,
								'right': right
							});
						}
					} else { // Unattach toolbar
						if ( $toolbarWrapper.hasClass( 'es-toolbar-wrapper-bottom' ) ) {
							$toolbarWrapper
								.removeClass( 'es-toolbar-wrapper-bottom' )
								.addClass( 'es-toolbar-wrapper-floating' );
							$toolbar.css( {
								'top': 0,
								'left': left,
								'right': right
							} );
						}
					}
				}
			} else { // Return toolbar to top position
				if (
					$toolbarWrapper.hasClass( 'es-toolbar-wrapper-floating' ) ||
					$toolbarWrapper.hasClass( 'es-toolbar-wrapper-bottom' )
				) {
					$toolbarWrapper.css( 'height', 'auto' )
						.removeClass( 'es-toolbar-wrapper-floating' )
						.removeClass( 'es-toolbar-wrapper-bottom' );
					$toolbar.css( {
						'top': 0,
						'left': 0,
						'right': 0
					} );
				}
			}
		}
	} );
};
