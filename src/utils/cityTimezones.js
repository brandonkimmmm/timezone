const cityTimezones = require('city-timezones');
const { isString, isEmpty } = require('lodash');
const { DateTime } = require('luxon');

const getCityTimezone = async (city) => {
	if (!isString(city) || isEmpty(city)) {
		throw new Error('Invalid city');
	}

	const cityLookup = cityTimezones.lookupViaCity(city);

	if (isEmpty(cityLookup)) {
		throw new Error('Invalid city');
	}

	const timezone = cityLookup[0].timezone;
	const offset = `${DateTime.now().setZone(timezone).offset / 60}:00`;

	return {
		timezone,
		offset
	};
};

module.exports = {
	getCityTimezone
};
