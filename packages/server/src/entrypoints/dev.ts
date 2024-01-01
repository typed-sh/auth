import {V4} from 'paseto';
import {createServer} from '..';

const main = async () => {
	const server = await createServer({
		config: {
			platformKey: await V4.generateKey('public'),
		},
	});

	await server.listen({
		host: '127.0.0.1',
		port: 16001,
	});

	process.on('SIGINT', async () => {
		await server.close();
		process.exit(0);
	});
};

void main();
