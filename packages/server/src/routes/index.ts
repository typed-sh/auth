import {type FastifyPluginAsync} from 'fastify';
import {oauthRouter} from './oauth';
import {onsiteRouter} from './onsite';

export const router: FastifyPluginAsync = async server => {
	await server.register(onsiteRouter, {prefix: '/onsite'});
	await server.register(oauthRouter, {prefix: '/oauth'});
};
