import type { Server } from 'node:http';
import type { ModulesRegistry } from '@infrastructure/modules-registry';
import { WebSocketServer } from 'ws';

export function createWebSocketServer(httpServer: Server, container: ModulesRegistry) {
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
