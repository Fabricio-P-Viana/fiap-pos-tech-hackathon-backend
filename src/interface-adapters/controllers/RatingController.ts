import type { ReqResNextFunction } from "../types/index.ts";
import { ValidationError } from "../../domain/errors/ValidationError.ts";
import { CreateRatingDTO } from "../../application/rating/dtos/CreateRatingDTO.ts";
import { UpdateRatingDTO } from "../../application/rating/dtos/UpdateRatingDTO.ts";
import type { CreateRatingUseCase } from "../../application/rating/use-cases/CreateRating.ts";
import type { FindAllRatingUseCase } from "../../application/rating/use-cases/FindAllRating.ts";
import type { FindOneByIdRatingUseCase } from "../../application/rating/use-cases/FindOneByIdRating.ts";
import type { UpdateRatingUseCase } from "../../application/rating/use-cases/UpdateRating.ts";
import type { DeleteRatingUseCase } from "../../application/rating/use-cases/DeleteRating.ts";
import RatingView from "../presenters/RatingView.ts";
import type { Actor } from "../../domain/services/OccurrencePolicy.ts";

export default class RatingController {
  constructor(
    private readonly createRatingUseCase: CreateRatingUseCase,
    private readonly findAllRatingUseCase: FindAllRatingUseCase,
    private readonly findOneByIdRatingUseCase: FindOneByIdRatingUseCase,
    private readonly updateRatingUseCase: UpdateRatingUseCase,
    private readonly deleteRatingUseCase: DeleteRatingUseCase
  ) {}

  private parseId(id: string | string[]): number {
    const value = parseInt(Array.isArray(id) ? id[0] : id, 10);
    if (Number.isNaN(value))
      throw new ValidationError("Rating ID must be a valid number");
    return value;
  }

  private actor(req: ReqResNextFunction["req"]): Actor {
    if (!req.user) throw new ValidationError("Authenticated user is required");
    return { id: req.user.userId, role: req.user.role };
  }

  async create({ req, res, next }: ReqResNextFunction): Promise<void> {
    try {
      const dto = CreateRatingDTO.create({
        ...req.body,
        authorId: req.user?.userId,
      });
      res
        .status(201)
        .json(RatingView.render(await this.createRatingUseCase.execute(dto)));
    } catch (error) {
      next(error);
    }
  }

  async findAll({ req, res, next }: ReqResNextFunction): Promise<void> {
    try {
      const occurrenceIdRaw = req.query.occurrenceId as string | undefined;
      const occurrenceId = occurrenceIdRaw
        ? parseInt(occurrenceIdRaw, 10)
        : undefined;
      if (occurrenceIdRaw && Number.isNaN(occurrenceId))
        throw new ValidationError("occurrenceId must be a valid number");

      const actor = req.user
        ? { id: req.user.userId, role: req.user.role }
        : undefined;

      res
        .status(200)
        .json(
          RatingView.renderMany(
            await this.findAllRatingUseCase.execute({ occurrenceId }, actor)
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
          RatingView.render(
            await this.findOneByIdRatingUseCase.execute(
              this.parseId(req.params.id),
              this.actor(req)
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
          RatingView.render(
            await this.updateRatingUseCase.execute(
              this.parseId(req.params.id),
              UpdateRatingDTO.create(req.body),
              this.actor(req)
            )
          )
        );
    } catch (error) {
      next(error);
    }
  }

  async delete({ req, res, next }: ReqResNextFunction): Promise<void> {
    try {
      await this.deleteRatingUseCase.execute(
        this.parseId(req.params.id),
        this.actor(req)
      );
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
