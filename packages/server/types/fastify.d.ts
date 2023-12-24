import {type DatabasePluginContext} from '../src/plugins/database';

declare module 'fastify' {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface FastifyInstance {
		db: DatabasePluginContext;
	}
}
