import {Type, type FastifyPluginAsyncTypebox} from '@fastify/type-provider-typebox';
import {createHash} from '../../modules/password';
import {HttpErrorBadRequest} from '../../modules/errors';

export const onsiteUserRouter: FastifyPluginAsyncTypebox = async server => {
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
			const hash = await createHash(password);
			const now = Date.now();

			const tx = server.db.driver.transaction(() => {
				server.db.models.users.createUser().run(email, username, hash, Buffer.from([0]), now, now);
			});

			tx();

			return '';
		},
		async errorHandler(error, request, reply) {
			if (error.message.includes('UNIQUE')) {
				throw new HttpErrorBadRequest('unique_constraint_failed');
			}

			void reply.send(error);
		},
	});
};
