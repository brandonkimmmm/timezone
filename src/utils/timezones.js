const cityTimezones = require('city-timezones');
const { isString, isEmpty } = require('lodash');
const { DateTime } = require('luxon');

const getCityTimezone = async (city, country) => {
	if (!isString(city) || isEmpty(city)) {
		throw new Error('Invalid city');
	}

	const cityLookup = cityTimezones.lookupViaCity(city);

	if (isEmpty(cityLookup)) {
		throw new Error('Invalid city');
	}

	let foundCity;

	if (isString(country) && country.length === 2) {
		foundCity = cityLookup.find((city) => city.iso2 === country.toUpperCase());
	} else {
		foundCity = cityLookup[0];
	}

	if (!foundCity) {
		throw new Error('Invalid city');
	}

	const timezone = foundCity.timezone;
	const offset = `${DateTime.now().setZone(timezone).offset / 60}:00`;

	return {
		timezone,
		offset
	};
};

const getCurrentTime = (timezone) => {
	return DateTime.now().setZone(timezone).toFormat('FFF');
};

const formatTimezones = async (timezones) => {
	return timezones.map((timezone) => {
		return {
			name: timezone.name,
			city: timezone.city,
			timezone: timezone.timezone,
			offset: timezone.offset,
			current_time: getCurrentTime(timezone.timezone)
		};
	});
};

module.exports = {
	getCityTimezone,
	getCurrentTime,
	formatTimezones
};
