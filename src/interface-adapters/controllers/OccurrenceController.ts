import type { ReqResNextFunction } from "../types/index.ts";
import { ValidationError } from "../../domain/errors/ValidationError.ts";
import { CreateOccurrenceDTO } from "../../application/occurrence/dtos/CreateOccurrenceDTO.ts";
import { UpdateOccurrenceDTO } from "../../application/occurrence/dtos/UpdateOccurrenceDTO.ts";
import { ChangeOccurrenceStatusDTO } from "../../application/occurrence/dtos/ChangeOccurrenceStatusDTO.ts";
import type { CreateOccurrenceUseCase } from "../../application/occurrence/use-cases/CreateOccurrence.ts";
import type { FindAllOccurrenceUseCase } from "../../application/occurrence/use-cases/FindAllOccurrence.ts";
import type { FindOneByIdOccurrenceUseCase } from "../../application/occurrence/use-cases/FindOneByIdOccurrence.ts";
import type { UpdateOccurrenceUseCase } from "../../application/occurrence/use-cases/UpdateOccurrence.ts";
import type { ChangeOccurrenceStatusUseCase } from "../../application/occurrence/use-cases/ChangeOccurrenceStatus.ts";
import type { DeleteOccurrenceUseCase } from "../../application/occurrence/use-cases/DeleteOccurrence.ts";
import type { FindOccurrenceEventsUseCase } from "../../application/occurrence/use-cases/FindOccurrenceEvents.ts";
import OccurrenceEventView from "../presenters/OccurrenceEventView.ts";
import OccurrenceView from "../presenters/OccurrenceView.ts";

export default class OccurrenceController {
  constructor(
    private readonly createOccurrenceUseCase: CreateOccurrenceUseCase,
    private readonly findAllOccurrenceUseCase: FindAllOccurrenceUseCase,
    private readonly findOneByIdOccurrenceUseCase: FindOneByIdOccurrenceUseCase,
    private readonly updateOccurrenceUseCase: UpdateOccurrenceUseCase,
    private readonly changeOccurrenceStatusUseCase: ChangeOccurrenceStatusUseCase,
    private readonly deleteOccurrenceUseCase: DeleteOccurrenceUseCase,
    private readonly findOccurrenceEventsUseCase: FindOccurrenceEventsUseCase
  ) {}

  private parseId(id: string | string[]): number {
    const value = parseInt(Array.isArray(id) ? id[0] : id, 10);
    if (Number.isNaN(value))
      throw new ValidationError("Occurrence ID must be a valid number");
    return value;
  }

  private actorId(req: ReqResNextFunction["req"]): number {
    const actorId = req.user?.userId;
    if (!actorId) throw new ValidationError("Authenticated user is required");
    return actorId;
  }

  async create({ req, res, next }: ReqResNextFunction): Promise<void> {
    try {
      const dto = CreateOccurrenceDTO.create({
        ...req.body,
        requesterId: this.actorId(req),
      });
      const occurrence = await this.createOccurrenceUseCase.execute(dto);
      res.status(201).json(OccurrenceView.render(occurrence));
    } catch (error) {
      next(error);
    }
  }

  async findAll({ res, next }: ReqResNextFunction): Promise<void> {
    try {
      res
        .status(200)
        .json(
          OccurrenceView.renderMany(
            await this.findAllOccurrenceUseCase.execute()
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
          OccurrenceView.render(
            await this.findOneByIdOccurrenceUseCase.execute(
              this.parseId(req.params.id)
            )
          )
        );
    } catch (error) {
      next(error);
    }
  }

  async findEvents({ req, res, next }: ReqResNextFunction): Promise<void> {
    try {
      const events = await this.findOccurrenceEventsUseCase.execute(
        this.parseId(req.params.id)
      );
      res.status(200).json(OccurrenceEventView.renderMany(events));
    } catch (error) {
      next(error);
    }
  }

  async update({ req, res, next }: ReqResNextFunction): Promise<void> {
    try {
      const occurrence = await this.updateOccurrenceUseCase.execute(
        this.parseId(req.params.id),
        UpdateOccurrenceDTO.create(req.body),
        this.actorId(req)
      );
      res.status(200).json(OccurrenceView.render(occurrence));
    } catch (error) {
      next(error);
    }
  }

  async changeStatus({ req, res, next }: ReqResNextFunction): Promise<void> {
    try {
      const occurrence = await this.changeOccurrenceStatusUseCase.execute(
        this.parseId(req.params.id),
        this.actorId(req),
        ChangeOccurrenceStatusDTO.create(req.body)
      );
      res.status(200).json(OccurrenceView.render(occurrence));
    } catch (error) {
      next(error);
    }
  }

  async delete({ req, res, next }: ReqResNextFunction): Promise<void> {
    try {
      await this.deleteOccurrenceUseCase.execute(this.parseId(req.params.id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
