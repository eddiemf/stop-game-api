import { Id } from '@shared/id';
import { Fail, Ok, type Result } from '@shared/result';
import { ValidationError } from '../errors/validation-error';

interface Props {
  id?: string;
  name: string;
}

export class GameTopic {
  private constructor(
    private id: string,
    private name: string
  ) {}

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getProps(): Props {
    return {
      id: this.id,
      name: this.name,
    };
  }

  public setName(newName: string): Result<void, ValidationError> {
    const nameResult = GameTopic.validateName(newName);
    if (!nameResult.isOk) return Fail(nameResult.error);

    this.name = newName;

    return Ok(undefined);
  }

  public static create({ id = Id.createID(), name }: Props): Result<GameTopic, ValidationError> {
    const nameResult = GameTopic.validateName(name);
    if (!nameResult.isOk) return Fail(nameResult.error);

    return Ok(new GameTopic(id, name));
  }

  private static validateName(name: string): Result<string, ValidationError> {
    if (!name) return Fail(new ValidationError('name', 'Name is required and cannot be empty.'));
    if (typeof name !== 'string')
      return Fail(new ValidationError('name', 'Name must be a string.'));
    if (name.length < 2 || name.length > 50)
      return Fail(new ValidationError('name', 'Name must be between 2 and 50 characters long.'));

    return Ok(name);
  }
}
