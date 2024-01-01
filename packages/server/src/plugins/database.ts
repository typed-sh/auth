import {type FastifyPluginAsync} from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import {writeFile} from 'fs/promises';
import path from 'path';
import {createDatabaseDriver} from '../modules/database/driver';
import {prepareModel} from '../modules/models';

export type DatabasePluginContext = {
	filepath: string;
	driver: ReturnType<typeof createDatabaseDriver>;
	models: ReturnType<typeof prepareModel>;
};

const reference = 'db';

const plugin: FastifyPluginAsync = async server => {
	if (server.hasDecorator(reference)) {
		server.log.warn({scope: 'plugin:database'}, 'decorator already declared');

		return;
	}

	const filepath = path.join(process.cwd(), 'auth.db');

	if (process.env.__AUTH_EMPTY_DB_ON_BOOT) {
		server.log.warn({scope: 'plugin:database'}, 'emptying database file on boot');

		await writeFile(filepath, '', 'utf8');
	}

	const driver = createDatabaseDriver(filepath);
	const models = prepareModel(driver);

	driver.pragma('foreign_keys = on');
	driver.pragma('journal_mode = wal');

	const context: DatabasePluginContext = {
		filepath,
		driver,
		models,
	};

	server.decorate(reference, context);
	server.addHook('onClose', () => {
		driver.close();

		server.log.info({scope: 'plugin:database'}, 'closed database');
	});
};

export const databasePlugin = fastifyPlugin(plugin);
