/**
 * Progressive enhancement for JS core- define things that are scheduled to
 * appear in the standard anyway.
 */

if(!Array.prototype.last) Object.defineProperty(Array.prototype, 'last', {
	value: function() { return this[this.length - 1] }
});
