export * from './game-session';

export interface Request {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: Record<string, any>;
}

export interface Response {
  status: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: Record<string, any>;
}

export interface RequestHandler {
  (request: Request): Promise<Response>;
}
