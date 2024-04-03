import { Router,  RequestLike } from 'itty-router'

export const router = Router({ base: '/api' })

export interface Env {
	kv: KVNamespace;
}

async function getViews(kv: KVNamespace, slug: string): Promise<number> {
	const value = await kv.get<number>(slug, 'json')

	return value === null ? 1 : value
}

async function setViews(kv: KVNamespace, slug: string, count: number) {
	return kv.put(slug, JSON.stringify(count))
}

router.get('/:slug', async (req: RequestLike, env: Env): Promise<Response> => {
	const { slug } = req.params ?? {}

	if (!slug) {
		return new Response('Missing slug', { status: 400 })
	}

	const count = await getViews(env.kv, slug)

	return new Response(`${count}`, { status: 200 })
})

router.post('/:slug', async (req: RequestLike, env: Env): Promise<Response> => {
	const { slug } = req.params ?? {}

	if (!slug) {
		return new Response('Missing slug', { status: 400 })
	}

	const count = await getViews(env.kv, slug)
	let result = 1

	if (count !== null) {
		result = count + 1
	}

	setViews(env.kv, slug, result)

	return new Response(`${result}`, { status: 200 })
})

router.all(
	'*',
	(req) =>
		new Response(`API ${req.method} ${new URL(req.url).pathname} | ${new Date()}`, { status: 418 })
)

export default {
	fetch: router.fetch
};
