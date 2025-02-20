/*!
 * VisualEditor UserInterface SidebarDialogWindowManager class.
 *
 * @copyright See AUTHORS.txt
 */

/**
 * Window manager for sidebar dialogs.
 *
 * @class
 * @extends ve.ui.SurfaceWindowManager
 *
 * @constructor
 * @param {ve.ui.Surface} surface Surface this belongs to
 * @param {Object} [config] Configuration options
 * @param {ve.ui.Overlay} [config.overlay] Overlay to use for menus
 */
ve.ui.SidebarDialogWindowManager = function VeUiSidebarDialogWindowManager( surface, config ) {
	// Parent constructor
	ve.ui.SidebarDialogWindowManager.super.call( this, surface, ve.extendObject( { modal: false }, config ) );

	this.$element.addClass( 've-ui-sidebarDialogWindowManager' );

	this.connect( this, {
		opening: 'onSidebarDialogsOpeningOrClosing',
		closing: 'onSidebarDialogsOpeningOrClosing'
	} );
};

/* Inheritance */

OO.inheritClass( ve.ui.SidebarDialogWindowManager, ve.ui.SurfaceWindowManager );

/* Static Properties */

ve.ui.SidebarDialogWindowManager.static.sizes = {
	gutter: {
		width: 44,
		height: '100%'
	},
	small: {
		width: 150,
		height: '100%'
	},
	medium: {
		width: 300,
		height: '100%'
	},
	large: {
		width: 400,
		height: '100%'
	}
};

/* Methods */

/**
 * Handle windows opening or closing.
 *
 * @param {OO.ui.Window} win
 * @param {jQuery.Promise} openingOrClosing
 * @param {Object} data
 */
ve.ui.SidebarDialogWindowManager.prototype.onSidebarDialogsOpeningOrClosing = function ( win, openingOrClosing ) {
	const transitionDuration = OO.ui.theme.getDialogTransitionDuration();

	// win.isOpened before promise means we are closing
	const isClosing = win.isOpened();
	if ( isClosing ) {
		win.$element.css( 'width', '' );
	}
	// The following classes are generated here:
	// * ve-ui-surface-sidebarOpen-gutter
	// * ve-ui-surface-sidebarOpen-small
	// * ve-ui-surface-sidebarOpen-medium
	// * ve-ui-surface-sidebarOpen-large
	this.getSurface().$element.toggleClass( 've-ui-surface-sidebarOpen ve-ui-surface-sidebarOpen-' + win.getSize(), !isClosing );

	openingOrClosing.then( () => {
		// win.isOpened after promise means we are opening
		if ( win.isOpened() ) {
			win.$element.css( 'width', win.getSizeProperties().width );
		}

		setTimeout( () => {
			this.getSurface().getView().emit( 'position' );
		}, transitionDuration );
	} );
};

/**
 * @inheritdoc
 */
ve.ui.SidebarDialogWindowManager.prototype.getTeardownDelay = function () {
	return 250;
};
