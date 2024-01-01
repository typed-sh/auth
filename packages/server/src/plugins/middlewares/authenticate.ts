import {type FastifyPluginAsyncTypebox} from '@fastify/type-provider-typebox';
import {type onRequestAsyncHookHandler} from 'fastify';
import {HttpErrorForbidden} from '../../modules/errors';
import {decodeAccessToken, validateAccessToken, type AccessTokenPayload} from '../../modules/token/access';

export type AuthenticationContext = AccessTokenPayload;

const reference = 'access';

export const handleRequestAuthentication: onRequestAsyncHookHandler = async request => {
	const header = request.headers.authorization;

	if (!header) {
		throw new HttpErrorForbidden('invalid credentials');
	}

	const [type, token] = header.split(' ');

	if (
		type !== 'bearer'
    || !token
	) {
		throw new HttpErrorForbidden('invalid credentials');
	}

	let payload: AccessTokenPayload;

	try {
		payload = decodeAccessToken(token).payload!;

		if (!payload) {
			throw new Error();
		}
	} catch (error: unknown) {
		throw new HttpErrorForbidden('invalid credentials');
	}

	const integration = request.server.db.models.userIntegrations.getUserIntegration().get(payload.integration);

	if (
		!integration
	) {
		return;
	}

	const access = await validateAccessToken(integration.private_key, token);

	request[reference] = access;
};

export const authenticatePlugin: FastifyPluginAsyncTypebox = async server => {
	if (server.hasRequestDecorator(reference)) {
		server.log.warn({scope: 'plugin:middlewares:authenticate'}, 'decorator already declared');

		return;
	}

	server.decorateRequest(reference, null);

	server.addHook('onRequest', handleRequestAuthentication);
};
