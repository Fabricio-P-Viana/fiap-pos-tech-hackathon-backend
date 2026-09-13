import type { StorageService } from "../../domain/services/StorageService.ts";
import { SupabaseStorageService } from "./SupabaseStorageService.ts";
import { LocalDiskStorageService } from "./LocalDiskStorageService.ts";

export function createStorageService(): StorageService {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return new SupabaseStorageService();
  }
  return new LocalDiskStorageService();
}
