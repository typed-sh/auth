import {type FastifyPluginAsync} from 'fastify';
import {onsiteRouter} from './onsite';

export const router: FastifyPluginAsync = async server => {
	await server.register(onsiteRouter, {prefix: '/onsite'});
};
