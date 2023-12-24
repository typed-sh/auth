import {TypeBoxValidatorCompiler} from '@fastify/type-provider-typebox';
import fastify from 'fastify';
import {init} from './modules/init';
import {cookiePlugin} from './plugins/cookie';
import {databasePlugin} from './plugins/database';
import {router} from './routes';

export const createServer = async () => {
	const server = fastify({
		logger: {
			transport: {
				target: 'pino-pretty',
				options: {
					translateTime: 'HH:MM:ss Z',
					ignore: 'pid,hostname',
				},
			},
		},
	})
		.setValidatorCompiler(TypeBoxValidatorCompiler);

	await server.register(cookiePlugin);
	await server.register(databasePlugin);

	await init(server);

	await server.register(router, {prefix: '/api'});

	return server;
};
