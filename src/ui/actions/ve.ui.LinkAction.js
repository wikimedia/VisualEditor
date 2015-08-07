/*!
 * VisualEditor UserInterface LinkAction class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Link action.
 * This action transforms or inspects links (or potential links).
 *
 * @class
 * @extends ve.ui.Action
 * @constructor
 * @param {ve.ui.Surface} surface Surface to act on
 */
ve.ui.LinkAction = function VeUiLinkAction( surface ) {
	// Parent constructor
	ve.ui.Action.call( this, surface );
};

/* Inheritance */

OO.inheritClass( ve.ui.LinkAction, ve.ui.Action );

/* Static Properties */

ve.ui.LinkAction.static.name = 'link';

/**
 * RegExp matching an autolink + trailing space.
 * @property {RegExp}
 * @private
 */
ve.ui.LinkAction.static.autolinkRegExp = null; // Initialized below.

/**
 * List of allowed methods for the action.
 *
 * @static
 * @property
 */
ve.ui.LinkAction.static.methods = [ 'autolinkUrl' ];

/* Methods */

/**
 * Autolink the selection (which may have trailing whitespace).
 *
 * @method
 * @return {boolean} Action was executed
 */
ve.ui.LinkAction.prototype.autolinkUrl = function () {
	var range, rangeEnd, linktext, i,
		surfaceModel = this.surface.getModel(),
		documentModel = surfaceModel.getDocument(),
		selection = surfaceModel.getSelection();

	function isLinkAnnotation( annotation ) {
		return /^link/.test( annotation.name );
	}

	if ( !( selection instanceof ve.dm.LinearSelection ) ) {
		return false;
	}

	range = selection.getRange();
	rangeEnd = range.end;

	// Shrink range to eliminate trailing whitespace.
	linktext = documentModel.data.getText( true, range ).replace( /\s+$/, '' );
	range = range.truncate( linktext.length );

	// Check that none of the range has an existing link annotation.
	// Otherwise we could autolink an internal link, which would be ungood.
	for ( i = range.start; i < range.end; i++ ) {
		if ( documentModel.data.getAnnotationsFromOffset( i ).containsMatching( isLinkAnnotation ) ) {
			// Don't autolink this.
			return false;
		}
	}

	// Make sure `undo` doesn't expose the selected linktext.
	surfaceModel.setLinearSelection( new ve.Range( rangeEnd, rangeEnd ) );

	// Annotate the (previous) range.
	surfaceModel.change(
		ve.dm.Transaction.newFromAnnotation(
			documentModel,
			range,
			'set',
			this.getLinkAnnotation( linktext )
		),
		surfaceModel.getSelection()
	);

	return true;
};

/**
 * Return an appropriate annotation for the given href.
 *
 * @method
 * @return {ve.dm.LinkAnnotation} The annotation to use.
 */
ve.ui.LinkAction.prototype.getLinkAnnotation = function ( href ) {
	return new ve.dm.LinkAnnotation( {
		type: 'link',
		attributes: {
			href: href
		}
	} );
};

/* Registration */

ve.ui.actionFactory.register( ve.ui.LinkAction );

// Delayed initialization (wait until ve.init.platform exists)
ve.init.Platform.static.initializedPromise.then( function () {

	ve.ui.LinkAction.static.autolinkRegExp =
		new RegExp(
			'\\b' + ve.init.platform.getUnanchoredExternalLinkUrlProtocolsRegExp().source + '\\S+(\\s|\\n\\n)$'
		);

	ve.ui.sequenceRegistry.register(
		new ve.ui.Sequence( 'autolinkUrl', 'autolinkUrl', ve.ui.LinkAction.static.autolinkRegExp, 0, true )
	);
} );
