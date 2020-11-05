import { Request, Response } from 'express';
import { RequestHandler } from '../../controllers';

export const requestAdapter = (requestHandler: RequestHandler) => async (
  req: Request,
  res: Response
): Promise<void> => {
  const adaptedRequest = {
    params: req.params,
    body: req.body,
  };

  const { status, response } = await requestHandler(adaptedRequest);

  res.status(status).json(response);
};
