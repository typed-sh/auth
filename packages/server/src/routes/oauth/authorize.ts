/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable new-cap */
import {Type, type FastifyPluginAsyncTypebox} from '@fastify/type-provider-typebox';
import QueryString from 'qs';
import {HttpErrorBadRequest} from '../../modules/errors';
import {Formats} from '../../modules/formats';
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
				response_type: Type.Literal('code'),
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
				throw new HttpErrorBadRequest('application not found');
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

			if (query.scope.includes(Scope.UserWrite) && !application.is_trusted) {
				return reply.redirect(307, application.redirect_uri + '?' + QueryString.stringify({
					error: 'invalid_request',
					error_description: 'This application has not been approved to request user.write scope.',
				}));
			}

			const integration = server.db.models.userIntegrations.getUserIntegrationByUserAndApplication().get(request.session.user, clientId);

			if (!integration) {
				return reply.redirect(307, '/i/onsite/integration?' + QueryString.stringify({callback: request.originalUrl}));
			}

			const state = Math.random().toString(36);
			const token = await issueAuthorizationToken(server.config.platformKey, {
				integration: integration.id,
				state,
			});

			server.db.models.userIntegrations.setUserIntegrationState().run(state, integration.id);

			return reply.redirect(307, application.redirect_uri + '?' + QueryString.stringify(query.state ? {
				code: token,
				state: query.state,
			} : {
				code: token,
			}));
		},
	});
};
