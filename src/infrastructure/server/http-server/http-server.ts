import { createServer } from 'node:http';
import express from 'express';
import type { IocContainer } from '../../ioc';
import { GameSessionRouter } from './routes';

export function createHttpServer(container: IocContainer) {
  const app = express();

  app.use(express.urlencoded({ extended: true }));

  app.get('/healthcheck', (_, res) => res.send('I am alive :)'));

  new GameSessionRouter(app, container);
  // app.get('/game-session/:sessionId/join', joinSession);
  // app.post('/game-session/:sessionId/topics', addTopic);
  // app.delete('/game-session/:sessionId/topics/:topicId', removeTopic);
  // app.put('/game-session/:sessionId/topics/:topicId', renameTopic);

  return createServer(app);
}
