define(['jquery',
		'exports',
		'signals',
		'compoundSignal',
		'search/friends',
		'search/likes',
		'search/mentions',
		'search/photos',
		'search/places' ],
		function ($, exports, signals, compoundSignals, friends, likes, mentions, photos, places) {

	'use strict';

	var Search = function (_authResponse) {
		this.uid = _authResponse.uid;
		this.targetId = _authResponse.targetId;
		this.coupleData = [];
		this.percentChange = new signals.Signal();

		this.authData = {
			uid: this.uid,
			targetId: this.targetId
		};

		this.friends = new friends.Friends(this.authData);
		this.likes = new likes.Likes(this.authData);
		this.mentions = new mentions.Mentions(this.authData);
		this.photos = new photos.Photos(this.authData);
		this.places = new places.Places(this.authData);

		this.friends.dataLoaded.add($.proxy(this.onGetFriends, this));
		this.likes.dataLoaded.add($.proxy(this.onGetLikes, this));
		this.mentions.dataLoaded.add($.proxy(this.onGetMentions, this));
		this.photos.dataLoaded.add($.proxy(this.onGetPhotos, this));
		this.places.dataLoaded.add($.proxy(this.onGetPlaces, this));

		this.dataReady = new signals.CompoundSignal(
				this.friends.dataLoaded,
				this.likes.dataLoaded,
				this.mentions.dataLoaded,
				this.photos.dataLoaded,
				this.places.dataLoaded
		);

	};

	Search.prototype.changeOtherData = function (targetId) {
		this.targetId = targetId;
	};

	Search.prototype.onGetFriends = function () {
		this.percentChange.dispatch();
		var mutualFriends = this.friends.retrieveData();
		console.log(mutualFriends);
	};

	Search.prototype.onGetLikes = function () {
		this.percentChange.dispatch();
		var likes = this.likes.retrieveData();
		console.log(likes);
	};

	Search.prototype.onGetMentions = function () {
		this.percentChange.dispatch();
		var mentions = this.mentions.retrieveData();
		console.log(mentions);
	};

	Search.prototype.onGetPhotos = function () {
		this.percentChange.dispatch();
		var photos = this.photos.retrieveData();
		console.log(photos);
	};

	Search.prototype.onGetPlaces = function () {
		this.percentChange.dispatch();
		var places = this.places.retrieveData();
		console.log(places);
	};

	Search.prototype.retrieveCoupleData = function () {
		this.friends.getFriends();
		this.likes.getLikes();
		this.mentions.getMentions();
		this.photos.getPhotos();
		this.places.getPlaces();
	};

	Search.prototype.getTotalPercent = function(){
		return this.friends.retrieveData().percent +
			this.likes.retrieveData().percent +
			this.mentions.retrieveData().percent +
			this.photos.retrieveData().percent +
			this.places.retrieveData().percent;
	};

	Search.prototype.getPhrase = function(){
		var phrase = '';
		var i = this.getTotalPercent();
		if ( i < 11 ) {
			phrase = 'um é água e o outro é fogo, mas calma! até a água se derrete toda pertinho do calor.';
		} else if ( i < 21 ){
			phrase = 'vocês têm pouco em comum, mas não desista. afinal, os opostos também se atraem.';
		} else if ( i < 31 ){
			phrase = 'os opostos se atraem, mas os dispostos se atraem muito mais. então esteja disposto a conhecer melhor quem você ama. assim, a afinidade vai só aumentar.';
		} else if ( i < 41 ){
			phrase = 'a afinidade está baixa, mas vocês já têm algo muito importante em comum: o amor um pelo outro.';
		} else if ( i < 51 ){
			phrase = 'média sintonia! vocês já têm algumas coisas em comum. agora é passar mais tempo juntos, porque afinidade é como um bom vinho: melhora com o tempo.';
		} else if ( i === 50 ) {
			phrase = 'meio "amei-o". o que vocês têm em comum deixa o amor mais forte e o que vocês têm de diferente deixa o amor mais interessante. aproveitem esse amor na medida certa!';
		} else if ( i < 61 ) {
			phrase = 'passe mais tempo com quem você ama! vocês já têm algumas coisas em comum, mas precisam descobrir mais coisas juntos.';
		} else if ( i < 71 ) {
			phrase = 'vocês têm tudo para dar certo! a sintonia está ótima e para ficar ainda melhor prepare uma surpresa especial de dia dos namorados.';
		} else if ( i < 81 ) {
			phrase = 'alta afinidade! o coração de vocês batem juntos pelas mesmas coisas, inclusive um pelo outro.';
		} else if ( i < 91 ) {
			phrase = 'super afinidade! vocês já têm tanto em comum que até os corações de vocês devem bater no mesmo ritmo.';
		} else {
			phrase = 'afinidade máxima! vocês são o caso de sucesso do cupido. ele acertou em cheio com o amor de vocês dois.';
		}
		return phrase;
	};

	exports.Search = Search;
});
