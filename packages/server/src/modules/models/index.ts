import {type Database} from 'better-sqlite3';
import {prepareApplicationsModel} from './applications';
import {prepareMetaModel} from './meta';
import {prepareUserIntegrationsModel} from './userIntegrations';
import {prepareUsersModel} from './users';

export const prepareModel = (db: Database) => ({
	meta: prepareMetaModel(db),
	users: prepareUsersModel(db),
	applications: prepareApplicationsModel(db),
	userIntegrations: prepareUserIntegrationsModel(db),
});
