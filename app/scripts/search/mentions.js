define(['jquery', 'exports', 'facebookSDK', 'signals', 'utils'], function ($, exports, FB, signals, utils) {
	'use strict';
	var Mentions = function (_authResponse) {
		this.authData = _authResponse;
		this.mentionsData = [];
		this.mentionsLength = 0;
		this.maxIterations = 3;
		this.mentionsPercentBase = 3;
		this.dataLoaded = new signals.Signal();
	};


	Mentions.prototype.getMentions = function () {
		FB.api('fql', {q: 'SELECT message FROM status WHERE status_id IN (SELECT post_id FROM stream_tag WHERE actor_id = ' + this.authData.uid + ' AND target_id =' + this.authData.targetId + ')'}, $.proxy(this.onGetMentions, this));
	};

	Mentions.prototype.onGetMentions = function (response) {
		var scope = this;
		this.mentionsLength = response.data.length;
		var mentionPos = 0;
		if (this.mentionsLength > 0) {
			for (var x = 0; x < this.maxIterations; x++) {
				mentionPos = utils.randomRange(0, this.mentionsLength - 1);
				this.mentionsData.push(response.data[mentionPos]);
			}
		}

		setTimeout(function () {
			scope.dataLoaded.dispatch();
		}, 12000);
	};

	Mentions.prototype.retrieveData = function () {
		return {
			'length': this.mentionsLength,
			'mentions': this.mentionsData,
			'percent': utils.getPercentData(this.mentionsLength, this.mentionsPercentBase)
		};
	};
	
	exports.Mentions = Mentions;
});
