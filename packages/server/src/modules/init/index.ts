import {type createServer} from '../..';
import {getAvailableMigrations, getRequiredMigrations, migrateSequentially} from '../database/migration';

type Server = Awaited<ReturnType<typeof createServer>>;

const initMigrations = async (server: Server) => {
	console.log('init(migrations): running');

	const {db} = server;

	let currentRevision = 0;

	try {
		currentRevision = parseInt(db.models.meta.getMigrationRevision()!, 10);
	} catch (error) {
		if (error instanceof Error && error.message.includes('no such table')) {
			console.log('init(migrations): we are now on a fresh database');
		} else {
			console.error('init(migrations): exiting as the state is not evaluatable', error);

			// Hard exit
			process.exit(1);
		}
	}

	if (isNaN(currentRevision)) {
		currentRevision = 0;
	}

	await migrateSequentially(db.driver, await getRequiredMigrations(currentRevision, await getAvailableMigrations()));

	console.log('init(migrations): done');
};

export const init = async (server: Server) => {
	await initMigrations(server);
};
