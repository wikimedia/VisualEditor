/*global mw */
mw.loader.using( 'schema.GenderSurvey', function () {
	ve.init.mw.genderSurvey = {
		logAndEndTour: function ( buttonType ) {
			mw.eventLog.logEvent( 'GenderSurvey', {
				userId: mw.config.get( 'wgUserId' ),
				buttonType: buttonType
			} );
			mw.guidedTour.endTour( 'vegendersurvey' );
		}
	};

	mw.guidedTour.launchTour( 'vegendersurvey' );
} );
