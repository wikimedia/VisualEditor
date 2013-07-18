/*!
 * VisualEditor UserInterface MWMathInspector class.
 *
 * @copyright 2011-2013 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * MediaWiki math inspector.
 *
 * @class
 * @extends ve.ui.Inspector
 *
 * @constructor
 * @param {ve.ui.Surface} surface
 * @param {Object} [config] Config options
 */
ve.ui.MWMathInspector = function VeUiMWMathInspector( surface, config ) {
	// Parent constructor
	ve.ui.Inspector.call( this, surface, config );
};

/* Inheritance */

ve.inheritClass( ve.ui.MWMathInspector, ve.ui.Inspector );

/* Static properties */

ve.ui.MWMathInspector.static.icon = 'math';

ve.ui.MWMathInspector.static.titleMessage = 'visualeditor-mwmathinspector-title';

ve.ui.MWMathInspector.static.InputWidget = ve.ui.InputWidget;

/* Methods */

/**
 * Handle frame ready events.
 *
 * @method
 */
ve.ui.MWMathInspector.prototype.initialize = function () {
	// Parent method
	ve.ui.Inspector.prototype.initialize.call( this );

	this.input = new this.constructor.static.InputWidget( {
		'$$': this.frame.$$, 'overlay': this.surface.$localOverlay
	} );

	// Initialization
	this.$form.append( this.input.$ );
};


/**
 * Handle the inspector being opened.
 */
ve.ui.MWMathInspector.prototype.onOpen = function () {

	var src = this.surface.getView().getFocusedNode().getModel().getAttribute( 'extsrc' );

	// Parent method
	ve.ui.Inspector.prototype.onOpen.call( this );

	// Wait for animation to complete
	setTimeout( ve.bind( function () {
		// Setup input text
		this.input.setValue( src );
		this.input.$input.focus().select();
	}, this ), 200 );
};

/**
 * Handle the inspector being closed.
 *
 * @param {string} action Action that caused the window to be closed
 */
ve.ui.MWMathInspector.prototype.onClose = function ( action ) {
	// Parent method
	ve.ui.Inspector.prototype.onClose.call( this, action );

	var newsrc = this.input.getValue(),
		surfaceModel = this.surface.getModel(),
		mathNode = this.surface.getView().getFocusedNode().getModel();

	surfaceModel.change(
		ve.dm.Transaction.newFromAttributeChanges(
			surfaceModel.getDocument(), mathNode.getOuterRange().start, { 'extsrc': newsrc }
		)
	);
};

/* Registration */

ve.ui.inspectorFactory.register( 'mwMathInspector', ve.ui.MWMathInspector );
