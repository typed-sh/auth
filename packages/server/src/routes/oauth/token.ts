/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable new-cap */
import {Type, type FastifyPluginAsyncTypebox} from '@fastify/type-provider-typebox';
import {decode} from 'paseto';
import {HttpErrorBadRequest} from '../../modules/errors';
import {issueAccessToken} from '../../modules/token/access';
import {validateAuthorizationToken} from '../../modules/token/authorization';
import {issueRefreshToken, validateRefreshToken, type RefreshTokenPayload} from '../../modules/token/refresh';
import {Scope} from '../../modules/token/scope';

export const oauthTokenRouter: FastifyPluginAsyncTypebox = async server => {
	server.route({
		url: '/',
		method: 'get',
		schema: {
			querystring: Type.Optional(Type.Object({
				grant_type: Type.Literal('authorization_code'),
				code: Type.String(),
				redirect_uri: Type.String(),
				client_id: Type.String(),
			})),
			body: Type.Optional(Type.Object({
				grant_type: Type.Literal('refresh_token'),
				refresh_token: Type.String(),
				scope: Type.Optional(Type.Array(Type.Enum(Scope))),
			})),
		},
		async handler(request, reply) {
			const {query, body} = request;

			// Refreshing an Access Token
			// https://datatracker.ietf.org/doc/html/rfc6749#section-6
			if (body) {
				const decoded = decode<RefreshTokenPayload>(body.refresh_token);

				if (!decoded.payload) {
					throw new HttpErrorBadRequest('invalid_request');
				}

				const integration = server.db.models.userIntegrations.getUserIntegration().get(decoded.payload.integration);

				if (!integration) {
					throw new HttpErrorBadRequest('invalid_request');
				}

				const payload = await validateRefreshToken(integration.private_key, body.refresh_token);

				if (body.scope) {
					for (const scope of body.scope) {
						if (!payload.scopes.includes(scope)) {
							throw new HttpErrorBadRequest('invalid_scope');
						}
					}

					payload.scopes = body.scope;
				}

				const accessToken = await issueAccessToken(integration.private_key, {
					integration: integration.id,
					scopes: payload.scopes,
				});

				return {
					access_token: accessToken,
					token_type: 'bearer',
					expires_in: 1800,
					scope: body.scope,
				};
			}

			// Authorization Response
			// https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.2
			if (query) {
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
					scopes: payload.scopes,
				});
				const refreshToken = await issueRefreshToken(integration.private_key, {
					integration: integration.id,
					scopes: payload.scopes,
				});

				return {
					access_token: accessToken,
					token_type: 'bearer',
					expires_in: 1800,
					refresh_token: refreshToken,
					scope: payload.scopes,
				};
			}

			throw new HttpErrorBadRequest('invalid_request');
		},
	});
};
