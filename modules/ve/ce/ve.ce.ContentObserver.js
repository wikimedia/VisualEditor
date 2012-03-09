ve.ce.ContentObserver = function( documentView ) {
	// Inheritance
	ve.EventEmitter.call( this );
	
	this.$node = null;
	this.interval = null;
	this.frequency = 100;
	this.prevText = null;
	this.prevHash = null;
};

ve.ce.ContentObserver.prototype.setElement = function( $node ) {
	if ( this.$node !== $node ) {
		this.stop();

		this.$node = $node;
		this.prevText = ve.ce.Surface.getDOMText2( this.$node[0] );
		this.prevHash = ve.ce.Surface.getDOMHash( this.$node[0] );

		this.start();
	}
};

ve.ce.ContentObserver.prototype.stop = function() {
	if ( this.interval !== null ) {
		clearInterval( this.interval );
		this.interval = null;
		this.poll();
		this.$node = null;
	}
};

ve.ce.ContentObserver.prototype.start = function() {
	this.poll();
	var _this = this;
	setTimeout( function() { _this.poll(); }, 0);
	this.interval = setInterval( function() { _this.poll(); }, this.frequency );
};

ve.ce.ContentObserver.prototype.poll = function() {
	var text = ve.ce.Surface.getDOMText2( this.$node[0] );
	var hash = ve.ce.Surface.getDOMHash( this.$node[0] );

	if ( text !== this.prevText || hash !== this.prevHash ) {
		this.emit('change', {
			$node: this.$node,
			prevText: this.prevText,
			text: text,
			prevHash: this.prevHash,
			hash: hash
		} );
		this.prevText = text;
		this.prevHash = hash;
	}
};

/* Inheritance */

ve.extendClass( ve.ce.ContentObserver , ve.EventEmitter );