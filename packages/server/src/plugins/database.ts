import {type FastifyPluginAsync} from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import path from 'path';
import {createDatabaseDriver} from '../modules/database/driver';
import {prepareModel} from '../modules/database/models';

export type DatabasePluginContext = {
	filepath: string;
	driver: ReturnType<typeof createDatabaseDriver>;
	models: ReturnType<typeof prepareModel>;
};

const reference = 'db';

const plugin: FastifyPluginAsync = async server => {
	if (server.hasDecorator(reference)) {
		console.warn('plugins(database): already declared');

		return;
	}

	const filepath = path.join(process.cwd(), 'auth.db');
	const driver = createDatabaseDriver(filepath);
	const models = prepareModel(driver);

	driver.pragma('foreign_keys = on');

	const context: DatabasePluginContext = {
		filepath,
		driver,
		models,
	};

	server.decorate(reference, context);
};

export const databasePlugin = fastifyPlugin(plugin);
