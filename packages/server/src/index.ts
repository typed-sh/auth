import './modules/formats';

import {TypeBoxValidatorCompiler} from '@fastify/type-provider-typebox';
import fastify from 'fastify';
import {type Config} from './modules/config';
import {init} from './modules/init';
import {configPlugin} from './plugins/config';
import {cookiePlugin} from './plugins/cookie';
import {databasePlugin} from './plugins/database';
import {router} from './routes';

export const createServer = async ({
	config,
}: {
	config: Config;
}) => {
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

	await server.register(configPlugin, config);
	await server.register(databasePlugin);

	await server.register(cookiePlugin);

	await init(server);

	await server.register(router, {prefix: '/api'});

	return server;
};
