import {decode, V4 as paseto} from 'paseto';
import {type UserIntegrationsTable} from '../models/userIntegrations';
import {type Scope} from './scope';

const defaultSigningOptions = {
	issuer: 'typed.sh',
	subject: 'access',
};

export type AccessTokenPayload = {
	integration: UserIntegrationsTable['id'];
	scopes: Scope[];
};

export const issueAccessToken = async (key: Buffer, payload: AccessTokenPayload) => paseto.sign(
	payload,
	paseto.bytesToKeyObject(key),
	{
		...defaultSigningOptions,
		expiresIn: '30 minutes',
	},
);

export const validateAccessToken = async (key: Buffer, token: string) => paseto.verify<AccessTokenPayload>(token, key, defaultSigningOptions);

export const decodeAccessToken = (token: string) => decode<AccessTokenPayload>(token);
