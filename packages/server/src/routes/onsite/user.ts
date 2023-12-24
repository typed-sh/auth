import {Type, type FastifyPluginAsyncTypebox} from '@fastify/type-provider-typebox';
import {HttpErrorBadRequest} from '../../modules/errors';
import {createHash} from '../../modules/password';
import {isPassword} from '../../modules/models/users';

export const onsiteUserRouter: FastifyPluginAsyncTypebox = async server => {
	if (process.env.__AUTH_DISABLE_SIGNUP) {
		return;
	}

	server.route({
		url: '/',
		method: 'post',
		schema: {
			body: Type.Object({
				email: Type.String(),
				password: Type.String(),
				username: Type.String(),
			}),
		},
		async handler(request, reply) {
			const {email, username, password} = request.body;

			if (!isPassword(password)) {
				throw new HttpErrorBadRequest('invalid_password_components');
			}

			const hash = await createHash(password);
			const now = Date.now();

			const tx = server.db.driver.transaction(() => {
				server.db.models.users.createUser().run(email, username, hash, Buffer.from([0]), now, now);
			});

			tx();

			return '';
		},
		async errorHandler(error, request, reply) {
			if (error.message.includes('UNIQUE')) { // Error: sqlite unique constraint
				throw new HttpErrorBadRequest('unique_constraint_failed');
			}

			void reply.send(error);
		},
	});
};
