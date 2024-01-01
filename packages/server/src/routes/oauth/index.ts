import {type FastifyPluginAsync} from 'fastify';
import {oauthAuthorizeRouter} from './authorize';
import {oauthTokenRouter} from './token';

export const oauthRouter: FastifyPluginAsync = async server => {
	await server.register(oauthAuthorizeRouter, {prefix: '/authorize'});
	await server.register(oauthTokenRouter, {prefix: '/token'});
};
