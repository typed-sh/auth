import {type KeyObject} from 'crypto';
import {V4 as paseto} from 'paseto';
import {type UserIntegrationsTable} from '../models/userIntegrations';
import {type Scope} from './scope';

const defaultSigningOptions = {
	issuer: 'typed.sh',
	subject: 'authorization',
};

export type AuthorizationTokenPayload = {
	integration: UserIntegrationsTable['id'];
	scopes: Scope[];
	state: string;
};

export const issueAuthorizationToken = async (key: KeyObject, payload: AuthorizationTokenPayload) => paseto.sign(
	payload,
	key,
	{
		...defaultSigningOptions,
		expiresIn: '5 minutes',
	},
);

export const validateAuthorizationToken = async (key: KeyObject, token: string) => paseto.verify<AuthorizationTokenPayload>(token, key, defaultSigningOptions);
