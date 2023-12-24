import {type FastifyPluginAsyncTypebox} from '@fastify/type-provider-typebox';
import {onsiteUserRouter} from './user';

export const onsiteRouter: FastifyPluginAsyncTypebox = async server => {
	await server.register(onsiteUserRouter, {prefix: '/user'});
};
