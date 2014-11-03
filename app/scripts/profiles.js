define(['jquery', 'exports', 'facebookSDK', 'signals'], function ($, exports, FB, signals) {
	'use strict';

	var Profiles = function (_authResponse) {
		this.uid = _authResponse.userID;
		this.targetId = null;
		this.user = null;
		this.inRelationshipWith = null;
		this.userDataReady = new signals.Signal();
		this.otherDataReady = new signals.Signal();

		this.authData = {
			uid: this.uid,
			targetId: this.targetId
		};
	};

	Profiles.prototype.addEventListeners = function () {
		
	};

	Profiles.prototype.getUserData = function () {
		FB.api('fql', {q: 'SELECT name, significant_other_id FROM user WHERE uid =' + this.authData.uid}, $.proxy(this.onGetUserData, this));
	};

	Profiles.prototype.onGetUserData = function (response) {
		this.user = response.data[0];
		this.user.pic = 'https://graph.facebook.com/'+ this.uid +'/picture?width=180&height=180';
		this.userDataReady.dispatch(this.user);
		if (this.user.significant_other_id !== null) {
			this.changeTargetData(this.user.significant_other_id);
		}
	};

	Profiles.prototype.changeTargetData = function (targetId) {
		this.targetId = targetId;
		this.getTargetUser(this.targetId);
	};

	Profiles.prototype.getTargetUser = function (targetId) {
		FB.api('fql', {q: 'SELECT name, significant_other_id FROM user WHERE uid =' + targetId}, $.proxy(this.onGetTargetUser, this));
	};

	Profiles.prototype.onGetTargetUser = function (response) {
		var scope = this;
		this.inRelationshipWith = response.data[0];
		this.inRelationshipWith.pic = 'https://graph.facebook.com/' + this.targetId + '/picture?width=180&height=180';
		var image = new Image();

		image.onload = function () {
			$('.loading-photo').css('opacity', 0);
			scope.otherDataReady.dispatch(scope.inRelationshipWith);
		};
		image.src = this.inRelationshipWith.pic;
	};

	exports.Profiles = Profiles;
});
