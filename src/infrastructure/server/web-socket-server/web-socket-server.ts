import type { Server } from 'node:http';
import type { IocContainer } from '@infrastructure/ioc';
import { WebSocketServer } from 'ws';

export function createWebSocketServer(httpServer: Server, container: IocContainer) {
  const wss = new WebSocketServer({ server: httpServer, clientTracking: true });

  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      console.log(`Received message: ${message}`);
      // Here you can handle incoming messages and interact with the container services
    });

    ws.send('Welcome to the WebSocket server!');
  });

  return wss;
}
