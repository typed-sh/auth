import {type Database} from 'better-sqlite3';

export type MetaTable = {
	key: number;
	value: string;
};

export const prepareMetaModel = (db: Database) => {
	const getMigrationRevision = () => db.prepare<[string], Pick<MetaTable, 'value'>>('select value from "meta" where key = ?').get('migration_revision')?.value;

	return {
		getMigrationRevision,
	};
};
