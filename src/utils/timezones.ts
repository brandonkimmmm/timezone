import cityTimezones from 'city-timezones';
import { isEmpty } from 'lodash';
import { DateTime } from 'luxon';
import { TimezoneInstance } from '../db/models/timezone';
import { TimezoneSchema } from './schemas';

interface CityTimezone {
	timezone: string;
	offset: string;
}

interface Timezone {
	name: string;
	city: string;
	timezone: string;
	offset: string;
	current_time: string;
}

export const getCityTimezone = async (
	city: string,
	country?: string
): Promise<CityTimezone> => {
	city = await TimezoneSchema.extract('city').required().validateAsync(city);
	country = await TimezoneSchema.extract('country').validateAsync(country);

	const cityLookup = cityTimezones.lookupViaCity(city);

	if (isEmpty(cityLookup)) {
		throw new Error('Invalid city');
	}

	const foundCity = country
		? cityLookup.find((city) => city.iso2 === country)
		: cityLookup[0];

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

export const getCurrentTime = (timezone: string): string => {
	return DateTime.now().setZone(timezone).toFormat('FFF');
};

export const formatTimezones = async (
	timezones: TimezoneInstance[]
): Promise<Timezone[]> => {
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
