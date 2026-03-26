// Puter worker runtime provides a global `router` and `user.puter` API surface.
// Keep types loose here so the main app TypeScript build doesn't fail.
declare const router: any;

const PROJECT_PREFIX = 'roomify_project_';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const jsonResponse = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), {
        status,
        headers: {
            ...CORS_HEADERS,
            'Content-Type': 'application/json',
        },
    });

const jsonError = (status: number, message: string, extra: Record<string, unknown> = {}) =>
    jsonResponse(status, { error: message, ...extra });

const getUserId = async (userPuter: any) => {
    try {
        const user = await userPuter.auth.getUser();

        return user?.uuid || null;
    } catch {
        return null;
    }
}

// Handle browser preflight requests when calling this worker cross-origin (e.g. from localhost during dev).
if (typeof router?.options === 'function') {
    router.options('/api/*', async () => new Response(null, { status: 204, headers: CORS_HEADERS }));
}

router.post('/api/projects/save', async (ctx: any) => {
    try {
        const { request, user } = ctx;
        const userPuter = user.puter;

        if(!userPuter) return jsonError(401, 'Authentication failed');

        const body = await request.json();
        const project = body?.project;

        if(!project?.id || !project?.sourceImage) return jsonError(400, 'Project ID and source image are required');

        const payload = {
            ...project,
            updatedAt: new Date().toISOString(),
        }

        const userId = await getUserId(userPuter);
        if(!userId) return jsonError(401, 'Authentication failed');

        const key = `${PROJECT_PREFIX}${project.id}`;
        await userPuter.kv.set(key, payload);

        return jsonResponse(200, { saved: true, id: project.id, project: payload });
    } catch (e: unknown) {
        return jsonError(500, 'Failed to save project', { message: (e as any)?.message || 'Unknown error' });
    }
})

router.get('/api/projects/list', async (ctx: any) => {
    try {
        const { user } = ctx;
        const userPuter = user.puter;
        if (!userPuter) return jsonError(401, 'Authentication failed');

        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(401, 'Authentication failed');

        const projects = (await userPuter.kv.list(PROJECT_PREFIX, true))
            .map((entry: any) => ({ ...entry.value, isPublic: true }))

        return jsonResponse(200, { projects });
    } catch (e: unknown) {
        return jsonError(500, 'Failed to list projects', { message: (e as any)?.message || 'Unknown error' });
    }
})

router.get('/api/projects/get', async (ctx: any) => {
    try {
        const { request, user } = ctx;
        const userPuter = user.puter;
        if (!userPuter) return jsonError(401, 'Authentication failed');

        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(401, 'Authentication failed');

        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) return jsonError(400, 'Project ID is required');

        const key = `${PROJECT_PREFIX}${id}`;
        const project = await userPuter.kv.get(key);

        if (!project) return jsonError(404, 'Project not found');

        return jsonResponse(200, { project });
    } catch (e: unknown) {
        return jsonError(500, 'Failed to get project', { message: (e as any)?.message || 'Unknown error' });
    }
})
