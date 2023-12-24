/* eslint-disable @typescript-eslint/consistent-type-definitions */
import {type CookiePluginRequestContext} from '../src/plugins/cookie';
import {type DatabasePluginContext} from '../src/plugins/database';

declare module 'fastify' {
	interface FastifyInstance {
		db: DatabasePluginContext;
	}

	interface FastifyRequest {
		cookies: CookiePluginRequestContext;
	}
}
