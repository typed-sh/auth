import {type KeyObject} from 'crypto';
import {V4 as paseto} from 'paseto';
import {type UsersTable} from '../models/users';

const defaultSigningOptions = {
	issuer: 'typed.sh',
	subject: 'onsite',
};

export type OnsiteTokenPayload = {
	user: UsersTable['id'];
};

export const issueOnsiteToken = async (key: KeyObject, payload: OnsiteTokenPayload) => paseto.sign(payload, key, {
	...defaultSigningOptions,
	expiresIn: '24 hours',
});

export const validateOnsiteToken = async (key: KeyObject, token: string) => paseto.verify<OnsiteTokenPayload>(token, key, defaultSigningOptions);
