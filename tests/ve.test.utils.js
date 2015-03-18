/*!
 * VisualEditor test utilities.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see http://ve.mit-license.org
 */

( function () {
	/*jshint browser:true */

	// Configure QUnit
	QUnit.config.requireExpects = true;

	// Extend QUnit.module to provide a fixture element. This used to be in tests/index.html, but
	// dynamic test runners like Karma build their own web page.
	( function () {
		var orgModule = QUnit.module;

		QUnit.module = function ( name, localEnv ) {
			localEnv = localEnv || {};
			orgModule( name, {
				setup: function () {
					this.fixture = document.createElement( 'div' );
					this.fixture.id = 'qunit-fixture';
					document.body.appendChild( this.fixture );

					if ( localEnv.setup ) {
						localEnv.setup.call( this );
					}
				},
				teardown: function () {
					if ( localEnv.teardown ) {
						localEnv.teardown.call( this );
					}

					this.fixture.parentNode.removeChild( this.fixture );
				}
			} );
		};
	}() );

	/**
	 * @class
	 * @singleton
	 * @ignore
	 */
	ve.test = { utils: {} };

	// TODO: this is a hack to make normal heading/preformatted/table
	// nodes the most recently registered, instead of any integration versions
	ve.dm.modelRegistry.register( ve.dm.HeadingNode );
	ve.dm.modelRegistry.register( ve.dm.PreformattedNode );
	ve.dm.modelRegistry.register( ve.dm.TableNode );

	ve.test.utils.runIsolateTest = function ( assert, type, range, expected, label ) {
		var doc = ve.dm.example.createExampleDocument( 'isolationData' ),
			surface = new ve.dm.Surface( doc ),
			fragment = surface.getLinearFragment( range ),
			data;

		data = ve.copy( doc.getFullData() );
		fragment.isolateAndUnwrap( type );
		expected( data );

		assert.deepEqual( doc.getFullData(), data, label );
	};

	ve.test.utils.runFormatConverterTest = function ( assert, range, type, attributes, expectedRange, expectedData, msg ) {
		var surface = ve.test.utils.createSurfaceFromHtml( ve.dm.example.isolationHtml ),
			formatAction = new ve.ui.FormatAction( surface ),
			data = ve.copy( surface.getModel().getDocument().getFullData() ),
			originalData = ve.copy( data );

		expectedData( data );

		surface.getModel().setLinearSelection( range );
		formatAction.convert( type, attributes );

		assert.equalLinearData( surface.getModel().getDocument().getFullData(), data, msg + ': data models match' );
		assert.equalRange( surface.getModel().getSelection().getRange(), expectedRange, msg + ': ranges match' );

		surface.getModel().undo();

		assert.equalLinearData( surface.getModel().getDocument().getFullData(), originalData, msg + ' (undo): data models match' );
		assert.equalRange( surface.getModel().getSelection().getRange(), range, msg + ' (undo): ranges match' );

		surface.destroy();
	};

	ve.test.utils.countGetModelFromDomTests = function ( cases ) {
		var msg, n = 0;
		for ( msg in cases ) {
			if ( cases[msg].head !== undefined || cases[msg].body !== undefined ) {
				n += 3;
				if ( cases[msg].storeLength ) {
					n += 1;
				}
				if ( cases[msg].storeItems ) {
					n += cases[msg].storeItems.length;
				}
			}
		}
		return n;
	};

	ve.test.utils.runGetModelFromDomTest = function ( assert, caseItem, msg ) {
		var model, i, length, hash, html, htmlDoc, actualData, actualRtDoc, expectedRtDoc,
			// Make sure we've always got a <base> tag
			defaultHead = '<base href="' + ve.dm.example.baseUri + '">';

		if ( caseItem.head !== undefined || caseItem.body !== undefined ) {
			html = '<head>' + ( caseItem.head || defaultHead ) + '</head><body>' + caseItem.body + '</body>';
			htmlDoc = ve.createDocumentFromHtml( html );
			model = ve.dm.converter.getModelFromDom( htmlDoc );
			actualData = model.getFullData();
			// Round-trip here, check round-trip later
			if ( caseItem.modify ) {
				actualData = ve.copy( actualData );
				caseItem.modify( model );
			}
			actualRtDoc = ve.dm.converter.getDomFromModel( model );

			// Normalize and verify data
			ve.dm.example.postprocessAnnotations( actualData, model.getStore() );
			assert.equalLinearData( actualData, caseItem.data, msg + ': data' );
			assert.deepEqual( model.getInnerWhitespace(), caseItem.innerWhitespace || new Array( 2 ), msg + ': inner whitespace' );
			if ( caseItem.storeLength !== undefined ) {
				assert.strictEqual( model.getStore().valueStore.length, caseItem.storeLength, msg + ': store length matches' );
			}
			// check storeItems have been added to store
			if ( caseItem.storeItems ) {
				for ( i = 0, length = caseItem.storeItems.length; i < length; i++ ) {
					hash = caseItem.storeItems[i].hash || OO.getHash( caseItem.storeItems[i].value );
					assert.deepEqualWithDomElements(
						model.getStore().value( model.getStore().indexOfHash( hash ) ) || {},
						caseItem.storeItems[i].value,
						msg + ': store item ' + i + ' found'
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

	ve.test.utils.runGetDomFromModelTest = function ( assert, caseItem, msg ) {
		var originalData, model, store, i, length, html, fromDataBody, clipboardHtml;

		store = new ve.dm.IndexValueStore();
		// Load storeItems into store
		if ( caseItem.storeItems ) {
			for ( i = 0, length = caseItem.storeItems.length; i < length; i++ ) {
				store.index( caseItem.storeItems[i].value, caseItem.storeItems[i].hash );
			}
		}
		model = new ve.dm.Document( ve.dm.example.preprocessAnnotations( caseItem.data, store ) );
		model.innerWhitespace = caseItem.innerWhitespace ? ve.copy( caseItem.innerWhitespace ) : new Array( 2 );
		if ( caseItem.modify ) {
			caseItem.modify( model );
		}
		originalData = ve.copy( model.getFullData() );
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
		assert.deepEqualWithDomElements( model.getFullData(), originalData, msg + ' (data hasn\'t changed)' );
	};

	/**
	 * Create a UI surface from some HTML
	 *
	 * @param {string} html Document HTML
	 * @returns {ve.ui.Surface} UI surface
	 */
	ve.test.utils.createSurfaceFromHtml = function ( html ) {
		return this.createSurfaceFromDocument( ve.createDocumentFromHtml( html ) );
	};

	/**
	 * Create a UI surface from a document
	 * @param {ve.dm.Document} doc Document
	 * @returns {ve.ui.Surface} UI surface
	 */
	ve.test.utils.createSurfaceFromDocument = function ( doc ) {
		var target = new ve.init.sa.Target();
		$( '#qunit-fixture' ).append( target.$element );
		target.addSurface( doc );
		return target.surface;
	};

	/**
	 * Build a DOM from a JSON structure.
	 *
	 * @param {Object} data JSON structure
	 * @param {string} data.type Tag name or '#text' or '#comment'
	 * @param {string} [data.text] Node text, only used if type is '#text' or '#comment'
	 * @param {Object[]} [data.children] Node's children; array of objects like data
	 * @returns {Node} DOM node corresponding to data
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
				node.appendChild( buildDom( data.children[i] ) );
			}
		}
		return node;
	};
}() );
