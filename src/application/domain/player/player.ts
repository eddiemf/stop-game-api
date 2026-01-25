import { Id } from '@shared/id';
import { fail, ok, type Result } from '@shared/result';
import { ValidationError } from '../errors/validation-error';

interface Props {
  id?: string;
  userId: string;
  name: string;
  isConnected?: boolean;
}

export class Player {
  private constructor(
    private _id: string,
    private _userId: string,
    private _name: string,
    private _isConnected: boolean
  ) {}

  public get id() {
    return this._id;
  }

  public get userId(): string {
    return this._userId;
  }

  public get name(): string {
    return this._name;
  }

  public get isConnected(): boolean {
    return this._isConnected;
  }

  public setName(name: string): Result<void, ValidationError> {
    const nameResult = Player.validateName(name);
    if (!nameResult.isOk) return fail(nameResult.error);

    this._name = name;

    return ok(undefined);
  }

  public setConnected(isConnected: boolean): void {
    this._isConnected = isConnected;
  }

  static create({
    id = Id.createID(),
    userId,
    name,
    isConnected = true,
  }: Props): Result<Player, ValidationError> {
    const nameResult = Player.validateName(name);
    if (!nameResult.isOk) return fail(nameResult.error);

    return ok(new Player(id, userId, name, isConnected));
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
