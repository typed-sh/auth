import fastify from 'fastify';
import {databasePlugin} from './plugins/database';

export const createServer = async () => {
	const server = fastify();

	await server.register(databasePlugin);

	return server;
};
