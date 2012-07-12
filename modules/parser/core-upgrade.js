/**
 * Progressive enhancement for JS core- define things that are scheduled to
 * appear in the standard anyway.
 */

if(!Array.prototype.last) Object.defineProperty(Array.prototype, 'last', {
	value: function() { return this[this.length - 1] }
});

/** Good-old monkey-patching to let us merge properties of another object into this one. */
if(!Object.prototype.mergeProperties) Object.defineProperty(Object.prototype, 'mergeProperties', {
	value: function (o) {
		var self = this;
		Object.keys(o).forEach(function(k) {
			self[k] = o[k];
		});
		return this;
	}
});
