/*!
 * VisualEditor DebugBar class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Debug bar
 *
 * @class
 * @extends OO.ui.Element
 *
 * @constructor
 * @param {ve.ui.Surface} surface Surface to debug
 * @param {Object} [config] Configuration options
 */
ve.ui.DebugBar = function VeUiDebugBar( surface, config ) {
	// Parent constructor
	OO.ui.Element.call( this, config );

	this.surface = surface;

	this.$commands = this.$( '<div>' ).addClass( 've-ui-debugBar-commands' );
	this.$dumpLinmodData = this.$( '<td>' ).addClass( 've-ui-debugBar-dump-linmod-data' );
	this.$dumpLinmodMetadata = this.$( '<td>' ).addClass( 've-ui-debugBar-dump-linmod-metadata' );
	this.$dumpView = this.$( '<td>' ).addClass( 've-ui-debugBar-dump-view' );
	this.$dumpModel = this.$( '<td>' ).addClass( 've-ui-debugBar-dump-model' );

	this.$dump =
		this.$( '<table class="ve-ui-debugBar-dump"></table>' ).append(
			this.$( '<thead><th>Linear model data</th><th>Linear model metadata</th><th>View tree</th><th>Model tree</th></thead>' ),
			this.$( '<tbody>' ).append(
				this.$( '<tr>' ).append(
					this.$dumpLinmodData, this.$dumpLinmodMetadata, this.$dumpView, this.$dumpModel
				)
			)
		);

	// Widgets
	this.fromTextInput = new OO.ui.TextInputWidget( { readOnly: true } );
	this.toTextInput = new OO.ui.TextInputWidget( { readOnly: true } );

	this.logRangeButton = new OO.ui.ButtonWidget( { label: 'Log', disabled: true } );
	this.dumpModelButton = new OO.ui.ButtonWidget( { label: 'Dump model' } );
	this.dumpModelChangeToggle = new OO.ui.ToggleButtonWidget( { label: 'Dump on change' } );

	var fromLabel = new OO.ui.LabelWidget(
			{ label: 'Range', input: this.fromTextInput }
		),
		toLabel = new OO.ui.LabelWidget(
			{ label: '-', input: this.toTextInput }
		);

	// Events
	this.logRangeButton.on( 'click', ve.bind( this.onLogRangeButtonClick, this ) );
	this.dumpModelButton.on( 'click', ve.bind( this.onDumpModelButtonClick, this ) );
	this.dumpModelChangeToggle.on( 'click', ve.bind( this.onDumpModelChangeToggleClick, this ) );

	this.onDumpModelChangeToggleClick();
	this.getSurface().getModel().connect( this, { select: this.onSurfaceSelect } );
	this.onSurfaceSelect( this.getSurface().getModel().getSelection() );

	this.$element.addClass( 've-ui-debugBar' );
	this.$element.append(
		this.$commands.append(
			fromLabel.$element,
			this.fromTextInput.$element,
			toLabel.$element,
			this.toTextInput.$element,
			this.logRangeButton.$element,
			this.$( this.constructor.static.dividerTemplate ),
			this.dumpModelButton.$element,
			this.dumpModelChangeToggle.$element
		),
		this.$dump
	);

	this.target = null;
};

/* Inheritance */

OO.inheritClass( ve.ui.DebugBar, OO.ui.Element );

/**
 * Divider HTML template
 *
 * @property {string}
 */
ve.ui.DebugBar.static.dividerTemplate = '<span class="ve-ui-debugBar-commands-divider">&nbsp;</span>';

/**
 * Get surface the debug bar is attached to
 *
 * @returns {ve.ui.Surface|null} Surface
 */
ve.ui.DebugBar.prototype.getSurface = function () {
	return this.surface;
};

/**
 * Handle select events on the attached surface
 *
 * @param {ve.Range} range
 */
ve.ui.DebugBar.prototype.onSurfaceSelect = function ( range ) {
	if ( range ) {
		this.fromTextInput.setValue( range.from );
		this.toTextInput.setValue( range.to );
	}
	this.fromTextInput.setDisabled( !range );
	this.toTextInput.setDisabled( !range );
	this.logRangeButton.setDisabled( !range || range.isCollapsed() );
};

/**
 * Handle click events on the log range button
 *
 * @param {jQuery.Event} e Event
 */
ve.ui.DebugBar.prototype.onLogRangeButtonClick = function () {
	var from = this.fromTextInput.getValue(),
		to = this.toTextInput.getValue();
	// TODO: Validate input
	ve.dir( this.getSurface().view.documentView.model.data.slice( from, to ) );
};

/**
 * Handle click events on the dump model button
 *
 * @param {jQuery.Event} e Event
 */
ve.ui.DebugBar.prototype.onDumpModelButtonClick = function () {
	var debugBar = this,
		surface = debugBar.getSurface(),
		documentModel = surface.getModel().getDocument(),
		documentView = surface.getView().getDocument();

	function dumpLinMod( linearData ) {
		var i, $li, $label, element, text, annotations, data,
			$ol = debugBar.$( '<ol start="0"></ol>' );

		data = linearData instanceof ve.dm.LinearData ? linearData.data : linearData;

		for ( i = 0; i < data.length; i++ ) {
			$li = debugBar.$( '<li>' );
			$label = debugBar.$( '<span>' );
			element = data[i];
			annotations = null;
			if ( linearData instanceof ve.dm.MetaLinearData ) {
				if ( element && element.length ) {
					$li.append( dumpLinMod( element ) );
				} else {
					$li.append( debugBar.$( '<span>undefined</span>' ).addClass( 've-ui-debugBar-dump-undefined' ) );
				}
			} else {
				if ( element.type ) {
					$label.addClass( 've-ui-debugBar-dump-element' );
					text = element.type;
					annotations = element.annotations;
				} else if ( ve.isArray( element ) ) {
					$label.addClass( 've-ui-debugBar-dump-achar' );
					text = element[0];
					annotations = element[1];
				} else {
					$label.addClass( 've-ui-debugBar-dump-char' );
					text = element;
				}
				$label.html( ( text.match( /\S/ ) ? text : '&nbsp;' ) + ' ' );
				if ( annotations ) {
					$label.append(
						/*jshint loopfunc:true */
						debugBar.$( '<span>' ).text(
							'[' + documentModel.store.values( annotations ).map( function ( ann ) {
								return JSON.stringify( ann.getComparableObject() );
							} ).join( ', ' ) + ']'
						)
					);
				}

				$li.append( $label );
			}
			$ol.append( $li );
		}
		return $ol;
	}

	// linear model dump
	debugBar.$dumpLinmodData.html( dumpLinMod( documentModel.data ) );
	debugBar.$dumpLinmodMetadata.html( dumpLinMod( documentModel.metadata ) );

	/**
	 * Generate an ordered list describing a node
	 *
	 * @param {ve.Node} node Node
	 * @returns {jQuery} Ordered list
	 */
	function generateListFromNode( node ) {
		var $li, i, $label,
			$ol = debugBar.$( '<ol start="0"></ol>' );

		for ( i = 0; i < node.children.length; i++ ) {
			$li = debugBar.$( '<li>' );
			$label = debugBar.$( '<span>' ).addClass( 've-ui-debugBar-dump-element' );
			if ( node.children[i].length !== undefined ) {
				$li.append(
					$label
						.text( node.children[i].type )
						.append(
							debugBar.$( '<span>' ).text( ' (' + node.children[i].length + ')' )
						)
				);
			} else {
				$li.append( $label.text( node.children[i].type ) );
			}

			if ( node.children[i].children ) {
				$li.append( generateListFromNode( node.children[i] ) );
			}

			$ol.append( $li );
		}
		return $ol;
	}

	debugBar.$dumpModel.html(
		generateListFromNode( documentModel.getDocumentNode() )
	);
	debugBar.$dumpView.html(
		generateListFromNode( documentView.getDocumentNode() )
	);
	debugBar.$dump.show();
};

/**
 * Handle click events on the dump model toggle button
 *
 * @param {jQuery.Event} e Event
 */
ve.ui.DebugBar.prototype.onDumpModelChangeToggleClick = function () {
	if ( this.dumpModelChangeToggle.getValue() ) {
		this.onDumpModelButtonClick();
		this.getSurface().model.connect( this, { documentUpdate: this.onDumpModelButtonClick } );
	} else {
		this.getSurface().model.disconnect( this, { documentUpdate: this.onDumpModelButtonClick } );
	}
};
