define(['jquery', 'exports', 'facebookSDK', 'signals', 'utils'], function ($, exports, FB, signals, utils) {

	'use strict';

	var Likes = function (_authResponse) {
		this.authData = _authResponse;
		this.likesData = [];
		this.likesLength = 0;
		this.maxIterations = 3;
		this.likesPercentBase = 15;
		this.dataLoaded = new signals.Signal();
	};

	Likes.prototype.getLikes = function () {
		FB.api('fql', {q:
			{
				'query1': 'SELECT name, pic, page_id FROM page WHERE page_id IN (SELECT page_id FROM page_fan WHERE uid =' + this.authData.uid  + ')',
				'query2': 'SELECT name, pic, page_id FROM #query1 WHERE page_id IN (SELECT page_id FROM page_fan WHERE uid = ' + this.authData.targetId + ')'
			}}, $.proxy(this.onGetLikes, this));
	};

	Likes.prototype.onGetLikes = function (response) {
		this.likesLength = response.data[1].fql_result_set.length;
		var scope = this;
		var likePos = 0;
		if (this.likesLength > 0){
			for (var x = 0; x < this.maxIterations; x++) {
				likePos = utils.randomRange(0, this.likesLength - 1);
				this.likesData.push(response.data[1].fql_result_set[likePos]);
			}
		}
		setTimeout(function () {
			scope.dataLoaded.dispatch();
		}, 8000);
	};

	Likes.prototype.retrieveData = function () {
		return {
			'length': this.likesLength,
			'likes': this.likesData,
			'percent': utils.getPercentData(this.likesLength, this.likesPercentBase)
		};
	};

	exports.Likes = Likes;
});
