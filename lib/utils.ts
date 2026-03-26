import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const HOSTING_CONFIG_KEY = "roomify_hosting_config";
export const HOSTING_DOMAIN_SUFFIX = ".puter.site";

export const isHostedUrl = (value: unknown): value is string =>
    typeof value === "string" && value.includes(HOSTING_DOMAIN_SUFFIX);

export const createHostingSlug = () =>
    `roomify-${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;

// Puter worker runtime provides a global `router` and `user.puter` API surface.
// Keep types loose here so the main app TypeScript build doesn't fail.
const runtimeRouter: any =
  typeof globalThis !== "undefined" ? (globalThis as any).router : undefined;

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
if (typeof runtimeRouter?.options === "function") {
  runtimeRouter.options(
    "/api/*",
    async () => new Response(null, { status: 204, headers: CORS_HEADERS }),
  );
}

if (typeof runtimeRouter?.post === "function") {
  runtimeRouter.post("/api/projects/save", async (ctx: any) => {
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
  });
}

if (typeof runtimeRouter?.get === "function") {
  runtimeRouter.get("/api/projects/list", async (ctx: any) => {
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
  });
}

if (typeof runtimeRouter?.get === "function") {
  runtimeRouter.get("/api/projects/get", async (ctx: any) => {
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
  });
}


const normalizeHost = (subdomain: string) =>
    subdomain.endsWith(HOSTING_DOMAIN_SUFFIX)
        ? subdomain
        : `${subdomain}${HOSTING_DOMAIN_SUFFIX}`;

export const getHostedUrl = (
    hosting: { subdomain: string },
    filePath: string,
): string | null => {
  if (!hosting?.subdomain) return null;
  const host = normalizeHost(hosting.subdomain);
  return `https://${host}/${filePath}`;
};

export const getImageExtension = (contentType: string, url: string): string => {
  const type = (contentType || "").toLowerCase();
  const typeMatch = type.match(/image\/(png|jpe?g|webp|gif|svg\+xml|svg)/);
  if (typeMatch?.[1]) {
    const ext = typeMatch[1].toLowerCase();
    return ext === "jpeg" || ext === "jpg"
        ? "jpg"
        : ext === "svg+xml"
            ? "svg"
            : ext;
  }

  const dataMatch = url.match(/^data:image\/([a-z0-9+.-]+);/i);
  if (dataMatch?.[1]) {
    const ext = dataMatch[1].toLowerCase();
    return ext === "jpeg" ? "jpg" : ext;
  }

  const extMatch = url.match(/\.([a-z0-9]+)(?:$|[?#])/i);
  if (extMatch?.[1]) return extMatch[1].toLowerCase();

  return "png";
};

export const dataUrlToBlob = (
    dataUrl: string,
): { blob: Blob; contentType: string } | null => {
  try {
    const match = dataUrl.match(/^data:([^;]+)?(;base64)?,([\s\S]*)$/i);
    if (!match) return null;
    const contentType = match[1] || "";
    const isBase64 = !!match[2];
    const data = match[3] || "";
    const raw = isBase64
        ? atob(data.replace(/\s/g, ""))
        : decodeURIComponent(data);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 1) {
      bytes[i] = raw.charCodeAt(i);
    }
    return { blob: new Blob([bytes], { type: contentType }), contentType };
  } catch {
    return null;
  }
};

export const fetchBlobFromUrl = async (
    url: string,
): Promise<{ blob: Blob; contentType: string } | null> => {
  if (url.startsWith("data:")) {
    return dataUrlToBlob(url);
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch image");
    return {
      blob: await response.blob(),
      contentType: response.headers.get("content-type") || "",
    };
  } catch {
    return null;
  }
};

export const imageUrlToPngBlob = async (url: string): Promise<Blob | null> => {
  if (typeof window === "undefined") return null;

  try {
    const img = new Image();
    img.crossOrigin = "anonymous";

    const loaded = await new Promise<HTMLImageElement>((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = url;
    });

    const width = loaded.naturalWidth || loaded.width;
    const height = loaded.naturalHeight || loaded.height;
    if (!width || !height) return null;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(loaded, 0, 0, width, height);

    return await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((result) => resolve(result), "image/png");
    });
  } catch {
    return null;
  }
};
