/*!
 * VisualEditor test utilities.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see http://ve.mit-license.org
 */

( function () {
	/**
	 * @class
	 * @singleton
	 * @ignore
	 */
	ve.test = { utils: {} };

	// Create a dummy platform and target so ve.init.platform/target are available
	function DummyPlatform() {
		DummyPlatform.super.apply( this, arguments );
		this.sessionStorage = {};
		// Set this to true to test session methods failing and returning false
		this.sessionDisabled = false;
	}
	OO.inheritClass( DummyPlatform, ve.init.Platform );
	DummyPlatform.prototype.getUserLanguages = function () { return [ 'en' ]; };
	DummyPlatform.prototype.getMessage = function () { return Array.prototype.join.call( arguments, ',' ); };
	DummyPlatform.prototype.getLanguageName = function ( lang ) { return 'langname-' + lang; };
	DummyPlatform.prototype.getLanguageDirection = function () { return 'ltr'; };
	DummyPlatform.prototype.getExternalLinkUrlProtocolsRegExp = function () { return /^https?:\/\//i; };
	DummyPlatform.prototype.getUnanchoredExternalLinkUrlProtocolsRegExp = function () { return /https?:\/\//i; };
	DummyPlatform.prototype.getUserConfig = function () { return undefined; };
	DummyPlatform.prototype.setUserConfig = function () {};
	DummyPlatform.prototype.getSession = function ( key ) {
		if ( this.sessionDisabled ) { return false; }
		return this.sessionStorage.hasOwnProperty( key ) ? this.sessionStorage[ key ] : null;
	};
	DummyPlatform.prototype.setSession = function ( key, value ) {
		if ( this.sessionDisabled || value === '__FAIL__' ) { return false; }
		this.sessionStorage[ key ] = value.toString(); return true;
	};
	DummyPlatform.prototype.removeSession = function ( key ) {
		if ( this.sessionDisabled ) { return false; }
		delete this.sessionStorage[ key ]; return true;
	};

	ve.test.utils.DummyPlatform = DummyPlatform;

	function DummyTarget() {
		DummyTarget.super.apply( this, arguments );
	}
	OO.inheritClass( DummyTarget, ve.init.Target );
	DummyTarget.prototype.addSurface = function () {
		// Parent method
		var surface = DummyTarget.super.prototype.addSurface.apply( this, arguments );
		if ( !this.getSurface() ) {
			this.setSurface( surface );
		}
		surface.initialize();
		return surface;
	};

	ve.test.utils.DummyTarget = DummyTarget;

	/* eslint-disable no-new */
	new ve.test.utils.DummyPlatform();
	new ve.test.utils.DummyTarget();
	/* eslint-enable no-new */

	// Disable scroll animatinos
	ve.scrollIntoView = function () {};

	function getSerializableData( model ) {
		return model.getFullData( undefined, true );
	}

	ve.test.utils.runIsolateTest = function ( assert, type, range, expected, label ) {
		var data,
			doc = ve.dm.example.createExampleDocument( 'isolationData' ),
			surface = new ve.dm.Surface( doc ),
			fragment = surface.getLinearFragment( range );

		data = ve.copy( getSerializableData( doc ) );
		fragment.isolateAndUnwrap( type );
		expected( data );

		assert.deepEqual( getSerializableData( doc ), data, label );
	};

	ve.test.utils.runFormatConverterTest = function ( assert, range, type, attributes, expectedRange, expectedData, msg ) {
		var surface = ve.test.utils.createModelOnlySurfaceFromHtml( ve.dm.example.isolationHtml ),
			formatAction = new ve.ui.FormatAction( surface ),
			data = ve.copy( getSerializableData( surface.getModel().getDocument() ) ),
			originalData = ve.copy( data );

		expectedData( data );

		surface.getModel().setLinearSelection( range );
		formatAction.convert( type, attributes );

		assert.equalLinearData( getSerializableData( surface.getModel().getDocument() ), data, msg + ': data models match' );
		assert.equalRange( surface.getModel().getSelection().getRange(), expectedRange, msg + ': ranges match' );

		surface.getModel().undo();

		assert.equalLinearData( getSerializableData( surface.getModel().getDocument() ), originalData, msg + ' (undo): data models match' );
		assert.equalRange( surface.getModel().getSelection().getRange(), range, msg + ' (undo): ranges match' );
	};

	ve.test.utils.runActionTest = function ( actionName, assert, html, createView, method, args, rangeOrSelection, msg, options ) {
		var actualData, originalData, expectedOriginalRangeOrSelection,
			surface = createView ?
				ve.test.utils.createViewOnlySurfaceFromHtml( html || ve.dm.example.html ) :
				ve.test.utils.createModelOnlySurfaceFromHtml( html || ve.dm.example.html ),
			action = ve.ui.actionFactory.create( actionName, surface ),
			data = ve.copy( getSerializableData( surface.getModel().getDocument() ) ),
			documentModel = surface.getModel().getDocument(),
			selection = ve.test.utils.selectionFromRangeOrSelection( documentModel, rangeOrSelection ),
			expectedSelection = options.expectedRangeOrSelection && ve.test.utils.selectionFromRangeOrSelection( documentModel, options.expectedRangeOrSelection );

		if ( options.undo ) {
			originalData = ve.copy( data );
		}

		ve.dm.example.postprocessAnnotations( data, surface.getModel().getDocument().getStore() );

		if ( options.expectedData ) {
			options.expectedData( data, action );
		}

		surface.getModel().setSelection( selection );
		action[ method ].apply( action, args || [] );

		actualData = getSerializableData( surface.getModel().getDocument() );
		ve.dm.example.postprocessAnnotations( actualData, surface.getModel().getDocument().getStore() );
		assert.equalLinearData( actualData, data, msg + ': data models match' );
		if ( expectedSelection ) {
			assert.equalHash( surface.getModel().getSelection(), expectedSelection, msg + ': selections match' );
		}

		if ( options.undo ) {
			if ( options.expectedOriginalData ) {
				options.expectedOriginalData( originalData, action );
			}

			surface.getModel().undo();

			assert.equalLinearData( getSerializableData( surface.getModel().getDocument() ), originalData, msg + ' (undo): data models match' );
			if ( expectedSelection ) {
				expectedOriginalRangeOrSelection = options.expectedOriginalRangeOrSelection &&
					ve.test.utils.selectionFromRangeOrSelection( documentModel, options.expectedOriginalRangeOrSelection );
				assert.equalHash( surface.getModel().getSelection(), expectedOriginalRangeOrSelection || selection, msg + ' (undo): selections match' );
			}
		}
	};

	ve.test.utils.runGetModelFromDomTest = function ( assert, caseItem, msg ) {
		var model, hash, html, htmlDoc, actualDataReal, actualDataMeta, actualRtDoc, expectedRtDoc,
			// Make sure we've always got a <base> tag
			defaultHead = '<base href="' + ve.dm.example.baseUri + '">';

		if ( caseItem.head !== undefined || caseItem.body !== undefined ) {
			html = '<head>' + ( caseItem.head || defaultHead ) + '</head><body>' + caseItem.body + '</body>';
			htmlDoc = ve.createDocumentFromHtml( html );
			model = ve.dm.converter.getModelFromDom( htmlDoc, { fromClipboard: !!caseItem.fromClipboard } );
			actualDataReal = model.getFullData();
			actualDataMeta = getSerializableData( model );

			// Round-trip here, check round-trip later
			if ( caseItem.modify ) {
				actualDataReal = ve.copy( actualDataReal );
				actualDataMeta = ve.copy( actualDataMeta );
				caseItem.modify( model );
			}
			actualRtDoc = ve.dm.converter.getDomFromModel( model );

			// Normalize and verify data
			ve.dm.example.postprocessAnnotations( actualDataReal, model.getStore(), caseItem.preserveAnnotationDomElements );
			ve.dm.example.postprocessAnnotations( actualDataMeta, model.getStore(), caseItem.preserveAnnotationDomElements );

			assert.equalLinearData( actualDataReal, ( caseItem.realData || caseItem.data ), msg + ': real data' );
			assert.equalLinearData( actualDataMeta, caseItem.data, msg + ': data with metaItems restored' );

			assert.deepEqual( model.getInnerWhitespace(), caseItem.innerWhitespace || new Array( 2 ), msg + ': inner whitespace' );
			// Check storeItems have been added to store
			if ( caseItem.storeItems ) {
				for ( hash in caseItem.storeItems ) {
					assert.deepEqualWithDomElements(
						model.getStore().value( hash ) || {},
						caseItem.storeItems[ hash ],
						msg + ': store item ' + hash + ' found'
					);
				}
			}
			// Check round-trip
			expectedRtDoc = caseItem.normalizedBody ?
				ve.createDocumentFromHtml( caseItem.normalizedBody ) :
				htmlDoc;
			assert.equalDomElement( actualRtDoc.body, expectedRtDoc.body, msg + ': round-trip' );
		}
	};

	ve.test.utils.getModelFromTestCase = function ( caseItem ) {
		var hash, model,
			store = new ve.dm.HashValueStore();

		// Load storeItems into store
		if ( caseItem.storeItems ) {
			for ( hash in caseItem.storeItems ) {
				store.hashStore[ hash ] = ve.copy( caseItem.storeItems[ hash ] );
			}
		}
		model = new ve.dm.Document( ve.dm.example.preprocessAnnotations( caseItem.data, store ) );
		model.innerWhitespace = caseItem.innerWhitespace ? ve.copy( caseItem.innerWhitespace ) : new Array( 2 );
		if ( caseItem.modify ) {
			caseItem.modify( model );
		}
		return model;
	};

	ve.test.utils.runGetDomFromModelTest = function ( assert, caseItem, msg ) {
		var originalData, model, html, fromDataBody, clipboardHtml;

		model = ve.test.utils.getModelFromTestCase( caseItem );
		originalData = ve.copy( getSerializableData( model ) );
		fromDataBody = caseItem.fromDataBody || caseItem.normalizedBody || caseItem.body;
		html = '<body>' + fromDataBody + '</body>';
		clipboardHtml = '<body>' + ( caseItem.clipboardBody || fromDataBody ) + '</body>';
		assert.equalDomElement(
			ve.dm.converter.getDomFromModel( model ),
			ve.createDocumentFromHtml( html ),
			msg
		);
		assert.equalDomElement(
			ve.dm.converter.getDomFromModel( model, true ),
			ve.createDocumentFromHtml( clipboardHtml ),
			msg + ' (clipboard mode)'
		);
		assert.deepEqualWithDomElements( getSerializableData( model ), originalData, msg + ' (data hasn\'t changed)' );
	};

	ve.test.utils.runDiffElementTest = function ( assert, caseItem ) {
		var visualDiff, diffElement,
			oldDoc = ve.dm.converter.getModelFromDom( ve.createDocumentFromHtml( caseItem.oldDoc ) ),
			newDoc = ve.dm.converter.getModelFromDom( ve.createDocumentFromHtml( caseItem.newDoc ) );
		// TODO: Differ expects newDoc to be derived from oldDoc and contain all its store data.
		// We may want to remove that assumption from the differ?
		newDoc.getStore().merge( oldDoc.getStore() );
		visualDiff = new ve.dm.VisualDiff( oldDoc, newDoc, caseItem.forceTimeout ? -1 : undefined );
		diffElement = new ve.ui.DiffElement( visualDiff );
		assert.equalDomElement( diffElement.$document[ 0 ], $( '<div>' ).addClass( 've-ui-diffElement-document' ).html( caseItem.expected )[ 0 ], caseItem.msg );
		assert.strictEqual( diffElement.$element.hasClass( 've-ui-diffElement-hasMoves' ), !!caseItem.hasMoves, caseItem.msg + ': hasMoves' );
		assert.strictEqual( diffElement.$element.hasClass( 've-ui-diffElement-hasDescriptions' ), !!caseItem.expectedDescriptions, caseItem.msg + ': hasDescriptions' );
		if ( caseItem.expectedDescriptions !== undefined ) {
			assert.deepEqual(
				diffElement.descriptions.items.map( function ( item ) { return item.$label.text(); } ),
				caseItem.expectedDescriptions,
				caseItem.msg + ': sidebar'
			);
		}
		assert.deepEqual(
			diffElement.$messages.children().length, caseItem.forceTimeout ? 1 : 0,
			'Timeout message ' + ( caseItem.forceTimeout ? 'shown' : 'not shown' )
		);
	};

	/**
	 * Create a UI surface from some HTML
	 *
	 * This is incredibly slow (>100ms) so consider creating just a ce.Surface
	 * or dm.Surface, or a mock surface using create(View|Model)OnlySurface*.
	 *
	 * @param {string} html Document HTML
	 * @return {ve.ui.Surface} UI surface
	 */
	ve.test.utils.createSurfaceFromHtml = function ( html ) {
		return this.createSurfaceFromDocument(
			ve.dm.converter.getModelFromDom( ve.createDocumentFromHtml( html ) )
		);
	};

	/**
	 * Create a UI surface from a document
	 *
	 * See warning in ve.test.utils.createSurfaceFromHtml.
	 *
	 * @param {ve.dm.Document} doc Document
	 * @return {ve.ui.Surface} UI surface
	 */
	ve.test.utils.createSurfaceFromDocument = function ( doc ) {
		var target = new ve.init.sa.Target();
		$( '#qunit-fixture' ).append( target.$element );
		target.addSurface( doc );
		return target.surface;
	};

	/**
	 * Create a CE surface from some HTML
	 *
	 * @param {string} html Document HTML
	 * @return {ve.ce.Surface} CE surface
	 */
	ve.test.utils.createSurfaceViewFromHtml = function ( html ) {
		return this.createSurfaceViewFromDocument(
			ve.dm.converter.getModelFromDom( ve.createDocumentFromHtml( html ) )
		);
	};

	/**
	 * Create a CE surface from a document
	 *
	 * @param {ve.dm.Document} doc Document
	 * @return {ve.ce.Surface} CE surface
	 */
	ve.test.utils.createSurfaceViewFromDocument = function ( doc ) {
		var model, view,
			mockSurface = {
				$blockers: $( '<div>' ),
				$selections: $( '<div>' ),
				$element: $( '<div>' ),
				isMobile: function () {
					return false;
				},
				isMultiline: function () {
					return true;
				},
				getBoundingClientRect: function () {
					return {};
				},
				getImportRules: function () {
					return ve.init.Target.static.importRules;
				},
				getModel: function () {
					return model;
				},
				getView: function () {
					return view;
				},
				commandRegistry: ve.ui.commandRegistry,
				sequenceRegistry: ve.ui.sequenceRegistry,
				dataTransferHandlerFactory: ve.ui.dataTransferHandlerFactory
			};

		model = new ve.dm.Surface( doc );
		view = new ve.ce.Surface( model, mockSurface );

		view.surface = mockSurface;
		mockSurface.$element.append( view.$element );
		$( '#qunit-fixture' ).append( mockSurface.$element );

		view.initialize();
		model.initialize();

		return view;
	};

	/**
	 * Create a view-only UI surface from some HTML
	 *
	 * @param {string} html Document HTML
	 * @return {Object} Mock UI surface which only returns a real view (and its model)
	 */
	ve.test.utils.createViewOnlySurfaceFromHtml = function ( html ) {
		var surfaceView = ve.test.utils.createSurfaceViewFromDocument(
			ve.dm.converter.getModelFromDom( ve.createDocumentFromHtml( html ) )
		);

		return surfaceView.surface;
	};

	/**
	 * Create a model-only UI surface from some HTML
	 *
	 * @param {string} html Document HTML
	 * @return {Object} Mock UI surface which only returns a real model
	 */
	ve.test.utils.createModelOnlySurfaceFromHtml = function ( html ) {
		var model = new ve.dm.Surface(
			ve.dm.converter.getModelFromDom( ve.createDocumentFromHtml( html ) )
		);
		return {
			getModel: function () {
				return model;
			},
			getView: function () {
				// Mock view
				return {
					focus: function () {}
				};
			}
		};
	};

	/**
	 * Create a DM selection from a range or a JSON selection
	 *
	 * @param {ve.dm.Document} doc Document
	 * @param {ve.Range|Object|string} rangeOrSelection Range or JSON selection
	 * @return {ve.dm.Selection} Selection
	 */
	ve.test.utils.selectionFromRangeOrSelection = function ( doc, rangeOrSelection ) {
		return rangeOrSelection instanceof ve.Range ?
			new ve.dm.LinearSelection( doc, rangeOrSelection ) :
			ve.dm.Selection.static.newFromJSON( doc, rangeOrSelection );
	};

	/**
	 * Build a DOM from a JSON structure.
	 *
	 * @param {Object} data JSON structure
	 * @param {string} data.type Tag name or '#text' or '#comment'
	 * @param {string} [data.text] Node text, only used if type is '#text' or '#comment'
	 * @param {Object[]} [data.children] Node's children; array of objects like data
	 * @return {Node} DOM node corresponding to data
	 */
	ve.test.utils.buildDom = function buildDom( data ) {
		var i, node;
		if ( data.type === '#text' ) {
			return document.createTextNode( data.text );
		}
		if ( data.type === '#comment' ) {
			return document.createComment( data.text );
		}
		node = document.createElement( data.type );
		if ( data.children ) {
			for ( i = 0; i < data.children.length; i++ ) {
				node.appendChild( buildDom( data.children[ i ] ) );
			}
		}
		return node;
	};

	/**
	 * Like a reduced outerHTML serialization, but with a position marker '|'.
	 *
	 * For clarity, also wraps each text node in a fake tag, and omits non-class attributes.
	 *
	 * @param {Node} rootNode The node to serialize
	 * @param {Object} position
	 * @param {Node} position.node The node at which the position marker lies
	 * @param {number} position.offset The offset at which the position marker lies
	 * @param {Object} [options]
	 * @param {Function|string} options.ignore Selector for nodes to omit from output
	 * @return {string} Serialization of the node and position
	 */
	ve.test.utils.serializePosition = function ( rootNode, position, options ) {
		var html = [];
		function add( node ) {
			var i, len;

			if ( options && options.ignore && $( node ).is( options.ignore ) ) {
				return;
			} else if ( node.nodeType === Node.TEXT_NODE ) {
				html.push( '<#text>' );
				if ( node === position.node ) {
					html.push( ve.escapeHtml(
						node.textContent.substring( 0, position.offset ) +
						'|' +
						node.textContent.substring( position.offset )
					) );
				} else {
					html.push( ve.escapeHtml( node.textContent ) );
				}
				html.push( '</#text>' );
				return;
			} else if ( node.nodeType !== Node.ELEMENT_NODE ) {
				html.push( '<#unknown type=\'' + node.nodeType + '\'/>' );
				return;
			}
			// else node.nodeType === Node.ELEMENT_NODE

			html.push( '<', ve.escapeHtml( node.nodeName.toLowerCase() ) );
			if ( node.hasAttribute( 'class' ) ) {
				// Single quotes are less annoying for JSON escaping
				html.push(
					' class=\'',
					ve.escapeHtml( node.getAttribute( 'class' ) ),
					'\''
				);
			}
			html.push( '>' );
			for ( i = 0, len = node.childNodes.length; i < len; i++ ) {
				if ( node === position.node && i === position.offset ) {
					html.push( '|' );
				}
				add( node.childNodes[ i ] );
			}
			if ( node === position.node && node.childNodes.length === position.offset ) {
				html.push( '|' );
			}
			html.push( '</', ve.escapeHtml( node.nodeName.toLowerCase() ), '>' );
		}
		add( rootNode );
		return html.join( '' );
	};

	/**
	 * Take control of EventSequencer timeouts
	 *
	 * Modifies an EventSequencer object in-place to allow setTimeout behaviour to be
	 * simulated by test code. Replaces `postpone` and `cancelPostponed` with methods that
	 * queue/unqueue to an array, and adds an `endLoop` method to unqueue and run every
	 * queued call.
	 *
	 * @param {ve.EventSequencer} eventSequencer The EventSequencer to hijack
	 */
	ve.test.utils.hijackEventSequencerTimeouts = function ( eventSequencer ) {
		eventSequencer.postponedCalls = [];

		eventSequencer.postpone = function ( f ) {
			this.postponedCalls.push( f );
			return this.postponedCalls.length - 1;
		};

		eventSequencer.cancelPostponed = function ( callId ) {
			this.postponedCalls[ callId ] = null;
		};

		eventSequencer.endLoop = function () {
			var i, f;
			// Run every postponed call in order of postponement. Do not cache
			// list length, because postponed calls may add more postponed calls
			for ( i = 0; i < this.postponedCalls.length; i++ ) {
				f = this.postponedCalls[ i ];
				if ( f ) {
					// Exceptions thrown here will leave the postponed calls
					// list in an inconsistent state
					f();
				}
			}
			this.postponedCalls.length = 0;
		};
	};
}() );
