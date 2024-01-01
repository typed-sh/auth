/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable new-cap */
import {Type, type FastifyPluginAsyncTypebox} from '@fastify/type-provider-typebox';
import QueryString from 'qs';
import {HttpErrorBadRequest} from '../../modules/errors';
import {Formats} from '../../modules/formats';
import {issueAccessToken} from '../../modules/token/access';
import {issueAuthorizationToken} from '../../modules/token/authorization';
import {Scope, scopeSchema} from '../../modules/token/scope';
import {authenticateOnsitePlugin} from '../../plugins/middlewares/authenticateOnsite';

export const oauthAuthorizeRouter: FastifyPluginAsyncTypebox = async server => {
	await server.register(authenticateOnsitePlugin, {onAuthenticationFailed: 'callback'});

	server.route({
		url: '/',
		method: 'get',
		schema: {
			querystring: Type.Object({
				response_type: Type.Union([
					Type.Literal('code'),
					Type.Literal('token'),
					Type.Literal('password'),
					Type.Literal('client_credentials'),
				]),
				client_id: Type.String({
					format: Formats.Numeric,
				}),
				redirect_uri: Type.String(),
				scope: Type.Array(scopeSchema),
				state: Type.Optional(Type.String({
					minLength: 1,
					maxLength: 32,
				})),
			}),
		},
		async handler(request, reply) {
			const {query} = request;
			const clientId = parseInt(query.client_id, 10);

			const application = server.db.models.applications.getApplication().get(clientId);

			if (!application) {
				throw new HttpErrorBadRequest('invalid_request');
			}

			if (!application.is_approved) {
				return reply.redirect(307, application.redirect_uri + '?' + QueryString.stringify({
					error: 'access_denied',
					error_description: 'This application has not been approved yet.',
				}));
			}

			if (query.redirect_uri !== application.redirect_uri) {
				return reply.redirect(307, application.redirect_uri + '?' + QueryString.stringify({
					error: 'invalid_request',
					error_description: 'The given redirect_uri does not match.',
				}));
			}

			if (!application.is_confidential && query.scope.includes(Scope.UserWrite)) {
				return reply.redirect(307, application.redirect_uri + '?' + QueryString.stringify({
					error: 'invalid_scope',
					error_description: 'This application type cannot request user.write scope.',
				}));
			}

			const integration = server.db.models.userIntegrations.getUserIntegrationByUserAndApplication().get(request.session.user, clientId);

			if (!integration) {
				return reply.redirect(307, '/i/onsite/integration?' + QueryString.stringify({callback: request.originalUrl}));
			}

			if (
				(!integration.is_user_readable && query.scope.includes(Scope.UserRead))
				|| (!integration.is_user_writable && query.scope.includes(Scope.UserWrite))
			) {
				return reply.redirect(307, application.redirect_uri + '?' + QueryString.stringify({
					error: 'invalid_scope',
					error_description: 'This request includes unauthorized scopes for this application.',
				}));
			}

			if (
				query.response_type === 'password'
				|| query.response_type === 'client_credentials'
			) {
				throw new HttpErrorBadRequest('unsupported_response_type');
			}

			// Authorization Code Grant
			// https://datatracker.ietf.org/doc/html/rfc6749#section-4.1
			if (query.response_type === 'code') {
				const state = Math.random().toString(36);
				const token = await issueAuthorizationToken(server.config.platformKey, {
					integration: integration.id,
					scopes: query.scope,
					state,
				});

				server.db.models.userIntegrations.setUserIntegrationState().run(state, integration.id);

				return reply.redirect(307, application.redirect_uri + '?' + QueryString.stringify(query.state ? {
					code: token,
					state: query.state,
				} : {
					code: token,
				}));
			}

			// Implicit Grant
			// https://datatracker.ietf.org/doc/html/rfc6749#section-4.2
			if (query.scope.includes(Scope.UserWrite)) {
				return reply.redirect(307, application.redirect_uri + '?' + QueryString.stringify({
					error: 'invalid_scope',
					error_description: 'This request includes unauthorized scopes for this response type.',
				}));
			}

			const accessToken = await issueAccessToken(integration.private_key, {
				integration: integration.id,
				scopes: query.scope,
			});

			return reply.redirect(307, application.redirect_uri + '?' + QueryString.stringify(query.state ? {
				access_token: accessToken,
				token_type: 'bearer',
				expires_in: 1800,
				scope: query.scope,
				state: query.state,
			} : {
				access_token: accessToken,
				token_type: 'bearer',
				expires_in: 1800,
				scope: query.scope,
			}));
		},
	});
};
