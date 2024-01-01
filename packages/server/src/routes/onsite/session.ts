import {Type, type FastifyPluginAsyncTypebox} from '@fastify/type-provider-typebox';
import {HttpErrorBadRequest} from '../../modules/errors';
import {validateHash} from '../../modules/password';
import {issueOnsiteToken} from '../../modules/token/onsite';
import {CookieNames, atZeroDateUtcString, getCookieString} from '../../plugins/cookie';

export const onsiteSessionRouter: FastifyPluginAsyncTypebox = async server => {
	server.route({
		url: '/',
		method: 'post',
		schema: {
			body: Type.Object({
				email: Type.String(),
				password: Type.String(),
			}),
		},
		async handler(request, reply) {
			const {body} = request;
			const user = server.db.models.users.getUserByEmail().get(body.email);

			if (
				!user
        || !await validateHash(body.password, user.password)
			) {
				throw new HttpErrorBadRequest('invalid credentials');
			}

			const token = await issueOnsiteToken(server.config.platformKey, {
				user: user.id,
			});

			void reply.header('set-cookie', getCookieString(CookieNames.Auth, token, [
				'HttpOnly',
				'SameSite=Strict',
				'Path=/',
			]));

			return '';
		},
	});

	server.route({
		url: '/',
		method: 'delete',
		async handler(request, reply) {
			void reply.header('set-cookie', getCookieString(CookieNames.Auth, '', [
				'HttpOnly',
				'SameSite=Strict',
				'Path=/',
				`Expires=${atZeroDateUtcString}`,
			]));

			return '';
		},
	});
};
