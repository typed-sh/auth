import {V4 as paseto} from 'paseto';
import {type UserIntegrationsTable} from '../models/userIntegrations';
import {type Scope} from './scope';

const defaultSigningOptions = {
	issuer: 'typed.sh',
	subject: 'refresh',
};

export type RefreshTokenPayload = {
	integration: UserIntegrationsTable['id'];
	scopes: Scope[];
};

export const issueRefreshToken = async (key: Buffer, payload: RefreshTokenPayload) => paseto.sign(
	payload,
	paseto.bytesToKeyObject(key),
	{
		...defaultSigningOptions,
		expiresIn: '6 months',
	},
);

export const validateRefreshToken = async (key: Buffer, token: string) => paseto.verify<RefreshTokenPayload>(token, key, defaultSigningOptions);
