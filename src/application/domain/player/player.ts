import { Id } from '@shared/id';
import { Fail, Ok, type Result } from '@shared/result';
import { ValidationError } from '../errors/validation-error';

interface Props {
  id?: string;
  userId: string;
  name: string;
  isConnected?: boolean;
}

export class Player {
  private constructor(
    private id: string,
    private userId: string,
    private name: string,
    private isConnected: boolean
  ) {}

  public getId(): string {
    return this.id;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getName(): string {
    return this.name;
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }

  public getProps(): Props {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      isConnected: this.isConnected,
    };
  }

  public setName(name: string): Result<void, ValidationError> {
    const nameResult = Player.validateName(name);
    if (!nameResult.isOk) return Fail(nameResult.error);

    this.name = name;

    return Ok(undefined);
  }

  public setConnected(isConnected: boolean): void {
    this.isConnected = isConnected;
  }

  static create({
    id = Id.createID(),
    userId,
    name,
    isConnected = true,
  }: Props): Result<Player, ValidationError> {
    const nameResult = Player.validateName(name);
    if (!nameResult.isOk) return Fail(nameResult.error);

    return Ok(new Player(id, userId, name, isConnected));
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
