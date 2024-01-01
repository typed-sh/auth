/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable new-cap */
import {Type, type FastifyPluginAsyncTypebox} from '@fastify/type-provider-typebox';
import {HttpErrorBadRequest} from '../../modules/errors';
import {issueAccessToken} from '../../modules/token/access';
import {validateAuthorizationToken} from '../../modules/token/authorization';
import {issueRefreshToken} from '../../modules/token/refresh';

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

			const accessToken = await issueAccessToken(integration.private_key, {
				integration: integration.id,
				user: integration.user,
				application: integration.application,
				scopes: payload.scopes,
			});
			const refreshToken = await issueRefreshToken(integration.private_key, {
				integration: integration.id,
			});

			return {
				access_token: accessToken,
				token_type: 'bearer',
				expires_in: 1800,
				refresh_token: refreshToken,
				scope: payload.scopes,
			};
		},
	});
};
