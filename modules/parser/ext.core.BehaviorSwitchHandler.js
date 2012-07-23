/**
 */

function BehaviorSwitchHandler( manager, isInclude ) {
	this.manager = manager;
	this.manager.addTransform( this.onBehaviorSwitch.bind( this ), "BehaviorSwitchHandler:onBehaviorSwitch", this.rank, 'tag', 'behavior-switch' );
}

BehaviorSwitchHandler.prototype.rank = 2.14;

BehaviorSwitchHandler.prototype.onBehaviorSwitch = function ( token, manager, cb ) {
	var env = this.manager.env,
		magic_word = token.attribs[0].v;

	env.setVariable(magic_word, true);

	return { tokens: 
		[
			new SelfclosingTagTk( 'meta', 
					[ new KV( 'typeof', 'mw:Placeholder' ) ],
					token.dataAttribs )
		]
	};
};


if (typeof module == "object") {
	module.exports.BehaviorSwitchHandler = BehaviorSwitchHandler;
}
