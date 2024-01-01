import {type Database} from 'better-sqlite3';
import {type UsersTable} from './users';

export type ApplicationsTable = {
	id: number;
	user: UsersTable['id'];
	name: string;
	description: string;
	website: string;
	privacy_policy: string;
	redirect_uri: string;
	is_approved: boolean;
	is_trusted: boolean;
	created_at: number;
	updated_at: number;
};

export const prepareApplicationsModel = (db: Database) => {
	const getApplication = () => db.prepare<[ApplicationsTable['id']], ApplicationsTable>('select * from "applications" where id = ?');

	return {
		getApplication,
	};
};
