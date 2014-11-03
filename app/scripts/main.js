require.config({
	shim: {
		'facebookSDK': {
			exports: 'FB'
		},
		'tdFriendSelector': {
			exports: 'TDFriendSelector'
		},
		tweenMax:{
			exports: 'TweenMax'
		},
		'swfobject': {
			exports: 'swfobject'
		}
	},
	paths: {
		jquery: '../components/jquery/jquery',
		async: '../components/requirejs-plugins/src/async',
		tweenMax: '../components/tweenMax/src/uncompressed/TweenMax',
		facebookSDK: '//connect.facebook.net/en_US/all',
		signals : '../components/js-signals/dist/signals',
		compoundSignal: '../components/CompoundSignal/src/CompoundSignal',
		tdFriendSelector: '../components/Facebook-friend-selector/tdfriendselector',
		swfobject: '//ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject'
	}
});

require(['jquery', 'exports', 'facebookSDK', 'search', 'profiles', 'resultPage'], function ($, exports, FB, search, profiles, resultPage) {
	'use strict';

	var appId = '';
	var appChannel = '';
	var authResponse = {};
	var resultPageInstance = null;
	var searchDataInstance = null;
	var usersProfilesInstance = null;
	var scope = { scope: 'user_actions.video, user_likes, user_photos, user_relationships, user_subscriptions, publish_actions, user_activities, user_location, user_videos, user_about_me, user_interests, user_relationship_details, user_status, friends_about_me, friends_interests, friends_relationship_details, friends_status, friends_actions.video, friends_likes, friends_photos, friends_relationships, friends_videos, friends_activities, friends_location, friends_actions.music,manage_notifications, publish_stream, status_update, create_note, photo_upload, read_requests, read_stream, read_friendlists, read_insights, share_item, user_online_presence'};
	var isInitialized = false;

	function fbInitAsync() {
		var localId = '468865259867175';
		var devId = '392498084197005';
		var prodId = '145052352351722';
		var devDomainChannel = '//localhost:9000/channel.html';
		var prodDomainChannel = '//seguro.olh.am/boulevard-namorados-2013/dist/channel.html';

		appId = prodId;
		appChannel = prodDomainChannel;
		FB.init({
			appId: appId,
			channelUrl: appChannel,
			status: true,
			xfbml: true,
			cookies: true
		});
		FB.getLoginStatus(getFbStatus);
		FB.Canvas.setAutoGrow(100);
	}

	function getFbStatus(response) {
		console.log(response.status);
		if (response.status === 'connected') {
			authResponse = response.authResponse;
			FB.ui({method: 'permissions.request', 'perms': scope.scope});
			$('.loading-status').fadeOut(500, function () {
				$('.heart-section').fadeIn();
			});
			$(init);
		} else if (response.status === 'not_authorized') {
			$('.loading-status').fadeOut(500, function () {
				$('.no-login').fadeIn();
				loginFB();
			});
		} else {
			$('.loading-status').fadeOut(500, function () {
				$('.no-login').fadeIn();
				loginFB();
			});
		}
	}

	function loginFB() {
		FB.login(function (r) {
			authResponse = r.authResponse;
			$('.no-login').fadeOut();
			$('.iteraction-section').fadeIn();
			$(init);
		}, scope);
	}

	function init() {
		if (isInitialized) {
			return;
		}
		isInitialized = true;
		resultPageInstance = new resultPage.ResultPage();
		usersProfilesInstance = new profiles.Profiles(authResponse);
		usersProfilesInstance.getUserData();
		usersProfilesInstance.userDataReady.add(onRenderUserData);
		usersProfilesInstance.otherDataReady.add(onRenderOtherData);
		resultPageInstance.changeOtherData.add(onUpdateOtherData);
		addEventListeners();
	}

	function onRenderUserData(userData) {
		resultPageInstance.insertUserData(userData);
	}


	function onDataReady() {
		resultPageInstance.showFlashButtons({
			appId: appId,
			targetId: usersProfilesInstance.targetId,
			percentValue: searchDataInstance.getTotalPercent(),
			finishPhrase: searchDataInstance.getPhrase(),
			amigosComum: searchDataInstance.friends.retrieveData().length,
			gostosComum: searchDataInstance.likes.retrieveData().length,
			mencoesCasal: searchDataInstance.mentions.retrieveData().length,
			fotosJuntos: searchDataInstance.photos.retrieveData().length,
			encontros: searchDataInstance.places.retrieveData().length
		});
	}

	function onRenderOtherData(otherData) {
		resultPageInstance.insertOtherData(otherData);
		startData();
		$('.begin-test').css('cursor', 'pointer');
	}

	function onUpdateOtherData(otherId) {
		usersProfilesInstance.changeTargetData(otherId);
	}

	function startData() {
		var _authResponse = [];
		_authResponse.uid = usersProfilesInstance.uid;
		_authResponse.targetId = usersProfilesInstance.targetId;
		searchDataInstance = new search.Search(_authResponse);
		searchDataInstance.dataReady.addOnce(onDataReady);
		searchDataInstance.percentChange.add(onChangePercent);
	}

	function onChangePercent () {
		resultPageInstance.changeProgressBar();
	}

	function enableSearch(e) {
		e.preventDefault();
		try{
			window.ga('send', 'event', 'namorados-2013', 'clique', 'botao-comecar');
		} catch(error){}
		if( searchDataInstance ) {
			searchDataInstance.retrieveCoupleData();
			resultPageInstance.startPreloader();
		}
	}

	function addEventListeners() {
		$('.begin-test').css('cursor', 'default');
		$('.begin-test').click(enableSearch);
	}

	if(FB){
		fbInitAsync();
	} else {
		window.fbAsyncInit = fbInitAsync;
	}
});
