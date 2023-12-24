import {type Database} from 'better-sqlite3';
import {readFile, readdir} from 'fs/promises';
import path from 'path';

export type Migration = {
	revision: number;
	path: string;
};

export const migrationsDirectory = path.join(process.cwd(), 'migrations');

export const getAvailableMigrations = async (): Promise<Migration[]> => {
	const dir = await readdir(migrationsDirectory);

	return dir
		.filter(file => file.endsWith('.sql'))
		.map(file => ({
			revision: parseInt(file.split('-')[0], 10),
			path: path.join(migrationsDirectory, file),
		}))
		.sort((a, b) => a.revision - b.revision);
};

export const getRequiredMigrations = async (currentRevision: number, migrations: Migration[]) => {
	if (!currentRevision) {
		return migrations;
	}

	const current = migrations.findIndex(migration => migration.revision === currentRevision);

	if (current < 0) {
		return [];
	}

	return migrations.slice(current + 1);
};

export const migrate = async (db: Database, migration: Migration) => {
	db.exec(await readFile(migration.path, 'utf8'));
};

export const migrateSequentially = async (db: Database, migrations: Migration[]) => {
	for (const migration of migrations) {
		// eslint-disable-next-line no-await-in-loop
		await migrate(db, migration);
	}
};
