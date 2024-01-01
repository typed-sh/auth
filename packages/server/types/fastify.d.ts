/* eslint-disable @typescript-eslint/consistent-type-definitions */
import {type ConfigPluginContext} from '../src/plugins/config';
import {type CookiePluginRequestContext} from '../src/plugins/cookie';
import {type DatabasePluginContext} from '../src/plugins/database';
import {type AuthenticationContext} from '../src/plugins/middlewares/authenticate';
import {type AuthenticationOnsiteContext} from '../src/plugins/middlewares/authenticateOnsite';

declare module 'fastify' {
	interface FastifyInstance {
		db: DatabasePluginContext;
		config: ConfigPluginContext;
	}

	interface FastifyRequest {
		cookies: CookiePluginRequestContext;
		session: AuthenticationOnsiteContext;
		access: AuthenticationContext;
	}
}
