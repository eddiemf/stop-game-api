import { Id } from '@shared/id';
import { fail, ok, type Result } from '@shared/result';
import { ValidationError } from '../errors/validation-error';

interface Props {
  id?: string;
  name: string;
}

export class GameTopic {
  private constructor(
    private _id: string,
    private _name: string
  ) {}

  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public setName(newName: string): Result<void, ValidationError> {
    const nameResult = GameTopic.validateName(newName);
    if (!nameResult.isOk) return fail(nameResult.error);

    this._name = newName;

    return ok(undefined);
  }

  public static create({ id = Id.createID(), name }: Props): Result<GameTopic, ValidationError> {
    const nameResult = GameTopic.validateName(name);
    if (!nameResult.isOk) return fail(nameResult.error);

    return ok(new GameTopic(id, name));
  }

  private static validateName(name: string): Result<string, ValidationError> {
    if (!name) return fail(new ValidationError('name', 'Name is required and cannot be empty.'));
    if (typeof name !== 'string')
      return fail(new ValidationError('name', 'Name must be a string.'));
    if (name.length < 2 || name.length > 50)
      return fail(new ValidationError('name', 'Name must be between 2 and 50 characters long.'));

    return ok(name);
  }
}
