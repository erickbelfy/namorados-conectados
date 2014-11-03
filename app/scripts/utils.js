define(['jquery', 'exports'], function ($, exports) {
	'use strict';

	exports.randomRange = function (min, max) {
		return min + Math.floor(Math.random() * (max - min + 1));
	};

	exports.getPercentData = function (value, base) {
		var total = 0;
		if (value >= 1) {
			total = 1;
		}
		if (value >= base) {
			total ++;
		} else {
			total += (value * 1) / base;
		}
		return  total.toFixed(1) * 10;
	};

});
