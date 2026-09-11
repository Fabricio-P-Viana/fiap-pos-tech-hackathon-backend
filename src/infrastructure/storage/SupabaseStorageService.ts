import type {
  StorageService,
  UploadedFile,
  UploadFileInput,
} from "../../domain/services/StorageService.ts";

export class SupabaseStorageService implements StorageService {
  private readonly baseUrl: string;
  private readonly serviceRoleKey: string;
  private readonly bucket: string;

  constructor(config?: {
    url?: string;
    serviceRoleKey?: string;
    bucket?: string;
  }) {
    this.baseUrl = (config?.url ?? process.env.SUPABASE_URL ?? "").replace(
      /\/+$/,
      ""
    );
    this.serviceRoleKey =
      config?.serviceRoleKey ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
    this.bucket =
      config?.bucket ?? process.env.SUPABASE_STORAGE_BUCKET ?? "attachments";

    if (!this.baseUrl || !this.serviceRoleKey) {
      throw new Error(
        "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured to use SupabaseStorageService"
      );
    }
  }

  async upload(input: UploadFileInput): Promise<UploadedFile> {
    const objectPath = `${input.folder}/${input.fileName}`;
    const response = await fetch(
      `${this.baseUrl}/storage/v1/object/${this.bucket}/${objectPath}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.serviceRoleKey}`,
          "Content-Type": input.mimeType,
          "x-upsert": "true",
        },
        body: new Uint8Array(input.buffer),
      }
    );

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `Supabase Storage upload failed (${response.status}): ${body}`
      );
    }

    return { path: objectPath, url: this.getPublicUrl(objectPath) };
  }

  async remove(path: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/storage/v1/object/${this.bucket}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.serviceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prefixes: [path] }),
      }
    );

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `Supabase Storage delete failed (${response.status}): ${body}`
      );
    }
  }

  getPublicUrl(path: string): string {
    return `${this.baseUrl}/storage/v1/object/public/${this.bucket}/${path}`;
  }
}
