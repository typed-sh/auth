import {createServer} from '..';

const main = async () => {
	const server = await createServer();

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
