import {type onRequestAsyncHookHandler, type FastifyPluginAsync, FastifyReply} from 'fastify';
import fastifyPlugin from 'fastify-plugin';

const reference = 'cookies';

export enum CookieNames {
	Auth = 'auth',
}

export type CookiePluginRequestContext = Partial<Record<CookieNames, string>> & Record<string, string>;

const handleRequest: onRequestAsyncHookHandler = async (request, reply) => {
	const header = request.headers.cookie;

	if (!header) {
		request.cookies = {};

		return;
	}

	request.cookies = new Proxy({}, {
		get(target, p: string, receiver) {
			const startIndex = header.indexOf(p + '=');

			if (!startIndex) {
				return;
			}

			const endIndex = header.indexOf(';', startIndex + 1);

			return decodeURIComponent(header.slice(startIndex, endIndex));
		},
	});
};

/**
https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie

Set-Cookie: <cookie-name>=<cookie-value>
Set-Cookie: <cookie-name>=<cookie-value>; Domain=<domain-value>
Set-Cookie: <cookie-name>=<cookie-value>; Expires=<date>
Set-Cookie: <cookie-name>=<cookie-value>; HttpOnly
Set-Cookie: <cookie-name>=<cookie-value>; Max-Age=<number>
Set-Cookie: <cookie-name>=<cookie-value>; Partitioned
Set-Cookie: <cookie-name>=<cookie-value>; Path=<path-value>
Set-Cookie: <cookie-name>=<cookie-value>; Secure

Set-Cookie: <cookie-name>=<cookie-value>; SameSite=Strict
Set-Cookie: <cookie-name>=<cookie-value>; SameSite=Lax
Set-Cookie: <cookie-name>=<cookie-value>; SameSite=None; Secure

// Multiple attributes are also possible, for example:
Set-Cookie: <cookie-name>=<cookie-value>; Domain=<domain-value>; Secure; HttpOnly
 */
type CookieExtensions = `Domain=${string}`
  | `Expires=${string}`
  | 'HttpOnly'
  | `Max-Age=${number}`
  | 'Partitioned'
  | `Path=/${string}`
  | 'Secure'
  | `SameSite=${'Strict' | 'Lax' | 'None'}`;

export const getCookieString = async (name: CookieNames, value: string, extensions: CookieExtensions[]) => `${name}=${encodeURIComponent(value)}; ${extensions.join('; ')}`;

const plugin: FastifyPluginAsync = async server => {
	server.addHook('onRequest', handleRequest);

	if (server.hasRequestDecorator(reference)) {
		server.log.warn({type: 'plugin', scope: 'cookie'}, 'decorator already declared');

		return;
	}

	server.decorateRequest(reference, null);
};

export const cookiePlugin = fastifyPlugin(plugin);
