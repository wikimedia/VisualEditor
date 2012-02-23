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
	this.mousedown = false;
	this.inime = false;
	this.prevText = app.getDOMText(this.$editor[0]);
	
	setInterval(function() {
		_this.loopFunc();
	}, 100);
};

app.prototype.onKeyPress = function() {
	//console.log("onKeyPress");
};

app.prototype.onKeyUp = function() {
	//console.log("onKeyUp");
	if ( this.inime ) {
		this.inime = false;
		//console.log("inime = false");
	}
};

app.prototype.onKeyDown = function( e ) {
	this.keydown = true;
	//console.log("onKeyDown");
	if ( e.which === 229 ) {
		this.inime = true;
		//console.log("inime = true");
	}
};

app.prototype.onMouseDown = function() {
	this.mousedown = true;
	//console.log("onMouseDown");
	if ( this.inime ) {
		this.inime = false;
		console.log("inime = false");
	}	
};

app.prototype.loopFunc = function() {
	var text = app.getDOMText(this.$editor[0]);
	
	if(text != this.prevText) {
		//console.log(text);
		
		if(this.keydown || this.inime) {
			console.log("change from keyboard");
			// we are going to need a cursor position
			var selection = rangy.getSelection();
			var offset = this.getOffset( selection.anchorNode, selection.anchorOffset );
			var diffLength = text.length - this.prevText.length;
			//console.log("diffLength: " + diffLength);
			
			if ( diffLength > 0 ) {
				//console.log( text.substring(offset - diffLength, offset) );	
			} else if ( diffLength === 0 ) {
				//console.log( text.substring(offset - 1, offset) );
			}

		} else {
			console.log("change not from keyboard");
			// find a change and commit to the model
		}
		
		this.prevText = text;
	}
	
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