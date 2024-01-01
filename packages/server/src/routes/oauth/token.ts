/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable new-cap */
import {Type, type FastifyPluginAsyncTypebox} from '@fastify/type-provider-typebox';
import {HttpErrorBadRequest} from '../../modules/errors';
import {validateAuthorizationToken} from '../../modules/token/authorization';
import {issueAccessToken} from '../../modules/token/access';
import {issueRefreshToken} from '../../modules/token/refresh';
import {Scope} from '../../modules/token/scope';

export const oauthTokenRouter: FastifyPluginAsyncTypebox = async server => {
	server.route({
		url: '/',
		method: 'get',
		schema: {
			querystring: Type.Object({
				grant_type: Type.Literal('authorization_code'),
				code: Type.String(),
				redirect_uri: Type.String(),
				client_id: Type.String(),
			}),
		},
		async handler(request, reply) {
			const {query} = request;
			const clientId = parseInt(query.client_id, 10);

			if (isNaN(clientId)) {
				throw new HttpErrorBadRequest('invalid_request');
			}

			const payload = await validateAuthorizationToken(server.config.platformKey, query.code)
				.catch((error: Error) => error);

			if (payload instanceof Error) {
				throw new HttpErrorBadRequest('invalid_request');
			}

			const integration = server.db.models.userIntegrations.getUserIntegration().get(payload.integration);

			if (
				!integration
        || integration.application !== clientId
        || integration.state !== payload.state
			) {
				throw new HttpErrorBadRequest('invalid_request');
			}

			server.db.models.userIntegrations.setUserIntegrationState().run('', integration.id);

			const scopes: Scope[] = [];

			if (integration.is_user_readable) {
				scopes.push(Scope.UserRead);
			}

			if (integration.is_user_writable) {
				scopes.push(Scope.UserWrite);
			}

			const accessToken = await issueAccessToken(integration.private_key, {
				integration: integration.id,
				user: integration.user,
				application: integration.application,
				scopes,
			});
			const refreshToken = await issueRefreshToken(integration.private_key, {
				integration: integration.id,
			});

			return {
				access_token: accessToken,
				token_type: 'bearer',
				expires_in: 1800,
				refresh_token: refreshToken,
				scope: scopes,
			};
		},
	});
};
