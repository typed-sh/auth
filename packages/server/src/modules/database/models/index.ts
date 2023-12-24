import {type Database} from 'better-sqlite3';
import {prepareMetaModel} from './meta';

export const prepareModel = (db: Database) => ({
	meta: prepareMetaModel(db),
});
