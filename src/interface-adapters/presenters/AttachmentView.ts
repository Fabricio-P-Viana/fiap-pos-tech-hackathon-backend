import { Attachment } from "../../domain/entities/Attachment.ts";

export default class AttachmentView {
  static render(attachment: Attachment): Attachment {
    return attachment;
  }

  static renderMany(attachments: Attachment[]): Attachment[] {
    return attachments.map((attachment) => this.render(attachment));
  }
}
