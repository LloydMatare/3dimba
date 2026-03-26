import {getOrCreateHostingConfig, uploadImageToHosting} from "./puter.hosting";
import {isHostedUrl} from "./utils";
import {PUTER_WORKER_URL} from "./constants";
import {getMockPricingSnapshot} from "./pricing.mock";
import { getPuter } from "./puter.client";

export const signIn = async () => {
    const puter = await getPuter();
    if (!puter) return null;
    return puter.auth.signIn();
};

export const signOut = async () => {
    const puter = await getPuter();
    if (!puter) return null;
    return puter.auth.signOut();
};

const getWorkerUrl = (path: string) => {
    // Avoid accidental `//api/.....` when env var is configured with a trailing slash.
    const base = (PUTER_WORKER_URL || "").replace(/\/+$/, "");
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${base}${normalizedPath}`;
};

export const getCurrentUser = async () => {
    try {
        const puter = await getPuter();
        if (!puter) return null;
        return await puter.auth.getUser();
    } catch {
        return null;
    }
}

export const createProject = async ({ item, visibility = "private" }: CreateProjectParams): Promise<DesignItem | null | undefined> => {
    const puter = await getPuter();
    if (!puter) {
        console.warn("Puter SDK unavailable; skipping project save.");
        return null;
    }

    if(!PUTER_WORKER_URL) {
        console.warn('Missing NEXT_PUBLIC_PUTER_WORKER_URL; skip history fetch;');
        return null;
    }
    const projectId = item.id;

    const hosting = await getOrCreateHostingConfig();

    const hostedSource = projectId ?
        await uploadImageToHosting({ hosting, url: item.sourceImage, projectId, label: 'source', }) : null;

    const hostedRender = projectId && item.renderedImage ?
        await uploadImageToHosting({ hosting, url: item.renderedImage, projectId, label: 'rendered', }) : null;

    const resolvedSource = hostedSource?.url || (isHostedUrl(item.sourceImage)
            ? item.sourceImage
            : ''
    );

    if(!resolvedSource) {
        console.warn('Failed to host source image, skipping save.')
        return null;
    }

    const resolvedRender = hostedRender?.url
        ? hostedRender?.url
        : item.renderedImage && isHostedUrl(item.renderedImage)
            ? item.renderedImage
            : undefined;

    const {
        sourcePath: _sourcePath,
        renderedPath: _renderedPath,
        publicPath: _publicPath,
        ...rest
    } = item;

    const payload = {
        ...rest,
        sourceImage: resolvedSource,
        renderedImage: resolvedRender,
    }

    try {
        const response = await puter.workers.exec(getWorkerUrl("/api/projects/save"), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                project: payload,
                visibility
            })
        });

        if(!response.ok) {
            console.error('failed to save the project', await response.text());
            return null;
        }

        const data = (await response.json()) as { project?: DesignItem | null }

        return data?.project ?? null;
    } catch (e) {
        console.log('Failed to save project', e)
        return null;
    }
}

export const getProjects = async () => {
    const puter = await getPuter();
    if (!puter) {
        console.warn("Puter SDK unavailable; skipping project list.");
        return [];
    }

    if(!PUTER_WORKER_URL) {
        console.warn('Missing NEXT_PUBLIC_PUTER_WORKER_URL; skip history fetch;');
        return []
    }

    try {
        const response = await puter.workers.exec(getWorkerUrl("/api/projects/list"), { method: 'GET' });

        if(!response.ok) {
            console.error('Failed to fetch history', await response.text());
            return [];
        }

        const data = (await response.json()) as { projects?: DesignItem[] | null };

        return Array.isArray(data?.projects) ? data?.projects : [];
    } catch (e) {
        console.error('Failed to get projects', e);
        return [];
    }
}

export const getProjectById = async ({ id }: { id: string }) => {
    const puter = await getPuter();
    if (!puter) {
        console.warn("Puter SDK unavailable; skipping project fetch.");
        return null;
    }

    if (!PUTER_WORKER_URL) {
        console.warn("Missing NEXT_PUBLIC_PUTER_WORKER_URL; skipping project fetch.");
        return null;
    }

    console.log("Fetching project with ID:", id);

    try {
        const response = await puter.workers.exec(
            getWorkerUrl(`/api/projects/get?id=${encodeURIComponent(id)}`),
            { method: "GET" },
        );

        console.log("Fetch project response:", response);

        if (!response.ok) {
            console.error("Failed to fetch project:", await response.text());
            return null;
        }

        const data = (await response.json()) as {
            project?: DesignItem | null;
        };

        console.log("Fetched project data:", data);

        return data?.project ?? null;
    } catch (error) {
        console.error("Failed to fetch project:", error);
        return null;
    }
};

export const fetchPricingSnapshot = async ({ cityId }: { cityId: string }) => {
    return getMockPricingSnapshot(cityId);
};
