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
ve.Surface = function( parent, dom, options ) {
	// Create linear model from HTML5 DOM
	var data = ve.dm.converter.getDataFromDom( dom );
	// Properties
	this.parent = parent;
	this.modes = {};
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
		},
		//TODO: i18n
		modes: {
			wikitext: 'Toggle wikitext view',
			json: 'Toggle JSON view',
			html: 'Toggle HTML view',
			render: 'Toggle preview',
			history: 'Toggle transaction history view',
			help: 'Toggle help view'
		}

	}, options );

	// A place to store element references
	this.$base = null;
	this.$surface = null;
	this.toolbarWrapper = {};

	/* Create document model object with the linear model */
	this.documentModel = new ve.dm.Document ( data );
	this.model = new ve.dm.Surface( this.documentModel );
	
	// Setup VE DOM Skeleton
	this.setupBaseElements();

	this.$surface = $( '<div></div>' ).attr( 'class', 'es-editor' );
	this.$base.find( '.es-visual' ).append( this.$surface );

	/* Instantiate surface layer */
	this.view = new ve.ce.Surface( $( '.es-editor' ), this.model );

	// Setup toolbars based on this.options
	this.setupToolbars();

	// Setup various toolbar modes and panels
	//this.setupModes();

	// Registration
	ve.instances.push( this );

	// Start tracking changes
	this.model.startHistoryTracking();
};

/* Methods */

ve.Surface.prototype.getModel = function() {
	return this.model;
};

ve.Surface.prototype.getDocumentModel = function() {
	return this.documentModel;
};

ve.Surface.prototype.getView = function() {
	return this.view;
};

ve.Surface.prototype.getContext = function() {
	return this.context;
};

ve.Surface.prototype.getParent = function() {
	return this.parent;
};

ve.Surface.prototype.setupBaseElements = function() {
	// Make new base element
	this.$base = $( '<div></div>' )
		.attr( 'class', 'es-base' )
		.append(
			$( '<div></div>' ).attr( 'class', 'es-panes' )
				.append( $( '<div></div>' ).attr( 'class', 'es-visual' ) )
				.append( $( '<div></div>' ).attr( 'class', 'es-panels' ) )
				.append( $( '<div></div>' ).attr( 'style', 'clear:both' ) )
		)
		.append(
			$( '<div></div>' ).attr( {
				// TODO: make 'paste' in surface stateful and remove this attrib
				'id': 'paste',
				'class': 'paste',
				'contenteditable': 'true'
			} )
		);
	// Attach the base the the parent
	$( this.getParent() ).append( this.$base );
};

ve.Surface.prototype.setupToolbars = function() {
	var _this = this;

	// Build each toolbar
	$.each( this.options.toolbars, function( name, config ) {
		if ( config !== null ) {
			if( name === 'top' ) {
				// Append toolbar wrapper at the top, just above .es-panes
				_this.toolbarWrapper[name] = $( '<div></div>' )
					.attr( 'class', 'es-toolbar-wrapper' )
					.append(
						$( '<div></div>' ).attr( 'class', 'es-toolbar' )
							.append(
								$( '<div></div>' ).attr( 'class', 'es-modes' )
							).append(
								$( '<div></div>' ).attr( 'style', 'clear:both' )
							).append(
								$( '<div></div>' ).attr( 'class', 'es-toolbar-shadow' )
							)
				);

				_this.$base.find( '.es-panes' ).before( _this.toolbarWrapper[name] );
			}
			// Instantiate the toolbar
			_this['toolbar-' + name] = new ve.ui.Toolbar(
				_this.$base.find( '.es-toolbar' ), _this.view, config.tools
			);
		}
	} );

	// Setup sticky toolbar
	this.makeMainEditorToolbarFloat();
};

/*
 * This code is responsible for switching toolbar into floating mode when scrolling ( with
 * keyboard or mouse ).
 * TODO: Determine if this would be better in ui.toolbar vs here.
 * TODO: This needs to be refactored so that it only works on the main editor top tool bar.
 */
ve.Surface.prototype.makeMainEditorToolbarFloat = function() {
	if ( !this.toolbarWrapper.top ) {
		return;
	}
	var $toolbarWrapper = this.toolbarWrapper.top,
		$toolbar = $toolbarWrapper.find( '.es-toolbar' ),
		$window = $( window );

	$window.scroll( function() {
		var toolbarWrapperOffset = $toolbarWrapper.offset();
		if ( $window.scrollTop() > toolbarWrapperOffset.top ) {
			if ( !$toolbarWrapper.hasClass( 'float' ) ) {
				var	left = toolbarWrapperOffset.left,
					right = $window.width() - $toolbarWrapper.outerWidth() - left;
				$toolbarWrapper.css( 'height', $toolbarWrapper.height() ).addClass( 'float' );
				$toolbar.css( { 'left': left, 'right': right } );
			}
		} else {
			if ( $toolbarWrapper.hasClass( 'float' ) ) {
				$toolbarWrapper.css( 'height', 'auto' ).removeClass( 'float' );
				$toolbar.css( { 'left': 0, 'right': 0 } );
			}
		}
	} );
};

ve.Surface.prototype.setupModes = function(){
	var _this = this;
	var activeModes = [];

	// Loop through toolbar config to build modes
	$.each( _this.options.toolbars, function( name, toolbar ){
		//if toolbar has modes
		if( toolbar.modes && toolbar.modes.length > 0 ) {
			for( var i=0;i<=toolbar.modes.length -1;i++ ) {
				$( _this.toolbarWrapper[name] )
					.find( '.es-modes' )
					.append(
						$( '<div></div>' ).attr( {
							'class': 'es-modes-button es-mode-' + toolbar.modes[i],
							'title': _this.options.modes[toolbar.modes[i]]
						} )
				);
				if( !activeModes[mode] ) {
					activeModes.push( toolbar.modes[i] );
				}
			}
		}
	} );

	// Build elements in #es-panels for each activeMode
	if ( activeModes.length > 0 ) {
		for ( var mode in activeModes ) {
			var renderType = '';
			switch( activeModes[mode] ) {
				case 'render':
					renderType = 'es-render';
					break;
				case 'help':
					renderType = '';
					break;
				default:
					renderType = 'es-code';
					break;
			}
			_this.$base
				.find( '.es-panels' )
				.append(
					$( '<div></div>' ).attr(
						'class', 'es-panel es-panel-' + activeModes[mode] + ' ' + renderType
					)
				);
		}
	}
	/*
		Define this.modes
		Called after bulding elements.
	*/
	this.defineModes();

	//Bind Mode events
	$.each( this.modes, function( name, mode ) {
		mode.$.click( function() {
			var disable = $( this ).hasClass( 'es-modes-button-down' );
			var visible = _this.$base.hasClass( 'es-showData' );
			$( '.es-modes-button' ).removeClass( 'es-modes-button-down' );
			$( '.es-panel' ).hide();
			if ( disable ) {
				if ( visible ) {
					_this.$base.removeClass( 'es-showData' );
					$( window ).resize();
				}
				_this.currentMode = null;
			} else {
				$( this ).addClass( 'es-modes-button-down' );
				mode.$panel.show();
				if ( !visible ) {
					_this.$base.addClass( 'es-showData' );
					$( window ).resize();
				}
				mode.update.call( mode );
				_this.currentMode = mode;
			}
		} );
	} );

	/* Bind some surface events for modes */
	this.model.on( 'transact', function() {
		if ( _this.currentMode ) {
			_this.currentMode.update.call( _this.currentMode );
		}
	} );
	this.model.on( 'select', function() {
		if ( _this.currentMode === _this.modes.history ) {
			_this.currentMode.update.call( _this.currentMode );
		}
	} );


};

/*
	Define modes
	TODO: possibly extend this object via the config
*/
ve.Surface.prototype.defineModes = function() {
	var _this = this;
	this.modes = {
		'wikitext': {
			'$': _this.$base.find( '.es-mode-wikitext' ),
			'$panel': _this.$base.find( '.es-panel-wikitext' ),
			'update': function() {
				this.$panel.text(
					ve.dm.WikitextSerializer.stringify( _this.getDocumentModel().getPlainObject() )
				);
			}
		},
		'json': {
			'$': _this.$base.find( '.es-mode-json' ),
			'$panel': _this.$base.find( '.es-panel-json' ),
			'update': function() {
				this.$panel.text( ve.dm.JsonSerializer.stringify( _this.getDocumentModel().getPlainObject(), {
					'indentWith': '  '
				} ) );
			}
		},
		'html': {
			'$': _this.$base.find( '.es-mode-html' ),
			'$panel': _this.$base.find( '.es-panel-html' ),
			'update': function() {
				this.$panel.text(
					ve.dm.HtmlSerializer.stringify( _this.getDocumentModel().getPlainObject() )
				);
			}
		},
		'render': {
			'$': _this.$base.find( '.es-mode-render' ),
			'$panel': _this.$base.find( '.es-panel-render' ),
			'update': function() {
				this.$panel.html(
					ve.dm.HtmlSerializer.stringify( _this.getDocumentModel().getPlainObject() )
				);
			}
		},
		'history': {
			'$': _this.$base.find( '.es-mode-history' ),
			'$panel': _this.$base.find( '.es-panel-history' ),
			'update': function() {
				var	history = _this.model.getHistory(),
					i = history.length,
					end = Math.max( 0, i - 25 ),
					j,
					k,
					ops,
					events = '',
					z = 0,
					operations,
					data;
					
				while ( --i >= end ) {
					z++;
					operations = [];
					for ( j = 0; j < history[i].stack.length; j++ ) {
						ops = history[i].stack[j].getOperations().slice( 0 );
						for ( k = 0; k < ops.length; k++ ) {
							data = ops[k].data || ops[k].length;
							if ( ve.isArray( data ) ) {
								data = data[0];
								if ( ve.isArray( data ) ) {
									data = data[0];
								}
							}
							if ( typeof data !== 'string' && typeof data !== 'number' ) {
								data = '-';
							}
							ops[k] = ops[k].type.substr( 0, 3 ) + '( ' + data + ' )';
						}
						operations.push( '[' + ops.join( ', ' ) + ']' );
					}
					events += '<div' + ( z === _this.model.undoIndex ? ' class="es-panel-history-active"' : '' ) + '>' + operations.join( ', ' ) + '</div>';
				}
				
				this.$panel.html( events );
			}
		},
		'help': {
			'$': _this.$base.find( '.es-mode-help' ),
			'$panel': _this.$base.find( '.es-panel-help' ),
			'update': function() {
				//TODO: Make this less ugly,
				//HOW?: Create api to register help items so that they may be generated here.
				/*jshint multistr:true */
				this.$panel.html( '\
				<div class="es-help-title">Keyboard Shortcuts</div>\
				<div class="es-help-shortcuts-title">Clipboard</div>\
				<div class="es-help-shortcut">\
					<span class="es-help-keys">\
						<span class="es-help-key">Ctrl <span class="es-help-key-or">or</span> &#8984;</span> +\
						<span class="es-help-key">C</span>\
					</span>\
					Copy selected text\
				</div>\
				<div class="es-help-shortcut">\
					<span class="es-help-keys">\
						<span class="es-help-key">Ctrl <span class="es-help-key-or">or</span> &#8984;</span> +\
						<span class="es-help-key">X</span>\
					</span>\
					Cut selected text\
				</div>\
				<div class="es-help-shortcut">\
					<span class="es-help-keys">\
						<span class="es-help-key">Ctrl <span class="es-help-key-or">or</span> &#8984;</span> +\
						<span class="es-help-key">V</span>\
					</span>\
					Paste text at the cursor\
				</div>\
				<div class="es-help-shortcuts-title">History navigation</div>\
				<div class="es-help-shortcut">\
					<span class="es-help-keys">\
						<span class="es-help-key">Ctrl <span class="es-help-key-or">or</span> &#8984;</span> +\
						<span class="es-help-key">Z</span>\
					</span>\
					Undo\
				</div>\
				<div class="es-help-shortcut">\
					<span class="es-help-keys">\
						<span class="es-help-key">Ctrl <span class="es-help-key-or">or</span> &#8984;</span> +\
						<span class="es-help-key">Y</span>\
					</span>\
					Redo\
				</div>\
				<div class="es-help-shortcut">\
					<span class="es-help-keys">\
						<span class="es-help-key">Ctrl <span class="es-help-key-or">or</span> &#8984;</span> +\
						<span class="es-help-key">&#8679;</span> +\
						<span class="es-help-key">Z</span>\
					</span>\
					Redo\
				</div>\
				<div class="es-help-shortcuts-title">Formatting</div>\
				<div class="es-help-shortcut">\
					<span class="es-help-keys">\
						<span class="es-help-key">Ctrl <span class="es-help-key-or">or</span> &#8984;</span> +\
						<span class="es-help-key">B</span>\
					</span>\
					Make selected text bold\
				</div>\
				<div class="es-help-shortcut">\
					<span class="es-help-keys">\
						<span class="es-help-key">Ctrl <span class="es-help-key-or">or</span> &#8984;</span> +\
						<span class="es-help-key">I</span>\
					</span>\
					Make selected text italic\
				</div>\
				<div class="es-help-shortcut">\
					<span class="es-help-keys">\
						<span class="es-help-key">Ctrl <span class="es-help-key-or">or</span> &#8984;</span> +\
						<span class="es-help-key">K</span>\
					</span>\
					Make selected text a link\
				</div>\
				<div class="es-help-shortcuts-title">Selection</div>\
				<div class="es-help-shortcut">\
					<span class="es-help-keys">\
						<span class="es-help-key">&#8679;</span> +\
						<span class="es-help-key">Arrow</span>\
					</span>\
					Adjust selection\
				</div>\
				<div class="es-help-shortcut">\
					<span class="es-help-keys">\
						<span class="es-help-key">Ctrl <span class="es-help-key-or">or</span> &#x2325;</span> +\
						<span class="es-help-key">Arrow</span>\
					</span>\
					Move cursor by words or blocks\
				</div>\
				<div class="es-help-shortcut">\
					<span class="es-help-keys">\
						<span class="es-help-key">Ctrl <span class="es-help-key-or">or</span> &#x2325;</span> +\
						<span class="es-help-key">&#8679;</span> +\
						<span class="es-help-key">Arrow</span>\
					</span>\
					Adjust selection by words or blocks\
				</div>' );
			}
		}
	};
};
