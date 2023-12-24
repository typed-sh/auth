import test from 'ava';
import {createServer} from '../src';

test('post: /api/onsite/user', async t => {
	const server = await createServer();
	const response = await server.inject({
		url: '/api/onsite/user',
		method: 'post',
		body: {
			email: 'user@domain.tld',
			password: 'thisissamplepassword!',
			username: 'user',
		},
	});

	t.is(response.body, '');
});
