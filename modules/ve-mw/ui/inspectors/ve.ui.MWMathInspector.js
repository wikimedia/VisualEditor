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

/* Methods */

/**
 * Handle frame ready events.
 *
 * @method
 */
ve.ui.MWMathInspector.prototype.initialize = function () {
	// Parent method
	ve.ui.Inspector.prototype.initialize.call( this );

	this.input = new ve.ui.TextInputWidget( {
		'$$': this.frame.$$,
		'overlay': this.surface.$localOverlay,
		'multiline': true
	} );
	this.input.$.addClass( 've-ui-mwMathInspector-input' );

	// Initialization
	this.$form.append( this.input.$ );
};


/**
 * Handle the inspector being opened.
 */
ve.ui.MWMathInspector.prototype.onOpen = function () {
	var extsrc = '';

	// Parent method
	ve.ui.Inspector.prototype.onOpen.call( this );

	this.node = this.surface.getView().getFocusedNode();

	if ( this.node ) {
		extsrc = this.node.getModel().getAttribute( 'mw' ).body.extsrc;
	}

	// Wait for animation to complete
	setTimeout( ve.bind( function () {
		// Setup input text
		this.input.setValue( extsrc );
		this.input.$input.focus().select();
	}, this ), 200 );
};

/**
 * Handle the inspector being closed.
 *
 * @param {string} action Action that caused the window to be closed
 */
ve.ui.MWMathInspector.prototype.onClose = function ( action ) {
	var mw,
		surfaceModel = this.surface.getModel();

	// Parent method
	ve.ui.Inspector.prototype.onClose.call( this, action );

	if ( this.node instanceof ve.ce.MWMathNode ) {
		mw = this.node.getModel().getAttribute( 'mw' );
		mw.body.extsrc = this.input.getValue();
		surfaceModel.change(
			ve.dm.Transaction.newFromAttributeChanges(
				surfaceModel.getDocument(), this.node.getOuterRange().start, { 'mw': mw }
			)
		);
	} else {
		mw = {
			'name': 'math',
			'attrs': {},
			'body': {
				'extsrc': this.input.getValue()
			}
		};
		surfaceModel.getFragment().collapseRangeToEnd().insertContent( [
			{
				'type': 'mwMath',
				'attributes': {
					'mw': mw
				}
			},
			{ 'type': '/mwMath' }
		] );
	}
};

/* Registration */

ve.ui.inspectorFactory.register( 'mwMathInspector', ve.ui.MWMathInspector );
