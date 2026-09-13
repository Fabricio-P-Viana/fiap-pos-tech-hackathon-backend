export interface UploadFileInput {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  folder: string;
}

export interface UploadedFile {
  path: string;
  url: string;
}

export interface StorageService {
  upload(_input: UploadFileInput): Promise<UploadedFile>;
  remove(_path: string): Promise<void>;
  getPublicUrl(_path: string): string;
}
