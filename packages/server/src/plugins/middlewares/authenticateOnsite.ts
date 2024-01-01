import {type FastifyPluginAsyncTypebox} from '@fastify/type-provider-typebox';
import {type onRequestAsyncHookHandler} from 'fastify';
import QueryString from 'qs';
import {HttpErrorForbidden} from '../../modules/errors';
import {type OnsiteTokenPayload, validateOnsiteToken} from '../../modules/token/onsite';

export type AuthenticationOnsiteContext = OnsiteTokenPayload;

export type AuthenticationOnsiteOptions = {
	onAuthenticationFailed: 'reject' | 'callback';
};

const reference = 'session';

export const handleRequestOnsiteAuthentication: onRequestAsyncHookHandler = async (request, reply) => {
	const token = request.cookies.auth;

	if (!token) {
		throw new HttpErrorForbidden('invalid credentials');
	}

	const data = await validateOnsiteToken(request.server.config.platformKey, token)
		.catch((error: Error) => error);

	if (data instanceof Error) {
		throw new HttpErrorForbidden('invalid credentials');
	}

	request[reference] = data;
};

export const handleRequestOnsiteAuthenticationCallback: onRequestAsyncHookHandler = async (request, reply) => {
	const token = request.cookies.auth;

	if (!token) {
		void reply.redirect(307, '/i/onsite/session?' + QueryString.stringify({callback: request.originalUrl}));

		return reply;
	}

	const data = await validateOnsiteToken(request.server.config.platformKey, token)
		.catch((error: Error) => error);

	if (data instanceof Error) {
		void reply.redirect(307, '/i/onsite/session?' + QueryString.stringify({callback: request.originalUrl}));

		return reply;
	}

	request[reference] = data;
};

export const authenticateOnsitePlugin: FastifyPluginAsyncTypebox<AuthenticationOnsiteOptions> = async (server, {onAuthenticationFailed}) => {
	if (server.hasRequestDecorator(reference)) {
		server.log.warn({scope: 'plugin:middlewares:authenticateOnsite'}, 'decorator already declared');

		return;
	}

	server.decorateRequest(reference, null);

	if (onAuthenticationFailed === 'callback') {
		server.addHook('onRequest', handleRequestOnsiteAuthenticationCallback);
	} else {
		server.addHook('onRequest', handleRequestOnsiteAuthentication);
	}
};
