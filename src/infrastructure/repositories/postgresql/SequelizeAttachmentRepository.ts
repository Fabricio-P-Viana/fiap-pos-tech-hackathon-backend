import type { ModelStatic } from "sequelize";
import {
  Attachment,
  type AttachmentData,
} from "../../../domain/entities/Attachment.ts";
import type { AttachmentRepository } from "../../../domain/repositories/AttachmentRepository.ts";
import type { AttachmentModel } from "../../database/models/AttachmentModel.ts";

export default class SequelizeAttachmentRepository
  implements AttachmentRepository
{
  private attachmentModel: ModelStatic<AttachmentModel>;

  constructor(attachmentModel: ModelStatic<AttachmentModel>) {
    this.attachmentModel = attachmentModel;
  }

  private mapToDomain(attachmentModel: AttachmentModel): Attachment {
    return new Attachment(attachmentModel.get({ plain: true }));
  }

  async create(attachmentData: AttachmentData): Promise<Attachment> {
    const created = await this.attachmentModel.create(attachmentData);
    return this.mapToDomain(created);
  }

  async findAll(): Promise<Attachment[]> {
    const attachments = await this.attachmentModel.findAll();
    return attachments.map((attachment) => this.mapToDomain(attachment));
  }

  async findById(id: number): Promise<Attachment | null> {
    const attachment = await this.attachmentModel.findByPk(id);
    return attachment ? this.mapToDomain(attachment) : null;
  }

  async update(
    id: number,
    attachmentData: Partial<AttachmentData>
  ): Promise<Attachment | null> {
    const attachment = await this.attachmentModel.findByPk(id);
    if (!attachment) return null;

    await attachment.update(attachmentData);
    return this.mapToDomain(attachment);
  }

  async delete(id: number): Promise<boolean> {
    const attachment = await this.attachmentModel.findByPk(id);
    if (!attachment) return false;

    await attachment.destroy();
    return true;
  }
}
