import {type Database} from 'better-sqlite3';

export type UsersTable = {
	id: number;
	email: string;
	username: string;
	password: string;
	// eslint-disable-next-line @typescript-eslint/ban-types
	mfa: Buffer | null;
	created_at: number;
	updated_at: number;
};

export const prepareUsersModel = (db: Database) => {
	const getUserByEmail = () => db.prepare<[UsersTable['email']], UsersTable>('select * from "users" where email = ?');
	const getUserById = () => db.prepare<[UsersTable['id']], UsersTable>('select * from "users" where id = ?');

	const createUser = () => db.prepare<[UsersTable['email'], UsersTable['username'], UsersTable['password'], UsersTable['mfa'], UsersTable['created_at'], UsersTable['updated_at']], UsersTable>(
		`insert into "users" (email, username, password, mfa, created_at, updated_at)
values (?, ?, ?, ?, ?, ?)`);

	return {
		getUserByEmail,
		getUserById,

		createUser,
	};
};
