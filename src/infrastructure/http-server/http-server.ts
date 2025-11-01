import express from 'express';
import type { IocContainer } from '../ioc';

export function createHttpServer(container: IocContainer) {
  const app = express();

  app.use(express.urlencoded({ extended: true }));

  app.get('/healthcheck', (_, res) => res.send('I am alive :)'));

  app.post('/game-session', (req, res) => container.gameChannelController.create(req, res));
  // app.get('/game-session/:sessionId/join', joinSession);
  // app.post('/game-session/:sessionId/topics', addTopic);
  // app.delete('/game-session/:sessionId/topics/:topicId', removeTopic);
  // app.put('/game-session/:sessionId/topics/:topicId', renameTopic);

  return app;
}
