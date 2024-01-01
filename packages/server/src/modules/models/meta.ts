import {type Database} from 'better-sqlite3';

export enum MetaKey {
	MigrationRevision = 'migration_revision',
}

export type MetaTable = {
	key: MetaKey;
	value: string;
};

export const prepareMetaModel = (db: Database) => {
	const getMeta = () => db.prepare<[MetaTable['key']], Pick<MetaTable, 'value'>>('select value from "meta" where key = ?');
	const setMeta = () => db.prepare<[MetaTable['key'], MetaTable['value']], MetaTable>('insert into "meta" (key, value) values (?, ?)');

	return {
		getMeta,
		setMeta,
	};
};
