import {type FastifyPluginAsync} from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import path from 'path';
import {createDatabaseDriver} from '../modules/database/driver';

export type DatabasePluginContext = {
	filepath: string;
	driver: ReturnType<typeof createDatabaseDriver>;
};

const reference = 'db';

const plugin: FastifyPluginAsync = async server => {
	if (server.hasDecorator(reference)) {
		console.warn('plugins(database): already declared');

		return;
	}

	const filepath = path.join(process.cwd(), '');
	const driver = createDatabaseDriver(filepath);

	const context: DatabasePluginContext = {
		filepath,
		driver,
	};

	server.decorate(reference, context);
};

export const databasePlugin = fastifyPlugin(plugin);
