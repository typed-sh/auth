import {type Database} from 'better-sqlite3';
import {prepareMetaModel} from './meta';
import {prepareUsersModel} from './users';

export const prepareModel = (db: Database) => ({
	meta: prepareMetaModel(db),
	users: prepareUsersModel(db),
});
