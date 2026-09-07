import type { ReqResNextFunction } from "../types/index.ts";
import { ValidationError } from "../../domain/errors/ValidationError.ts";
import { CreateAttachmentDTO } from "../../application/attachment/dtos/CreateAttachmentDTO.ts";
import { UpdateAttachmentDTO } from "../../application/attachment/dtos/UpdateAttachmentDTO.ts";
import type { CreateAttachmentUseCase } from "../../application/attachment/use-cases/CreateAttachment.ts";
import type { FindAllAttachmentUseCase } from "../../application/attachment/use-cases/FindAllAttachment.ts";
import type { FindOneByIdAttachmentUseCase } from "../../application/attachment/use-cases/FindOneByIdAttachment.ts";
import type { UpdateAttachmentUseCase } from "../../application/attachment/use-cases/UpdateAttachment.ts";
import type { DeleteAttachmentUseCase } from "../../application/attachment/use-cases/DeleteAttachment.ts";
import AttachmentView from "../presenters/AttachmentView.ts";

export default class AttachmentController {
  constructor(
    private readonly createAttachmentUseCase: CreateAttachmentUseCase,
    private readonly findAllAttachmentUseCase: FindAllAttachmentUseCase,
    private readonly findOneByIdAttachmentUseCase: FindOneByIdAttachmentUseCase,
    private readonly updateAttachmentUseCase: UpdateAttachmentUseCase,
    private readonly deleteAttachmentUseCase: DeleteAttachmentUseCase
  ) {}

  private parseId(id: string | string[]): number {
    const value = parseInt(Array.isArray(id) ? id[0] : id, 10);
    if (Number.isNaN(value))
      throw new ValidationError("Attachment ID must be a valid number");
    return value;
  }

  async create({ req, res, next }: ReqResNextFunction): Promise<void> {
    try {
      res
        .status(201)
        .json(
          AttachmentView.render(
            await this.createAttachmentUseCase.execute(
              CreateAttachmentDTO.create(req.body)
            )
          )
        );
    } catch (error) {
      next(error);
    }
  }

  async findAll({ res, next }: ReqResNextFunction): Promise<void> {
    try {
      res
        .status(200)
        .json(
          AttachmentView.renderMany(
            await this.findAllAttachmentUseCase.execute()
          )
        );
    } catch (error) {
      next(error);
    }
  }

  async findById({ req, res, next }: ReqResNextFunction): Promise<void> {
    try {
      res
        .status(200)
        .json(
          AttachmentView.render(
            await this.findOneByIdAttachmentUseCase.execute(
              this.parseId(req.params.id)
            )
          )
        );
    } catch (error) {
      next(error);
    }
  }

  async update({ req, res, next }: ReqResNextFunction): Promise<void> {
    try {
      res
        .status(200)
        .json(
          AttachmentView.render(
            await this.updateAttachmentUseCase.execute(
              this.parseId(req.params.id),
              UpdateAttachmentDTO.create(req.body)
            )
          )
        );
    } catch (error) {
      next(error);
    }
  }

  async delete({ req, res, next }: ReqResNextFunction): Promise<void> {
    try {
      await this.deleteAttachmentUseCase.execute(this.parseId(req.params.id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
