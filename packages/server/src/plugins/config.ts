import {type FastifyPluginAsync} from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import {type Config} from '../modules/config';

export type ConfigPluginContext = Config;

export type ConfigPluginOptions = Config;

const reference = 'config';

const plugin: FastifyPluginAsync<ConfigPluginOptions> = async (server, opts) => {
	if (server.hasDecorator(reference)) {
		server.log.warn({scope: 'plugin:config'}, 'decorator was already set');

		return;
	}

	server.decorate(reference, opts);
};

export const configPlugin = fastifyPlugin(plugin, {
	name: 'config',
});
