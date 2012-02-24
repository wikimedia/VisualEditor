app = function () {
	var	_this = this,
		$document = $( document );

	this.$editor = $('#editor');

	this.$editor.bind( {
		'focus': function( e ) {
			$document.unbind( '.surfaceView' );
			$document.bind( {
				'keydown.surfaceView': function( e ) {
					return _this.onKeyDown( e );
				},
				'keyup.surfaceView': function( e ) {
					return _this.onKeyUp( e );
				},
				'keypress.surfaceView': function( e ) {
					return _this.onKeyPress( e );
				}
			} );
		},
		'blur': function( e ) {
			$document.unbind( '.surfaceView' );
		}
	} );

	this.$editor.mousedown( function(e) {
		return _this.onMouseDown( e );
	} );

	// Set initial content for the "editor"
	this.$editor.html("<b>Lorem Ipsum is simply dummy text</b> of the printing and typesetting industry. <b>Lorem Ipsum has been the <i>industry's</i> standard</b> dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it <u>to <b>make <i>a type</i> specimen</b> book.</u>");
	this.$editor.addClass('leafNode');

	this.keydown = false;
	this.keyup = false;
	this.keypress = false;
	this.mousedown = false;

	this.loop = false;
	this.logkey = false;

	this.prevText = app.getDOMText(this.$editor[0]).replace(String.fromCharCode(32), " ").replace(String.fromCharCode(160), " ");
	
	this.prevHash = app.getDOMHash(this.$editor[0]);
	console.log("Initial hash", this.prevHash);
	
};

app.prototype.onKeyDown = function( e ) {
	if ( this.logkey ) {
		console.log("onKeyDown", e.which);
	}
	this.keydown = true;
};

app.prototype.onKeyUp = function( e ) {
	if ( this.logkey ) {
		console.log("onKeyUp", e.which);
	}
	this.keyup = true;
};

app.prototype.onKeyPress = function( e ) {
	if ( this.logkey ) {
		console.log("onKeyPress");
	}
	this.keypress = true;
};

app.prototype.onMouseDown = function( e ) {
	if ( this.logkey ) {
		console.log("onMouseDown");
	}
	this.mousedown = true;

	if(this.loop == false) {
		var _this = this;
		setInterval(function() {
			_this.loopFunc();
		}, 100);		
	}
};

app.prototype.loopFunc = function() {
	var text = app.getDOMText(this.$editor[0]).replace(String.fromCharCode(32), " ").replace(String.fromCharCode(160), " ");
	var hash = app.getDOMHash(this.$editor[0]);

	var selection = rangy.getSelection();

	if ( !selection.anchorNode ) {
		return;
	}

	var offset = this.getOffset(selection.anchorNode, selection.anchorOffset);

	if(text != this.prevText) {
		console.log("new text");
		this.prevText = text;
	}
	
	if(hash != this.prevHash) {
		console.log("new DOM", hash);
		this.prevHash = hash;
	}

	this.keypress = false;
	this.keyup = false;
	this.keydown = false;
	this.mousedown = false;
};

app.getDOMText = function( elem ) {
    var nodeType = elem.nodeType,
        ret = '';

    if ( nodeType === 1 || nodeType === 9 ) {
        // Use textContent || innerText for elements
        if ( typeof elem.textContent === 'string' ) {
            return elem.textContent;
        } else if ( typeof elem.innerText === 'string' ) {
            // Replace IE's carriage returns
            return elem.innerText.replace( /\r\n/g, '' );
        } else {
            // Traverse it's children
            for ( elem = elem.firstChild; elem; elem = elem.nextSibling) {
                ret += app.getDOMText( elem );
            }
        }
    } else if ( nodeType === 3 || nodeType === 4 ) {
        return elem.nodeValue;
    }

    return ret;
};

app.getDOMHash = function( elem ) {
    var nodeType = elem.nodeType,
    	nodeName = elem.nodeName,
        ret = '';

	if ( nodeType === 3 || nodeType === 4 ) {
		return '#';
	} else if ( nodeType === 1 || nodeType === 9 ) {
		ret += '<' + nodeName + '>';
		for ( elem = elem.firstChild; elem; elem = elem.nextSibling) {
        	ret += app.getDOMHash( elem );
        }
        ret += '</' + nodeName + '>';
	}
	return ret;
};

app.prototype.getOffset = function( localNode, localOffset ) {
	var $node = $( localNode );

	if ( $node.hasClass( 'leafNode' ) ) {
		return localOffset;
	}
	
	while( !$node.hasClass( 'leafNode' ) ) {
		$node = $node.parent();
	}
	
	var current = [$node.contents(), 0];
	var stack = [current];
	
	var offset = 0;
	
	while ( stack.length > 0 ) {
		if ( current[1] >= current[0].length ) {
			stack.pop();
			current = stack[ stack.length - 1 ];
			continue;
		}
		var item = current[0][current[1]];
		var $item = current[0].eq( current[1] );
		
		if ( item.nodeType === 3 ) {
			if ( item === localNode ) {
				offset += localOffset;
				break;
			} else {
				offset += item.textContent.length;
			}
		} else if ( item.nodeType === 1 ) {
			if ( $( item ).attr('contentEditable') === "false" ) {
				offset += 1;
			} else {
				if ( item === localNode ) {
					offset += localOffset;
					break;
				}
			
				stack.push( [$item.contents(), 0] );
				current[1]++;
				current = stack[stack.length-1];
				continue;
			}
		}
		current[1]++;
	}

	return offset;
};

$(function() {
	new app();
});