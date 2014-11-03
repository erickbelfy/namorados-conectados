define(['jquery', 'exports', 'facebookSDK', 'signals', 'utils'], function ($, exports, FB, signals, utils) {
	'use strict';

	var Places = function (_authResponse) {
		this.authData = _authResponse;
		this.placeData = [];
		this.placeLength = 0;
		this.maxIterations = 3;
		this.placePercentBase = 5;
		this.dataLoaded = new signals.Signal();
	};


	Places.prototype.getPlaces = function () {
		FB.api('fql', {q:
			{
				'query1': 'SELECT name,page_id, latitude, longitude, type FROM place WHERE page_id IN ( SELECT page_id FROM location_post WHERE ' + this.authData.uid  + ' IN tagged_uids )',
				'query2': 'SELECT name, latitude, longitude, type FROM #query1 where page_id IN (SELECT page_id FROM location_post WHERE ' + this.authData.targetId + ' IN tagged_uids)'
			}
		}, $.proxy(this.onGetPlaces, this));
	};

	Places.prototype.onGetPlaces = function (response) {
		var scope = this;
		this.placeLength = response.data[1].fql_result_set.length;

		setTimeout(function () {
			scope.dataLoaded.dispatch();
		}, 20000);
	};

	Places.prototype.retrieveData = function () {
		return {
			'length': this.placeLength,
			'places': this.placeData,
			'percent': utils.getPercentData(this.placeLength, this.placePercentBase)
		};
	};

	exports.Places = Places;
});
