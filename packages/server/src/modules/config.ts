import {type KeyObject} from 'crypto';
import {V4 as paseto} from 'paseto';

export type Config = {
	platformKey: KeyObject;
};

export type ConfigSerialized = {
	platformKey: string;
};

export const createConfig = async (): Promise<Config> => {
	const platformKey = await paseto.generateKey('public', {
		format: 'keyobject',
	});

	return {
		platformKey,
	};
};

export const serializeConfig = (config: Config): ConfigSerialized => ({
	platformKey: paseto.keyObjectToBytes(config.platformKey).toString('hex'),
});

export const deserializeConfig = (config: ConfigSerialized) => ({
	platformKey: paseto.bytesToKeyObject(Buffer.from(config.platformKey, 'hex')),
});
