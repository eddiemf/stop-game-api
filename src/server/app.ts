import express from 'express';
import { requestAdapter } from './adapters/express-request';
import { gameSessionController } from './controllers/game-session';

const app = express();
const port = 3000;
app.use(express.urlencoded({ extended: true }));

app.get('/healthcheck', (req, res) => {
  return res.send('I am alive :)');
});
app.get('/game-session/:hash', requestAdapter(gameSessionController.findGameSession));
app.post('/game-session', requestAdapter(gameSessionController.createGameSession));

app.listen(port, () => console.log('Running server'));
