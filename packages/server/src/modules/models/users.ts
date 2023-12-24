import {type Database} from 'better-sqlite3';

export type UsersTable = {
	id: number;
	email: string;
	username: string;
	password: string;
	mfa: Buffer;
	created_at: number;
	updated_at: number;
};

export const isPassword = (value: string) => value.length >= 16 && value.length <= 256 && /[^a-zA-Z0-9]/.test(value);

export const prepareUsersModel = (db: Database) => {
	const createUser = () => db.prepare<[UsersTable['email'], UsersTable['username'], UsersTable['password'], UsersTable['mfa'], UsersTable['created_at'], UsersTable['updated_at']], UsersTable>(
		`insert into "users" (email, username, password, mfa, created_at, updated_at)
values (?, ?, ?, ?, ?, ?)`);

	return {
		createUser,
	};
};
