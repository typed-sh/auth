/* eslint-disable new-cap */
import {FormatRegistry} from '@sinclair/typebox';

export enum Formats {
	Numeric = 'numeric',
}

FormatRegistry.Set(Formats.Numeric, value => {
	for (let i = 0; i < value.length; i++) {
		const code = value.charCodeAt(i);

		if (code < 48 || code > 57) {
			return false;
		}
	}

	return true;
});
