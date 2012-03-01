function Title ( key, ns, nskey, env ) {
	this.key = key;
	// Namespace index
	this.ns = new Namespace( ns );
	// the original ns string
	this.nskey = nskey;
	this.env = env;
}

Title.prototype.makeLink = function () {
	if ( this.nskey ) {
		return this.env.wgScriptPath + this.nskey + ':' + this.key;
	} else {
		return this.env.wgScriptPath + [this.ns.getDefaultName(), this.name].join(':');
	}
};


function Namespace ( id ) {
	this.id = id;
}

Namespace.prototype._defaultNamespaceIDs = {
	file: -2,
	image: -2,
	special: -1,
	main: 0,
	category: 14
};

Namespace.prototype._defaultNamespaceNames = {
	'-2': 'File',
	'-1': 'Special',
	'0': '',
	'14': 'Category'
};

Namespace.prototype.isFile = function ( ) {
	return this.id === this._defaultNamespaceIDs.file;
};
Namespace.prototype.isCategory = function ( ) {
	return this.id === this._defaultNamespaceIDs.category;
};

Namespace.prototype.getDefaultName = function ( ) {
	if ( this.id == this._defaultNamespaceIDs.main ) {
		return '';
	} else {
		return this._defaultNamespaceNames[this.id];
	}
};


if (typeof module == "object") {
	module.exports.Title = Title;
	module.exports.Namespace = Namespace;
}
