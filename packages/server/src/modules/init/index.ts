import {type createServer} from '../..';
import {getAvailableMigrations, getRequiredMigrations, migrateSequentially} from '../database/migration';
import {MetaKey} from '../models/meta';

type Server = Awaited<ReturnType<typeof createServer>>;

const initMigrations = async (server: Server) => {
	const {db} = server;

	let currentRevision = 0;

	try {
		currentRevision = parseInt(db.models.meta.getMeta().get(MetaKey.MigrationRevision)!.value, 10);
	} catch (error) {
		if (error instanceof Error && error.message.includes('no such table')) {
			server.log.info({scope: 'init:migrations'}, 'we are now on a fresh database');
		} else {
			server.log.error({scope: 'init:migrations', error}, 'exiting as the state is not evaluatable');

			// Hard exit
			process.exit(1);
		}
	}

	if (isNaN(currentRevision)) {
		currentRevision = 0;
	}

	const migrations = await getRequiredMigrations(currentRevision, await getAvailableMigrations());

	if (migrations.length) {
		server.log.info({scope: 'init:migrations', currentRevision, finalRevision: migrations[migrations.length - 1].revision}, 'running migrations');

		await migrateSequentially(db.driver, migrations);
	}

	server.log.info({scope: 'init:migrations'}, 'done migrations');
};

export const init = async (server: Server) => {
	await initMigrations(server);
};
