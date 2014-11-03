define(['jquery', 'exports', 'facebookSDK', 'signals', 'utils'], function ($, exports, FB, signals, utils) {
	'use strict';

	var Friends = function (_authResponse) {
		this.maxIterations = 3;
		this.currentIteration = 0;
		this.authData = _authResponse;
		this.mutualFriendData = [];
		this.mutualFriendsLength = 0;
		this.dataLoaded = new signals.Signal();
		this.friendsPercentBase = 20;

	};

	Friends.prototype.getFriends = function () {
		FB.api('/' + this.authData.uid + '/mutualfriends/' + this.authData.targetId, $.proxy(this.onGetFriends, this));

	};

	Friends.prototype.onGetFriends = function (response) {
		this.getMutualFriends(response);
	};

	Friends.prototype.getMutualFriends = function (mutualFriends) {
		this.mutualFriendsLength = mutualFriends.data.length;
		var friendPos = 0;
		var uid2 = 0;
		this.currentIteration = 0;
		if (this.mutualFriendsLength > 0) {
			for (var x = 0; x < this.maxIterations; x++) {
				friendPos = utils.randomRange(0, this.mutualFriendsLength - 1);
				uid2 = mutualFriends.data[friendPos].id;
				FB.api('fql', {q: 'SELECT uid, name, pic_square FROM user WHERE uid = ' + uid2 }, $.proxy(this.getFriendData, this));
			}
		} else {
			this.dataLoaded.dispatch();
		}
	};

	Friends.prototype.getFriendData = function (response) {
		var scope = this;
		this.mutualFriendData.push(response);
		this.currentIteration ++;
		if (this.currentIteration >= this.maxIterations) {
			setTimeout(function () {
				scope.dataLoaded.dispatch();
			}, 2000);
		}
	};


	Friends.prototype.retrieveData = function () {
		return {
			'length': this.mutualFriendsLength,
			'friends': this.mutualFriendData,
			'percent': utils.getPercentData(this.mutualFriendsLength, this.friendsPercentBase)
		};
	};
	
	exports.Friends = Friends;
});
