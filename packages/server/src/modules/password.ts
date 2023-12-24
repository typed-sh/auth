import * as argon2 from 'argon2';

export const createHash = async (password: string) => argon2.hash(password, {
	type: 2, /* @argon2.argon2id */
});

// Starts with $argon2
export const validateHash = async (password: string, hash: string) => argon2.verify(hash, password, {
	type: 2, /* @argon2.argon2id */
});
