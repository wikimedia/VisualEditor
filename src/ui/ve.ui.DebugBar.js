/*!
 * VisualEditor DebugBar class.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
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
	var closeButton;

	// Parent constructor
	ve.ui.DebugBar.super.call( this, config );

	this.surface = surface;

	this.$commands = $( '<div>' ).addClass( 've-ui-debugBar-commands' );
	this.$linmodData = $( '<td>' ).addClass( 've-ui-debugBar-dump-linmod-data' );
	this.$viewTree = $( '<td>' ).addClass( 've-ui-debugBar-view-tree' );
	this.$modelTree = $( '<td>' ).addClass( 've-ui-debugBar-model-tree' );

	closeButton = new OO.ui.ButtonWidget( {
		icon: 'close',
		label: ve.msg( 'visualeditor-debugbar-close' )
	} );

	// Widgets
	this.selectionLabel = new OO.ui.LabelWidget( { classes: [ 've-ui-debugBar-selectionLabel' ] } );

	this.logRangeButton = new OO.ui.ButtonWidget( { label: ve.msg( 'visualeditor-debugbar-logrange' ), disabled: true } );
	this.showModelToggle = new OO.ui.ToggleButtonWidget( { label: ve.msg( 'visualeditor-debugbar-showmodel' ) } );
	this.updateModelToggle = new OO.ui.ToggleButtonWidget( { label: ve.msg( 'visualeditor-debugbar-updatemodel' ) } );
	this.transactionsToggle = new OO.ui.ToggleButtonWidget( { label: ve.msg( 'visualeditor-debugbar-showtransactions' ) } );
	this.inputDebuggingToggle = new OO.ui.ToggleButtonWidget( { label: ve.msg( 'visualeditor-debugbar-inputdebug' ) } );
	this.filibusterToggle = new OO.ui.ToggleButtonWidget( { label: ve.msg( 'visualeditor-debugbar-startfilibuster' ) } );

	this.$dump =
		$( '<div class="ve-ui-debugBar-dump">' ).append(
			this.updateModelToggle.$element,
			$( '<table></table>' ).append(
				$( '<thead><th>Linear model data</th><th>View tree</th><th>Model tree</th></thead>' ),
				$( '<tbody>' ).append(
					$( '<tr>' ).append(
						this.$linmodData, this.$viewTree, this.$modelTree
					)
				)
			)
		).hide();

	this.$transactions = $( '<div class="ve-ui-debugBar-transactions"><ol></ol></div>' );

	this.$filibuster = $( '<div class="ve-ui-debugBar-filibuster"></div>' );

	// Events
	this.logRangeButton.on( 'click', this.onLogRangeButtonClick.bind( this ) );
	this.showModelToggle.on( 'change', this.onShowModelToggleChange.bind( this ) );
	this.updateModelToggle.on( 'change', this.onUpdateModelToggleChange.bind( this ) );
	this.inputDebuggingToggle.on( 'change', this.onInputDebuggingToggleChange.bind( this ) );
	this.filibusterToggle.on( 'click', this.onFilibusterToggleClick.bind( this ) );
	this.transactionsToggle.on( 'change', this.onTransactionsToggleChange.bind( this ) );
	closeButton.on( 'click', this.$element.remove.bind( this.$element ) );

	this.getSurface().getModel().connect( this, {
		select: 'onSurfaceSelect',
		history: 'onHistory'
	} );
	this.onSurfaceSelect( this.getSurface().getModel().getSelection() );

	this.$element.addClass( 've-ui-debugBar' );
	this.$element.append(
		this.$commands.append(
			this.selectionLabel.$element,
			this.logRangeButton.$element,
			$( this.constructor.static.dividerTemplate ),
			this.showModelToggle.$element,
			this.inputDebuggingToggle.$element,
			this.filibusterToggle.$element,
			this.transactionsToggle.$element,
			$( this.constructor.static.dividerTemplate ),
			closeButton.$element
		),
		this.$dump,
		this.$transactions,
		this.$filibuster
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
 * @return {ve.ui.Surface|null} Surface
 */
ve.ui.DebugBar.prototype.getSurface = function () {
	return this.surface;
};

/**
 * Handle select events on the attached surface
 *
 * @param {ve.dm.Selection} selection
 */
ve.ui.DebugBar.prototype.onSurfaceSelect = function () {
	// Do not trust the emitted selection: nested emits can invalidate it. See T145938.
	var selection = this.surface.model.getSelection();
	this.selectionLabel.setLabel( selection.getDescription() );
	this.logRangeButton.setDisabled( !(
		( selection instanceof ve.dm.LinearSelection && !selection.isCollapsed() ) ||
		selection instanceof ve.dm.TableSelection
	) );
};

/**
 * Handle history events on the attached surface
 */
ve.ui.DebugBar.prototype.onHistory = ve.debounce( function () {
	if ( !this.$transactions.is( ':visible' ) ) {
		return;
	}
	this.updateTransactions();
} );

/**
 * Handle click events on the log range button
 *
 * @param {jQuery.Event} e Event
 */
ve.ui.DebugBar.prototype.onLogRangeButtonClick = function () {
	var i, ranges, selection = this.getSurface().getModel().getSelection();
	if ( selection instanceof ve.dm.LinearSelection || selection instanceof ve.dm.TableSelection ) {
		ranges = selection.getRanges();
		for ( i = 0; i < ranges.length; i++ ) {
			ve.dir( this.getSurface().view.documentView.model.data.slice( ranges[ i ].start, ranges[ i ].end ) );
		}
	}
};

/**
 * Handle change events on the show model toggle
 *
 * @param {boolean} value Value
 */
ve.ui.DebugBar.prototype.onShowModelToggleChange = function ( value ) {
	if ( value ) {
		this.updateDump();
		this.$dump.show();
	} else {
		this.updateModelToggle.setValue( false );
		this.$dump.hide();
	}
};

/**
 * Update the model dump
 */
ve.ui.DebugBar.prototype.updateDump = function () {
	var surface = this.getSurface(),
		documentModel = surface.getModel().getDocument(),
		documentView = surface.getView().getDocument();

	// linear model dump
	this.$linmodData.html( this.generateListFromLinearData( documentModel.data ) );
	this.$modelTree.html(
		this.generateListFromNode( documentModel.getDocumentNode() )
	);
	this.$viewTree.html(
		this.generateListFromNode( documentView.getDocumentNode() )
	);
};

/**
 * Get an ordered list representation of some linear data
 *
 * @param {ve.dm.LinearData} linearData Linear data
 * @return {jQuery} Ordered list
 */
ve.ui.DebugBar.prototype.generateListFromLinearData = function ( linearData ) {
	var i, $li, $label, element, text, annotations, data,
		$ol = $( '<ol start="0"></ol>' );

	data = linearData instanceof ve.dm.LinearData ? linearData.data : linearData;

	for ( i = 0; i < data.length; i++ ) {
		$li = $( '<li>' );
		$label = $( '<span>' );
		element = data[ i ];
		annotations = null;
		if ( element.type ) {
			$label.addClass( 've-ui-debugBar-dump-element' );
			text = element.type;
			annotations = element.annotations;
		} else if ( Array.isArray( element ) ) {
			$label.addClass( 've-ui-debugBar-dump-achar' );
			text = element[ 0 ];
			annotations = element[ 1 ];
		} else {
			if ( element.type ) {
				$label.addClass( 've-ui-debugBar-dump-element' );
				text = element.type;
				annotations = element.annotations;
			} else if ( Array.isArray( element ) ) {
				$label.addClass( 've-ui-debugBar-dump-achar' );
				text = element[ 0 ];
				annotations = element[ 1 ];
			} else {
				$label.addClass( 've-ui-debugBar-dump-char' );
				text = element;
			}
			$label.html( ( text.match( /\S/ ) ? text : '&nbsp;' ) + ' ' );
			if ( annotations ) {
				$label.append(
					$( '<span>' ).text(
						'[' + this.getSurface().getModel().getDocument().getStore().values( annotations ).map( function ( ann ) {
							return JSON.stringify( ann.getComparableObject() );
						} ).join( ', ' ) + ']'
					)
				);
			}

			$li.append( $label );
		}
		$label.html( ( text.match( /\S/ ) ? text : '&nbsp;' ) + ' ' );
		if ( annotations ) {
			$label.append(
				$( '<span>' ).text(
					'[' + this.getSurface().getModel().getDocument().getStore().values( annotations ).map( function ( ann ) {
						return JSON.stringify( ann.getComparableObject() );
					} ).join( ', ' ) + ']'
				)
			);
		}

		$li.append( $label );
		$ol.append( $li );
	}
	return $ol;
};

/**
 * Generate an ordered list describing a node
 *
 * @param {ve.Node} node Node
 * @return {jQuery} Ordered list
 */
ve.ui.DebugBar.prototype.generateListFromNode = function ( node ) {
	var $li, i, $label,
		$ol = $( '<ol start="0"></ol>' );

	for ( i = 0; i < node.children.length; i++ ) {
		$li = $( '<li>' );
		$label = $( '<span>' ).addClass( 've-ui-debugBar-dump-element' );
		if ( node.children[ i ].length !== undefined ) {
			$li.append(
				$label
					.text( node.children[ i ].type )
					.append(
						$( '<span>' ).text( ' (' + node.children[ i ].length + ')' )
					)
			);
		} else {
			$li.append( $label.text( node.children[ i ].type ) );
		}

		if ( node.children[ i ].children ) {
			$li.append( this.generateListFromNode( node.children[ i ] ) );
		}

		$ol.append( $li );
	}
	return $ol;
};

/**
 * Handle change events on the update model toggle button
 *
 * @param {boolean} value Value
 */
ve.ui.DebugBar.prototype.onUpdateModelToggleChange = function ( value ) {
	if ( value ) {
		this.updateDump();
		this.getSurface().model.connect( this, { documentUpdate: 'updateDump' } );
	} else {
		this.getSurface().model.disconnect( this, { documentUpdate: 'updateDump' } );
	}
};

/**
 * Handle click events on the input debugging toggle button
 *
 * @param {boolean} value Value
 */
ve.ui.DebugBar.prototype.onInputDebuggingToggleChange = function ( value ) {
	var surfaceModel = this.getSurface().getModel(),
		selection = surfaceModel.getSelection();

	ve.inputDebug = value;

	// Clear the cursor before rebuilding, it will be restored later
	surfaceModel.setNullSelection();
	setTimeout( function () {
		surfaceModel.getDocument().rebuildTree();
		surfaceModel.setSelection( selection );
	} );
};

/**
 * Handle click events on the filibuster toggle button
 *
 * @param {jQuery.Event} e Event
 */
ve.ui.DebugBar.prototype.onFilibusterToggleClick = function () {
	var debugBar = this;
	if ( this.filibusterToggle.getValue() ) {
		this.filibusterToggle.setLabel( ve.msg( 'visualeditor-debugbar-stopfilibuster' ) );
		this.$filibuster.off( 'click' );
		this.$filibuster.hide();
		this.$filibuster.empty();
		this.getSurface().startFilibuster();
	} else {
		this.getSurface().stopFilibuster();
		this.$filibuster.html( this.getSurface().filibuster.getObservationsHtml() );
		this.$filibuster.show();
		this.$filibuster.on( 'click', function ( e ) {
			var path,
				$li = $( e.target ).closest( '.ve-filibuster-frame' );

			if ( $li.hasClass( 've-filibuster-frame-expandable' ) ) {
				$li.removeClass( 've-filibuster-frame-expandable' );
				path = $li.data( 've-filibuster-frame' );
				if ( !path ) {
					return;
				}
				$li.children( 'span' ).replaceWith(
					$( debugBar.getSurface().filibuster.getObservationsHtml( path ) )
				);
				$li.toggleClass( 've-filibuster-frame-expanded' );
			} else if ( $li.children( 'ul' ).length ) {
				$li.toggleClass( 've-filibuster-frame-collapsed' );
				$li.toggleClass( 've-filibuster-frame-expanded' );
			}
		} );
		this.filibusterToggle.setLabel( ve.msg( 'visualeditor-debugbar-startfilibuster' ) );
	}
};

/**
 * Handle click events on the filibuster toggle button
 *
 * @param {boolean} value Value
 */
ve.ui.DebugBar.prototype.onTransactionsToggleChange = function ( value ) {
	if ( value ) {
		this.updateTransactions();
		this.$transactions.show();
	} else {
		this.$transactions.hide();
	}
};

/**
 * Update the transaction dump
 */
ve.ui.DebugBar.prototype.updateTransactions = function () {
	var surface = this.getSurface(),
		$transactionsList = this.$transactions.children( 'ol' ).empty();

	surface.getModel().getHistory().forEach( function ( item ) {
		var $state = $( '<ol>' ).appendTo( $( '<li>' ).appendTo( $transactionsList ) );
		item.transactions.forEach( function ( tx ) {
			$state.append( $( '<li>' ).text( ve.summarizeTransaction( tx ) ) );
		} );
	} );
};

/**
 * Destroy the debug bar
 */
ve.ui.DebugBar.prototype.destroy = function () {
	this.getSurface().getModel().disconnect();
	this.$element.remove();
};
