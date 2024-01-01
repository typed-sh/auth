import {type Database} from 'better-sqlite3';
import {type ApplicationsTable} from './applications';
import {type UsersTable} from './users';

export type UserIntegrationsTable = {
	id: number;
	user: UsersTable['id'];
	application: ApplicationsTable['id'];
	state: string;
	private_key: Buffer;
	is_user_readable: boolean;
	is_user_writable: boolean;
	created_at: number;
	updated_at: number;
};

export const prepareUserIntegrationsModel = (db: Database) => {
	const getUserIntegration = () => db.prepare<[UserIntegrationsTable['id']], UserIntegrationsTable>('select * from "user_integrations" where id = ?');
	const getUserIntegrationByUserAndApplication = () => db.prepare<[UserIntegrationsTable['user'], UserIntegrationsTable['application']], UserIntegrationsTable>('select * from "user_integrations" where user = ? and application = ?');

	const createUserIntegration = () => db.prepare<
	[
		UserIntegrationsTable['user'],
		UserIntegrationsTable['application'],
		UserIntegrationsTable['state'],
		UserIntegrationsTable['private_key'],
		UserIntegrationsTable['is_user_readable'],
		UserIntegrationsTable['is_user_writable'],
		UserIntegrationsTable['created_at'],
		UserIntegrationsTable['updated_at'],
	],
	UserIntegrationsTable
	>(`insert into "user_integrations" (user, application, state, private_key, is_user_readable, is_user_writable, created_at, updated_at)
values (?, ?, ?, ?, ?, ?, ?, ?)`);

	const setUserIntegrationState = () => db.prepare<[UserIntegrationsTable['state'], UserIntegrationsTable['id']], UserIntegrationsTable>('update "user_integrations" set state = ? where id = ?');

	return {
		getUserIntegration,
		getUserIntegrationByUserAndApplication,

		createUserIntegration,

		setUserIntegrationState,
	};
};
