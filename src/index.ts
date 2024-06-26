import { Router, cors } from 'itty-router';

const { preflight, corsify } = cors({
	origin: (origin) => origin.includes('emasuriano.com') ? origin : undefined,
	allowMethods: 'GET, POST',
});

export const router = Router({
	base: '/api',
	before: [preflight],
	finally: [corsify],
});

export interface Env {
	kv: KVNamespace;
}

router.get('/:slug', async (req, env: Env) => {
	const { slug } = req.params ?? {};

	if (!slug) {
		return new Response('Missing slug', { status: 400 });
	}

	try {
		const count = (await env.kv.get<number>(slug)) || 1;
		return new Response(`${count}`, { status: 200, headers: { 'Cache-control': 'no-cache' } });
	} catch (err) {
		console.error(`KV returned error: ${err}`);
		return new Response(err as string, { status: 500 });
	}
});

router.post('/:slug', async (req, env: Env) => {
	const { slug } = req.params ?? {};

	if (!slug) {
		return new Response('Missing slug', { status: 400 });
	}

	try {
		const count = Number(await env.kv.get(slug)) || 1;
		await env.kv.put(slug, `${count + 1}`);
		return new Response(`${count + 1}`, { status: 200, headers: { 'Cache-control': 'no-cache' } });
	} catch (err) {
		console.error(`KV returned error: ${err}`);
		return new Response(err as string, { status: 500 });
	}
});

router.all('*', (req) => new Response(`API ${req.method} ${new URL(req.url).pathname} | ${new Date()}`, { status: 418 }));

export default {
	fetch: router.fetch,
};
