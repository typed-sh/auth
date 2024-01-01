import {type FastifyPluginAsync} from 'fastify';
import {onsiteSessionRouter} from './session';

export const onsiteRouter: FastifyPluginAsync = async server => {
	await server.register(onsiteSessionRouter, {prefix: '/session'});
};
