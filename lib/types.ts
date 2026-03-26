// lib/types.ts
export interface Generate3DViewParams {
  sourceImage: File | string; // Adjust based on actual usage
}

export interface CreateProjectParams {
  item: any; // Define your project item structure
  visibility?: "private" | "public";
}

export interface DesignItem {
  id: string;
  name: string;
  // Add other properties
}

export interface HostingConfig {
  id: string;
  // Add other properties
}

export interface StoreHostedImageParams {
  hosting: HostingConfig;
  url: string;
  projectId: string;
  label?: string;
}

export interface HostedAsset {
  id: string;
  url: string;
  // Add other properties
}