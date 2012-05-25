/*
	ve.Core.js
*/
(function( mw, $ ){
	
	veCore = function(){
		var _this = this,
			pageName = mw.config.get( 'wgPageName' ),
			validNamespace = mw.config.get('wgCanonicalNamespace') === 'VisualEditor' ? true: false;

		this.$content = $('#content');

		this.$spinner = $('<div />')
			.attr({
				'id': 've-loader-spinner',
				'class': 'mw-ajax-loader'
			}).css({
				'height': this.$content.height() + 'px',
				'width': (this.$content.width() -20 ) + 'px'
			});

		// On VisualEditor namespace ?
		if ( validNamespace ) {
			$('#ca-edit > span > a').click( function( e ){
				// hijack the edit link
				e.preventDefault();

				_this.$content.html(
					_this.$spinner
				);
				// async init
				mw.loader.using( 'ext.visualEditor.ve', function(){
					_this.init();
				});
				_this.parsoidGetHTML( pageName, function( content ){
					_this.init( content );
				});

			});
		} //valid namespace
	};

	veCore.prototype.init = function( html ) {
		// store the html
		if (typeof html !== 'undefined') {
			this.html = html;
		}
		// if html and ve are loaded
		if(
			typeof ve !== 'undefined' &&
			typeof this.html !== 'undefined'
		){
			console.log ('loaded:', ve, this.html);
			$html = $("<div />")
				.html( this.html );

			// release this.html
			delete this.html;

			var options = {
				toolbars: {
					top: {
						/* What modes this toolbar will have */
						modes: ['wikitext', 'json', 'html', 'render', 'history', 'help']
					}
				}
			};
			$editor = $('<div id="ve-editor"></div>');
			this.$content.html( $editor );
			this.mainEditor = new ve.Surface( '#ve-editor', $html[0], options );
		}
	};

	veCore.prototype.parsoidGetHTML = function (title, callback) {
		$.ajax({
			url: mw.util.wikiScript( 'api' ),
			data: {
				'action': 've-parsoid',
				'paction': 'parse',
				'page': mw.config.get( 'wgPageName' ),
				'format': 'json'
			},
			dataType: 'json',
			type: 'GET',
			cache: 'false',
			timeout: 9000, //wait up to 9 seconds
			success: function( data ) {
				if (data && data['ve-parsoid'] && data['ve-parsoid'].parsed ) {
					if( typeof callback === 'function') {
						callback( data['ve-parsoid'].parsed );
					}
				}
			},
			error: function( error ) {}
		});
	};
/*
	Posts HTML to Parsoid Wrapper API
	API Posts HTML to Parsoid Service, receives Wikitext,
	API Saves Wikitext to page.
*/
	veCore.prototype.parsoidGetWikitextAndSave = function (title, callback) {
		// TODO: get html from linmod converter
		var data = _this.mainEditor.documentModel.getData(),
			html = "<h1>Test Html</h1>";

		$.ajax({
			url: mw.util.wikiScript( 'api' ),
			data: {
				'action': 've-parsoid',
				'paction': 'save',
				'page': mw.config.get( 'wgPageName' ),
				'html': html,
				'token': mw.user.tokens.get('editToken'),
				'format': 'json'
			},
			dataType: 'json',
			type: 'POST',
			success: function( data ) {
				if( typeof callback === 'function') {
					console.log (data);
					callback( data );
				}
			},
			error: function( error ) {}
		});
	};

	/* Gets HTML for a page from MW API action parse */
	veCore.prototype.getParsedPage = function( title, callback ) {
		//currently using mw api to get
		$.ajax({
			url: mw.util.wikiScript( 'api' ),
			data: {
				'action': 'parse',
				'format': 'json',
				'page': title
			},
			dataType: 'json',
			type: 'GET',
			cache: 'false',
			success: function( data ) {
				if ( data && data.parse && data.parse.text ) {
					// return pages to callback
					if( typeof callback === 'function') {
						callback( data.parse.text['*'] );
					}
				}
			},
			error: function() {
				if( typeof callback === 'function') {
					callback();
				}
			}
		});
	};

	var core = new veCore();

})(window.mw, jQuery);