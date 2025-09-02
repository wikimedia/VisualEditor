/**
 * TinyVE - Toy version of VisualEditor to illustrate the main concepts
 */

tinyve = {};
tinyve.dm = {};
tinyve.ce = {};
tinyve.ui = {};

/**
 * Representation of a range in the linear model
 *
 * Sometimes direction matters, e.g. when representing a cursor selection, `from` is the anchor
 * and `to` is the focus.
 *
 * @class
 * @param {number} from Offset of where the range begins
 * @param {number} to Offset of where the range extends to (can be before `from`)
 */
tinyve.Range = function TinyVeRange( from, to ) {
	this.from = from;
	this.to = to;
	this.start = Math.min( from, to );
	this.end = Math.max( from, to );
};

tinyve.Target = function TinyVeTarget( surface, config = {} ) {
	// Parent constructor
	tinyve.Target.super.apply( this, config );

	this.surface = surface;
	this.$element.addClass( 'tinyve-Target' );
	this.$element.append( surface.$element );
};

OO.inheritClass( tinyve.Target, OO.ui.Element );

tinyve.init = function ( $container, html ) {
	const domDocument = new DOMParser().parseFromString( html, 'text/html' );
	const linearData = tinyve.dm.converter.getDataFromDomSubtree( domDocument.body );
	const documentModel = new tinyve.dm.Document( linearData );
	const surfaceModel = new tinyve.dm.Surface( documentModel );
	const surface = new tinyve.ui.Surface( surfaceModel );
	const target = tinyve.init.target = new tinyve.Target( surface );
	$container.empty().append( target.$element );

	// Set up a global variable, for easy debugging.
	// Full VE has globals like this, so you can do things like this in the console:
	//
	// ve.init.target.surface.setReadOnly( true )
	// ve.init.target.surface.model.documentModel.data.getData()
	// ve.init.target.surface.view.$documentNode.find( '.ve-ce-annotation' )
	tinyve.init.target = target;
};
