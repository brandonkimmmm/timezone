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

const getCurrentTime = async (timezone) => {
	return DateTime.now().setZone(timezone).toFormat('FFF');
};

const formatTimezones = async (timezones) => {
	return timezones.map((timezone) => {
		return {
			name: timezone.name,
			city: timezone.city,
			timezone: timezone.timezone,
			offset: timezone.offset,
			current_time: getCurrentTime(timezone)
		};
	});
};

module.exports = {
	getCityTimezone,
	getCurrentTime,
	formatTimezones
};
