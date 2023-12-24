import fastify from 'fastify';
import {init} from './modules/init';
import {databasePlugin} from './plugins/database';

export const createServer = async () => {
	const server = fastify();

	await server.register(databasePlugin);

	await init(server);

	return server;
};
