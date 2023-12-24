import {createServer} from '..';

const main = async () => {
	const server = await createServer();
	const address = await server.listen({
		host: '127.0.0.1',
		port: 16001,
	});

	console.log(address);
};

void main();
