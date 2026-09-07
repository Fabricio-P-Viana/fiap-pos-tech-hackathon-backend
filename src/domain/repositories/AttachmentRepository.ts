import { Attachment, AttachmentData } from "../entities/Attachment.ts";

export interface AttachmentRepository {
  create(_attachmentData: AttachmentData): Promise<Attachment>;
  findAll(): Promise<Attachment[]>;
  findById(_id: number): Promise<Attachment | null>;
  update(
    _id: number,
    _attachmentData: Partial<AttachmentData>
  ): Promise<Attachment | null>;
  delete(_id: number): Promise<boolean>;
}
