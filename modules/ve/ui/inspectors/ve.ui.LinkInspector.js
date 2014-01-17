/*!
 * VisualEditor UserInterface LinkInspector class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Link inspector.
 *
 * @class
 * @extends ve.ui.AnnotationInspector
 *
 * @constructor
 * @param {ve.ui.WindowSet} windowSet Window set this inspector is part of
 * @param {Object} [config] Configuration options
 */
ve.ui.LinkInspector = function VeUiLinkInspector( windowSet, config ) {
	// Parent constructor
	ve.ui.AnnotationInspector.call( this, windowSet, config );

	// Properties
	this.linkNode = null;
};

/* Inheritance */

OO.inheritClass( ve.ui.LinkInspector, ve.ui.AnnotationInspector );

/* Static properties */

ve.ui.LinkInspector.static.name = 'link';

ve.ui.LinkInspector.static.icon = 'link';

ve.ui.LinkInspector.static.titleMessage = 'visualeditor-linkinspector-title';

ve.ui.LinkInspector.static.linkTargetInputWidget = ve.ui.LinkTargetInputWidget;

/**
 * Models this inspector can edit.
 *
 * These models may be either annotations or nodes. When nodes are inspected, #getNodeChanges
 * is used instead of #getAnnotation to determine what changes to save when the inspector is
 * closed.
 *
 * @static
 * @property {Function[]}
 */
ve.ui.LinkInspector.static.modelClasses = [ ve.dm.LinkAnnotation ];

/* Methods */

/**
 * Get the annotation from the input.
 *
 * This override allows AnnotationInspector to request the value from the inspector rather
 * than the widget.
 *
 * @method
 * @returns {ve.dm.LinkAnnotation} Link annotation
 */
ve.ui.LinkInspector.prototype.getAnnotation = function () {
	return this.targetInput.annotation;
};

/**
 * @inheritdoc
 */
ve.ui.LinkInspector.prototype.getAnnotationFromText = function ( text ) {
	return new ve.dm.LinkAnnotation( { 'type': 'link', 'attributes': { 'href': text } } );
};

/**
 * Get the changes to make to the node that's currently being inspected.
 *
 * This function can either return a plain object with attribute changes to make to the node,
 * or an array with linear model data to replace the node with.
 *
 * This function will only be invoked if this.linkNode is set.
 *
 * @returns {Object|Array} Object with attribute changes, or linear model array
 */
ve.ui.LinkInspector.prototype.getNodeChanges = function () {
	var annotation = this.targetInput.getAnnotation();
	if ( annotation ) {
		return { 'href': this.targetInput.getAnnotation().getAttribute( 'href' ) };
	}
	return {};
};

/**
 * @inheritdoc
 */
ve.ui.LinkInspector.prototype.initialize = function () {
	// Parent method
	ve.ui.AnnotationInspector.prototype.initialize.call( this );

	// Properties
	this.targetInput = new this.constructor.static.linkTargetInputWidget( {
		'$': this.$, '$overlay': this.surface.$localOverlayMenus
	} );

	// Initialization
	this.$form.append( this.targetInput.$element );
};

/**
 * @inheritdoc
 */
ve.ui.LinkInspector.prototype.setup = function ( data ) {
	var focusedNode = this.surface.getView().getFocusedNode();
	if ( focusedNode && ve.isInstanceOfAny( focusedNode.getModel(), this.constructor.static.modelClasses ) ) {
		this.linkNode = focusedNode.getModel();

		// Call grandparent method, skipping AnnotationInspector
		ve.ui.Inspector.prototype.setup.call( this, data );
	} else {
		this.linkNode = null;
		// Parent method
		ve.ui.AnnotationInspector.prototype.setup.call( this, data );
	}

	// Disable surface until animation is complete; will be reenabled in ready()
	this.surface.disable();
};

/**
 * @inheritdoc
 */
ve.ui.LinkInspector.prototype.ready = function () {
	// Parent method
	ve.ui.AnnotationInspector.prototype.ready.call( this );

	// Note: Focus input prior to setting target annotation
	this.targetInput.$input.focus();
	// Setup targetInput contents
	if ( this.linkNode ) {
		// FIXME this assumes the linkNode will always have an href attribute
		this.targetInput.setValue( this.linkNode.getAttribute( 'href' ) );
	} else if ( this.initialAnnotation ) {
		this.targetInput.setAnnotation( this.initialAnnotation );
	} else {
		// If an initial annotation couldn't be created (e.g. the text was invalid),
		// just populate the text we tried to create the annotation from
		this.targetInput.setValue( this.initialText );
	}
	this.targetInput.$input.select();
	this.surface.enable();
};

/**
 * @inheritdoc
 */
ve.ui.LinkInspector.prototype.teardown = function ( data ) {
	var changes, remove, replace, nodeRange, surfaceModel = this.surface.getModel();
	if ( this.linkNode ) {
		nodeRange = this.linkNode.getOuterRange();
		changes = this.getNodeChanges();
		replace = ve.isArray( changes );
		// FIXME figure out a better way to do the "if input is empty, remove" thing,
		// not duplicating it here from AnnotationInspector (where it doesn't even belong)
		remove = data.action === 'remove' || this.targetInput.getValue() === '';
		if ( remove || replace ) {
			surfaceModel.change(
				ve.dm.Transaction.newFromRemoval(
					surfaceModel.getDocument(),
					nodeRange
				)
			);
		}
		if ( !remove ) {
			if ( replace ) {
				// We've already removed the node, so we just need to do an insertion now
				surfaceModel.change(
					ve.dm.Transaction.newFromInsertion(
						surfaceModel.getDocument(),
						nodeRange.start,
						changes
					)
				);
			} else {
				surfaceModel.change(
					ve.dm.Transaction.newFromAttributeChanges(
						surfaceModel.getDocument(),
						nodeRange.start,
						changes
					)
				);
			}
		}
		// Call grandparent method, skipping AnnotationInspector
		ve.ui.Inspector.prototype.teardown.call( this, data );
	} else {
		// Parent method
		ve.ui.AnnotationInspector.prototype.teardown.call( this, data );
	}
};

/* Registration */

ve.ui.inspectorFactory.register( ve.ui.LinkInspector );
