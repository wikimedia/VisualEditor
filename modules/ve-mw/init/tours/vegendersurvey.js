/*global mw */
( function ( $, gt ) {
	gt.defineTour( {
		name: 'vegendersurvey',
		isSinglePage: true,
		// shouldLog tells GuidedTour to provide additional logging (step impressions, etc.)
		shouldLog: true,
		steps: [ {
			titlemsg: 'guidedtour-tour-vegendersurvey-title',
			descriptionmsg: 'guidedtour-tour-vegendersurvey-description',
			allowAutomaticOkay: false,
			overlay: true,
			width: 475,
			buttons: [ {
				namemsg: 'guidedtour-tour-vegendersurvey-male',
				onclick: function () {
					ve.init.mw.genderSurvey.logAndEndTour( 'male' );
				}
			}, {
				namemsg: 'guidedtour-tour-vegendersurvey-female',
				onclick: function () {
					ve.init.mw.genderSurvey.logAndEndTour( 'female' );
				}
			}, {
				namemsg: 'guidedtour-tour-vegendersurvey-optout',
				onclick: function () {
					ve.init.mw.genderSurvey.logAndEndTour( 'opt-out' );
				}
			} ]
		} ]
	} );
} ( jQuery, mw.guidedTour ) );