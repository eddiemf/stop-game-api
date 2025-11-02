import type { IocContainer } from '@infrastructure/ioc';
import type { Express } from 'express';

export class GameSessionRouter {
  constructor(
    private app: Express,
    private container: IocContainer
  ) {
    this.createGameSession();
  }

  private createGameSession() {
    this.app.post('/game-session', async (req, res) => {
      const result = await this.container.gameChannelController.create({ body: req.body });

      if (!result.isOk) return res.status(result.error.status).json(result.error);

      return res.status(result.data.status).json(result.data);
    });
  }
}
