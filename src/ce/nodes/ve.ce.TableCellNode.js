/*!
 * VisualEditor ContentEditable TableCellNode class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * ContentEditable table cell node.
 *
 * @class
 * @extends ve.ce.BranchNode
 * @mixes ve.ce.TableCellableNode
 * @mixes ve.ce.ContentEditableNode
 * @constructor
 * @param {ve.dm.TableCellNode} model Model to observe
 * @param {Object} [config] Configuration options
 */
ve.ce.TableCellNode = function VeCeTableCellNode() {
	// Parent constructor
	ve.ce.TableCellNode.super.apply( this, arguments );

	// Mixin constructors
	ve.ce.TableCellableNode.call( this );
	ve.ce.ContentEditableNode.call( this );

	this.setEditing( false );

	// Events
	this.model.connect( this, {
		update: 'onUpdate',
		attributeChange: 'onAttributeChange'
	} );
	this.connect( this, {
		teardown: 'onTableCellTeardown'
	} );
};

/* Inheritance */

OO.inheritClass( ve.ce.TableCellNode, ve.ce.BranchNode );

OO.mixinClass( ve.ce.TableCellNode, ve.ce.TableCellableNode );
OO.mixinClass( ve.ce.TableCellNode, ve.ce.ContentEditableNode );

/* Static Properties */

ve.ce.TableCellNode.static.name = 'tableCell';

ve.ce.TableCellNode.static.trapsCursor = true;

/* Methods */

/**
 * @inheritdoc
 */
ve.ce.TableCellNode.prototype.initialize = function () {
	// Parent method
	ve.ce.TableCellNode.super.prototype.initialize.call( this );

	const rowspan = this.model.getRowspan();
	const colspan = this.model.getColspan();

	// DOM changes
	this.$element
		// The following classes are used here:
		// * ve-ce-tableCellNode-data
		// * ve-ce-tableCellNode-header
		.addClass( 've-ce-tableCellNode ve-ce-tableCellNode-' + this.model.getAttribute( 'style' ) );

	// Set attributes (keep in sync with #onSetup)
	if ( rowspan > 1 ) {
		this.$element.attr( 'rowspan', rowspan );
	}
	if ( colspan > 1 ) {
		this.$element.attr( 'colspan', colspan );
	}

	ve.ce.TableCellNode.static.updateStyles( this.$element, this.model );

	// Add tooltip
	this.$element.attr( 'title', ve.msg( 'visualeditor-tablecell-tooltip' ) );
};

/**
 * Update the DOM element styles from the data model.
 *
 * @param {HTMLElement} $element DOM element
 * @param {ve.dm.TableCellNode|ve.dm.TableRowNode} model Data model
 */
ve.ce.TableCellNode.static.updateStyles = function ( $element, model ) {
	const align = model.getAttribute( 'align' );
	const valign = model.getAttribute( 'valign' );
	const textAlign = model.getAttribute( 'textAlign' );
	const verticalAlign = model.getAttribute( 'verticalAlign' );
	if ( align ) {
		$element.attr( 'align', align );
	}
	if ( valign ) {
		$element.attr( 'valign', valign );
	}
	if ( textAlign ) {
		$element.css( 'textAlign', textAlign );
	}
	if ( verticalAlign ) {
		$element.css( 'verticalAlign', verticalAlign );
	}
};

/**
 * Set the editing mode of a table cell node
 *
 * @param {boolean} enable Enable editing
 */
ve.ce.TableCellNode.prototype.setEditing = function ( enable ) {
	this.editing = enable;
	this.$element.toggleClass( 've-ce-tableCellNode-editing', enable );
	this.setContentEditable();
	if ( this.getRoot() ) {
		this.getRoot().getSurface().setActiveNode( enable ? this : null );
	}
	if ( enable ) {
		this.$element.removeAttr( 'title' );
	} else {
		this.$element.attr( 'title', ve.msg( 'visualeditor-tablecell-tooltip' ) );
	}
};

/**
 * Handle teardown events
 *
 * Same functionality as the teardown handler in ve.ce.ActiveNode
 */
ve.ce.TableCellNode.prototype.onTableCellTeardown = function () {
	// If the table cell is active on teardown, ensure the surface's
	// activeNode is cleared.
	if ( this.getRoot() ) {
		const surface = this.getRoot().getSurface();
		if ( surface.getActiveNode() === this ) {
			surface.setActiveNode( null );
		}
	}
};

// eslint-disable-next-line jsdoc/require-returns
/**
 * @see ve.ce.ContentEditableNode
 */
ve.ce.TableCellNode.prototype.setContentEditable = function () {
	// Overwite any state passed to setContentEditable with this.editing, so that
	// setContentEditable doesn't override the editing state.
	return ve.ce.ContentEditableNode.prototype.setContentEditable.call( this, this.editing );
};

/**
 * Handle model update events.
 *
 * If the style changed since last update the DOM wrapper will be replaced with an appropriate one.
 */
ve.ce.TableCellNode.prototype.onUpdate = function () {
	this.updateTagName();
};

/**
 * Handle attribute changes to keep the live HTML element updated.
 *
 * @param {string} key Attribute name
 * @param {any} from Old value
 * @param {any} to Old value
 */
ve.ce.TableCellNode.prototype.onAttributeChange = function ( key, from, to ) {
	switch ( key ) {
		case 'colspan':
		case 'rowspan':
			if ( to > 1 ) {
				this.$element.attr( key, to );
			} else {
				this.$element.removeAttr( key );
			}
			break;
		case 'style':
			// The following classes are used here:
			// * ve-ce-tableCellNode-data
			// * ve-ce-tableCellNode-header
			this.$element
				.removeClass( 've-ce-tableCellNode-' + from )
				.addClass( 've-ce-tableCellNode-' + to );
			this.updateTagName();
			break;
	}
};

/* Registration */

ve.ce.nodeFactory.register( ve.ce.TableCellNode );
