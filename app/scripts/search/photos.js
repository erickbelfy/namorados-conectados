define(['jquery', 'exports', 'facebookSDK', 'signals', 'utils'], function ($, exports, FB, signals, utils) {
	'use strict';

	var Photos = function (_authResponse) {
		this.authData = _authResponse;
		this.photosData = [];
		this.photosLength = 0;
		this.maxIterations = 3;
		this.photosPercentBase = 10;
		this.dataLoaded = new signals.Signal();
	};


	Photos.prototype.getPhotos = function () {
		FB.api('fql', {q: 'SELECT pid, src_big, caption FROM photo WHERE pid IN (SELECT pid FROM photo_tag WHERE subject = ' + this.authData.uid +  ' AND pid IN (SELECT pid FROM photo_tag WHERE subject = ' + this.authData.targetId + ') )'}, $.proxy(this.onGetPhotos, this));
	};

	Photos.prototype.onGetPhotos = function (response) {
		var scope = this;
		this.photosLength = response.data.length;
		var photosPos = 0;
		if (this.photosLength > 0) {
			for (var x = 0; x < this.maxIterations; x++) {
				photosPos = utils.randomRange(0, this.photosLength);
				this.photosData.push(response.data[photosPos]);
			}
		}

		setTimeout(function () {
			scope.dataLoaded.dispatch();
		}, 17000);
	};

	Photos.prototype.retrieveData = function () {
		return {
			'length': this.photosLength,
			'photos': this.photosData,
			'percent': utils.getPercentData(this.photosLength, this.photosPercentBase)
		};
	};


	exports.Photos = Photos;
});
