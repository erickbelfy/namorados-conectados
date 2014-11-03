define(['jquery', 'exports', 'facebookSDK', 'signals', 'tdFriendSelector', 'tweenMax', 'swfobject'],
		function ($, exports, FB, signals, tdFriendSelector, TweenMax, swfobject) {

	'use strict';
	
	var ResultPage =  function () {
		this.preloaderPhrase = [
			'Iniciando sincronização.',
			'Calculando fotos. Vocês são muito fotogênicos, hein!',
			'Vocês curtem muitas coisas juntos. Inclusive um ao outro.',
			'Vocês frequentam os mesmos lugares?',
			'Muitos amigos em comum! Um deles pode ser o cupido de vocês.',
			'Nível de afinidade encontrado.'
		];
		this.phrasePos = 1;
		this.currentPercent = 20;
		this.changeOtherData = new signals.Signal();
		TDFriendSelector.init({debug: false, speed: 200});
		this.selector = TDFriendSelector.newInstance({
			callbackFriendSelected : $.proxy(this.onFriendSelected, this),
			callbackSubmit: $.proxy(this.onSubmitButton, this),
			callbackCloseButton: $.proxy(this.onSubmitButton, this),
			maxSelection: 1,
			friendsPerPage: 5
		});
		this.addEventListeners();
	};

	ResultPage.prototype.addEventListeners = function () {
		$('.other-button').click($.proxy(this.showFriendsList, this));
	};

	ResultPage.prototype.formatUserName = function (name) {
		var splitedName = name.split(' ');
		var formattedName = splitedName[0];
		if (splitedName[1].length > 2) {
			formattedName += ' ' + splitedName[1];
		} else {
			var lastName = splitedName.length -1;
			formattedName += ' ' + splitedName[lastName];
		}
		return formattedName;
	};

	ResultPage.prototype.insertUserData = function (userData) {
		var userPic = document.getElementById('user-pic');
		var userLabel = document.getElementById('user-name');
		userPic.src = userData.pic;
		userLabel.innerHTML = this.formatUserName(userData.name);
		this.userName = userData.name;
		this.userPhoto = userData.pic;
	};

	ResultPage.prototype.insertOtherData = function (otherData) {
		var userPic = document.getElementById('other-pic');
		var userLabel = document.getElementById('other-name');
		userPic.src = otherData.pic;
		userLabel.innerHTML = this.formatUserName(otherData.name);
		this.enableNextButton();
		this.targetName = otherData.name;
		this.targetPhoto = otherData.pic;
		$('#add-person-label').html('TROCAR PESSOA');
	};

	ResultPage.prototype.enableNextButton = function () {
		var startButton = $('.flag-start');
		if (!startButton.hasClass('flag-hover')) {
			startButton.addClass('flag-hover');
		}
	};

	ResultPage.prototype.startPreloader = function () {
		$('.btn-flags').css('opacity', 0);
		var heartTitle = $('.heart-title');
		var introText = $('.intro-text');
		var resultBox = $('.result-box');
		setTimeout(function () {
			TweenMax.to(heartTitle, 2, {css: { top: '-150px'}, ease: Back.easeInOut});
			TweenMax.to(introText, 2, {css: { top: '750px'}, ease: Back.easeInOut});
			TweenMax.to(resultBox, 0.5, {css: {height: 200}, ease: Cubic.easeInOut});
			$('.other-button').fadeOut();
			setTimeout(function () {
				$('.preloader-section').fadeIn();
				$('.btn-flags').css('visibility', 'hidden');
				$('.loading-status').addClass('opacity-on');
			}, 700);
		}, 1000);
	};

	ResultPage.prototype.showPreloaderStatus = function () {
		console.log('ehre');
	};

	ResultPage.prototype.startResults = function (data) {
		var scope = this;
		this.bigHeartAnim(data);
	};

	ResultPage.prototype.finishAnimation = function (data) {
		var scope = this;
		$('.loading-status').removeClass('opacity-on');
		setTimeout(function () {
			$('.result-box').height(520);
			$('.buttons-box').addClass('final-border-bottom');
		}, 1000);

		setTimeout(function () {
			scope.animHeart(data);
		}, 2000);
	};

	ResultPage.prototype.insertResultPhrase = function () {
		setTimeout(function () {
			$('.preloader-section').fadeOut(1000, function () {
				$('.result-message').fadeIn();
			});
		}, 1200);
	};

	ResultPage.prototype.bigHeartAnim = function (data) {
		$('.result-message').text(data.finishPhrase);
		this.insertResultPhrase();
		var loveHandcap = $('.love');
		var percent = 100 - data.percentValue;
		this.countPercent(data.percentValue);
		TweenMax.to(loveHandcap, 3, {css: { top: percent + '%'}, delay: 0.3, ease: (percent >= 75) ? Cubic.easeInOut : Back.easeInOut, onCompleteScope: this, onComplete: this.finishAnimation, onCompleteParams: [data]});
	};

	ResultPage.prototype.countPercent = function (percent) {
		var currentPercent = 0;
		$('.total-percent').fadeIn();
		setTimeout(function () {
			var handler = setInterval(function () {
				$('.total-percent').text(currentPercent + '%');
				if (currentPercent < percent) {
					currentPercent ++;
				} else {
					clearInterval(handler);
				}
			}, 20);
		}, 1000);
	};

	ResultPage.prototype.showFriendsList = function (e) {
		e.preventDefault();
		try{
			window.ga('send', 'event', 'namorados-2013', 'clique', 'botao-mais');
		} catch(error){}
		$('.loading-photo').css('opacity', 0.6);
		this.selector.showFriendSelector();
	};

	ResultPage.prototype.onFriendSelected = function (otherId) {
		this.changeOtherData.dispatch(otherId);
		this.selector.hideFriendSelector();
		this.selector.reset();
	};

	ResultPage.prototype.onSubmitButton = function () {
		$('.loading-photo').css('opacity', 0);
	};

	ResultPage.prototype.changeProgressBar = function () {
		var progressBar = $('.loader-progress');
		var currentPhrase = $('.phrases');
		progressBar.css('width', this.currentPercent + '%');
		currentPhrase.text(this.preloaderPhrase[this.phrasePos]);
		this.currentPercent += 20;
		this.phrasePos++;
	};

	ResultPage.prototype.animHeart = function (data) {
		
		$('.photos-total').text(data.fotosJuntos);
		$('.likes-total').text(data.gostosComum);
		$('.mentions-total').text(data.mencoesCasal);
		$('.friends-total').text(data.amigosComum);
		$('.places-total').text(data.encontros);

		var scope = this;

		var photosHeart = $('.result-item.photos');
		var likesHeart = $('.result-item.likes');
		var placesHeart = $('.result-item.places');
		var mentionsHeart = $('.result-item.mentions');
		var friendsHeart = $('.result-item.friends');

		var photoHeartDataBlock = photosHeart.find('.white-heart');
		var likesHeartDataBlock = likesHeart.find('.white-heart');
		var placesHeartDataBlock = placesHeart.find('.white-heart');
		var mentionsHeartDataBlock = mentionsHeart.find('.white-heart');
		var friendsHeartDataBlock = friendsHeart.find('.white-heart');

		photosHeart.find('.icons').css('opacity', 0);
		likesHeart.find('.icons').css('opacity', 0);
		placesHeart.find('.icons').css('opacity', 0);
		mentionsHeart.find('.icons').css('opacity', 0);
		friendsHeart.find('.icons').css('opacity', 0);

		photoHeartDataBlock.css('opacity', 0);
		likesHeartDataBlock.css('opacity', 0);
		placesHeartDataBlock.css('opacity', 0);
		mentionsHeartDataBlock.css('opacity', 0);
		friendsHeartDataBlock.css('opacity', 0);

		var insertIcon = function(elem){
			TweenLite.to(elem.find('.icons'), 0.3, {css: { opacity: 1 }});
			if(elem===placesHeart){
				scope.whitePhotosHeart.apply(scope);
			}
		};

		var anim = function(elem, delay){
			TweenMax.to(elem, 0.3, {css: {width: '150px'}, delay: delay, ease: Power4.ease, onComplete:insertIcon, onCompleteParams:[elem]});
		};

		anim(photosHeart, 0);
		anim(likesHeart, 0.2);
		anim(mentionsHeart, 0.4);
		anim(friendsHeart, 0.6);
		anim(placesHeart, 0.8);

	};

	ResultPage.prototype.whitePhotosHeart = function () {

		var photosHeart = $('.result-item.photos .white-heart');
		var likesHeart = $('.result-item.likes .white-heart');
		var placesHeart = $('.result-item.places .white-heart');
		var mentionsHeart = $('.result-item.mentions .white-heart');
		var friendsHeart = $('.result-item.friends .white-heart');

		var photoHeartDataBlock = photosHeart.find('.heart-holder');
		var likesHeartDataBlock = likesHeart.find('.heart-holder');
		var placesHeartDataBlock = placesHeart.find('.heart-holder');
		var mentionsHeartDataBlock = mentionsHeart.find('.heart-holder');
		var friendsHeartDataBlock = friendsHeart.find('.heart-holder');

		var finishAnim = function(elem){
			TweenMax.to(elem, 0.5, {css: {top:'7px', opacity: 1}, ease: Cubic.easeInOut});
			if ( elem === placesHeartDataBlock ) {
				try{
					var obj = swfobject.getObjectById('image-exporter');
					obj.showButtons();
				}catch(e){}
			}
		};

		var anim = function(elem, endElem, delay){
			TweenMax.to(elem, 0.6, {css: {opacity:1, top: '125px'}, delay:delay, ease: Cubic.easeOut, onCompleteScope: this, onComplete: finishAnim, onCompleteParams: endElem });
		};

		anim(photosHeart, photoHeartDataBlock, 0);
		anim(likesHeart, likesHeartDataBlock, 0.2);
		anim(mentionsHeart, mentionsHeartDataBlock, 0.4);
		anim(friendsHeart, friendsHeartDataBlock, 0.6);
		anim(placesHeart, placesHeartDataBlock, 0.8);

	};

	ResultPage.prototype.showFlashButtons = function(data){
		var flashvars = {
			appId: data.appId,
			targetId: data.targetId,
			phpURL: 'save-image.php',
			userName: this.userName,
			targetName: this.targetName,
			percentValue: data.percentValue,
			userPhoto: this.userPhoto,
			targetPhoto: this.targetPhoto,
			finishPhrase: data.finishPhrase,
			fotosJuntos: data.fotosJuntos,
			gostosComum: data.gostosComum,
			mencoesCasal: data.mencoesCasal,
			amigosComum: data.amigosComum,
			encontros: data.encontros
		};
		var params = {
			allowscriptaccess: 'always',
			wmode: 'transparent'
		};
		swfobject.embedSWF('swf/image-exporter.swf', 'image-exporter', '810', '75', '10.0.0', null, flashvars, params, {name:'image-exporter'});
		this.startResults(data);
	};

	exports.ResultPage = ResultPage;

});
