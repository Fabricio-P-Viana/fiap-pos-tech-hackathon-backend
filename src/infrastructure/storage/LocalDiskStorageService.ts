import fs from "node:fs";
import path from "node:path";
import type {
  StorageService,
  UploadedFile,
  UploadFileInput,
} from "../../domain/services/StorageService.ts";

export class LocalDiskStorageService implements StorageService {
  private readonly rootDir: string;
  private readonly publicBaseUrl: string;

  constructor(config?: { rootDir?: string; publicBaseUrl?: string }) {
    this.rootDir = config?.rootDir ?? path.resolve(process.cwd(), "uploads");
    this.publicBaseUrl =
      config?.publicBaseUrl ??
      process.env.APP_BASE_URL ??
      "http://localhost:3000";
    fs.mkdirSync(this.rootDir, { recursive: true });
  }

  async upload(input: UploadFileInput): Promise<UploadedFile> {
    const objectPath = `${input.folder}/${input.fileName}`;
    const fullPath = path.join(this.rootDir, objectPath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    await fs.promises.writeFile(fullPath, input.buffer);
    return { path: objectPath, url: this.getPublicUrl(objectPath) };
  }

  async remove(objectPath: string): Promise<void> {
    const fullPath = path.join(this.rootDir, objectPath);
    await fs.promises.rm(fullPath, { force: true });
  }

  getPublicUrl(objectPath: string): string {
    return `${this.publicBaseUrl}/uploads/${objectPath}`;
  }
}
