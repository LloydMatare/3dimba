let puterPromise: Promise<any> | null = null;

export const getPuter = async () => {
  if (typeof window === "undefined") return null;
  if (!puterPromise) {
    puterPromise = import("@heyputer/puter.js").then(
      (mod) => (mod as any).default ?? mod,
    );
  }
  return puterPromise;
};
